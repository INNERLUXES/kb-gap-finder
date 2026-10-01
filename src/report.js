// Report formats: text for a terminal, Markdown for the support team's review, JSON for other tools.

import { pct } from './analyze.js';

function cell(t) {
  return String(t).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function toText(r) {
  const lines = [`kb-gap-finder: ${r.tickets} ticket(s), ${r.articles} article(s)`, '',
    `  tickets an article covers: ${r.covered} (${pct(r.coverage)})`];
  if (r.gaps.length) {
    lines.push('', 'Questions no article answers:');
    for (const g of r.gaps) lines.push(`  ${String(g.tickets).padStart(3)}  ${g.example}   [${g.terms.join(', ')}]`);
  }
  if (r.mostUsed.length) {
    lines.push('', 'Articles that answer the most tickets:');
    for (const a of r.mostUsed) lines.push(`  ${String(a.tickets).padStart(3)}  ${a.title} (${a.id})`);
  }
  if (r.unused.length) {
    lines.push('', 'Articles no ticket needed:');
    for (const a of r.unused) lines.push(`       ${a.title} (${a.id})`);
  }
  if (r.duplicates.length) {
    lines.push('', 'Articles so alike they may repeat or contradict each other:');
    for (const d of r.duplicates) lines.push(`  ${d.similarity.toFixed(2)}  ${d.a} / ${d.b}`);
  }
  if (r.gate) lines.push('', r.gate.pass ? 'GATE: PASS' : `GATE: FAIL - ${r.gate.reason}`);
  return lines.join('\n') + '\n';
}

export function toMarkdown(r) {
  const lines = [`## kb-gap-finder: ${pct(r.coverage)} of tickets covered`, '', `${r.tickets} tickets, ${r.articles} articles, ${r.covered} covered.`];
  if (r.gaps.length) {
    lines.push('', '| Tickets | Question no article answers | Terms |', '| --- | --- | --- |');
    for (const g of r.gaps) lines.push(`| ${g.tickets} | ${cell(g.example)} | ${cell(g.terms.join(', '))} |`);
  }
  if (r.unused.length) {
    lines.push('', '| Article no ticket needed |', '| --- |');
    for (const a of r.unused) lines.push(`| ${cell(a.title)} (${cell(a.id)}) |`);
  }
  if (r.duplicates.length) {
    lines.push('', '| Similarity | Article | Article |', '| --- | --- | --- |');
    for (const d of r.duplicates) lines.push(`| ${d.similarity.toFixed(2)} | ${cell(d.a)} | ${cell(d.b)} |`);
  }
  if (r.gate && !r.gate.pass) lines.push('', `**Gate failed:** ${cell(r.gate.reason)}`);
  return lines.join('\n') + '\n';
}

export function toJson(r) {
  return JSON.stringify(r, null, 2) + '\n';
}
