// Compares tickets with articles:
//   gaps        tickets whose best article match is below the coverage line, grouped by similar wording
//   unused      articles that are the best match for no ticket
//   duplicates  pairs of articles so alike they may say the same thing twice, or contradict each other

import { terms, vectorize, cosine, topTerms, mask } from './text.js';

export const DEFAULTS = { cover: 0.2, group: 0.35, duplicate: 0.6, top: 10 };

export function analyze(tickets, articles, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const vectors = vectorize([...tickets.map((t) => terms(t.text)), ...articles.map((a) => terms(a.text))]);
  const tv = vectors.slice(0, tickets.length);
  const av = vectors.slice(tickets.length);

  const best = tv.map((v) => {
    let score = 0;
    let index = -1;
    av.forEach((a, j) => {
      const s = cosine(v, a);
      if (s > score) {
        score = s;
        index = j;
      }
    });
    return { score, index };
  });

  // gaps: uncovered tickets, grouped greedily around the first ticket of each group
  const uncovered = tickets.map((t, i) => i).filter((i) => best[i].score < o.cover);
  const groups = [];
  for (const i of uncovered) {
    const g = groups.find((x) => cosine(tv[x.seed], tv[i]) >= o.group);
    if (g) g.members.push(i);
    else groups.push({ seed: i, members: [i] });
  }
  const gaps = groups
    .map((g) => {
      const merged = new Map();
      for (const i of g.members) for (const [t, w] of tv[i]) merged.set(t, (merged.get(t) || 0) + w);
      return {
        tickets: g.members.length,
        example: mask(tickets[g.seed].title || tickets[g.seed].text).trim().slice(0, 140),
        terms: topTerms(merged, 4),
        ids: g.members.map((i) => tickets[i].id)
      };
    })
    .sort((a, b) => b.tickets - a.tickets || a.example.localeCompare(b.example))
    .slice(0, o.top);

  const used = new Map();
  best.forEach((b) => {
    if (b.index >= 0 && b.score >= o.cover) used.set(b.index, (used.get(b.index) || 0) + 1);
  });
  const articleUse = articles.map((a, j) => ({ id: a.id, title: a.title, tickets: used.get(j) || 0 }));

  const duplicates = [];
  for (let i = 0; i < av.length; i += 1) {
    for (let j = i + 1; j < av.length; j += 1) {
      const s = cosine(av[i], av[j]);
      if (s >= o.duplicate) duplicates.push({ a: articles[i].id, b: articles[j].id, similarity: Math.round(s * 100) / 100 });
    }
  }
  duplicates.sort((x, y) => y.similarity - x.similarity);

  return {
    tickets: tickets.length,
    articles: articles.length,
    covered: tickets.length - uncovered.length,
    coverage: tickets.length ? (tickets.length - uncovered.length) / tickets.length : 0,
    gaps,
    unused: articleUse.filter((a) => a.tickets === 0).map((a) => ({ id: a.id, title: a.title })),
    mostUsed: articleUse.filter((a) => a.tickets > 0).sort((x, y) => y.tickets - x.tickets || x.id.localeCompare(y.id)).slice(0, o.top),
    duplicates,
    settings: { cover: o.cover, group: o.group, duplicate: o.duplicate }
  };
}

export function pct(x) {
  return `${(Math.round(x * 1000) / 10).toFixed(1)}%`;
}
