# Security

## Reporting a problem

Write to info@innerluxes.dev with the subject line "kb-gap-finder security", or use private vulnerability reporting on this repository. Please do not open a public issue for a vulnerability.

Include small made-up tickets and articles that show the problem, what you expected and what happened.

## Scope

In scope:

- personal data that reaches a report unmasked
- an input that makes the tool hang or use unbounded memory
- a Markdown report that breaks its table
- anything that makes the tool open a network connection, follow a link out of the articles folder, or read or write a file it was not given

Out of scope: who may read the tickets and the help center; docs/limits.md lists what word matching cannot see.

Read [docs/threat-model.md](docs/threat-model.md) for the rest.
