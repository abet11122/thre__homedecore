import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
if (!fs.existsSync(root)) throw new Error('Run npm run build before npm run seo:check.');
const builtFiles = new Set(fs.readdirSync(root, { recursive: true }).map(file => file.replaceAll('\\', '/')));
const files = [...builtFiles].filter(file => file.endsWith('.html'));
const errors = new Set();
const warnings = [];
const pages = new Map();
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attrs = tag => Object.fromEntries([...tag.matchAll(/\s([\w:-]+)(?:\s*=\s*"([^"]*)")?/g)].map(match => [match[1], decode(match[2] ?? '')]));
const fail = (url, message) => errors.add(`${url}: ${message}`);
const titles = new Map();
const descriptions = new Map();
const sitemapFiles = fs.readdirSync(root).filter(file => /^sitemap.*\.xml$/.test(file));
const sitemapUrls = new Set(sitemapFiles.flatMap(file => [...fs.readFileSync(path.join(root, file), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]))).filter(url => !url.endsWith('.xml')));

for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => attrs(match[0]));
  const get = name => meta.find(tag => tag.name === name || tag.property === name)?.content;
  const canonicals = [...html.matchAll(/<link\b[^>]*>/g)].map(match => attrs(match[0])).filter(tag => tag.rel === 'canonical');
  const canonical = canonicals[0]?.href;
  if (canonicals.length !== 1) fail(route, 'Expected one canonical URL');
  if (!canonical || !/^https?:\/\//.test(canonical)) fail(route, 'Canonical must be absolute');
  else {
    const url = new URL(canonical);
    if (url.search || url.hash) fail(route, 'Canonical contains query or fragment');
    if (url.pathname !== route) fail(route, 'Canonical does not match generated route');
  }
  const noindex = /noindex/.test(get('robots') ?? '');
  if (noindex && sitemapUrls.has(canonical)) fail(route, 'Noindex page included in sitemap');
  if (!noindex && !sitemapUrls.has(canonical)) fail(route, 'Indexable page missing from sitemap');
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '').trim();
  const description = get('description')?.trim();
  if (!title) fail(route, 'Missing title');
  if (!description) fail(route, 'Missing description');
  if ([...html.matchAll(/<h1\b/g)].length !== 1) fail(route, 'Expected one H1');
  if (get('og:url') !== canonical) fail(route, 'Open Graph URL differs from canonical');
  for (const field of ['og:image', 'twitter:image']) {
    if (!/^https?:\/\//.test(get(field) ?? '')) fail(route, `Missing absolute ${field}`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const image = attrs(match[0]);
    if (!Object.hasOwn(image, 'alt')) fail(route, 'Image lacks alt attribute');
    if (!image.width || !image.height) fail(route, 'Image lacks dimensions');
  }
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const schema = JSON.parse(match[1]);
      for (const node of schema['@graph'] ?? [schema]) {
        if (node['@type'] === 'BlogPosting') {
          if (node.mainEntityOfPage?.['@id'] !== canonical) fail(route, 'Article page reference differs from canonical');
          if (!node.headline || !node.datePublished || !node.author || !node.image?.length) fail(route, 'Incomplete article structured data');
          if (new Date(node.dateModified) < new Date(node.datePublished)) fail(route, 'Article updated before publication');
        }
      }
    } catch { fail(route, 'Invalid JSON-LD'); }
  }
  if (!noindex) {
    for (const [value, map, label] of [[title, titles, 'title'], [description, descriptions, 'description']]) {
      if (map.has(value)) fail(route, `Duplicate ${label} with ${map.get(value)}`);
      map.set(value, route);
    }
    if (title.length > 65) warnings.push({ route, issue: 'Title over 65 characters', length: title.length });
    if (description?.length > 170) warnings.push({ route, issue: 'Description over 170 characters', length: description.length });
  }
  const ids = new Set([...html.matchAll(/\bid="([^"]*)"/g)].map(match => decode(match[1])));
  pages.set(route, { html, canonical, ids });
}

for (const [route, { html, canonical }] of pages) {
  for (const match of html.matchAll(/<(?:a|img|link|script)\b[^>]*>/g)) {
    const tag = attrs(match[0]);
    const target = tag.href ?? tag.src;
    if (!target || !canonical || /^(?:mailto:|tel:|data:|javascript:)/.test(target)) continue;
    const url = new URL(target, canonical);
    if (url.origin !== new URL(canonical).origin) continue;
    const resource = decodeURIComponent(url.pathname).replace(/^\//, '');
    const candidates = [resource, `${resource.replace(/\/$/, '')}${resource ? '/' : ''}index.html`];
    if (!candidates.some(candidate => builtFiles.has(candidate))) fail(route, `Broken local link or asset: ${url.pathname}`);
    if (url.hash && pages.has(url.pathname)) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!pages.get(url.pathname).ids.has(id)) fail(route, `Missing fragment: ${url.pathname}${url.hash}`);
    }
  }
}

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
const origin = new URL(pages.get('/').canonical).origin;
if (!robots.includes(`Sitemap: ${origin}/sitemap-index.xml`)) fail('robots.txt', 'Sitemap origin differs from canonical origin');
if (/Disallow:\s*\/(?:search|saved)/.test(robots)) fail('robots.txt', 'Noindex pages blocked from crawling');

const contentReview = [];
for (const file of fs.readdirSync('src/content/posts').filter(file => file.endsWith('.md'))) {
  const markdown = fs.readFileSync(path.join('src/content/posts', file), 'utf8');
  const body = markdown.replace(/^---[\s\S]*?---\s*/, '');
  const paragraphs = body.split(/\r?\n\s*\r?\n/).map(text => text.trim()).filter(text => text.length > 100 && !text.startsWith('#'));
  const repeated = paragraphs.length - new Set(paragraphs).size;
  if (repeated >= 3) contentReview.push({ slug: file.replace(/\.md$/, ''), repeatedParagraphs: repeated });
}
const report = { pages: pages.size, sitemapUrls: sitemapUrls.size, errors: [...errors], metadataWarnings: warnings, contentReview };
fs.writeFileSync(path.join(root, 'seo-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Checked ${pages.size} HTML pages and ${sitemapUrls.size} sitemap URLs.`);
console.log(`${errors.size} errors; ${warnings.length} metadata length warnings; ${contentReview.length} articles with repeated paragraphs.`);
console.log('Detailed report: dist/seo-audit.json');
for (const error of [...errors].slice(0, 30)) console.error(error);
if (errors.size) process.exitCode = 1;
