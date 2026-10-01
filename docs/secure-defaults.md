# Secure defaults

The default run is the safe run. Nothing below needs a flag.

- **Masked by default.** Email addresses and runs of six or more digits (phone, order, card and account numbers) in ticket text are replaced with `[email]` and `[number]` before an example reaches the report. Masking cannot be switched off.
- **One example per gap.** The report shows one masked example and the main terms for each group of tickets, never the full text of a ticket.
- **No network.** The tool reads the files it is given and sends nothing anywhere, so it can run where the ticket export already lives.
- **No dependencies.** Node 22 or newer and nothing else, so there is no third-party code that could read the tickets.
- **No links followed.** Symbolic links inside the articles folder are skipped, so the run cannot wander outside the folder it was given.
- **Fails closed.** A bad line in the tickets stops the run with exit code 2 and the line number, instead of being skipped quietly.
- **Writes only what it is told to.** Output goes to the screen unless `--output` names a file.

## Sharing a report safely

1. Run the tool where the ticket export already is; do not copy raw tickets to another machine.
2. Share the Markdown or text report, not the export.
3. Read the gap examples before sharing outside the support team: names and street addresses are not masked (see docs/limits.md).
4. Delete the raw export when the review is done, as your retention rules require.
