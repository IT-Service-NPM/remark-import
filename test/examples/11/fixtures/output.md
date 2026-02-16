Hello. I am an main markdown file with `::include` directive.

Hello. I am the included. Test for code file path rebasing:

```typescript file=../example.ts
import { remark } from 'remark';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkInclude } from '#@it-service-npm/remark-include';
import codeImport from 'remark-code-import';
import type { VFile } from 'vfile';

interface CodeImportOptions extends Array<unknown> {
  async?: boolean;
  preserveTrailingNewline?: boolean;
  removeRedundantIndentations?: boolean;
  rootDir?: string;
  allowImportingFromOutside?: boolean;
};

export async function remarkDirectiveUsingExample(
  filePath: string
): Promise<VFile> {
  return remark()
    .use(remarkDirective)
    .use(codeImport as Plugin<CodeImportOptions, Root>, {
      async: false,
      preserveTrailingNewline: false
    })
    .use(remarkInclude)
    .process(await vFile.read(filePath));
};

```

Code with file path with spaces and lines range:

```typescript file=subfolder1/code\ with\ spaces.ts#L10-L13
```

And code without file attribute:

```typescript
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkInclude } from '#@it-service-npm/remark-include';
import type { VFile } from 'vfile';
```

*That* should do it!
