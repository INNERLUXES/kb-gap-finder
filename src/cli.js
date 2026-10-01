// Command line: kb-gap-finder --tickets <tickets.jsonl> --articles <folder or articles.jsonl> [options]

import { readFile, writeFile } from 'node:fs/promises';
import { parseTickets, loadArticles } from './load.js';
import { analyze, pct, DEFAULTS } from './analyze.js';
import { toText, toMarkdown, toJson } from './report.js';

const FORMATS = { text: toText, markdown: toMarkdown, json: toJson };

export const USAGE = `Usage: kb-gap-finder --tickets <tickets.jsonl> --articles <folder | articles.jsonl> [options]

Compares support tickets with help articles: the questions no article answers, the articles no ticket needs,
and articles so alike they may contradict each other. Reads files only; ticket text is masked in the report.

Options:
  --cover <0..1>          best-match score a ticket needs to count as covered (default: ${DEFAULTS.cover})
  --group <0..1>          similarity that puts two uncovered tickets in one group (default: ${DEFAULTS.group})
  --duplicate <0..1>      similarity at which two articles are reported as alike (default: ${DEFAULTS.duplicate})
  --top <n>               how many gaps to list (default: ${DEFAULTS.top})
  --min-coverage <0..1>   exit with 1 when fewer tickets than this are covered
  --format <name>         text, markdown or json (default: text)
  --output <file>         write the report to a file instead of the screen
  --help                  show this text
`;

function share(name, v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1) throw new Error(`${name} takes a number from 0 to 1`);
  return n;
}

export function parseArgs(argv) {
  const o = { tickets: null, articles: null, cover: DEFAULTS.cover, group: DEFAULTS.group, duplicate: DEFAULTS.duplicate, top: DEFAULTS.top,
    minCoverage: null, format: 'text', output: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`);
      i += 1;
      return v;
    };
    if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--tickets') o.tickets = next();
    else if (a === '--articles') o.articles = next();
    else if (a === '--cover') o.cover = share(a, next());
    else if (a === '--group') o.group = share(a, next());
    else if (a === '--duplicate') o.duplicate = share(a, next());
    else if (a === '--min-coverage') o.minCoverage = share(a, next());
    else if (a === '--top') {
      o.top = Number(next());
      if (!Number.isInteger(o.top) || o.top < 1) throw new Error('--top takes a positive whole number');
    } else if (a === '--format') o.format = next();
    else if (a === '--output') o.output = next();
    else throw new Error(`unknown argument ${a}`);
  }
  if (!o.help) {
    if (!o.tickets || !o.articles) throw new Error('give --tickets and --articles');
    if (!FORMATS[o.format]) throw new Error(`unknown format ${o.format}`);
  }
  return o;
}

// Exit code: 0 done (and gate passed), 1 coverage below --min-coverage, 2 usage or input error.
export async function main(argv, io = { out: (t) => process.stdout.write(t), err: (t) => process.stderr.write(t) }) {
  let o;
  try {
    o = parseArgs(argv);
  } catch (error) {
    io.err(`kb-gap-finder: ${error.message}\n\n${USAGE}`);
    return 2;
  }
  if (o.help) {
    io.out(USAGE);
    return 0;
  }
  let report;
  try {
    const tickets = parseTickets(await readFile(o.tickets, 'utf8'));
    const articles = await loadArticles(o.articles);
    report = analyze(tickets, articles, { cover: o.cover, group: o.group, duplicate: o.duplicate, top: o.top });
  } catch (error) {
    io.err(`kb-gap-finder: ${error.message}\n`);
    return 2;
  }
  if (o.minCoverage !== null) {
    const pass = report.coverage >= o.minCoverage;
    report.gate = { pass, reason: pass ? '' : `coverage ${pct(report.coverage)} is below ${pct(o.minCoverage)}` };
  }
  const out = FORMATS[o.format](report);
  if (o.output) await writeFile(o.output, out, 'utf8');
  else io.out(out);
  return report.gate && !report.gate.pass ? 1 : 0;
}
