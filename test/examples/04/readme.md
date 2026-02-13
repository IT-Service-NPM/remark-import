# Recursive transclusion

`@it-service-npm/remark-include` directive supported in included files.

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

```markdown file=snapshots/output.md
Hello. I am an main markdown file with `::include` directive.

Hello. I am the included1.

Hello. I am the included2.

*That* should do it!
```
