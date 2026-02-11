# Recursive transclusion

`@it-service/remark-include` directive supported in included files.

> [!IMPORTANT]
>
> `remark-directive` plugin expected in remark pipeline before
> `@it-service/remark-include`!

```typescript file=./example.ts
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import remarkInclude from '#@it-service/remark-include';
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

::include{file=./included1.md}

_That_ should do it!

```

included1.md:

```markdown file=fixtures/included1.md
Hello. I am the included1.

::include{file=./included2.md}

```

included2.md:

```markdown file=fixtures/included2.md
Hello. I am the included2.

```

Remark output:

```markdown file=__snapshots__/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the included1.

Hello. I am the included2.

*That* should do it!

```
