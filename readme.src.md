# @it-service/remark-include Remark plugin

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

[npm]: https://img.shields.io/npm/v/@it-service/remark-include.svg?logo=npm

[npm-url]: https://www.npmjs.com/package/@it-service/remark-include

[node]: https://img.shields.io/node/v/@it-service/remark-include.svg

[node-url]: https://nodejs.org

[deps]: https://img.shields.io/librariesio/release/npm/@it-service/remark-include

[deps-url]: https://libraries.io/npm/@it-service/remark-include/tree

[size]: https://packagephobia.com/badge?p=@it-service/remark-include

[size-url]: https://packagephobia.com/result?p=@it-service/remark-include

[build]: https://github.com/IT-Service-NPM/remark-include/actions/workflows/ci.yml/badge.svg?branch=main

[build-url]: https://github.com/IT-Service-NPM/remark-include/actions/workflows/ci.yml

[tests]: https://img.shields.io/endpoint?logo=vitest&url=https%3A%2F%2Fgist.githubusercontent.com%2Fsergey-s-betke%2Fd70e4de09a490afc9fb7a737363b231a%2Fraw%2Fremark-include-junit-tests.json

[tests-url]: https://github.com/IT-Service-NPM/remark-include/actions/workflows/ci.yml

[coverage]: https://img.shields.io/endpoint?logo=vitest&url=https%3A%2F%2Fgist.githubusercontent.com%2Fsergey-s-betke%2Fd70e4de09a490afc9fb7a737363b231a%2Fraw%2Fremark-include-lcov-coverage.json

[coverage-url]: https://github.com/IT-Service-NPM/remark-include/actions/workflows/ci.yml

This plugin is a modern version of
[`remark-import`](https://github.com/BrekiTomasson/remark-import) plugin
and [`remark-include`](https://github.com/Qard/remark-include) plugin,
written in Typescript, and compatible with Remark v15.

Relative images and links in the imported files will have their paths rewritten
to be relative the original document rather than the imported file.

## Contents

- [@it-service/remark-include Remark plugin](#it-serviceremark-include-remark-plugin)
  - [Contents](#contents)
  - [Install](#install)
  - [Examples](#examples)
  - [API](#api)
  - [License](#license)

## Install

```sh
npm install --save-dev @it-service/remark-include
```

`remark-directive` plugin expected before
`@it-service/remark-include`!

## Examples

::include{file=test/examples/01/readme.md}

::include{file=test/examples/02/readme.md}

## API

Please, read the [API reference](/docs/index.md).

## License

[MIT](LICENSE) © [Sergei S. Betke](https://github.com/sergey-s-betke)
