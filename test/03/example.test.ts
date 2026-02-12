// import { promisify } from 'node:util';
import * as path from 'node:path';
import { remarkDirectiveUsingExample } from './example.ts';

const testSrcFilesPath: string = path.join(__dirname, 'fixtures');

describe('remark-include', () => {

  it('must include single markdown file', async () => {
    const _cwd = process.cwd();
    try {
      process.chdir(__dirname);

      const outputFile = await remarkDirectiveUsingExample(
        path.join(testSrcFilesPath, 'main.md')
      );

      expect(outputFile.messages.length).toBe(1);
    } finally {
      process.chdir(_cwd);
    };

  });

});
