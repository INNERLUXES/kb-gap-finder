import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stem, terms, vectorize, cosine, topTerms, mask } from '../src/index.js';

test('stem joins the common forms of a word', () => {
  assert.equal(stem('refunds'), 'refund');
  assert.equal(stem('refunded'), 'refund');
  assert.equal(stem('refunding'), 'refund');
  assert.equal(stem('gas'), 'gas');
});

test('terms drops stop words, short words, numbers and markup', () => {
  assert.deepEqual(terms('<p>How do I return the Jacket? Order 4471</p>'), ['return', 'jacket', 'order']);
});

test('cosine of identical texts is 1, of unrelated texts is 0', () => {
  const [a, b, c] = vectorize([terms('return the jacket'), terms('return the jacket'), terms('password reset link')]);
  assert.ok(Math.abs(cosine(a, b) - 1) < 1e-9);
  assert.equal(cosine(a, c), 0);
});

test('topTerms lists the heaviest terms first', () => {
  const [v] = vectorize([terms('gift gift gift receipt')]);
  assert.equal(topTerms(v, 1)[0], 'gift');
});

test('mask hides email addresses and long numbers', () => {
  assert.equal(mask('mail sam@example.com about order 4471923'), 'mail [email] about order [number]');
  assert.equal(mask('size 42'), 'size 42');
});
