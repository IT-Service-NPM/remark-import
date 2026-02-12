# Updating relative path for links, images

Relative images and links in the imported files will have their paths rewritten
to be relative the original document rather than the imported file.

> [!IMPORTANT]
>
> `remark-directive` plugin expected in remark pipeline before
> `@it-service/remark-include`!

```typescript file=./example.ts
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkInclude } from '#@it-service/remark-include';
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

::include{file=./subfolder1/included.md}

_That_ should do it!

```

included.md:

```markdown file=fixtures/subfolder1/included.md
Hello. I am the included. Test image:

![Test local image](test-image.png)

![Test local image with space](test%20image.png)

![Test web image](https://img.shields.io/badge/github-repo-blue?logo=github)

```

Remark output:

```markdown file=fixtures/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the included. Test image:

![Test local image](subfolder1/test-image.png)

![Test local image with space](subfolder1/test%20image.png)

![Test web image](https://img.shields.io/badge/github-repo-blue?logo=github)

*That* should do it!

```
