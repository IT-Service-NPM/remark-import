<!-- markdownlint-configure-file
{
  "default": true,
  "line-length": false,
  "no-duplicate-heading": false,
  "no-multiple-blanks": false,
  "heading-increment": false,
  "single-title": false
}
-->
# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.2.0](https://github.com/IT-Service-NPM/remark-include/compare/v3.1.0...v3.2.0) (2026-02-16)


### Features

* add globs support ([e0c24ee](https://github.com/IT-Service-NPM/remark-include/commit/e0c24ee16b8030f2b3ff33e9d946bea270417dbe)), closes [#9](https://github.com/IT-Service-NPM/remark-include/issues/9)

# [3.1.0](https://github.com/IT-Service-NPM/remark-include/compare/v3.0.0...v3.1.0) (2026-02-16)

### Features

* fix url in all Resource nodes,
  not just in links, images and definitions
  ([e88accc](https://github.com/IT-Service-NPM/remark-include/commit/e88accce5de75a7eb3f99b4fdf54a96e0a91bbdc))

# [3.0.0](https://github.com/IT-Service-NPM/remark-include/compare/v2.0.6...v3.0.0) (2026-02-16)

### Bug Fixes

* fix multiple `::include` in one file
  ([4aa0879](https://github.com/IT-Service-NPM/remark-include/commit/4aa0879493d587bfa510e5f1d7bb5d3c1630afd4))

### Features

* support async processing
  ([3007f8c](https://github.com/IT-Service-NPM/remark-include/commit/3007f8c11ec06e8cfbef8305dfb5a85034ca628f)),
  closes [#6](https://github.com/IT-Service-NPM/remark-include/issues/6)

### BREAKING CHANGES

* added `remarkInclude` (async, preferably) and `remarkIncludeSync` exports (#6)

## [2.0.6](https://github.com/IT-Service-NPM/remark-include/compare/v2.0.5...v2.0.6) (2026-02-15)

### Bug Fixes

* fix spaces escaping in code file path
  ([331ead8](https://github.com/IT-Service-NPM/remark-include/commit/331ead838b1581a7802667c10f4f7e43635277c9))

## [2.0.5](https://github.com/IT-Service-NPM/remark-include/compare/v2.0.4...v2.0.5) (2026-02-15)

### Bug Fixes

* if file not found, remove `::include` directive
  ([6100f4b](https://github.com/IT-Service-NPM/remark-include/commit/6100f4be43750ff0184beffdcdd2d5bd5c939722))

## [2.0.4](https://github.com/IT-Service-NPM/remark-include/compare/v2.0.3...v2.0.4) (2026-02-14)

### Bug Fixes

* remove development dependency
  (`mdast`, used just `@types/mdast`)
  ([f1c8321](https://github.com/IT-Service-NPM/remark-include/commit/f1c83219201a0c783bdfea5594a9db03c34d2f14))

## [2.0.3](https://github.com/IT-Service-NPM/remark-include/compare/v2.0.2...v2.0.3) (2026-02-13)

### Bug Fixes

* remove runtime dependency
  (`remark-directive`)
  ([145855f](https://github.com/IT-Service-NPM/remark-include/commit/145855f718f2cdc276ecfeffd25ba6fe6622e428))

## [2.0.2](https://github.com/IT-Service-NPM/remark-include/compare/v2.0.1...v2.0.2) (2026-02-13)

### Bug Fixes

* remove runtime dependencies
  (`mdast-util-directive`, `mdast-util-to-hast`, `unified`, `vfile`)
  ([9c09a97](https://github.com/IT-Service-NPM/remark-include/commit/9c09a97b0bdd5b3f9246a9ed00115277753a506f))

## [2.0.1](https://github.com/IT-Service-NPM/remark-include/compare/v2.0.0...v2.0.1) (2026-02-13)

### Bug Fixes

* remove runtime dependency
  (`mdast`)
  ([cd8a00e](https://github.com/IT-Service-NPM/remark-include/commit/cd8a00efd2bbcdb9a3dbd8dd5148b51c3b5f68c7))

# [2.0.0](https://github.com/IT-Service-NPM/remark-include/compare/v1.0.0...v2.0.0) (2026-02-13)

### BREAKING CHANGES

* change scope to `@it-service-npm`

### Bug Fixes

* always use code file path in posix format
  ([1a71e89](https://github.com/IT-Service-NPM/remark-include/commit/1a71e891c5e03d31f22284d2bf513d5145942498)),
  closes [#4](https://github.com/IT-Service-NPM/remark-include/issues/4)
* fix error messages style
  ([d831149](https://github.com/IT-Service-NPM/remark-include/commit/d8311494394e64e14b062180c19ead062d8db1e9)),
  closes [#7](https://github.com/IT-Service-NPM/remark-include/issues/7)
* fix nodes url processing (not as path, as url)
  ([02109ff](https://github.com/IT-Service-NPM/remark-include/commit/02109ff16dba655b297b0cf40262bad524ec2e3d)),
  closes [#4](https://github.com/IT-Service-NPM/remark-include/issues/4)

### Features

* adjust the heading levels
  ([9057276](https://github.com/IT-Service-NPM/remark-include/commit/9057276eeb7c9d14631d17080f7acd6419af5275)),
  closes [#8](https://github.com/IT-Service-NPM/remark-include/issues/8)
* update relative file path in the code blocks
  ([407204e](https://github.com/IT-Service-NPM/remark-include/commit/407204ef2919116a24d983abaededfc016918b88)),
  closes [#4](https://github.com/IT-Service-NPM/remark-include/issues/4)
* update relative links (files paths)
  ([9ef224a](https://github.com/IT-Service-NPM/remark-include/commit/9ef224a027cacf00dbcdd823ce99bfb2471a8566)),
  closes [#4](https://github.com/IT-Service-NPM/remark-include/issues/4)
* add support for specify file path without extension
  ([442ede8](https://github.com/IT-Service-NPM/remark-include/commit/442ede8624fa853e39bb7eb81cdd6640bf63e297)),
  closes [#5](https://github.com/IT-Service-NPM/remark-include/issues/5)
* include directive refactored with Typescript
  ([e22f4b1](https://github.com/IT-Service-NPM/remark-include/commit/e22f4b10287ee99fd0855ca473050989032ea114)),
  [#2](https://github.com/IT-Service-NPM/remark-include/issues/2)
