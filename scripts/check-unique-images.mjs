/**
 * Fails when two live posts share a heroImage or a pinImage.
 *
 * "Live" means the post is in the sitemap: it uses the same test as the
 * sitemap filter in astro.config.mjs (cleared by the content policy, not
 * noindex, and dated today or earlier). Reused stock photos across published
 * posts read as templated, low-value content, so that case exits 1.
 *
 * Duplicates that involve at most one live post are only warnings: the other
 * posts are noindex or gated out of the sitemap and are never published.
 *
 *   node scripts/check-unique-images.mjs            summary of warnings
 *   node scripts/check-unique-images.mjs --verbose  list every gated slug
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { keptSourceIsPublic } from '../src/lib/contentPolicy.mjs';

const verbose = process.argv.includes('--verbose');
const postsDirectory = join(process.cwd(), 'src', 'content', 'posts');
const FIELDS = ['heroImage', 'pinImage'];

function field(source, name) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const value = frontmatter.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, 'm'))?.[1];
  return value?.replace(/^["']|["']$/g, '');
}

const posts = readdirSync(postsDirectory)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const slug = basename(file, '.md');
    const source = readFileSync(join(postsDirectory, file), 'utf8');
    return {
      slug,
      live: keptSourceIsPublic(slug, source),
      heroImage: field(source, 'heroImage'),
      pinImage: field(source, 'pinImage'),
    };
  });

const live = posts.filter((post) => post.live);
const errors = [];
const warnings = [];

for (const name of FIELDS) {
  const byImage = new Map();
  for (const post of posts) {
    if (!post[name]) continue;
    if (!byImage.has(post[name])) byImage.set(post[name], []);
    byImage.get(post[name]).push(post);
  }
  for (const [image, users] of byImage) {
    if (users.length < 2) continue;
    const liveUsers = users.filter((post) => post.live);
    const gatedUsers = users.filter((post) => !post.live);
    if (liveUsers.length > 1) {
      errors.push(`${name} ${image} is shared by ${liveUsers.length} live posts: ${liveUsers.map((p) => p.slug).join(', ')}`);
    } else {
      const liveNote = liveUsers.length ? ` (live: ${liveUsers[0].slug})` : '';
      const gatedList = verbose ? `: ${gatedUsers.map((p) => p.slug).join(', ')}` : '';
      warnings.push(`${name} ${image} is shared by ${gatedUsers.length} noindex/gated post(s)${liveNote}${gatedList}`);
    }
  }
}

for (const post of live) {
  if (post.heroImage && post.heroImage === post.pinImage) {
    warnings.push(`${post.slug} (live) uses the same photo for heroImage and pinImage: ${post.heroImage}`);
  }
}

console.log(`Checked ${posts.length} posts, ${live.length} live (in the sitemap).`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s), not failing:`);
  for (const warning of warnings) console.log(`  warn  ${warning}`);
  if (!verbose) console.log('  (run with --verbose to list the gated slugs)');
}
if (errors.length) {
  console.error(`\n${errors.length} error(s): live posts must not share images:`);
  for (const error of errors) console.error(`  FAIL  ${error}`);
  process.exit(1);
}
console.log(`\nOK: all ${live.length} live posts have a unique heroImage and a unique pinImage.`);
