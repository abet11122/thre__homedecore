# Small Cozy Home

A static Astro home-decor archive. The approved inventory is in `src/data/content-policy.json`; public listings use the same KEEP filter.

## Develop and check

`npx astro dev --background` starts the development server. Manage it with `npx astro dev status`, `npx astro dev logs` and `npx astro dev stop`.

`npm run build` generates publishing rules then builds `dist/`. Run `npm run seo:check`, `npm run seo:audit`, and `node scripts/check-remediation.mjs` after building.

## Content and identity

Advertising is disabled everywhere. AdSlot is a compatibility component that emits nothing. No advertising loader or tracking snippet is emitted, even if old ad environment variables remain configured.

Editorial Team is a publication byline, not a fictitious personal identity or credential. The legacy author URL is preserved. About and privacy pages describe the current implementation without claiming a verified individual, consent service or delivered contact form.

The 48 KEEP files contain owner prompts in Markdown comments. The Markdown processor strips those comments before public HTML is emitted. The private `editorial/keep/` worksheets list the photos, actual measurements/cost/time, real attempts and personal opinions needed. Comments are not completed evidence. The 21 unfinished destinations have `publicationReady: false` in the policy, so a date passing cannot publish them. Change that gate only after editorial review; never remove `noindex` just to reach a target count.

Originals of all 250 articles are preserved in `editorial/source-archive/`. The one-time migration scripts must not be rerun to reset edited drafts. `editorial/merge-ledger.json` records retained/discarded source material. `scripts/generate-keyword-posts.mjs` is disabled to prevent restoring repeated templates.

## Images

Public image rendering uses local files only. `src/data/stock-images.json` resolves legacy Unsplash IDs to optimized WebP assets; `src/data/article-images.json` contains dimensions, responsive sizes, sources and license links. A missing mapping fails the build. These are stock illustrations, not owner photographs. Legacy Unsplash photographer names and photo-page provenance remain owner verification tasks; original CDN URLs are retained without inventing credits.

## Publishing and removals

The build activates a merge redirect only when its KEEP destination has a public route. Other retired sources have a noindex retirement notice and are absent from listings, RSS, sitemap, search and related links. This uses the approved noindex option rather than pretending static HTML can return HTTP 410.

`public/_redirects` contains forced HTTP 301 rules for **Netlify**. `public/.htaccess` provides equivalent rules for **Apache** where mod_alias and AllowOverride are enabled. For **Cloudflare Pages**, copy `editorial/cloudflare-redirects.txt` to `dist/_redirects` after the build. Other hosts need equivalent rules configured before deployment. Astro's generated HTML redirect is a fallback, not proof of a production HTTP 301. Verify actual response codes after deployment.

`scripts/prepare-publishing.mjs --clean-links` is an explicit maintenance command to update links/tags after editorial policy changes. Normal builds generate rules without rewriting article sources.

The valid sitemap endpoint is `/sitemap-index.xml`. `public/ads.txt` retains the existing publisher declaration; account ownership must be confirmed by the owner.

See `REMEDIATION-REPORT.md` for what changed, checks performed and manual inputs still required. The baseline audit CSVs are preserved as the pre-change inventory.
