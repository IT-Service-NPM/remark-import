# Adjust the heading levels

`@it-service/remark-include` adjust the heading levels within the included content.

Source files:

main.md:

```markdown file=fixtures/main.md
# Main file

Hello. I am an main markdown file with `::include` directive.

::include{file=./included1.md}

## in main file

_That_ should do it!
```

included1.md:

```markdown file=fixtures/included1.md
# included1 file

Hello. I am the included1.

## in included1 file

::include{file=./included2.md}

## in included 1 file after included2

text text text.
```

included2.md:

```markdown file=fixtures/included2.md
# included2 file

Hello. I am the included2.
```

Remark output:

```markdown file=snapshots/output.md
# Main file

Hello. I am an main markdown file with `::include` directive.

## included1 file

Hello. I am the included1.

### in included1 file

#### included2 file

Hello. I am the included2.

### in included 1 file after included2

text text text.

## in main file

*That* should do it!
```
