# @it-service-npm/remark-include Remark plugin

[![GitHub release][github-release]][github-release-url]
[![NPM release][npm]][npm-url]
[![Node version][node]][node-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]

[![CI Status][build]][build-url]
[![Tests Results][tests]][tests-url]
[![Coverage status][coverage]][coverage-url]

[![Semantic Versioning](https://img.shields.io/badge/Semantic%20Versioning-v2.0.0-green.svg?logo=semver)](https://semver.org/lang/ru/spec/v2.0.0.html)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-v1.0.0-yellow.svg?logo=git)](https://conventionalcommits.org)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

[![VS Code](https://img.shields.io/badge/Visual_Studio_Code-0078D4?logo=visual%20studio%20code)](https://code.visualstudio.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-333333.svg?logo=typescript)](http://www.typescriptlang.org/)
[![EditorConfig](https://img.shields.io/badge/EditorConfig-333333.svg?logo=editorconfig)](https://editorconfig.org)
[![ESLint](https://img.shields.io/badge/ESLint-3A33D1?logo=eslint)](https://eslint.org)

[github-release]: https://img.shields.io/github/v/release/IT-Service-NPM/remark-include.svg?sort=semver&logo=github

[github-release-url]: https://github.com/IT-Service-NPM/remark-include/releases

[npm]: https://img.shields.io/npm/v/@it-service-npm/remark-include.svg?logo=npm

[npm-url]: https://www.npmjs.com/package/@it-service-npm/remark-include

[node]: https://img.shields.io/node/v/@it-service-npm/remark-include.svg

[node-url]: https://nodejs.org

[deps]: https://img.shields.io/librariesio/release/npm/@it-service-npm/remark-include

[deps-url]: https://libraries.io/npm/@it-service-npm%2Fremark-include

[size]: https://packagephobia.com/badge?p=@it-service-npm/remark-include

[size-url]: https://packagephobia.com/result?p=@it-service-npm/remark-include

[build]: https://github.com/IT-Service-NPM/remark-include/actions/workflows/ci.yml/badge.svg?branch=main

[build-url]: https://github.com/IT-Service-NPM/remark-include/actions/workflows/ci.yml

[tests]: https://img.shields.io/endpoint?logo=vitest&url=https%3A%2F%2Fgist.githubusercontent.com%2Fsergey-s-betke%2Fd70e4de09a490afc9fb7a737363b231a%2Fraw%2Fremark-include-junit-tests.json

[tests-url]: https://github.com/IT-Service-NPM/remark-include/actions/workflows/ci.yml

[coverage]: https://coveralls.io/repos/github/IT-Service-NPM/remark-include/badge.svg?branch=main

[coverage-url]: https://coveralls.io/github/IT-Service-NPM/remark-include?branch=main

With this plugin, you can use `::include{file=./included.md}`
statements to compose markdown files together.

This plugin is a modern version of
[`remark-import`](https://github.com/BrekiTomasson/remark-import) plugin
and [`remark-include`](https://github.com/Qard/remark-include) plugin,
written in Typescript, and compatible with Remark v15.

Relative images and links in the imported files will have their paths rewritten
to be relative the original document rather than the imported file.

An imported markdown file will “inherit” the heading levels.
If the `::include{file=./included.md}` statement happens under Heading 2,
for example, any heading 1 in the included file
will be “translated” to have header level 3.

`remarkInclude` (preferably) and `remarkIncludeSync` are exported.

## Contents

- [@it-service-npm/remark-include Remark plugin](#it-service-npmremark-include-remark-plugin)
  - [Contents](#contents)
  - [Install](#install)
  - [Examples](#examples)
    - [Transclusion or including markdown sub-documents for reuse](#transclusion-or-including-markdown-sub-documents-forreuse)
    - [File name without extension](#file-name-withoutextension)
    - [Recursive transclusion](#recursive-transclusion)
    - [Updating relative path for links, images](#updating-relative-path-for-linksimages)
    - [Updating relative path for code files](#updating-relative-path-for-codefiles)
  - [API](#api)
  - [License](#license)

## Install

```sh
npm install --save-dev @it-service-npm/remark-include
```

`remark-directive` plugin expected before
`@it-service-npm/remark-include`!

## Examples

### Transclusion or including markdown sub-documents for reuse

`@it-service-npm/remark-include` can include sub-documents in markdown document.

> [!IMPORTANT]
>
> `remark-directive` plugin expected in remark pipeline before
> `@it-service-npm/remark-include`!

```typescript file=test/examples/01/example.ts
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkIncludeSync } from '#@it-service-npm/remark-include';
import type { VFile } from 'vfile';

export async function remarkDirectiveUsingExample(
  filePath: string
): Promise<VFile> {
  return remark()
    .use(remarkDirective)
    .use(remarkIncludeSync)
    .process(await vFile.read(filePath));
};

```

Source files:

main.md:

```markdown file=test/examples/01/fixtures/main.md
Hello. I am an main markdown file with `::include` directive.

::include{file=./included.md}

_That_ should do it!

```

included.md:

```markdown file=test/examples/01/fixtures/included.md
Hello. I am the included.
```

Remark output:

```markdown file=test/examples/01/snapshots/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the included.

*That* should do it!

```

### File name without extension

`@it-service-npm/remark-include` can include sub-documents
in markdown main document with file name without extension.

In this example used async plugin `remarkInclude`.

> [!TIP]
>
> For extension list used
> [markdown-extensions](https://www.npmjs.com/package/markdown-extensions)
> package.

Source files:

```typescript file=test/examples/02/example.ts
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkInclude } from '#@it-service-npm/remark-include';
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

main.md:

```markdown file=test/examples/02/fixtures/main.md
Hello. I am an main markdown file with `::include` directive.

::include{file=./included1}

::include{file=./included2}

_That_ should do it!

```

included1.md:

```markdown file=test/examples/02/fixtures/included1.md
Hello. I am the `included1.md` file.

```

included2.markdown:

```markdown file=test/examples/02/fixtures/included2.markdown
Hello. I am the `included2.markdown` file.
```

Remark output:

```markdown file=test/examples/02/snapshots/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the `included1.md` file.

Hello. I am the `included2.markdown` file.

*That* should do it!

```

### Recursive transclusion

`@it-service-npm/remark-include` directive supported in included files.

Source files:

main.md:

```markdown file=test/examples/04/fixtures/main.md
Hello. I am an main markdown file with `::include` directive.

::include{file=./included1.md}

_That_ should do it!

```

included1.md:

```markdown file=test/examples/04/fixtures/included1.md
Hello. I am the included1.

::include{file=./included2.md}

```

included2.md:

```markdown file=test/examples/04/fixtures/included2.md
Hello. I am the included2.

```

Remark output:

```markdown file=test/examples/04/snapshots/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the included1.

Hello. I am the included2.

*That* should do it!

```

### Updating relative path for links, images

Relative images and links in the imported files will have their paths rewritten
to be relative the original document rather than the imported file.

Source files:

main.md:

```markdown file=test/examples/10/fixtures/main.md
Hello. I am an main markdown file with `::include` directive.

::include{file=./subfolder1/included.md}

_That_ should do it!

```

included.md:

```markdown file=test/examples/10/fixtures/subfolder1/included.md
Hello. I am the included. Test image:

![Test local image](test-image.png)

![Test local image with space](test%20image.png)

![Test web image](https://img.shields.io/badge/github-repo-blue?logo=github)

```

Remark output:

```markdown file=test/examples/10/fixtures/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the included. Test image:

![Test local image](subfolder1/test-image.png)

![Test local image with space](subfolder1/test%20image.png)

![Test web image](https://img.shields.io/badge/github-repo-blue?logo=github)

*That* should do it!

```

### Updating relative path for code files

Relative images and links in the imported files will have their paths rewritten
to be relative the original document rather than the imported file.

Source files:

main.md:

```markdown file=test/examples/11/fixtures/main.md
Hello. I am an main markdown file with `::include` directive.

::include{file=./subfolder1/included.md}

_That_ should do it!

```

included.md:

````markdown file=test/examples/11/fixtures/subfolder1/included.md
Hello. I am the included. Test for code file path rebasing:

```typescript file=../../example.ts
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkInclude } from '#@it-service-npm/remark-include';
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

Code with file path with spaces and lines range:

```typescript file=code\ with\ spaces.ts#L10-L13
  return remark()
    .use(remarkDirective)
    .use(remarkInclude)
    .process(await vFile.read(filePath));
```

And code without file attribute:

```typescript
import { remark } from 'remark';
import * as vFile from 'to-vfile';
import remarkDirective from 'remark-directive';
import { remarkInclude } from '#@it-service-npm/remark-include';
import type { VFile } from 'vfile';
```

````

Remark output:

````markdown file=test/examples/11/fixtures/output.md
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

````

## API

Please, read the [API reference](/docs/index.md).

## License

[MIT](LICENSE) © [Sergei S. Betke](https://github.com/sergey-s-betke)
