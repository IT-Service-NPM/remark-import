import { remark } from 'remark';
import * as vFile from 'to-vfile';
import { remarkIncludeSync } from '#@it-service-npm/remark-include';
import type { VFile } from 'vfile';

export async function remarkDirectiveUsingExample(
  filePath: string
): Promise<VFile> {
  return remark()
    .use(remarkIncludeSync)
    .process(await vFile.read(filePath));
};
