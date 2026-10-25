/**
 * Take a season's posts out of search and listings once it is over, and bring
 * them back when it comes round again.
 *
 *   npm run season -- halloween              preview what would change
 *   npm run season -- halloween --apply      set noindex: true
 *   npm run season -- halloween --undo       remove noindex again
 *   npm run season                           list the seasons it knows about
 *
 * A post belongs to a season when its file name or its title contains one of
 * that season's words. The URLs keep working for anyone holding a link — the
 * posts simply drop out of the sitemap, the homepage, category and tag pages,
 * search and related-post lists, because getPublishedPosts() filters on
 * noindex and astro.config.mjs keeps noindex pages out of the sitemap.
 *
 * Why bother: a site whose front page is full of Halloween in February reads
 * as abandoned. Hiding the out-of-season posts keeps the listings honest
 * without deleting anything or breaking a single link.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canPublish } from '../src/lib/contentPolicy.mjs';

const POSTS = fileURLToPath(new URL('../src/content/posts/', import.meta.url));

const SEASONS = {
  halloween: ['halloween', 'pumpkin carving', 'spooky'],
  christmas: ['christmas', 'festive', 'advent'],
  thanksgiving: ['thanksgiving', 'friendsgiving'],
  fall: ['fall-', 'autumn'],
  spring: ['spring-'],
  summer: ['summer-'],
};

const args = process.argv.slice(2);
const season = args.find((a) => !a.startsWith('--'));
const mode = args.includes('--apply') ? 'apply' : args.includes('--undo') ? 'undo' : 'preview';

if (!season || !SEASONS[season]) {
  console.log('Usage: npm run season -- <season> [--apply|--undo]\n');
  console.log('Seasons:');
  for (const [name, words] of Object.entries(SEASONS)) console.log(`  ${name.padEnd(13)} matches: ${words.join(', ')}`);
  process.exit(season ? 1 : 0);
}

const words = SEASONS[season];
const files = readdirSync(POSTS)
  .filter((f) => f.endsWith('.md'))
  // Only articles the policy actually publishes. The withdrawn and merged
  // drafts are never served, so flagging them would be noise.
  .filter((f) => canPublish(f.slice(0, -3)))
  .filter((f) => {
    const src = readFileSync(join(POSTS, f), 'utf8');
    const title = src.match(/^title:\s*"?([^"\n]*)/m)?.[1] ?? '';
    const hay = `${f} ${title}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  })
  .sort();

/** Add or remove `noindex`, keeping the file's own line endings. */
function setNoindex(src, on) {
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return src;
  let head = fm[1].replace(/^noindex:[^\r\n]*(?:\r?\n|$)/gm, '');
  if (on) head = head.replace(/^(category:[^\r\n]*)/m, `$1${eol}noindex: true`);
  return src.replace(fm[1], head);
}

let changed = 0;
for (const f of files) {
  const path = join(POSTS, f);
  const src = readFileSync(path, 'utf8');
  const hidden = /^noindex:\s*true/m.test(src);
  const needs = mode === 'undo' ? hidden : !hidden;
  if (!needs) continue;
  changed++;
  if (mode === 'preview') console.log(`would ${hidden ? 'restore' : 'hide   '}  ${f}`);
  else {
    writeFileSync(path, setNoindex(src, mode === 'apply'));
    console.log(`${mode === 'apply' ? 'hidden  ' : 'restored'}  ${f}`);
  }
}

console.log(`\n${files.length} ${season} posts, ${changed} ${mode === 'preview' ? 'to change — run again with --apply' : 'changed'}.`);
if (mode !== 'preview') console.log('Run `npm run build` and commit the result.');
