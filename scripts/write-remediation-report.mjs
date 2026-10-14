import fs from 'node:fs';
const policy=JSON.parse(fs.readFileSync('src/data/content-policy.json','utf8'));
const publishing=JSON.parse(fs.readFileSync('editorial/publishing-status.json','utf8'));
const checks=JSON.parse(fs.readFileSync('editorial/remediation-checks.json','utf8'));
const browser=JSON.parse(fs.readFileSync('editorial/browser-review.json','utf8'));
const ledger=JSON.parse(fs.readFileSync('editorial/merge-ledger.json','utf8'));
const imported=ledger.filter(r=>/^\d+ existing/.test(r.result));
const importedSections=imported.reduce((sum,r)=>sum+Number(r.result.match(/^\d+/)[0]),0);
const bytes=fs.readdirSync('public/images/stock').reduce((sum,f)=>sum+fs.statSync('public/images/stock/'+f).size,0);
const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const active=new Map(publishing.redirects.map(r=>[r.source,r.destination]));
const rows=Object.entries(policy).map(([slug,p])=>{
  const url=`/post/${slug}/`;
  const status=p.action==='KEEP+IMPROVE'?(p.publicationReady?'PUBLIC_GENERAL_GUIDANCE; OWNER_EVIDENCE_STILL_NEEDED':'WITHHELD_UNTIL_OWNER_REVIEW'):active.has(url)?'301_CONFIGURED; VERIFY_AFTER_HOST_DEPLOY':'NOINDEX_RETIREMENT_NOTICE';
  return {url,action:p.action,planned_destination:p.target?`/post/${p.target}/`:'',handling:status,source_preserved:`editorial/source-archive/${slug}.md`};
});
fs.writeFileSync('triage-implemented.csv','\uFEFF'+[Object.keys(rows[0]),...rows.map(Object.values)].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n');
const report=`# Remediation report

Updated October 15, 2026 (Asia/Karachi). The user authorized implementation with “fix issues” after reviewing the audit proposal. Changes are local and have not been deployed. No new articles or advertising code were added; no experience, prices, credentials or original-photo claims were invented.

## Applied inventory

| Decision | Local result |
|---|---|
| 48 KEEP+IMPROVE | ${publishing.published} existing general-guidance posts in the public archive; ${publishing.withheldKeep} unfinished destinations explicitly held for owner review |
| 165 MERGE | ${publishing.activeMergeRedirects} redirect rules to available destinations; ${publishing.pendingMerges} sources noindexed until the unfinished destinations are ready |
| 37 REMOVE | All 37 original articles excluded; their old URLs have noindex retirement notices |

All 250 original sources are preserved in `editorial/source-archive/`. Noindex retirement notices contain no old costume, gift, wedding or other removed article text, appear in no discovery listings, and carry no ads. This uses the approved noindex alternative, not a claimed HTTP 410. On a static host these notices can return 200 with a noindex meta tag; robots allows the crawler to read that instruction.

`triage-implemented.csv` records the handling of every URL. `src/data/content-policy.json` is the common publication policy. Homepage, navigation, search, saved ideas, categories, related posts, RSS, sitemap and the AI-readable map use the same public-post filter. Twenty-one destinations have `publicationReady: false`; dates passing cannot publish them. Before release, complete review, set that gate deliberately and retain the normal noindex/date checks.

## Fixed

- [x] Replaced the unverified personal byline with **Editorial Team**, explicitly a publication label. Changed author structured data from Person to Organization and removed unverified social-profile ownership claims. Retained the existing author URL for continuity; the URL does not assert the former identity is real.
- [x] Rewrote About, privacy and disclosure to describe generated drafts, stock illustration, general guidance and actual data behavior. Removed unsupported consent-service and personal-testing claims.
- [x] Removed the global AdSense loader, ad placements, empty ad rails and mobile ad bar. AdSlot emits nothing even if old environment variables are present. Removed the automatic Pinterest script and remote font stylesheets.
- [x] Added an adjacent Amazon/affiliate disclosure immediately before product links, in addition to article disclosure. Product links retain sponsored attributes. Recommendations are not represented as first-hand tests.
- [x] Renamed the existing legal page **Terms of Service** and retained its footer link and URL. Contact now provides explicit email links rather than presenting a mail-app launcher as a delivered web form. A domain-email setup placeholder is clearly marked.
- [x] Added the four requested owner-input placeholders to all 48 existing KEEP Markdown files, plus section-specific prompts and private per-post worksheets. The Markdown processor strips those comments from public HTML, and reading time excludes them.
- [x] Removed repeated boilerplate from unfinished KEEP drafts. Consolidated **${importedSections} existing substantive sections from ${imported.length} overlapping sources** where they met the transfer criteria. Skipped repeated templates, unsupported first-hand/price claims and redundant sections; the private merge ledger records all sources. Existing primary page structures remain varied; suggested formats are in the worksheets.
- [x] Removed duplicate paragraphs introduced by consolidation. Replaced unsupported shelf load/price claims and unsafe body-weight testing instructions with manufacturer-specific planning guidance. An empty cost section was removed; actual costs remain an owner-input task.
- [x] Disabled the keyword generator that recreates repeated templates. Future editing should improve existing drafts rather than restore this bulk workflow.
- [x] Localized and optimized **51 legacy stock photographs**, including responsive WebP variants; the stock asset folder totals **${(bytes/1024/1024).toFixed(2)} MiB**. Local rendering has no remote image requests. Replaced irrelevant portrait, sunglasses, hobby and landscape placements with visually reviewed room illustrations. Captions explicitly distinguish stock illustrations from documented projects.
- [x] Kept stock provenance separate from originality: all 48 KEEP posts still rely on stock photographs. Unknown Unsplash photographer names and photo-page records are labeled unverified rather than invented. Original CDN URLs and license links are retained for owner verification.
- [x] Updated old internal article links to final destinations or removed links whose destinations are held. Fixed the tool page's old bathroom link. Filtered single-post tags, kept thin category hubs noindexed and excluded from sitemap, and verified the odd tag is not generated.

## Validation

- Production build succeeded. Existing `seo:check` and `seo:audit` passed: **zero technical errors and zero metadata-length warnings**.
- Remediation assertions passed: ${checks.checks.htmlFiles} HTML files (including redirect fallbacks), ${checks.checks.sitemapUrls} indexable sitemap URLs, ${checks.checks.publicKeep} public KEEP articles, **zero ad-markup pages**, **zero leaked private-placeholder pages**.
- All public KEEP posts are reachable from the homepage. No retired post is linked from public navigation or article links, and retired sources appear in neither sitemap, RSS nor the AI-readable map. Canonicals, local assets, fragments and one-H1 checks pass.
- Browser checks covered **${browser.reviews.length} page/viewport combinations**: seven screens at 320, 375, 768 and 1440px, including mobile-menu operation, search filtering, persisted save toggling and page rendering. **${browser.issues.length} layout/content issues, ${browser.errors.length} JavaScript exceptions and ${browser.failedRequests.length} failed requests** were recorded. Tests ran against built files, not only the development view.
- Local navigation and LCP/CLS observations are recorded in `editorial/browser-review.json`. They are local diagnostics, not a Lighthouse score, field INP measurement or guarantee of production Core Web Vitals. Remote image/font/ad dependencies were removed to reduce requests, but production speed still needs measurement after deployment.
- The existing SEO script still reports repeated paragraphs in 102 preserved source files outside the public archive. The updated prose audit uses different exclusions and flags 90. Neither is a count of live articles; public-source duplication checks pass. The original sources were intentionally preserved for editorial traceability.

## AdSense checklist after fixes

| Check | Current result |
|---|---|
| (a) No thin, empty or coming-soon content | **PARTIAL / manual value review remains.** Repeated drafts and retired articles are excluded; no unfinished placeholders are published as articles. Original evidence and deeper per-idea work remain owner tasks. |
| (b) No copied or scraped content | **UNVERIFIED.** Internal boilerplate was removed/excluded and sources consolidated. Third-party originality and rights cannot be certified from this repository. |
| (c) No prohibited content | **PASS for the reviewed topic scope.** No prohibited category was identified; this is not a guarantee about every external destination or legal right. |
| (d) No ads on search/tags/404/thank-you | **PASS locally.** Advertising is absent site-wide, including all utility pages. No thank-you page exists. |
| (e) Affiliate disclosure visible nearby | **PASS locally for the current recommendation blocks.** Amazon wording appears immediately before sponsored product links. |
| (f) Working navigation and reachability | **PASS locally.** Static and browser checks pass; production deployment checks remain. |
| (g) Truthful author and ownership information | **Personal misrepresentation corrected; owner facts pending.** Editorial Team claims no person, credentials or personal testing. Real ownership, domain mailbox and provenance still require confirmation. |

The site is **not being represented as guaranteed AdSense-ready**. The 48-post target is an editorial choice; placeholders and technical fixes do not establish original value.

## Owner tasks

- [ ] Complete `editorial/OWNER-DETAILS.md`: real owner/business, background if published, photo permission, verified domain email, actual editorial process and owned social profiles. Keeping Editorial Team with the site mark is an honest alternative to publishing a personal profile.
- [ ] For each KEEP post use `editorial/keep/<slug>.md`: supply **[MY PHOTO]**, **[MY MEASUREMENTS / COST / TIME]**, **[WHAT I TRIED AND WHAT WENT WRONG]**, and **[MY OPINION]** using actual evidence. Add suitability, constraints, tradeoffs, installation and maintenance detail to the retained ideas; do not pad a generic list or invent a failed attempt.
- [ ] Verify text authorship, product facts, stock licenses and the unrecorded photographer credits. Supply real original photos and evidence for claims presented as first-hand. All 48 posts remain stock-only until real images are supplied.
- [ ] Review the 21 withheld destinations before changing their explicit publication gate; 84 dependent redirects will then be eligible to activate on a subsequent build.
- [ ] Verify that the configured contact address receives and replies to email. Replace the domain-mailbox placeholder with an address you control, or provide a real form-delivery service; no backend or fake success response was invented.
- [ ] Confirm the existing `ads.txt` publisher declaration belongs to the correct account. No advertising has been enabled.
- [ ] Deploy the local changes and use the hosting-specific HTTP rules below. Check live response codes, indexing, redirects, third-party links, mobile behavior and PageSpeed/Search Console field data before requesting another AdSense review.

## Hosting and HTTP redirects

`public/_redirects` contains forced 301 rules for Netlify; `public/.htaccess` contains equivalent Apache rules requiring the relevant server modules/configuration. For Cloudflare Pages, replace the built `dist/_redirects` with `editorial/cloudflare-redirects.txt` before deploying. Other hosts require equivalent supported rules. The Astro HTML redirect is a fallback and does not itself prove an HTTP 301 on the public host.

No deployment host credentials or live publishing operation were provided. The production homepage previously differed from the checkout. All reported fixes are therefore local until the updated build and host rules are deployed and their live responses verified.

## Records

- Baseline: `audit.csv`, `triage.csv`, `ADSENSE-AUDIT-PLAN.md`.
- Current source metrics: `editorial/current-audit/audit.csv`; retired-row metrics describe the preserved source, not the retirement notice.
- Applied handling: `triage-implemented.csv`, `editorial/publishing-status.json`.
- Checks: `editorial/remediation-checks.json`, `editorial/current-technical.json`, `editorial/browser-review.json`.

Run `npm run build`, `npm run seo:check`, `npm run seo:audit`, and `node scripts/check-remediation.mjs` to check a subsequent edit. Normal builds generate publishing rules without rewriting articles.
`;
fs.writeFileSync('REMEDIATION-REPORT.md',report);
console.log('Wrote REMEDIATION-REPORT.md and triage-implemented.csv');
