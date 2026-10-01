// Reads the tickets (JSON Lines) and the help articles (a folder of .md, .txt or .html files, or one JSON Lines file).

import { readdir, readFile, lstat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

function jsonl(text, what, fields) {
  const rows = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    let o;
    try {
      o = JSON.parse(t);
    } catch (error) {
      throw new Error(`${what} line ${i + 1}: not valid JSON (${error.message})`);
    }
    if (o === null || typeof o !== 'object' || Array.isArray(o)) throw new Error(`${what} line ${i + 1}: each line must be a JSON object`);
    const text2 = fields.map((f) => (typeof o[f] === 'string' ? o[f] : '')).join(' ').trim();
    if (!text2) throw new Error(`${what} line ${i + 1}: needs ${fields.map((f) => `"${f}"`).join(' or ')}`);
    rows.push({ id: typeof o.id === 'string' && o.id ? o.id : `line-${i + 1}`, title: typeof o[fields[0]] === 'string' ? o[fields[0]] : '', text: text2 });
  });
  return rows;
}

// tickets.jsonl: { "id": "...", "subject": "...", "body": "..." } (subject or body required)
export function parseTickets(text) {
  const rows = jsonl(text, 'tickets', ['subject', 'body']);
  if (!rows.length) throw new Error('no tickets in the file');
  return rows;
}

// articles.jsonl: { "id": "...", "title": "...", "body": "..." }
export function parseArticles(text) {
  const rows = jsonl(text, 'articles', ['title', 'body']);
  if (!rows.length) throw new Error('no articles in the file');
  return rows;
}

const ARTICLE_EXT = new Set(['.md', '.markdown', '.txt', '.html', '.htm']);

// A folder of articles: each file is one article; the title is its first heading or its file name.
export async function loadArticles(path) {
  const info = await lstat(path);
  if (info.isFile()) return parseArticles(await readFile(path, 'utf8'));
  const out = [];
  for (const name of (await readdir(path)).sort()) {
    if (!ARTICLE_EXT.has(extname(name).toLowerCase())) continue;
    const full = join(path, name);
    if (!(await lstat(full)).isFile()) continue;
    const text = await readFile(full, 'utf8');
    const heading = /^#\s+(.+)$/m.exec(text) || /<h1[^>]*>([^<]+)<\/h1>/i.exec(text);
    out.push({ id: name, title: heading ? heading[1].trim() : basename(name, extname(name)), text });
  }
  if (!out.length) throw new Error(`no .md, .txt or .html articles in ${path}`);
  return out;
}
