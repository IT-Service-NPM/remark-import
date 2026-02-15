# Transclusion or including markdown sub-documents for reuse

`@it-service-npm/remark-include` can include sub-documents in markdown document.

> \[!IMPORTANT]
>
> `remark-directive` plugin expected in remark pipeline before
> `@it-service-npm/remark-include`!

```typescript file=./example.ts
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import remarkInclude from '#@it-service-npm/remark-include';
import type { VFile } from 'vfile';

export async function remarkDirectiveUsingExample(
  filePath: string
): Promise<VFile> {
  return remark()
    .use(remarkDirective)
    .use(remarkInclude)
    .process(await vFile.read(filePath));
};
```

Source files:

main.md:

```markdown file=fixtures/main.md
Hello. I am an main markdown file with `::include` directive.

::include{file=./included.md}

_That_ should do it!
```

included.md:

```markdown file=fixtures/included.md
Hello. I am the included.
```

Remark output:

```markdown file=snapshots/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the included.

*That* should do it!
```
