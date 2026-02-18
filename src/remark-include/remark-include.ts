/**
 * With this Remark plugin, you can use `::include`
 * directive to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * @packageDocumentation
 */

import * as path from 'node:path';
import * as url from 'node:url';
import RelateUrl from 'relateurl';
import isAbsoluteUrl from 'is-absolute-url';
import convertPath from '@stdlib/utils-convert-path';
import { assertDefined, isDefined } from 'ts-runtime-typecheck';
import { globSync } from 'node:fs';
import { glob } from 'node:fs/promises';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Transformer, Preset, Plugin, Processor } from 'unified';
import type {
  Nodes, Root, Parent, Heading,
  Resource, Code, RootContent
} from 'mdast';
import type { LeafDirective } from 'mdast-util-directive';
import remarkDirective from 'remark-directive';
import type { VFile } from 'vfile';
import { VFileMessage } from 'vfile-message';
import { read, readSync } from 'to-vfile';
import { visit } from 'unist-util-visit';

/* eslint-disable max-statements */

/**
 * Collect `::include` directives for processing
 *
 * @param tree source AST
 * @param _file source markdown file
 * @returns directives for later processing
 */
function getIncludeDirectives(tree: Root, _file: VFile): {
  node: LeafDirective,
  index: number,
  parent: Parent,
  depth: number
}[] {

  let depth = 0;
  const includeDirectives: {
    node: LeafDirective,
    index: number,
    parent: Parent,
    depth: number
  }[] = [];

  visit(
    tree,
    function (node: Nodes, index?: number, parent?: Parent): void {
      if (node.type === 'heading') {
        depth = node.depth;
      } else if (
        (node.type === 'leafDirective') &&
        ((node).name === 'include')
      ) {
        includeDirectives.push({
          node: node,
          index: index!,
          parent: parent!,
          depth: depth
        });
      };
    }
  );

  return includeDirectives.reverse();
};

/**
 * Get file path (or glob) from `file` attribute
 * for `::include` directive
 *
 * @param node include directive
 * @param file current markdown file
 * @returns file path (glob)
 */
function getIncludeDirectiveFileAttr(
  node: LeafDirective,
  file: VFile
): string {
  try {
    assertDefined(node.attributes);
    assertDefined(node.attributes.file);
  } catch {
    file.fail(
      '::include, `file` attribute expected',
      node,
      '@it-service-npm/remark-include'
    );
  };
  if (!isDefined(file.dirname)) {
    file.fail(
      '::include, unexpected error: "file" should be an instance of VFile',
      node,
      '@it-service-npm/remark-include'
    );
  };
  return node.attributes.file;
};

/**
 * Send Remark error message when file from
 * `::include` directive not found
 *
 * @param node - include directive
 * @param file - current markdown file
 * @param filePath - missing file path
 * @throws
 */
function errorFileNotFound(
  node: LeafDirective,
  file: VFile,
  filePath: string
): never {
  if (isDefined(node.attributes?.optional)) {
    throw file.info(
      `::include, file not found - "${filePath}"`,
      node,
      '@it-service-npm/remark-include'
    );
  } else {
    file.fail(
      `::include, file not found - "${filePath}"`,
      node,
      '@it-service-npm/remark-include'
    );
  };
};

/**
 * Included markdown AST postprocessing:
 *
 * - relative images and links in the included files
 *   will have their paths rewritten
 *   to be relative the original document rather than the imported file
 * - an included markdown file will "inherit" the heading levels
 *
 * @param includedAST AST for included markdown file
 * @param mainFile main ("includer") markdown file
 * @param includedFile included markdown file
 * @param depth heading level for current include directive
 */
function fixIncludedAST(
  includedAST: Root,
  mainFile: VFile,
  includedFile: VFile,
  depth: number
): Root {
  let depthDelta: number | undefined;
  visit(includedAST,
    function (_node: Nodes): void {

      if (_node.type === 'heading') {
        const node: Heading = _node;
        depthDelta ??= node.depth - depth - 1;
        node.depth -= depthDelta;

      } else if (['image', 'link', 'definition'].includes(_node.type)) {
        const node: Resource = _node as unknown as Resource;

        function isGFMFileRelativeUrl(url: string): boolean {
          return !(isAbsoluteUrl(url) || url.startsWith('/'));
        };

        if (isGFMFileRelativeUrl(node.url)) {
          node.url = RelateUrl.relate(
            url.pathToFileURL(mainFile.path).href,
            new URL(
              node.url,
              url.pathToFileURL(includedFile.path)
            ).href
          );
        };

      } else if (_node.type === 'code') {
        const node: Code = _node;
        const fileMeta: string | undefined = (node.meta ?? '')
          // Allow escaping spaces
          .split(/(?<!\\) /g)
          .find((meta) => meta.startsWith('file='));
        if (!isDefined(fileMeta)) {
          return;
        };
        // eslint-disable-next-line max-len
        const fileAttrRegExp = /^file=(?<path>.+?)(?:(?:#(?:L(?<from>\d+)(?<dash>-)?)?)(?:L(?<to>\d+))?)?$/;
        const res = fileAttrRegExp.exec(fileMeta);
        if (res?.groups?.path) {
          const filePath = res.groups.path;
          const normalizedFilePath = filePath
            .replace(/\\ /g, ' ');
          if (!path.isAbsolute(normalizedFilePath)) {
            const rebasedFilePath = convertPath(
              path.relative(
                mainFile.dirname!,
                path.resolve(
                  path.dirname(includedFile.path),
                  normalizedFilePath
                )
              ),
              'posix'
            );
            node.meta =
              'file=' + rebasedFilePath.replace(/ /g, '\\ ') +
              (res.groups.from ? '#L' + res.groups.from : '') +
              (res.groups.to ? '-L' + res.groups.to : '');
          };
        }
      };
    }
  );
  return includedAST;
};

/**
 * @internal
 */
export function _remarkIncludeSync(
  this: Processor
): Transformer<Root> {

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor: Processor = this;

  return function (tree: Root, file: VFile): Root {

    const includeDirectives = getIncludeDirectives(tree, file);

    for (const includeDirective of includeDirectives) {
      try {

        const filePathGlob = getIncludeDirectiveFileAttr(
          includeDirective.node,
          file);
        const includedFilesPaths = globSync(filePathGlob, {
          cwd: path.resolve(file.dirname!)
        }).sort();
        if (includedFilesPaths.length === 0) {
          errorFileNotFound(includeDirective.node, file, filePathGlob);
        };

        const includedContent: RootContent[] = includedFilesPaths.map(
          function (
            _includedFilePath: string
          ): RootContent[] {
            const includedFilePath = path.resolve(
              path.resolve(file.dirname!),
              _includedFilePath
            );
            const includedFile: VFile = readSync(includedFilePath, 'utf-8');
            const includedAST: Root = processor.runSync(
              processor.parse(includedFile),
              includedFile
            ) as Root;
            fixIncludedAST(
              includedAST,
              file, includedFile,
              includeDirective.depth
            );
            return includedAST.children;
          }
        ).flat();

        includeDirective.parent.children.splice(
          includeDirective.index, 1,
          ...includedContent
        );

      } catch (err) {
        if ((err instanceof VFileMessage) && (!err.fatal)) {
          includeDirective.parent.children.splice(
            includeDirective.index, 1,
          );
        } else {
          throw err;
        };
      };
    };
    return tree;
  };
};
// const remarkIncludeSyncPlugin: Plugin<[], Root> = remarkIncludeSync;

/**
 * Sync plugin fabric function.
 *
 * With this plugin, you can use `::include{file=./included.md}`
 * statements to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * Relative images and links in the imported files
 * will have their paths rewritten
 * to be relative the original document rather than the imported file.
 *
 * An imported markdown file will "inherit" the heading levels.
 * If the `::include{file=./included.md}` statement happens under Heading 2,
 * for example, any heading 1 in the included file
 * will be "translated" to have header level 3.
 *
 * @remarks
 *
 * @see {@link https://github.com/BrekiTomasson/remark-import| remark-import},
 * {@link https://github.com/Qard/remark-include| remark-include}
 *
 * @public
 */
export const remarkIncludeSync: Preset = {
  plugins: [
    remarkDirective,
    _remarkIncludeSync
  ]
};

export default remarkIncludeSync;

/**
 * @internal
 */
function _remarkInclude(
  this: Processor
): Transformer<Root> {

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor: Processor = this;

  return async function (tree: Root, file: VFile): Promise<Root> {

    const includeDirectives = getIncludeDirectives(tree, file);

    for (const includeDirective of includeDirectives) {
      try {

        const filePathGlob = getIncludeDirectiveFileAttr(
          includeDirective.node,
          file
        );
        const includedFilesPaths = (await Array.fromAsync(glob(filePathGlob, {
          cwd: path.resolve(file.dirname!)
        }))).sort();
        if (includedFilesPaths.length === 0) {
          errorFileNotFound(includeDirective.node, file, filePathGlob);
        };

        const includedContent: RootContent[] =
          (await Promise.all(includedFilesPaths.map(
            async function (
              _includedFilePath: string
            ): Promise<RootContent[]> {
              const includedFilePath = path.resolve(
                path.resolve(file.dirname!),
                _includedFilePath
              );
              const includedFile: VFile = await read(includedFilePath, 'utf-8');
              const includedAST: Root = await processor.run(
                processor.parse(includedFile),
                includedFile
              ) as Root;
              fixIncludedAST(
                includedAST,
                file, includedFile,
                includeDirective.depth
              );
              return includedAST.children;
            }
          ))).flat();

        includeDirective.parent.children.splice(
          includeDirective.index, 1,
          ...includedContent
        );

      } catch (err) {
        if ((err instanceof VFileMessage) && (!err.fatal)) {
          includeDirective.parent.children.splice(
            includeDirective.index, 1,
          );
        } else {
          throw err;
        };
      };
    };
    return tree;
  };
};
// const remarkIncludePlugin: Plugin<[], Root> = remarkInclude;

/**
 * Async plugin fabric function.
 *
 * With this plugin, you can use `::include{file=./included.md}`
 * statements to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * Relative images and links in the imported files
 * will have their paths rewritten
 * to be relative the original document rather than the imported file.
 *
 * An imported markdown file will "inherit" the heading levels.
 * If the `::include{file=./included.md}` statement happens under Heading 2,
 * for example, any heading 1 in the included file
 * will be "translated" to have header level 3.
 *
 * @remarks
 *
 * @see {@link https://github.com/BrekiTomasson/remark-import| remark-import},
 * {@link https://github.com/Qard/remark-include| remark-include}
 *
 * @public
 */
export const remarkInclude: Preset = {
  plugins: [
    remarkDirective,
    _remarkInclude
  ]
};
