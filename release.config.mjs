// @ts-nocheck

/**
 * @type {import('semantic-release').GlobalConfig}
 *
 * @link https://github.com/JanSzewczyk/semantic-release-config/blob/main/src/index.js
 */
export default {
  extends: "@szum-tech/semantic-release-config/without-npm",
  branches: ["main"],
  "additional-packages": ["@semantic-release/git", "@semantic-release/changelog"],
  plugins: [
    ["@semantic-release/commit-analyzer", {
      preset: "angular"
    }],
    ["@semantic-release/release-notes-generator", {
      preset: "angular",
      presetConfig: {
        types: [
          { type: 'feat', section: 'Features', hidden: false },
          { type: 'fix', section: 'Bug Fixes', hidden: false },
          { type: 'perf', section: 'Performance Improvements', hidden: false },
          { type: 'revert', section: 'Reverts', hidden: false },
          { type: 'docs', section: 'Other Updates', hidden: true },
          { type: 'style', section: 'Other Updates', hidden: true },
          { type: 'chore', section: 'Other Updates', hidden: true },
          { type: 'refactor', section: 'Other Updates', hidden: false },
          { type: 'test', section: 'Other Updates', hidden: false },
          { type: 'build', section: 'Other Updates', hidden: false },
          { type: 'ci', section: 'Other Updates', hidden: false }
        ]
      }
    }],
    ["@semantic-release/changelog", {
      preset: "angular",
      changelogFile: "CHANGELOG.md",
      changelogTitle: `<!-- markdownlint-configure-file
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
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.`
    }],
    ["@semantic-release/npm", {
      npmPublish: false
    }],
    "@semantic-release/github",
    ["@semantic-release/git", {
      assets: [
        "package.json",
        "CHANGELOG.md",
        "docs/*.md",
        "readme.md",
        "test/examples/**/readme.md"
      ],
      message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }]
  ]
};
