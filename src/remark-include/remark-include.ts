import * as path from 'node:path';
import { type Transformer, type Plugin, type Processor } from 'unified';
import { type Root, type Parent } from 'mdast';
import { type LeafDirective } from 'mdast-util-directive';
import { VFile } from 'vfile';
import { readSync } from 'to-vfile';
import { visit } from 'unist-util-visit';
import { convert } from 'unist-util-is';

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
        const includedFilePath: string = path.resolve(
          file.dirname,
          node.attributes.file
        );

        //   if (existsSync(fileAbsPath)) {
        //     const rawMd = readFileSync(fileAbsPath, 'utf-8');
        //     parent.children.splice(index, 1, ...unified.parse(rawMd).children);
        //   } else {
        //     if (!optional) throw new Error(`import error: ${fileAbsPath} not found`);
        //     else node.children = [];
        //   }

        const includedFile: VFile = readSync(includedFilePath, 'utf-8');
        const includedAST: Root = unified.parse(includedFile) as Root;
        parent.children.splice(index, 1, ...includedAST.children);
      }
    );
    return tree;
  };
};

export default remarkInclude;
