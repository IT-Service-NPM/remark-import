import path from 'node:path';
import { remarkDirectiveUsingExample } from './example.ts';

const testSourceFilesPath: string = path.join(__dirname, 'fixtures');

describe('remark-include', () => {

  it('update relative path for code files',
    async () => {
      const _cwd = process.cwd();
      try {
        process.chdir(__dirname);

        const outputFile = await remarkDirectiveUsingExample(
          path.join(testSourceFilesPath, 'main.md')
        );

        await expect(String(outputFile))
          .toMatchFileSnapshot(path.join(testSourceFilesPath, 'output.md'));

      } finally {
        process.chdir(_cwd);
      };

    }
  );

});
