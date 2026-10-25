/*
  Duplication and voice check for the published articles.

  The AdSense rejection was caused by text shared with two sister sites, so the
  check that matters is not "is this post long enough" but "does any sentence in
  it already exist somewhere else". This script measures that.

  A sentence counts as shared when 12 or more words match after case, punctuation
  and whitespace are normalised. Twelve is long enough that a match is reuse
  rather than a coincidence of common phrasing.

  Usage:
    node scripts/check-duplication.mjs
    node scripts/check-duplication.mjs --verbose     # list every shared sentence

  The sister sites are read from these paths, each skipped if absent:
    SISTER_SITES env var, semicolon-separated, or the defaults below.
*/
import fs from 'node:fs';
import path from 'node:path';
import { keptSourceIsPublic } from '../src/lib/contentPolicy.mjs';

const POSTS = 'src/content/posts';
const MIN_WORDS = 12;
const VERBOSE = process.argv.includes('--verbose');

const DEFAULT_SISTERS = [
  'C:/Users/mmuba/OneDrive/Desktop/home_decore',
  'D:/my sites/pintrest/Mub_home_decore',
];
const sisterRoots = (process.env.SISTER_SITES
  ? process.env.SISTER_SITES.split(';')
  : DEFAULT_SISTERS
).map(s => s.trim()).filter(Boolean);

const BANNED = [
  'transform', 'instantly', 'stunning', 'curated', 'elevate',
  "whether you're", 'whether you are', 'a touch of', 'when it comes to',
  'game-changer', 'game changer', 'effortlessly', 'elevates', 'transforms',
  'transformation', 'breathtaking', 'must-have', 'nestled',
];

/** Visible prose only: no frontmatter, HTML comments, code or link targets. */
function prose(raw) {
  const parts = raw.split(/^---\s*$/m);
  const body = parts.length > 2 ? parts.slice(2).join('---') : raw;
  return body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>|]/g, ' ');
}

const words = t => (t.match(/\b[\w'-]+\b/g) || []).length;

function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n\n+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => words(s) >= MIN_WORDS)
    .map(s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim());
}

function readDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ slug: f.slice(0, -3), raw: fs.readFileSync(path.join(dir, f), 'utf8') }));
}

/** Every markdown file under a site root, including nested post folders. */
function readSite(root) {
  const base = path.join(root, 'src/content/posts');
  if (!fs.existsSync(base)) return [];
  let out = readDir(base);
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (entry.isDirectory()) out = out.concat(readDir(path.join(base, entry.name)));
  }
  return out;
}

const all = readDir(POSTS);
const published = all.filter(p => keptSourceIsPublic(p.slug, p.raw));

// ---------------------------------------------------------------- within site
const own = new Map();
for (const p of published) {
  for (const s of new Set(sentences(prose(p.raw)))) {
    if (!own.has(s)) own.set(s, []);
    own.get(s).push(p.slug);
  }
}
const internal = [...own.entries()].filter(([, slugs]) => slugs.length >= 2);

// --------------------------------------------------------------- sister sites
const sisters = [];
for (const root of sisterRoots) {
  const posts = readSite(root);
  if (!posts.length) { console.log(`(skipped, no posts found: ${root})`); continue; }
  const index = new Map();
  for (const p of posts) {
    for (const s of new Set(sentences(prose(p.raw)))) {
      if (!index.has(s)) index.set(s, []);
      index.get(s).push(p.slug);
    }
  }
  sisters.push({ name: path.basename(root), count: posts.length, index });
}

let failures = 0;

console.log(`\nPublished articles: ${published.length} of ${all.length} files\n`);

console.log(`Repeated within this site (${MIN_WORDS}+ words, 2+ articles): ${internal.length}`);
if (internal.length) {
  failures++;
  const affected = new Set(internal.flatMap(([, s]) => s));
  console.log(`  articles involved: ${affected.size}`);
  for (const [s, slugs] of internal.slice(0, VERBOSE ? Infinity : 10)) {
    console.log(`  [${slugs.length}] ${s.slice(0, 100)}`);
    console.log(`        ${slugs.join(', ')}`);
  }
}

for (const sister of sisters) {
  const shared = new Map();
  for (const p of published) {
    const hits = [...new Set(sentences(prose(p.raw)))].filter(s => sister.index.has(s));
    if (hits.length) shared.set(p.slug, hits);
  }
  const distinct = new Set([...shared.values()].flat());
  console.log(`\nShared with ${sister.name} (${sister.count} files): ${distinct.size} sentences across ${shared.size} articles`);
  if (distinct.size) {
    failures++;
    for (const [slug, hits] of [...shared].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`  ${String(hits.length).padStart(3)}  ${slug}`);
      if (VERBOSE) for (const h of hits) console.log(`         ${h.slice(0, 100)}`);
    }
  }
}

// ---------------------------------------------------------------------- voice
console.log('\nVoice and structure:');
const bannedHits = [];
const headings = new Map();
const thinLinks = [];
for (const p of published) {
  const text = prose(p.raw).toLowerCase();
  for (const word of BANNED) {
    const n = text.split(word).length - 1;
    if (n) bannedHits.push(`${p.slug}: ${word} x${n}`);
  }
  const body = p.raw.split(/^---\s*$/m).slice(2).join('---');
  for (const m of body.matchAll(/^#{2,3}\s+(.+)$/gm)) {
    const h = m[1].trim();
    headings.set(h, (headings.get(h) || 0) + 1);
  }
  const links = [...body.matchAll(/\]\((\/[^)]*)\)/g)].length;
  if (links < 3) thinLinks.push(`${p.slug} (${links})`);
}
const reused = [...headings].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]);

console.log(`  banned phrases: ${bannedHits.length}`);
bannedHits.slice(0, VERBOSE ? Infinity : 12).forEach(h => console.log(`    ${h}`));
console.log(`  headings reused across articles: ${reused.length}`);
reused.slice(0, VERBOSE ? Infinity : 12).forEach(([h, n]) => console.log(`    [${n}] ${h}`));
console.log(`  articles with fewer than 3 internal links: ${thinLinks.length}`);
thinLinks.forEach(t => console.log(`    ${t}`));

if (bannedHits.length || reused.length || thinLinks.length) failures++;

console.log(failures ? '\nFAIL — see above.\n' : '\nPASS — no shared sentences, no banned phrases, no reused headings.\n');
process.exit(failures ? 1 : 0);
