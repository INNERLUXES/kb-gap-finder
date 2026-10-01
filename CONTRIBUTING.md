# Contributing

Every change goes through a pull request and is reviewed before it is merged. The pipeline runs the tests on Linux, Windows and macOS, the repository checks, CodeQL, and a secure development check of the repository itself.

## Changing the method

1. Describe the change in docs/method.md first.
2. Add a test with small, made-up tickets and articles where the result can be worked out by hand.
3. Anything shown in a report goes through `mask` first.

## Rules for the code

- No runtime dependencies. Node 22 or newer and nothing else.
- The tool reads the files it is given and writes only when `--output` is given. It opens no network connection.
- Never commit real tickets or a real help center, even as fixtures.

## Before you open the pull request

```
npm test
npm run check
npm run example
```
