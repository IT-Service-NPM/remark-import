import { remark } from 'remark';
import * as vFile from 'to-vfile';
import { remarkIncludePresetSync } from '@it-service-npm/remark-include';
import type { VFile } from 'vfile';

export async function remarkDirectiveUsingExample(
  filePath: string
): Promise<VFile> {
  return remark()
    .use(remarkIncludePresetSync)
    .process(await vFile.read(filePath));
};
