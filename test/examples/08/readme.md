# Include multiple files with glob

`@it-service-npm/remark-include` support
[glob](https://www.npmjs.com/package/glob)
as `file` attribute value.

Source files:

main.md:

```markdown file=fixtures/main.md
# main file

Hello. I am an main markdown file with `::include` directive.

::include{file=./included*.md}

_That_ should do it!
```

included1.md:

```markdown file=fixtures/included1.md
# included 1

Hello. I am the included1.
```

included2.md:

```markdown file=fixtures/included2.md
# included 2

Hello. I am the included2.
```

included3.md:

```markdown file=fixtures/included3.md
# included 3

Hello. I am the included3.
```

Remark output:

```markdown file=snapshots/output.md
# main file

Hello. I am an main markdown file with `::include` directive.

## included 1

Hello. I am the included1.

## included 2

Hello. I am the included2.

## included 3

Hello. I am the included3.

*That* should do it!
```
