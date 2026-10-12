// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { SITE, CATEGORIES } from './src/site.ts';

const postsDirectory = join(process.cwd(), 'src', 'content', 'posts');
const postFiles = readdirSync(postsDirectory).filter((file) => file.endsWith('.md'));
const noindexPostPaths = new Set(
  postFiles
    .filter((file) => {
      const source = readFileSync(join(postsDirectory, file), 'utf8');
      const date = source.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
      return (
        /^noindex:\s*true\s*$/m.test(source) ||
        !date ||
        Date.parse(`${date}T00:00:00Z`) > Date.now()
      );
    })
    .map((file) => `/post/${basename(file, '.md')}/`)
);
const publishedCategoryCounts = new Map();
for (const file of postFiles) {
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
  redirects: {
    '/post/affordable-fall-porch-styling-ideas': '/post/fall-porch-decor-ideas/',
    '/tag/diy-decor': '/category/diy-decor/',
    '/tag/entryway': '/category/entryway/',
    '/tag/seasonal': '/category/seasonal/',
    '/tag/small-spaces': '/category/small-spaces/',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
