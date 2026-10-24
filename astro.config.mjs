// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { SITE, CATEGORIES, NAV_MIN_POSTS } from './src/site.ts';
import { policy, keptSourceIsPublic } from './src/lib/contentPolicy.mjs';
import remarkPrivateNotes from './src/lib/remarkPrivateNotes.mjs';
import { satteri } from '@astrojs/markdown-satteri';

const postsDirectory = join(process.cwd(), 'src', 'content', 'posts');
const postFiles = readdirSync(postsDirectory).filter((file) => file.endsWith('.md'));
const publicPostSlugs = new Set(postFiles.filter(file => keptSourceIsPublic(basename(file, '.md'), readFileSync(join(postsDirectory, file), 'utf8'))).map(file => basename(file, '.md')));
const approvedRedirects = Object.fromEntries(Object.entries(policy)
  .filter(([, entry]) => entry.action === 'MERGE' && publicPostSlugs.has(entry.target))
  .map(([slug, entry]) => [`/post/${slug}`, { destination: `/post/${entry.target}/`, status: 301 }]));
const noindexPostPaths = new Set(
  postFiles
    .filter((file) => {
      const source = readFileSync(join(postsDirectory, file), 'utf8');
      const date = source.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
      return (
        !publicPostSlugs.has(basename(file, '.md')) ||
        /^noindex:\s*true\s*$/m.test(source) ||
        !date ||
        Date.parse(`${date}T00:00:00Z`) > Date.now()
      );
    })
    .map((file) => `/post/${basename(file, '.md')}/`)
);
const publishedCategoryCounts = new Map();
for (const file of postFiles) {
  if (!publicPostSlugs.has(basename(file, '.md'))) continue;
  const source = readFileSync(join(postsDirectory, file), 'utf8');
  const date = source.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  const category = source.match(/^category:\s*["']?([a-z-]+)["']?\s*$/m)?.[1];
  if (!category || !date || /^noindex:\s*true\s*$/m.test(source)) continue;
  if (Date.parse(`${date}T00:00:00Z`) > Date.now()) continue;
  publishedCategoryCounts.set(category, (publishedCategoryCounts.get(category) ?? 0) + 1);
}

const noindexPaths = new Set([
  '/404/',
  '/404.html',
  '/saved/',
  '/search/',
  '/tags/',
  '/tag/diy-decor/',
  '/tag/entryway/',
  '/tag/seasonal/',
  '/tag/small-spaces/',
]);

// https://astro.build/config
export default defineConfig({
  // Overridable via SITE_URL env var (e.g. per-environment on Vercel);
  // otherwise falls back to the single source of truth in src/site.ts.
  site: process.env.SITE_URL || SITE.url,
  output: 'static',
  trailingSlash: 'always',
  markdown: { processor: satteri({ mdastPlugins: [remarkPrivateNotes] }) },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return (
          !path.startsWith('/tag/') &&
          !(path.startsWith('/category/') && (publishedCategoryCounts.get(path.split('/')[2]) ?? 0) < 2) &&
          !noindexPaths.has(path) &&
          !noindexPostPaths.has(path)
        );
      },
    }),
  ],
  /*
    No redirects are declared here on purpose.

    In `output: 'static'` Astro can only implement a redirect as an HTML page
    carrying a meta refresh, which answers 200 — the reason every merged URL on
    this site used to return a thin 200 instead of a 301. The real rules are
    generated as vercel.json by scripts/prepare-publishing.mjs, which Vercel
    applies before it looks at the filesystem. `approvedRedirects` above is kept
    because the publishing script reports from the same policy data.
  */
  redirects: {},
  build: {
    inlineStylesheets: 'auto',
  },
  vite: { cacheDir: './.audit-vite-cache' },
});
