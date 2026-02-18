import { remark } from 'remark';
// import type { Plugin } from 'unified';
// import type { Root } from 'mdast';
import * as vFile from 'to-vfile';
import { remarkIncludePreset } from '@it-service-npm/remark-include';
// import codeImport from 'remark-code-import';
import type { VFile } from 'vfile';

// interface CodeImportOptions extends Array<unknown> {
//   async?: boolean;
//   preserveTrailingNewline?: boolean;
//   removeRedundantIndentations?: boolean;
//   rootDir?: string;
//   allowImportingFromOutside?: boolean;
// };

export async function remarkDirectiveUsingExample(
  filePath: string
): Promise<VFile> {
  return remark()
    // .use(codeImport as Plugin<CodeImportOptions, Root>, {
    //   async: false,
    //   preserveTrailingNewline: false
    // })
    .use(remarkIncludePreset)
    .process(await vFile.read(filePath));
};
