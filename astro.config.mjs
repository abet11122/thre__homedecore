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
    .filter((file) => /^noindex:\s*true\s*$/m.test(readFileSync(join(postsDirectory, file), 'utf8')))
    .map((file) => `/post/${basename(file, '.md')}/`)
);

const indexableCategories = new Set(
  postFiles.flatMap((file) => {
    const source = readFileSync(join(postsDirectory, file), 'utf8');
    const date = source.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
    const category = source.match(/^category:\s*"?([^"\r\n]+)"?\s*$/m)?.[1];
    const unavailable =
      /^noindex:\s*true\s*$/m.test(source) ||
      !date ||
      Date.parse(`${date}T00:00:00Z`) > Date.now();
    return category && !unavailable ? [category] : [];
  })
);
const emptyCategoryPaths = new Set(
  CATEGORIES.filter((category) => !indexableCategories.has(category.slug)).map(
    (category) => `/category/${category.slug}/`
  )
);

const noindexPaths = new Set(['/404/', '/404.html', '/saved/', '/search/']);

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
          !noindexPaths.has(path) &&
          !noindexPostPaths.has(path) &&
          !emptyCategoryPaths.has(path)
        );
      },
    }),
  ],
  redirects: {
    '/tag/diy-decor': '/category/diy-decor/',
    '/tag/entryway': '/category/entryway/',
    '/tag/seasonal': '/category/seasonal/',
    '/tag/small-spaces': '/category/small-spaces/',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
