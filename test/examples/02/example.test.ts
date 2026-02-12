// import { promisify } from 'node:util';
import * as path from 'node:path';
import { remarkDirectiveUsingExample } from './example.ts';

const testSrcFilesPath: string = path.join(__dirname, 'fixtures');
const testSnapshotsFilesPath: string = path.join(__dirname, 'snapshots');

describe('remark-include', () => {

  it('must include single markdown file', async () => {
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
