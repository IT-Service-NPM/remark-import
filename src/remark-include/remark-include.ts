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
import { accessSync } from 'node:fs';
import markdownExtensions from 'markdown-extensions';
import { type Transformer, type Plugin, type Processor } from 'unified';
import { type Root, type Parent } from 'mdast';
import { type LeafDirective } from 'mdast-util-directive';
import { VFile } from 'vfile';
import { readSync } from 'to-vfile';
import { visit } from 'unist-util-visit';
import { convert } from 'unist-util-is';

/**
 * Plugin fabric function.
 *
 * With this Remark plugin, you can use `::include{file=path.md}`
 * directive to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * @public
 */
export const remarkInclude: Plugin<[], Root> = function (): Transformer<Root> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const unified: Processor = this;
  return function (tree: Root, file: VFile): Root {
    visit(
      tree,
      convert({ type: 'leafDirective', name: 'include' }),
      function (node: LeafDirective, index: number, parent: Parent) {
        if (
          node.attributes === undefined || node.attributes === null
          || !Object.keys(node.attributes).includes('file')
          || node.attributes.file === undefined || node.attributes.file === null
        ) {
          throw new Error(
            '`include` directive error: `file` attribute expected'
          );
        };
        if (file.dirname === undefined) {
          throw new Error('File `path` expected');
        };

        let includedFilePath: string = path.resolve(
          file.dirname,
          node.attributes.file
        );
        const paths: string[] = [includedFilePath].concat(
          markdownExtensions.map((ext: string) => includedFilePath + '.' + ext)
        );
        if (paths.some(
          function (filePath: string): boolean {
            try {
              accessSync(filePath);
              includedFilePath = filePath;
              return true;
            } catch {
              return false;
            };
          }
        )) {
          const includedFile: VFile = readSync(includedFilePath, 'utf-8');
          const includedAST: Root = unified.parse(includedFile) as Root;
          parent.children.splice(index, 1, ...includedAST.children);
        } else {
          // TODO: add support for `optional` attribute
          throw new Error(
            `\`include\` directive error: ${includedFilePath} not found`
          );
        };
      }
    );
    return tree;
  };
};

export default remarkInclude;
