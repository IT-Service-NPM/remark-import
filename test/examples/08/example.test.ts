// import { promisify } from 'node:util';
import * as path from 'node:path';
import {
  remarkDirectiveUsingExample as remarkDirectiveUsingExampleSync
} from './example.sync.ts';
import {
  remarkDirectiveUsingExample
} from './example.ts';

const testSrcFilesPath: string = path.join(__dirname, 'fixtures');
const testSnapshotsFilesPath: string = path.join(__dirname, 'snapshots');

describe('remark-include', () => {

  it('support globs as file path in sync mode', async () => {
    const _cwd = process.cwd();
    try {
      process.chdir(__dirname);

      const outputFile = await remarkDirectiveUsingExampleSync(
        path.join(testSrcFilesPath, 'main.md')
      );

      await expect(String(outputFile))
        .toMatchFileSnapshot(
          path.join(testSnapshotsFilesPath, 'output.md')
        );

    } finally {
      process.chdir(_cwd);
    };

  });

  it('support globs as file path in async mode', async () => {
    const _cwd = process.cwd();
    try {
      process.chdir(__dirname);

      const outputFile = await remarkDirectiveUsingExample(
        path.join(testSrcFilesPath, 'main.md')
      );

      await expect(String(outputFile))
        .toMatchFileSnapshot(path.join(testSnapshotsFilesPath, 'output.md'));

    } finally {
      process.chdir(_cwd);
    };

  });

});
