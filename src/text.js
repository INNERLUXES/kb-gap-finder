// Turns text into weighted terms (TF-IDF) and compares them (cosine similarity). Plain and repeatable on purpose:
// the same files always give the same report, and nothing is sent to a model or a service.

const STOP = new Set(('a an and are as at be been but by can could did do does for from get got had has have how i if in into is it its ' +
  'just me my no not of on or our please so than that the their them then there these they this to too was we were what when where ' +
  'which who why will with would you your hi hello thanks thank regards dear team help need want').split(' '));

// A light stemmer: enough to treat "refunds", "refunded" and "refunding" as one term.
export function stem(word) {
  let w = word;
  for (const suffix of ['ingly', 'edly', 'ing', 'ed', 'es', 's']) {
    if (w.length > suffix.length + 3 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length);
      break;
    }
  }
  return w;
}

export function terms(text) {
  return String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((t) => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t))
    .map(stem);
}

// Builds TF-IDF vectors for a list of documents (arrays of terms). Returns Map term -> weight per document, normalized.
export function vectorize(docs) {
  const df = new Map();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) || 0) + 1);
  const n = docs.length;
  return docs.map((d) => {
    const tf = new Map();
    for (const t of d) tf.set(t, (tf.get(t) || 0) + 1);
    const v = new Map();
    let norm = 0;
    for (const [t, c] of tf) {
      const w = (1 + Math.log(c)) * Math.log((n + 1) / ((df.get(t) || 0) + 1) + 1);
      v.set(t, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [t, w] of v) v.set(t, w / norm);
    return v;
  });
}

export function cosine(a, b) {
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let s = 0;
  for (const [t, w] of small) {
    const o = large.get(t);
    if (o) s += w * o;
  }
  return s;
}

// The highest-weighted terms of a vector, for labels in the report.
export function topTerms(v, n = 4) {
  return [...v.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, n).map((e) => e[0]);
}

// Masks what should never reach a report: email addresses and long numbers (orders, phones, cards).
export function mask(text) {
  return String(text)
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/(?:\+?\d[\d ()-]{4,}\d)/g, '[number]');
}
