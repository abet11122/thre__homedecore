# AdSense content audit and approval plan

Audit date: October 14, 2026 (Asia/Karachi). Status: **Steps 1–2 complete; remediation awaiting approval.** This is a source and freshly built HTML audit, with a limited live-homepage comparison. No posts, redirects, indexing rules, ads, or public copy were changed. No articles were written. A successful technical check does not establish AdSense eligibility.

## Decision to approve

Review `triage.csv`: **48 KEEP+IMPROVE, 165 MERGE, 37 REMOVE**, covering every one of the 250 Markdown posts. Every MERGE row names its proposed destination. These are editorial proposals, not executed redirects. KEEP means a destination worth developing, not a claim that the current page is good enough.

- 17 costume/gift posts are explicitly off topic for this home-decor archive.
- 20 other removals are wedding, shower, or Elf activities. These are marked borderline event/activity content, not prohibited content. Removing them is a focus decision, not a Google requirement.
- 21 KEEP destinations are currently withheld or scheduled. Never publish their current boilerplate simply to reach 48 pages. Preserve their current exclusion until substantive review and real evidence are complete.
- Consolidate kitchen-counter variants, above-cabinet variants, bathroom organization variants, and seasonal variants into the specific destinations in the CSV. Halloween keeps separate indoor, porch, yard, centerpiece, and craft intents. Merge only distinct useful material, not whole lists or repeated paragraphs.
- Some style variants become sections of a broader room guide. Before a redirect goes live, the destination must actually satisfy the source intent. Check any available Search Console/backlink data before locking destination URLs; none was available for this audit. Do not redirect unrelated content to a generic category or homepage.

Approval requested: approve these 250 decisions, preservation of source files as editorial records, the sequencing below, and use of an honest **Editorial Team** byline until real author details are supplied. Suggested REMOVE handling: retain a useful page with `noindex,follow` only if there is a reader reason to keep it; otherwise use a true HTTP 410 for formerly public removed URLs. Already-withheld drafts need not acquire public routes. Hosting must be identified before implementing server response rules.

## Files and measurement methods

| File | Purpose |
|---|---|
| `audit.csv` | All 250 URLs, titles, categories, source publication dates, prose words, list counts/depth, photo provenance, off-topic flags and duplicate groups |
| `triage.csv` | One action, merge destination where applicable, reason, and approval status for every post |
| `audit-similarity.csv` | Pairwise matching-text/template evidence; not an accusation of third-party plagiarism |
| `keep-editorial-worksheet.csv` | All 48 KEEP destinations with four required owner-input placeholders, suggested structure, per-idea work, and stock-only flag |
| `audit-summary.json` | Machine-readable totals and unpublished KEEP destinations |
| `audit-technical.json` | Fresh local build checks, navigation reachability, remote photos, ad loader exposure and utility page findings |

Counts use the Markdown body only, excluding frontmatter (including its FAQ and takeaways), HTML figcaptions, recognizable photo-credit caption lines, and FAQ/related sections until the next heading of the same or higher level. Markdown images, tags, URLs and formatting are stripped; visible headings count toward body words. Words are Unicode letter/number sequences with internal apostrophes, dots or hyphens allowed. This is a reproducible editorial metric, not a Google threshold.

For listicles, list items are numbered H2 idea sections and average depth is their prose excluding the idea heading. For other formats the count is Markdown bullet/ordered entries, including indented continuation lines; `list_count_method` identifies which metric applies. These two formats are not directly comparable. An unnumbered guide can have zero list items and still be useful. Neither word count nor list length measures originality by itself.

Photo counts cover hero, Pinterest and body assets, excluding responsive renditions and deduplicating known assets by stock source URL or Unsplash photo ID. A Pinterest derivative of the same known stock photo counts once. Separate unidentified assets remain separate. Stock status comes from Unsplash IDs/URLs or the Pexels/Unsplash source records in `src/data/article-images.json`. **Original image count means confirmed originals; zero means none documented, not proof that every unknown photo is stock.** Self-hosted stock remains stock. Alt/source records have not been visually verified against every photo.

Text groups are connected clusters of pairs with either five-word-shingle Jaccard overlap of at least 0.45, at least two identical prose paragraphs of 25+ words, or the repeated topic-substitution template found in the generator. Cluster membership can be transitive; it does not assert every member is an exact duplicate. Topic overlap is separately recorded in `topic_overlap_group`; these are editorial consolidation buckets and do not assert textual duplication.

Source status at the audit date: **95 published**, **135 withheld/no route**, and **20 additionally scheduled/no route**. Status prioritizes `noindex`; 18 of the withheld posts also have future dates. Thus 38 files in total are future dated, matching the existing SEO check. The `noindex` flag currently prevents route generation; it is not an HTTP noindex response for a retained public URL. These distinctions matter for production removal handling.

## Content and trust findings

1. **Repeated template content.** This audit finds 104 posts with a long prose paragraph repeated at least three times after its exclusions. The existing `check-seo.mjs` flags 117 using a different paragraph heuristic; neither total is a count of published violations. A concrete example is `cozy-living-room-ideas.md`: the same two paragraphs recur under ten numbered ideas. `scripts/generate-keyword-posts.mjs` is the associated mass-production workflow. Do not rerun it to add volume. Replace or discard repetition within existing articles; never count placeholders as an improvement sufficient for release.
2. **Thin ideas despite article length.** `fall-porch-decor-ideas.md`, for example, has 12 ideas but many consist of a short suggestion without selection criteria, installation detail or demonstrated result. Improve usefulness per retained idea rather than padding to a word target. The floating-shelves guide also includes unsupported example prices, timelines and load ratings that need evidence or clearly labeled owner-input placeholders; do not present these as tested outcomes.
3. **Stock reliance.** All 48 KEEP destinations have only stock imagery among their referenced photos. A small set of local WebP images has stock licensing/photographer records; the wider site still requests remote Unsplash photos. Stock photography itself is not a policy violation and self-hosting does not make it original. Confirm licenses and photo relevance, add appropriate credits, then self-host retained images and responsive variants.
4. **Identity.** No `Elena Marsh` string or author stock portrait was found in the current source. Current configuration names **Sophie Lane**, uses `/favicon.svg`, and describes the mark as an illustration. This does not verify that Sophie is a real contributor. The live homepage also links to Sophie. Do not replace one unverified persona with another. Use Editorial Team and Organization author schema, preserving the existing author URL initially so a byline correction does not silently create a redirect. Real name, photo, background and ownership details remain owner inputs.
5. **About and production method.** The existing About correctly distinguishes stock illustration from a documented project, but says author information is verified without supplying evidence. Explain the actual use of generated drafts, stock references, human selection, fact checks, corrections and owner contributions only to the extent confirmed. Do not claim that a review/testing process already operates if it does not.
6. **Live/local mismatch.** The fetched live homepage still lists all 250 guides and dates into November 2026; the current local build produces only 95 post routes. Its footer contact address also differs from the local configuration. The live page may represent an older deployment or cached snapshot; local fixes cannot be assumed deployed. About, the old author URL and `/tag/onthecorner/` could not be fetched through the browsing tool; their HTTP response codes are unverified.

## Technical findings

- Fresh local build: 173 HTML files including five existing meta-refresh redirect pages; 168 ordinary pages, 112 indexable/sitemap URLs, 95 published post routes. Both existing SEO scripts pass, with zero technical errors and zero metadata-length warnings.
- Canonicals, internal link/asset targets, linked fragments, one H1, and sitemap exclusions pass the existing static checks. A separate navigation crawl reaches every generated content page from `/`; only 404 and redirect sources are excluded from that expectation. All 95 post routes appear in the generated sitemap and RSS.
- `robots.txt` allows crawling and points to `/sitemap-index.xml`. The sitemap index and its child XML file are valid sitemap endpoints; a literal `/sitemap.xml` filename is not required. Do not block removed pages in robots if Google needs to read their noindex or HTTP 410.
- `ads.txt` contains `google.com, pub-8497285724891966, DIRECT, f08c47fec0942fa0`, matching site configuration. Syntax/consistency pass; actual account ownership/authorization must be confirmed by the owner. No ad code was added by this work.
- **Ad exclusion fails:** the existing shared layout emits the AdSense loader on all 168 ordinary pages, including search, saved, tags and 404. Loader presence does not prove an impression, but exposes those pages to ad serving/Auto ads. Gate/remove the existing loader and placements for this remediation; never add new advertising. No thank-you route currently exists; any future one must be excluded too.
- Terms already exists at `/terms-and-conditions/` and is linked in the footer. Do not create a duplicate legal URL merely to name it Terms of Service. Its claims about advertising, ownership and data handling still need alignment with actual practice and owner review.
- Contact has visible email links and a form that opens a mail application. It is **not a delivered web form**: there is no form backend or delivery confirmation. Verify control of the configured address; add `[CONTACT EMAIL AT YOUR DOMAIN]` as a clearly marked setup input or implement a real delivery endpoint when details are supplied. Do not display a fake success state.
- The current code filters single-post tags and category-equivalent tags; `/tag/onthecorner/` is absent locally. Previously indexed tag URLs still need production status checks. Do not redirect that odd tag to an unrelated destination. Recompute retained tags after consolidation.
- No empty category is generated locally. Entryway, Home Office and Renter each have one post and are already noindexed/excluded from the sitemap. Check all archive counts again after consolidation; hide empty categories from navigation.
- All ordinary pages have a viewport and exactly one H1. No missing alt attributes were found. Empty decorative alt is valid. This is a syntax check; image relevance and whether a meaningful photo has been incorrectly marked decorative still need visual review.
- There are 1,439 remote image occurrences across 160 generated pages (including repeated navigation/cards). This is not a unique-photo count. Image self-hosting remains incomplete.
- **Mobile layout and page speed are unverified.** Responsive CSS, lazy loading, dimensions and viewport metadata are present, but no real mobile-browser or Lighthouse/field run was made. Check menu/search/save interactions, keyboard access, 320/375/768px widths, overflow and image sizes. Measure production LCP/INP/CLS and PageSpeed Insights after deployment. External-link status and actual mail delivery are also unverified.

The ordinary build initially failed because Vite could not unlink an existing cache file (EPERM). A build-only configuration, `audit.build.config.mjs`, selects a fresh cache location without changing site routes or behavior; that build succeeded. No dev server was started.

## Policy checklist — current state, not certification

PASS is limited to the evidence stated. FAIL/PENDING means the condition is not yet satisfied or cannot honestly be verified.

| Requested check | Result | Evidence / next action |
|---|---|---|
| (a) No thin, empty or coming-soon pages | **FAIL** | Short unsupported ideas and repeated templates remain in the source archive; live homepage still exposes the full archive. No empty local categories found, but withholding alone does not establish quality of retained pages. |
| (b) No copied/scraped content | **FAIL / UNVERIFIED** | Internal template replication is demonstrated. Third-party originality and rights were not established by a web-wide comparison or ownership records. Internal overlap is not proof of scraping. Owner must confirm sources and permissions. |
| (c) No prohibited content | **PASS, limited content-scope review** | Topics reviewed are decor, crafts, events, costumes and gifts; no prohibited-content category was identified. Off-topic does not mean prohibited. Not a full forensic or every-image review; verify linked destinations and photos before monetization. |
| (d) No ads on non-content pages | **FAIL** | Existing global loader is generated on search, tags, 404 and other utility pages. No new ads are planned or added. |
| (e) Disclosure near affiliate links | **FAIL / PARTIAL** | PostLayout conditionally discloses above article prose and footer has Amazon wording; ProductRecommendations adds links after the article with no disclosure in that block. Put clear disclosure immediately before those links and review every inline affiliate link. Sponsored rel exists on product links. |
| (f) Navigation and reachability | **PASS locally; production pending** | Existing local link checks pass and all generated content pages are reachable. Live homepage differs from local output; production response and interaction testing remain. |
| (g) Truthful author/ownership details | **FAIL / UNVERIFIED** | Elena is absent and a site mark replaces the portrait, but Sophie and ownership/editorial-process claims are not verified. Use Editorial Team without invented credentials; owner supplies actual identity/contact facts. |

Google does not specify a magic 40–50 article count, word count, or required number of personal photographs. The proposed size is the owner's editorial target. Policies address value, prohibited content and honest representation; placeholders, stock hosting and redirects do not by themselves earn approval.

## Work after approval

1. Preserve originals and apply the approved editorial inventory as the common source for posts, category/tag counts, RSS, sitemap, related links, search data, saved-page links and other feeds. Do not activate unfinished destination drafts.
2. Improve existing KEEP destinations using the per-post worksheet. Put the four owner-input placeholder types in the existing drafts where evidence is needed. Vary structure based on the actual subject; the worksheet's rotating format is a suggestion, not a new public template. Remove generic repeated sections, unsupported prices/ratings and any implied testing. Do not write new articles or invent replacement experience.
3. Keep incomplete drafts out of public indexes. Supply genuine evidence and verify each destination before moving useful source material and enabling its redirect. Never redirect useful readers to an unfinished placeholder page.
4. Add direct, one-hop **HTTP 301** rules for approved equivalent merges at the actual host. Static Astro redirect output currently consists of HTML meta refresh; it is not proof of an HTTP 301. Implement approved 410/noindex treatment for removals, then verify actual HTTP headers and bodies on production.
5. Update author copy/schema and About honestly; retain a neutral mark until an actual photo is supplied. Align legal, disclosure and contact pages with owner-confirmed facts. Place disclosure adjacent to affiliate blocks; keep existing advertising disabled on all excluded page types, adding no code or ads.
6. Localize retained imagery with license/source records, responsive variants, meaningful alt and loading priorities; remove remote dependencies only after their local replacements work. Rebuild archive/tag navigation and fix internal references to removed/merged URLs.
7. Rebuild and re-run both SEO checks plus audit scripts. Verify redirects, 410/noindex, robots, sitemap, RSS, link reachability and no ad loader on excluded pages. Then check live browser layout/performance and compare deployed inventory. Deployment is not performed as part of this audit.

## Owner inputs and final release checklist

- [ ] Approve/edit `triage.csv`, including the 20 borderline event/activity removals.
- [ ] Confirm which contributor and ownership facts are real, or authorize Editorial Team as the public byline. Supply `[REAL OWNER NAME]`, `[REAL BACKGROUND]`, `[MY AUTHOR PHOTO]` with permission, and actual editorial workflow details.
- [ ] For every KEEP post, provide `[MY PHOTO: describe shot]`, `[MY MEASUREMENTS / COST / TIME]`, `[WHAT I TRIED AND WHAT WENT WRONG]`, and `[MY OPINION: which idea I would pick and why]` using actual facts. The CSV contains subject-specific photo prompts and guidance. Do not fabricate failed projects or an opinion attributed to someone else.
- [ ] Confirm article provenance and rights, plus all stock licenses. Provide records for any image claimed as original. All 48 KEEP rows are currently marked stock-only.
- [ ] Verify factual product dimensions, supported installation/load ratings, costs and timelines from real evidence; clearly label illustrative calculations and estimates.
- [ ] Verify email control and choose a real domain mailbox or a delivered contact-form service; test delivery manually. Confirm social accounts belong to the publication.
- [ ] Confirm AdSense publisher account ownership and actual ad settings. Identify the deployment host for real HTTP status rules.
- [ ] Review the completed destination pages before retiring their sources. Ensure no public placeholders, empty hubs or broken internal links remain.
- [ ] Verify production reflects the approved local build, then test mobile behavior, external links and field/lab performance. Submit the clean sitemap and inspect representative URLs in Search Console before requesting AdSense review.

## Policy references

- [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)
- [Google Search spam policies — scaled content abuse and scraping](https://developers.google.com/search/docs/essentials/spam-policies)
- [Publisher policy: replicated content](https://support.google.com/publisherpolicies/answer/11190248?hl=en)
- [Publisher policy: misleading representation](https://support.google.com/publisherpolicies/answer/11185754?hl=en)
- [AdSense: account not approved / content quality](https://support.google.com/adsense/answer/81904?hl=en)
- [Live homepage comparison](https://www.smallspaceorganizationidea.site/)

## Reproduce

```powershell
node scripts/adsense-content-audit.mjs
npm.cmd run build -- --config audit.build.config.mjs
node scripts/check-seo.mjs
node scripts/seo-audit.mjs
node scripts/adsense-technical-audit.mjs
```

Audit metrics use the fixed audit date. The site build uses its normal real-time publication cutoff, so rerunning on another day can change generated counts. The two existing SEO scripts use their documented heuristics and will not necessarily match this audit's filtered body/paragraph counts.
