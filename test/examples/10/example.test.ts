// import { promisify } from 'node:util';
import * as path from 'node:path';
import { remarkDirectiveUsingExample } from './example.ts';

const testSrcFilesPath: string = path.join(__dirname, 'fixtures');

describe('remark-include', () => {

  it('update relative url for images',
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

  it('leave links (url) starting with `/` (relative to the repository root)',
    async () => {
      const _cwd = process.cwd();
      try {
        process.chdir(__dirname);

        const outputFile = await remarkDirectiveUsingExample(
          path.join(testSrcFilesPath, 'main-with-relative-to-root-link.md')
        );

        await expect(String(outputFile))
          .toMatchFileSnapshot(path.join(
            testSrcFilesPath,
            'output-with-relative-to-root-link.md'
          ));

      } finally {
        process.chdir(_cwd);
      };

    }
  );

});
