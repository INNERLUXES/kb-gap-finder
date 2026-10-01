# Threat model

## What the tool touches

- It reads one tickets file and the articles folder or file it is given. Symbolic links in the folder are not followed.
- It writes only when `--output` is given, and only that file.
- It opens no network connection and runs nothing from the files it reads.

## What could go wrong, and what stops it

| Risk | Control |
| --- | --- |
| Personal data from tickets lands in a shared report | Ticket text shown in the report is masked (emails, long numbers); only one example per gap is shown, never whole tickets |
| An article in HTML injects markup into a Markdown report | Titles and examples are escaped in tables; tags are removed before scoring |
| A malformed tickets file gives misleading numbers | A bad line stops the run with exit code 2 and its line number |
| A very large input exhausts memory | The comparison is in memory; docs/limits.md says to split very large sets |

## Out of scope

Who may read the tickets and the help center, and the chatbot that later uses the articles.
