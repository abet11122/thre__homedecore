import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const content = join(root, 'src', 'content', 'posts');
const errors = [];
const warnings = [];

if (!existsSync(dist)) {
  console.error('SEO audit requires a production build. Run npm run build first.');
  process.exit(1);
}

function filesIn(directory, predicate) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? filesIn(path, predicate)
      : predicate(path)
        ? [path]
        : [];
  });
}

function decode(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function first(html, expression) {
  return decode(html.match(expression)?.[1]?.trim());
}

const sitemapFiles = readdirSync(dist)
  .filter((name) => /^sitemap-\d+\.xml$/.test(name))
  .map((name) => join(dist, name));
const sitemapUrls = new Set(
  sitemapFiles.flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]))
  )
);

const records = filesIn(dist, (path) => path.endsWith('.html')).map((path) => {
  const html = readFileSync(path, 'utf8');
  const file = relative(dist, path).split(sep).join('/');
  const isRedirect = /<meta\s+http-equiv="refresh"/i.test(html);
  if (isRedirect) return null;
  const title = first(html, /<title>(.*?)<\/title>/s);
  const description = first(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = first(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const robots = first(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
  const h1s = (html.match(/<h1(?:\s|>)/gi) ?? []).length;
  const noindex = /(?:^|,\s*)noindex(?:,|$)/i.test(robots);

  if (!title) errors.push(`${file}: missing title`);
  if (!description) errors.push(`${file}: missing meta description`);
  if (!canonical) errors.push(`${file}: missing canonical URL`);
  if (!robots) errors.push(`${file}: missing robots directive`);
  if (h1s !== 1) errors.push(`${file}: expected one H1, found ${h1s}`);
  if (canonical && noindex && sitemapUrls.has(canonical)) {
    errors.push(`${file}: noindex URL appears in sitemap`);
  }
  if (canonical && !noindex && !sitemapUrls.has(canonical)) {
    errors.push(`${file}: indexable canonical is missing from sitemap`);
  }

  for (const [index, match] of [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].entries()) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD block ${index + 1} (${error.message})`);
    }
  }

  return { file, title, description, canonical, noindex };
}).filter(Boolean);

const seenCanonicals = new Map();
for (const record of records) {
  if (!record.canonical) continue;
  const previous = seenCanonicals.get(record.canonical);
  if (previous) errors.push(`${record.file}: canonical duplicates ${previous}`);
  else seenCanonicals.set(record.canonical, record.file);
}

for (const field of ['title', 'description']) {
  const groups = new Map();
  for (const record of records.filter((item) => !item.noindex)) {
    if (!record[field]) continue;
    groups.set(record[field], [...(groups.get(record[field]) ?? []), record.file]);
  }
  const duplicates = [...groups.values()].filter((files) => files.length > 1);
  if (duplicates.length) warnings.push(`${duplicates.length} duplicate indexable ${field} group(s)`);
}

const indexable = records.filter((record) => !record.noindex);
const longTitles = indexable.filter((record) => record.title.length > 65);
const weakDescriptions = indexable.filter(
  (record) => record.description.length < 70 || record.description.length > 170
);
if (longTitles.length) warnings.push(`${longTitles.length} indexable title(s) exceed 65 characters`);
if (weakDescriptions.length) {
  warnings.push(`${weakDescriptions.length} indexable description(s) fall outside 70-170 characters`);
}

let scheduled = 0;
let editorialNoindex = 0;
for (const file of readdirSync(content).filter((name) => name.endsWith('.md'))) {
  const source = readFileSync(join(content, file), 'utf8');
  const slug = file.slice(0, -3);
  const date = source.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  const isNoindex = /^noindex:\s*true\s*$/m.test(source);
  const output = join(dist, 'post', slug, 'index.html');
  const canonical = [...sitemapUrls].find((url) => new URL(url).pathname === `/post/${slug}/`);

  if (date && Date.parse(`${date}T00:00:00Z`) > Date.now()) {
    scheduled += 1;
    if (existsSync(output)) {
      const html = readFileSync(output, 'utf8');
      const robots = first(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
      if (!/(?:^|,\s*)noindex(?:,|$)/i.test(robots)) {
        errors.push(`${file}: scheduled post is indexable before ${date}`);
      }
    }
    if (canonical) errors.push(`${file}: scheduled post appears in sitemap`);
  } else if (isNoindex) {
    editorialNoindex += 1;
    if (!existsSync(output)) errors.push(`${file}: published noindex post was not generated`);
    if (canonical) errors.push(`${file}: editorial noindex post appears in sitemap`);
  }
}

console.log(
  `SEO audit: ${records.length} HTML pages, ${indexable.length} indexable, ${sitemapUrls.size} sitemap URLs, ${scheduled} scheduled posts held, ${editorialNoindex} editorial noindex posts.`
);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);

if (errors.length) process.exit(1);
console.log('SEO audit passed.');
