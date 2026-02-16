import * as path from 'node:path';
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkIncludeSync } from '#@it-service-npm/remark-include';

const testSrcFilesPath: string = path.join(__dirname, 'fixtures');

describe('remark-include', () => {

  // eslint-disable-next-line max-len
  it('send a FAIL message to the remark processor if the file attribute is missing',
    async () => {

      const RemarkProcessor = remark()
        .use(remarkDirective)
        .use(remarkIncludeSync)
        .freeze();
      const testFile = await vFile.read(
        path.join(testSrcFilesPath, 'main-without-file-attribute.md')
      );
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      const _cwd = process.cwd();
      try {
        process.chdir(__dirname);

        await expect(
          RemarkProcessor
            .process(testFile)
        ).rejects.toThrowError();

      } finally {
        process.chdir(_cwd);
      };
      expect(fileInfoSpy).toHaveBeenCalledTimes(0);
      expect(fileFailSpy).toHaveBeenCalledTimes(1);

    });

});
