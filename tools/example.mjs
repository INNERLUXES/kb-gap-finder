// Runs the README example and checks that it reports what the README shows.

import { main } from '../src/index.js';

let out = '';
const code = await main(['--tickets', 'examples/tickets.jsonl', '--articles', 'examples/articles'],
  { out: (t) => { out += t; }, err: (t) => process.stderr.write(t) });
process.stdout.write(out);
const expected = ['tickets an article covers: 6 (60.0%)', '3  Gift return without receipt', 'delivery-countries.md / shipping-countries.md'];
const missing = expected.filter((e) => !out.includes(e));
if (code !== 0 || missing.length || /sam@example\.com/.test(out)) {
  console.error(`example: unexpected report (exit code ${code}; missing: ${missing.join(' / ') || 'none'})`);
  process.exit(1);
}
