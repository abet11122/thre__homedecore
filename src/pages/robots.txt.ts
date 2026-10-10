import type { APIRoute } from 'astro';
import { SITE } from '../site';

const agents = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
];

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(SITE.url);
  const sitemap = new URL('/sitemap-index.xml', origin).href;
  const rules = [
    'User-agent: *',
    'Allow: /',
    '',
    ...agents.flatMap((agent) => [`User-agent: ${agent}`, 'Allow: /', '']),
    `Sitemap: ${sitemap}`,
    '',
  ];

  return new Response(rules.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
