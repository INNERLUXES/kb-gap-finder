import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseArgs, main, toMarkdown, loadArticles } from '../src/index.js';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const ex = (p) => join(root, 'examples', p);
const quiet = { out: () => {}, err: () => {} };

test('parseArgs reads options and refuses bad input', () => {
  const o = parseArgs(['--tickets', 't', '--articles', 'a', '--cover', '0.3', '--min-coverage', '0.5', '--format', 'json']);
  assert.equal(o.cover, 0.3);
  assert.equal(o.minCoverage, 0.5);
  assert.throws(() => parseArgs(['--tickets', 't']), /--tickets and --articles/);
  assert.throws(() => parseArgs(['--tickets', 't', '--articles', 'a', '--cover', '2']), /from 0 to 1/);
  assert.throws(() => parseArgs(['--tickets', 't', '--articles', 'a', '--top', '0']), /positive whole/);
});

test('loadArticles reads a folder and takes the first heading as the title', async () => {
  const a = await loadArticles(ex('articles'));
  assert.equal(a.length, 6);
  assert.equal(a.find((x) => x.id === 'password.md').title, 'Reset your password');
});

test('the example: coverage, the gift receipt gap, the duplicate pair, no email in the report', async () => {
  let out = '';
  assert.equal(await main(['--tickets', ex('tickets.jsonl'), '--articles', ex('articles'), '--format', 'json'], { out: (t) => { out += t; }, err: () => {} }), 0);
  const r = JSON.parse(out);
  assert.equal(r.tickets, 10);
  assert.equal(r.covered, 6);
  assert.equal(r.gaps[0].tickets, 3);
  assert.match(r.gaps[0].example, /receipt/i);
  assert.deepEqual(r.duplicates.map((d) => [d.a, d.b]), [['delivery-countries.md', 'shipping-countries.md']]);
  assert.doesNotMatch(out, /sam@example\.com/);
});

test('the gate and input errors', async () => {
  assert.equal(await main(['--tickets', ex('tickets.jsonl'), '--articles', ex('articles'), '--min-coverage', '0.8'], quiet), 1);
  assert.equal(await main(['--tickets', ex('tickets.jsonl'), '--articles', ex('articles'), '--min-coverage', '0.5'], quiet), 0);
  assert.equal(await main(['--tickets', 'missing.jsonl', '--articles', ex('articles')], quiet), 2);
  assert.equal(await main(['--help'], quiet), 0);
});

test('Markdown escapes pipes', () => {
  const md = toMarkdown({ tickets: 1, articles: 1, covered: 0, coverage: 0, gaps: [{ tickets: 1, example: 'a|b', terms: ['c|d'] }], unused: [], duplicates: [] });
  assert.match(md, /a\\\|b/);
});
