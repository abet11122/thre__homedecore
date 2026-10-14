import policy from '../data/content-policy.json' with { type: 'json' };

export function disposition(slug) { return policy[slug]; }
export function isKept(slug) { return policy[slug]?.action === 'KEEP+IMPROVE'; }
export function canPublish(slug) { return isKept(slug) && policy[slug]?.publicationReady === true; }
export function keptSourceIsPublic(slug, source, now = Date.now()) {
  const date = source.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  return canPublish(slug) && !/^noindex:\s*true\s*$/m.test(source) && Boolean(date) && Date.parse(`${date}T00:00:00Z`) <= now;
}
export { policy };
