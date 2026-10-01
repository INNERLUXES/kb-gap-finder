# kb-gap-finder

Finds the questions your help center does not answer, before a chatbot is trained on it.

A customer service chatbot answers from your help articles. If customers keep asking something no article covers, the bot will not know, or worse, will guess. If two articles say almost the same thing, one of them is usually out of date. This tool compares your support tickets with your help articles and lists:

- the questions customers ask that no article answers, grouped and counted;
- the articles that answer the most tickets;
- the articles no ticket needed;
- pairs of articles so alike that they may repeat or contradict each other.

It uses plain TF-IDF text similarity, so the same files always give the same report. Plain JavaScript, no dependencies; it reads the files you give it and sends nothing anywhere. Email addresses and long numbers in ticket text are masked in the report.

```
npm test
```

```
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

## Quick start

Requires Node 22 or newer. There is nothing to install.

```
git clone https://github.com/INNERLUXES/kb-gap-finder.git
cd kb-gap-finder
node bin/kb-gap-finder.js --tickets examples/tickets.jsonl --articles examples/articles
```

```
kb-gap-finder: 10 ticket(s), 6 article(s)

  tickets an article covers: 6 (60.0%)

Questions no article answers:
    3  Gift return without receipt   [receipt, gift, return, without]
    1  Gift cards abroad   [card, gift, abroad, another]

Articles that answer the most tickets:
    2  Track your order (track-your-order.md)
    1  Delivery countries (delivery-countries.md)
    1  Reset your password (password.md)
    1  Refunds and charges (refunds.md)
    1  Return an item (returns.md)

Articles no ticket needed:
       Countries we deliver to (shipping-countries.md)

Articles so alike they may repeat or contradict each other:
  0.70  delivery-countries.md / shipping-countries.md
```

The made-up shop in `examples/` needs one new article (returning a gift without a receipt) and should merge its two delivery-countries pages before a chatbot learns from them.

## Input

`--tickets` is JSON Lines, one ticket per line, with `subject`, `body` or both:

```json
{"id": "t04", "subject": "Gift return without receipt", "body": "I got a gift and want to return it but I have no receipt."}
```

`--articles` is a folder of `.md`, `.txt` or `.html` files (the first heading is the title), or a JSON Lines file with `title` and `body`.

## Options

```
--cover <0..1>          best-match score a ticket needs to count as covered (default: 0.2)
--group <0..1>          similarity that puts two uncovered tickets in one group (default: 0.35)
--duplicate <0..1>      similarity at which two articles are reported as alike (default: 0.6)
--top <n>               how many gaps to list (default: 10)
--min-coverage <0..1>   exit with 1 when coverage is below this
--format <name>         text, markdown or json
--output <file>         write the report to a file
```

Exit codes: `0` done, `1` coverage below `--min-coverage`, `2` a usage or input error.

## How it decides

[docs/method.md](docs/method.md) explains the scoring and how to tune the three thresholds for your own help center. [docs/limits.md](docs/limits.md) lists what word matching cannot see.

## Background

- How a customer service chatbot is built on approved help content: [customer service chatbot development](https://innerluxes.dev/artificial-intelligence/customer-service-chatbot).

## License

MIT
