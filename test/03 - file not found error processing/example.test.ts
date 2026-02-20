import path from 'node:path';
import { remark } from 'remark';
import type { Processor } from 'unified';
import type { Root } from 'mdast';
import * as vFile from 'to-vfile';
import {
  remarkIncludePreset,
  remarkIncludePresetSync
} from '@it-service-npm/remark-include';

const testSourceFilesPath: string = path.join(__dirname, 'fixtures');
const testSnapshotsFilesPath: string = path.join(__dirname, 'snapshots');

describe('remarkIncludeSync', () => {

  let RemarkProcessor: Processor<Root, undefined, undefined, Root, string>;

  beforeEach(() => {
    RemarkProcessor = remark()
      .use(remarkIncludePresetSync)
      .freeze();
  });

  // eslint-disable-next-line max-len
  it('send a INFO message to the remark processor if the file is not found and an optional attribute is present',
    async () => {

      const testFile = await vFile.read(
        path.join(testSourceFilesPath, 'main-with-optional-include.md')
      );
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect((async function () {
        const outputFile = await RemarkProcessor
          .process(testFile);
        return outputFile.value;
      })()).resolves
        .toMatchFileSnapshot(path.join(testSnapshotsFilesPath, 'output.md'));

      expect(fileInfoSpy).toHaveBeenCalledTimes(1);
      expect(fileFailSpy).toHaveBeenCalledTimes(0);

    });

  // eslint-disable-next-line max-len
  it('send a FAIL message to the remark processor if the file is not found and an optional attribute is not present',
    async () => {

      const testFile = await vFile.read(
        path.join(testSourceFilesPath, 'main-with-expected-include.md')
      );
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect(
        RemarkProcessor
          .process(testFile)
      ).rejects.toThrowError();

      expect(fileInfoSpy).toHaveBeenCalledTimes(0);
      expect(fileFailSpy).toHaveBeenCalledTimes(1);

    });

  // eslint-disable-next-line max-len
  it('send a INFO message to the remark processor if the file is not found with glob and an optional attribute is present',
    async () => {

      const testFile = await vFile.read(path.join(
        testSourceFilesPath,
        'main-with-optional-include-with-glob.md'
      ));
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect((async function () {
        const outputFile = await RemarkProcessor
          .process(testFile);
        return outputFile.value;
      })()).resolves
        .toMatchFileSnapshot(path.join(testSnapshotsFilesPath, 'output.md'));

      expect(fileInfoSpy).toHaveBeenCalledTimes(1);
      expect(fileFailSpy).toHaveBeenCalledTimes(0);

    });

  // eslint-disable-next-line max-len
  it('send a FAIL message to the remark processor if the file is not found with glob and an optional attribute is not present',
    async () => {

      const testFile = await vFile.read(path.join(
        testSourceFilesPath,
        'main-with-expected-include-with-glob.md'
      ));
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect(
        RemarkProcessor
          .process(testFile)
      ).rejects.toThrowError();

      expect(fileInfoSpy).toHaveBeenCalledTimes(0);
      expect(fileFailSpy).toHaveBeenCalledTimes(1);

    });

});

describe('remarkInclude', () => {

  let RemarkProcessor: Processor<Root, undefined, undefined, Root, string>;

  beforeEach(() => {
    RemarkProcessor = remark()
      .use(remarkIncludePreset)
      .freeze();
  });

  // eslint-disable-next-line max-len
  it('send a INFO message to the remark processor if the file is not found and an optional attribute is present',
    async () => {

      const testFile = await vFile.read(
        path.join(testSourceFilesPath, 'main-with-optional-include.md')
      );
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect((async function () {
        const outputFile = await RemarkProcessor
          .process(testFile);
        return outputFile.value;
      })()).resolves
        .toMatchFileSnapshot(path.join(testSnapshotsFilesPath, 'output.md'));

      expect(fileInfoSpy).toHaveBeenCalledTimes(1);
      expect(fileFailSpy).toHaveBeenCalledTimes(0);

    });

  // eslint-disable-next-line max-len
  it('send a FAIL message to the remark processor if the file is not found and an optional attribute is not present',
    async () => {

      const testFile = await vFile.read(
        path.join(testSourceFilesPath, 'main-with-expected-include.md')
      );
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect(
        RemarkProcessor
          .process(testFile)
      ).rejects.toThrowError();

      expect(fileInfoSpy).toHaveBeenCalledTimes(0);
      expect(fileFailSpy).toHaveBeenCalledTimes(1);

    });

  // eslint-disable-next-line max-len
  it('send a INFO message to the remark processor if the file is not found with glob and an optional attribute is present',
    async () => {

      const testFile = await vFile.read(path.join(
        testSourceFilesPath,
        'main-with-optional-include-with-glob.md'
      ));
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect((async function () {
        const outputFile = await RemarkProcessor
          .process(testFile);
        return outputFile.value;
      })()).resolves
        .toMatchFileSnapshot(path.join(testSnapshotsFilesPath, 'output.md'));

      expect(fileInfoSpy).toHaveBeenCalledTimes(1);
      expect(fileFailSpy).toHaveBeenCalledTimes(0);

    });

  // eslint-disable-next-line max-len
  it('send a FAIL message to the remark processor if the file is not found with glob and an optional attribute is not present',
    async () => {

      const testFile = await vFile.read(path.join(
        testSourceFilesPath,
        'main-with-expected-include-with-glob.md'
      ));
      const fileInfoSpy = vi.spyOn(testFile, 'info');
      const fileFailSpy = vi.spyOn(testFile, 'fail');

      await expect(
        RemarkProcessor
          .process(testFile)
      ).rejects.toThrowError();

      expect(fileInfoSpy).toHaveBeenCalledTimes(0);
      expect(fileFailSpy).toHaveBeenCalledTimes(1);

    });

});
