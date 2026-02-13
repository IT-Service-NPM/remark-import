# File name without extension

`@it-service-npm/remark-include` can include sub-documents
in markdown main document with file name without extension.

> [!TIP]
>
> For extension list used
> [markdown-extensions](https://www.npmjs.com/package/markdown-extensions)
> package.

Source files:

main.md:

```markdown file=fixtures/main.md
Hello. I am an main markdown file with `::include` directive.

::include{file=./included1}

::include{file=./included2}

_That_ should do it!

```

included1.md:

```markdown file=fixtures/included1.md
Hello. I am the `included1.md` file.

```

included2.markdown:

```markdown file=fixtures/included2.markdown
Hello. I am the `included2.markdown` file.
```

Remark output:

```markdown file=snapshots/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the `included1.md` file.

Hello. I am the `included2.markdown` file.

*That* should do it!

```
