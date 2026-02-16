/**
 * With this Remark plugin, you can use `::include{file=path.md}`
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
import isRelativeUrl from 'is-relative-url';
import convertPath from '@stdlib/utils-convert-path';
import {
  assertDefined, isDefined,
  isString, isOptString,
  isStruct
} from 'ts-runtime-typecheck';
import { glob, globSync } from 'glob';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Transformer, Plugin, Processor } from 'unified';
import type {
  Node, Root, Parent, Heading,
  Resource, Code, RootContent
} from 'mdast';
import type { LeafDirective } from 'mdast-util-directive';
import type { VFile } from 'vfile';
import { VFileMessage } from 'vfile-message';
import { read, readSync } from 'to-vfile';
import { visit } from 'unist-util-visit';
import { convert, is } from 'unist-util-is';

/* eslint-disable max-statements */

/**
 * Collect `::include` directives for processing
 *
 * @param {Root} tree - source AST
 * @param {VFile} _file - source markdown file
 * @returns {{
 *   node: LeafDirective,
 *   index: number,
 *   parent: Parent,
 *   depth: number
 * }[]}
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
    convert([
      { type: 'leafDirective', name: 'include' },
      { type: 'heading' }
    ]),
    function (_node: Node, index?: number, parent?: Parent): void {
      if (is(_node, 'heading')) {
        const node: Heading = _node as Heading;
        depth = node.depth;
      } else {
        includeDirectives.push({
          node: _node as LeafDirective,
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
 * for `::include{file=path/filename.md}` directive
 *
 * @param {LeafDirective} node - include directive
 * @param {VFile} file - current markdown file
 * @returns {string} - file path (glob)
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
 * `:: include{ file = path / filename.md }` directive not found
 *
 * @param {LeafDirective} node - include directive
 * @param {VFile} file - current markdown file
 * @param {string} filePath - missing file path
 * @throws {VFileMessage}
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
 * Searches for an existing file among possible paths and returns it
 *
 * @param {LeafDirective} node - include directive
 * @param {VFile} file - current markdown file
 * @returns {string} - file path
 */
function getIncludeDirectiveFilePathsSync(
  node: LeafDirective,
  file: VFile
): string[] | never {
  const filePathGlob = getIncludeDirectiveFileAttr(node, file);
  const includedFilesPaths = globSync(filePathGlob, {
    nodir: true,
    cwd: path.resolve(file.dirname!),
    realpath: true,
    absolute: true
  }).sort();
  if (includedFilesPaths.length === 0) {
    errorFileNotFound(node, file, filePathGlob);
  } else {
    return includedFilesPaths;
  };
};

/**
 * Searches for an existing file among possible paths and returns it
 *
 * @param {LeafDirective} node - include directive
 * @param {VFile} file - current markdown file
 * @returns {string} - file path
 */
async function getIncludeDirectiveFilePaths(
  node: LeafDirective,
  file: VFile
): Promise<string[]> {
  const filePathGlob = getIncludeDirectiveFileAttr(node, file);
  const includedFilesPaths = (await glob(filePathGlob, {
    nodir: true,
    cwd: path.resolve(file.dirname!),
    realpath: true,
    absolute: true
  })).sort();
  if (includedFilesPaths.length === 0) {
    errorFileNotFound(node, file, filePathGlob);
  } else {
    return includedFilesPaths;
  };
};

/**
 * Check if node instanceof Resource
 */
const isResource = isStruct({
  url: isString,
  title: isOptString
});

/**
 * Included markdown AST postprocessing:
 *
 * - relative images and links in the included files
 *   will have their paths rewritten
 *   to be relative the original document rather than the imported file
 * - an included markdown file will "inherit" the heading levels
 *
 * @param {Root} includedAST - AST for included markdown file
 * @param {VFile} mainFile - main ("includer") markdown file
 * @param {VFile} includedFile - included markdown file
 * @param {number} depth - heading level for current include directive
 */
function fixIncludedAST(
  includedAST: Root,
  mainFile: VFile,
  includedFile: VFile,
  depth: number
): Root {
  let depthDelta: number | undefined;
  visit(includedAST,
    function (_node: Node): void {

      if (is(_node, 'heading')) {
        const node: Heading = _node as Heading;
        depthDelta ??= node.depth - depth - 1;
        node.depth -= depthDelta;

      } else if (isResource(_node)) {
        const node: Resource = _node;
        if (isRelativeUrl(node.url,
          { allowProtocolRelative: false })
        ) {
          node.url = RelateUrl.relate(
            url.pathToFileURL(mainFile.path).href,
            new URL(
              node.url,
              url.pathToFileURL(includedFile.path)
            ).href
          );
        };

      } else if (is(_node, 'code')) {
        const node: Code = _node as Code;
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
 * Sync plugin fabric function.
 *
 * With this Remark plugin, you can use `::include{ file = path.md } `
 * directive to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * @public
 */
export function remarkIncludeSync(
  this: Processor
): Transformer<Root> {

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor: Processor = this;

  return function (tree: Root, file: VFile): Root {

    const includeDirectives = getIncludeDirectives(tree, file);

    for (const includeDirective of includeDirectives) {
      try {

        const includedFilePaths = getIncludeDirectiveFilePathsSync(
          includeDirective.node,
          file
        );
        let includedContent: RootContent[] = [];
        includedContent = includedContent.concat(...includedFilePaths.map(
          function (
            includedFilePath: string
          ): RootContent[] {
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
        ));

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

export default remarkIncludeSync;

/**
 * Async plugin fabric function.
 *
 * With this Remark plugin, you can use `::include{ file = path.md } `
 * directive to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * @public
 */
export function remarkInclude(
  this: Processor
): Transformer<Root> {

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor: Processor = this;

  return async function (tree: Root, file: VFile): Promise<Root> {

    const includeDirectives = getIncludeDirectives(tree, file);

    for (const includeDirective of includeDirectives) {
      try {

        const includedFilePaths = await getIncludeDirectiveFilePaths(
          includeDirective.node,
          file
        );
        let includedContent: RootContent[] = [];
        includedContent = includedContent.concat(...(await Promise.all(
          includedFilePaths.map(
            async function (
              includedFilePath: string
            ): Promise<RootContent[]> {
              const includedFile: VFile = await read(
                includedFilePath, 'utf-8'
              );
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
          )
        )));

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
