import rawPolicy from '../data/content-policy.json' with { type: 'json' };

/**
 * Focus change, decided 2026-10-24.
 *
 * This site covers seasonal decorating and cozy styling. Small-space organising
 * is the sister site's subject, so the articles below were withdrawn rather than
 * kept as near-duplicates of it. content-policy.json stays as the historical
 * triage record; the decision is layered over it here so that every consumer of
 * `policy` — the build config, the publishing script and the post route — gets
 * one consistent answer.
 */
export const WITHDRAWN = {
  'minimalist-living-room-guide':
    'Withdrawn 2026-10: general living-room guide, duplicated on the sister site under the same slug',
  'studio-apartment-zoning':
    'Withdrawn 2026-10: small-space layout rather than styling, duplicated on the sister site under the same slug',
  'diy-floating-shelves':
    'Withdrawn 2026-10: carpentry and storage rather than styling, and carried unsupported load ratings',
  'bathroom-storage-ideas-small-spaces':
    'Withdrawn 2026-10: organising niche, covered by the sister site',
  'apartment-decor-ideas-budget':
    'Withdrawn 2026-10: general renter decor, duplicated on the sister site under the same slug',
  'small-home-office-ideas':
    'Withdrawn 2026-10: workspace layout rather than seasonal styling, duplicated on the sister site under the same slug',
  'small-boys-bedroom-ideas':
    'Withdrawn 2026-10: kids\u2019 rooms fall outside the focus, duplicated on the sister site under the same slug',
  'small-apartment-organization-ideas':
    'Withdrawn 2026-10: organising niche, duplicated on the sister site under the same slug',
  'small-entryway-organization-ideas':
    'Withdrawn 2026-10: organising niche, duplicated on the sister site under the same slug',
  'small-kitchen-organization-ideas':
    'Withdrawn 2026-10: organising niche, duplicated on the sister site under the same slug',
};

const RETIRED_MERGE =
  'Withdrawn 2026-10: merge target was removed, so the URL is retired rather than redirected to an unrelated article';

/** content-policy.json with the focus change applied. */
function withFocusChange(source) {
  const out = {};
  for (const [slug, entry] of Object.entries(source)) {
    out[slug] = WITHDRAWN[slug]
      ? { ...entry, action: 'REMOVE', target: null, reason: WITHDRAWN[slug], publicationReady: false }
      : entry;
  }
  // A merge pointing at a withdrawn article has nowhere useful to go, and a
  // redirect to an unrelated article reads as a soft 404, so retire it instead.
  for (const [slug, entry] of Object.entries(out)) {
    if (entry.action === 'MERGE' && WITHDRAWN[entry.target]) {
      out[slug] = { ...entry, action: 'REMOVE', target: null, reason: RETIRED_MERGE, publicationReady: false };
    }
  }
  return out;
}

const policy = withFocusChange(rawPolicy);

export function disposition(slug) { return policy[slug]; }
export function isKept(slug) { return policy[slug]?.action === 'KEEP+IMPROVE'; }
export function canPublish(slug) { return isKept(slug) && policy[slug]?.publicationReady === true; }
export function keptSourceIsPublic(slug, source, now = Date.now()) {
  const date = source.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  return canPublish(slug) && !/^noindex:\s*true\s*$/m.test(source) && Boolean(date) && Date.parse(`${date}T00:00:00Z`) <= now;
}
export { policy };
