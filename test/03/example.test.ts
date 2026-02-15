import * as path from 'node:path';
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import remarkInclude from '#@it-service-npm/remark-include';

const testSrcFilesPath: string = path.join(__dirname, 'fixtures');
const testSnapshotsFilesPath: string = path.join(__dirname, 'snapshots');

describe('remark-include', () => {

  // eslint-disable-next-line max-len
  it('send a INFO message to the remark processor if the file is not found and an optional attribute is present',
    async () => {

      const RemarkProcessor = remark()
        .use(remarkDirective)
        .use(remarkInclude)
        .freeze();
      const testFile = await vFile.read(
        path.join(testSrcFilesPath, 'main-with-optional-include.md')
      );
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      const _cwd = process.cwd();
      try {
        process.chdir(__dirname);

        await expect((async function () {
          const outputFile = await RemarkProcessor
            .process(testFile);
          return outputFile.value;
        })()).resolves
          .toMatchFileSnapshot(path.join(testSnapshotsFilesPath, 'output.md'));

      } finally {
        process.chdir(_cwd);
      };
      expect(fileInfoSpy).toHaveBeenCalledTimes(1);
      expect(fileFailSpy).toHaveBeenCalledTimes(0);

    });

  // eslint-disable-next-line max-len
  it('send a FAIL message to the remark processor if the file is not found and an optional attribute is not present',
    async () => {

      const RemarkProcessor = remark()
        .use(remarkDirective)
        .use(remarkInclude)
        .freeze();
      const testFile = await vFile.read(
        path.join(testSrcFilesPath, 'main-with-expected-include.md')
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
