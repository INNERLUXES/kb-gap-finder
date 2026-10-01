# Method

1. **Words.** Each ticket and article is lower-cased, markup and numbers are removed, common words are dropped, and simple endings are cut so that "refund", "refunds" and "refunded" count as one term.
2. **Weights.** Every term gets a TF-IDF weight computed over all tickets and articles together: a term that appears in many documents counts little, a rare term counts a lot.
3. **Best match.** Each ticket is compared with every article (cosine similarity). Its best score decides whether it is covered (`--cover`, default 0.2).
4. **Gaps.** Uncovered tickets are grouped: a ticket joins the first group whose first ticket it resembles at `--group` (default 0.35) or more. Groups are listed by size.
5. **Article use.** An article is "used" when it is the best match of at least one covered ticket.
6. **Near duplicates.** Every pair of articles with a similarity of `--duplicate` (default 0.6) or more is listed.

## Tuning

- Short, chatty tickets match weakly: lower `--cover` if obviously answered tickets show up as gaps.
- If unrelated gaps are grouped together, raise `--group`; if one question is split across groups, lower it.
- Help centers with templated articles (same headings, same footer) look more alike: raise `--duplicate`, or strip the template before the run.

Run the tool on the same files after each change: the method has no randomness, so any change in the report comes from the change in the files or the thresholds.
