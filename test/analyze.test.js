import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, parseTickets, parseArticles } from '../src/index.js';

const articles = parseArticles([
  '{"id": "a1", "title": "Reset your password", "body": "Forgot password? Use the reset link to sign in to your account."}',
  '{"id": "a2", "title": "Return an item", "body": "Return an item with the return label from your order page."}',
  '{"id": "a3", "title": "Return items", "body": "Return items with the return label from the order page."}'
].join('\n'));

test('covered tickets, a grouped gap, an unused article and a near duplicate', () => {
  const tickets = parseTickets([
    '{"id": "t1", "subject": "Forgot password", "body": "I cannot sign in, I forgot my password"}',
    '{"id": "t2", "subject": "Gift card balance", "body": "How do I check my gift card balance?"}',
    '{"id": "t3", "subject": "Gift card balance?", "body": "What is the balance on my gift card"}'
  ].join('\n'));
  const r = analyze(tickets, articles);
  assert.equal(r.covered, 1);
  assert.equal(r.gaps.length, 1);
  assert.equal(r.gaps[0].tickets, 2);
  assert.ok(r.gaps[0].terms.includes('gift') || r.gaps[0].terms.includes('balance'));
  assert.deepEqual(r.unused.map((a) => a.id).sort(), ['a2', 'a3']);
  assert.deepEqual(r.duplicates.map((d) => [d.a, d.b]), [['a2', 'a3']]);
});

test('ticket text in the report is masked', () => {
  const tickets = parseTickets('{"id": "t1", "subject": "Refund for sam@example.com order 4471923", "body": "please refund"}');
  const r = analyze(tickets, articles);
  assert.match(r.gaps[0].example, /\[email\].*\[number\]/);
});

test('parsers refuse bad lines and empty files', () => {
  assert.throws(() => parseTickets('{"id": "x"}'), /needs "subject" or "body"/);
  assert.throws(() => parseTickets('{oops'), /line 1: not valid JSON/);
  assert.throws(() => parseTickets('# nothing'), /no tickets/);
  assert.throws(() => parseArticles('[1]'), /JSON object/);
});
