import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkInclude } from '@it-service-npm/remark-include';
import codeImport from 'remark-code-import';
import type { VFile } from 'vfile';

export async function remarkDirectiveUsingExample(
  filePath: string
): Promise<VFile> {
  return remark()
    .use(remarkDirective)
    .use([codeImport])
    .use(remarkInclude)
    .process(await vFile.read(filePath));
};
