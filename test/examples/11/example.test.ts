// import { promisify } from 'node:util';
import * as path from 'node:path';
import { remarkDirectiveUsingExample } from './example.ts';

const testSrcFilesPath: string = path.join(__dirname, 'fixtures');

describe('remark-include', () => {

  it('update relative path for code files',
    async () => {
      const _cwd = process.cwd();
      try {
        process.chdir(__dirname);

        const outputFile = await remarkDirectiveUsingExample(
          path.join(testSrcFilesPath, 'main.md')
        );

        await expect(String(outputFile))
          .toMatchFileSnapshot(path.join(testSrcFilesPath, 'output.md'));

      } finally {
        process.chdir(_cwd);
      };

    }
  );

});
