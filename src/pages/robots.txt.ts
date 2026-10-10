import type { APIContext } from 'astro';
import { SITE } from '../site';

export function GET({ site }: APIContext) {
  // Crawlers must access search and saved pages to read their noindex tags.
  const sitemap = new URL('/sitemap-index.xml', site ?? SITE.url).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
