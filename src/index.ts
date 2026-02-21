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

import path from 'node:path';
import url from 'node:url';
import RelateUrl from 'relateurl';
import isAbsoluteUrl from 'is-absolute-url';
import convertPath from '@stdlib/utils-convert-path';
import { globSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import type { Transformer, Preset, Processor } from 'unified';
import type {
  Nodes, Root, Parent,
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
 *
 * @internal
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
        includeDirectives.unshift({
          node: node,
          index: index!,
          parent: parent!,
          depth: depth
        });
      }
    }
  );

  return includeDirectives;
};

/**
 * Get file path (or glob) from `file` attribute
 * for `::include` directive
 *
 * @param node include directive
 * @param file current markdown file
 * @returns file path (glob)
 *
 * @internal
 */
function getIncludeDirectiveFileAttribute(
  node: LeafDirective,
  file: VFile
): string {
  if (
    node.attributes?.file === null ||
    typeof node.attributes?.file === 'undefined'
  ) {
    file.fail(
      '::include, `file` attribute expected',
      node,
      '@it-service-npm/remark-include'
    );
  } else {
    if (typeof file.dirname === 'undefined') {
      file.fail(
        '::include, unexpected error: "file" should be an instance of VFile',
        node,
        '@it-service-npm/remark-include'
      );
    } else {
      return node.attributes.file;
    };
  };
};

/**
 * Send Remark error message when file from
 * `::include` directive not found
 *
 * @param node - include directive
 * @param file - current markdown file
 * @param filePath - missing file path
 * @throws
 *
 * @internal
 */
function errorFileNotFound(
  node: LeafDirective,
  file: VFile,
  filePath: string
): never {
  if (
    node.attributes?.optional === null ||
    typeof node.attributes?.optional === 'undefined'
  ) {
    file.fail(
      `::include, file not found - "${filePath}"`,
      node,
      '@it-service-npm/remark-include'
    );
  } else {
    throw file.info(
      `::include, file not found - "${filePath}"`,
      node,
      '@it-service-npm/remark-include'
    );
  };
};

/**
 * Translate included Resources ULR:
 *
 * - relative images and links in the included files
 *   will have their paths rewritten
 *   to be relative the original document rather than the imported file
 *
 * @param node image, link, definition or other Resource node
 * @param mainFile main ("includer") markdown file
 * @param includedFile included markdown file
 *
 * @internal
 */
function fixIncludedResourcesURL(
  node: Resource,
  mainFile: VFile,
  includedFile: VFile
): void {
  if (!(isAbsoluteUrl(node.url) || node.url.startsWith('/'))) {
    node.url = RelateUrl.relate(
      url.pathToFileURL(mainFile.path).href,
      new URL(
        node.url,
        url.pathToFileURL(includedFile.path)
      ).href
    );
  };
};

/**
 * Translate included code path:
 *
 * - an included markdown file will "inherit" the heading levels
 *
 * @param node Code node
 * @param mainFile main ("includer") markdown file
 * @param includedFile included markdown file
 *
 * @internal
 */
function fixIncludedCodePath(
  node: Code,
  mainFile: VFile,
  includedFile: VFile
): void {
  const fileMeta: string | undefined = (node.meta ?? '')
    // Allow escaping spaces
    .split(/(?<!\\) /g)
    .find((meta) => meta.startsWith('file='));
  if (typeof fileMeta === 'undefined') {
    return;
  };
  // eslint-disable-next-line max-len
  const fileAttributeRegExp = /^file=(?<path>.+?)(?:(?:#(?:L(?<from>\d+)(?:-)?)?)(?:L(?<to>\d+))?)?$/;
  const fileMetaStructure = fileAttributeRegExp.exec(fileMeta);
  if (fileMetaStructure?.groups?.path) {
    const filePath = fileMetaStructure.groups.path;
    const normalizedFilePath = filePath
      .replaceAll(String.raw`\ `, ' ');
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
        'file=' + rebasedFilePath.replaceAll(' ', String.raw`\ `) +
        (fileMetaStructure.groups.from ?
          '#L' + fileMetaStructure.groups.from
          : '') +
        (fileMetaStructure.groups.to ?
          '-L' + fileMetaStructure.groups.to
          : '');
    };
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
 *
 * @internal
 */
function fixIncludedAST(
  includedAST: Root,
  mainFile: VFile,
  includedFile: VFile,
  depth: number
): Root {
  let depthDelta: number | undefined;
  visit(includedAST,
    function (node: Nodes): void {
      switch (node.type) {
        case 'heading': {
          node.depth -= (depthDelta ??= node.depth - depth - 1);
          break;
        }
        case 'image':
        case 'link':
        case 'definition': {
          fixIncludedResourcesURL(node, mainFile, includedFile);
          break;
        }
        case 'code': {
          fixIncludedCodePath(node, mainFile, includedFile);
          break;
        }
      };
    }
  );
  return includedAST;
};

/**
 * Sync Remark plugin fabric function.
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
export function remarkIncludeSync(
  this: Processor
): Transformer<Root> {

  const processor: Processor = this;

  return function (tree: Root, file: VFile): Root {

    const includeDirectives = getIncludeDirectives(tree, file);

    for (const includeDirective of includeDirectives) {
      try {

        const filePathGlob = getIncludeDirectiveFileAttribute(
          includeDirective.node,
          file);
        const includedFilesPaths = globSync(filePathGlob, {
          cwd: path.resolve(file.dirname!)
        }).toSorted();
        if (includedFilesPaths.length === 0) {
          errorFileNotFound(includeDirective.node, file, filePathGlob);
        };

        const includedContent: RootContent[] = includedFilesPaths.flatMap(
          function (
            _includedFilePath: string
          ): RootContent[] {
            const includedFilePath = path.resolve(
              path.resolve(file.dirname!),
              _includedFilePath
            );
            const includedFile: VFile = readSync(includedFilePath, 'utf8');
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
        );

        includeDirective.parent.children.splice(
          includeDirective.index, 1,
          ...includedContent
        );

      } catch (error) {
        if ((error instanceof VFileMessage) && (!error.fatal)) {
          includeDirective.parent.children.splice(
            includeDirective.index, 1,
          );
        } else {
          throw error;
        };
      };
    };
    return tree;
  };
};

/**
 * Preset of Remark plugins:
 * {@link remarkIncludeSync}
 * and {@link https://www.npmjs.com/package/remark-directive| remarkDirective}
 *
 * @remarks
 *
 * @see {@link remarkIncludeSync},
 * {@link https://www.npmjs.com/package/remark-directive| remarkDirective}
 *
 * @public
 */
export const remarkIncludePresetSync: Preset = {
  plugins: [
    remarkDirective,
    remarkIncludeSync
  ]
};

export default remarkIncludePresetSync;

/**
 * Async Remark plugin fabric function.
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
export function remarkInclude(
  this: Processor
): Transformer<Root> {

  const processor: Processor = this;

  return async function (tree: Root, file: VFile): Promise<Root> {

    const includeDirectives = getIncludeDirectives(tree, file);

    for (const includeDirective of includeDirectives) {
      try {

        const filePathGlob = getIncludeDirectiveFileAttribute(
          includeDirective.node,
          file
        );
        const includedFilesPaths = (await Array.fromAsync(glob(filePathGlob, {
          cwd: path.resolve(file.dirname!)
        })));
        includedFilesPaths.sort();
        if (includedFilesPaths.length === 0) {
          errorFileNotFound(includeDirective.node, file, filePathGlob);
        };

        const _includedContent: RootContent[][] =
          (await Promise.all(includedFilesPaths.map(
            async function (
              _includedFilePath: string
            ): Promise<RootContent[]> {
              const includedFilePath = path.resolve(
                path.resolve(file.dirname!),
                _includedFilePath
              );
              const includedFile: VFile = await read(includedFilePath, 'utf8');
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
          )));
        const includedContent: RootContent[] = _includedContent.flat();

        includeDirective.parent.children.splice(
          includeDirective.index, 1,
          ...includedContent
        );

      } catch (error) {
        if ((error instanceof VFileMessage) && (!error.fatal)) {
          includeDirective.parent.children.splice(
            includeDirective.index, 1,
          );
        } else {
          throw error;
        };
      };
    };
    return tree;
  };
};

/**
 * Preset of Remark plugins:
 * {@link remarkInclude}
 * and {@link https://www.npmjs.com/package/remark-directive| remarkDirective}
 *
 * @remarks
 *
 * @see {@link remarkInclude},
 * {@link https://www.npmjs.com/package/remark-directive| remarkDirective}
 *
 * @public
 */
export const remarkIncludePreset: Preset = {
  plugins: [
    remarkDirective,
    remarkInclude
  ]
};
