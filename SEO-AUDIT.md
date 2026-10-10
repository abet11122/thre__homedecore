# SEO review — October 10, 2026

## Changes implemented

- Generated `robots.txt` from the configured production URL so its sitemap matches canonical URLs, including deployments that set `SITE_URL`.
- Allowed crawling of search and saved pages so search engines can see their existing `noindex` instructions. Kept search, saved, and 404 pages out of the sitemap.
- Normalized canonical URLs to the configured trailing-slash convention and corrected the static 404 URL.
- Used the public brand name, Small Cozy Home, in titles and structured data. Removed repeated brand suffixes when titles become long, shortened 31 article titles, and distinguished topic hub titles from article and category titles.
- Limited generated meta descriptions to 160 characters at word boundaries. Full visible descriptions and article text remain available.
- Added a descriptive homepage H1, corrected the Open Graph author to an author URL, honored supplied wide images, and emitted image dimensions only when known.
- Added a connected WebPage node, merged collection/profile metadata into that page, and removed an invalid author-page ItemList reference. Escaped embedded JSON-LD and included current-page URLs in breadcrumb data.
- Counted prose rather than Markdown markup in article word counts and reading times. Removed the incorrect claim that FAQ markup guarantees People Also Ask eligibility.
- Added `npm run seo:check` to check the generated site and write an inventory to `dist/seo-audit.json`.

## Validation

Run `npm run build`, followed by `npm run seo:check`.

After merging remote `main`: **368 content pages plus four redirect pages, 220 indexable pages and sitemap URLs, zero technical errors, and zero metadata length warnings.** Both `npm run seo:check` and `npm run seo:audit` pass. The content review still flags 120 articles for repeated paragraphs; 104 published articles are explicitly marked editorial `noindex`, and 41 future-dated articles are kept out of search and feeds at build time.

The audit covers generated HTML pages and sitemap URLs, unique titles and descriptions on indexable pages, canonical consistency, noindex exclusions, one H1 per page, absolute social images, image attributes, parseable JSON-LD, article references, local link/asset targets, and linked fragments. Metadata length thresholds are editorial checks, not promises about Google's display width. It also lists articles with at least three repeated long paragraphs for editorial review.

This is a local build audit. The production homepage could not be accessed through the browsing tool, so production response codes, redirects, indexing, and Core Web Vitals have not been verified. No deployment or Search Console submission was performed.

## Remaining editorial priorities

1. **Rewrite repetitive articles.** The source review flags 120 articles with repeated paragraphs inside the same article. The keyword generator repeats generic paragraphs under different headings, often without answering the specific topic. Replace these with useful steps, relevant examples, measurements where justified, and original observations. The full slug list is in `dist/seo-audit.json` under `contentReview`. Do not rerun `scripts/generate-keyword-posts.mjs` as an SEO fix: it recreates this pattern and can retitle existing articles.
2. **Consolidate overlapping search intent.** Examples include `above-kitchen-cabinet-decor-ideas`, `above-kitchen-cabinets-decor-ideas`, and `decorating-above-kitchen-cabinets`; `bathroom-over-toilet-storage-ideas` and `bathroom-over-the-toilet-storage-ideas`; and `under-bathroom-sink-organization-ideas` and `under-sink-bathroom-organization-ideas`. Select the best article based on usefulness and existing search/backlink data, merge useful content, then redirect redundant URLs and update internal links. Current article URLs remain available.
3. **Verify publication dates.** Forty-one articles have publication dates after October 10, 2026. The merged implementation marks those pages `noindex` and excludes them from the sitemap, RSS, and `llms.txt`, while retaining their routes. A new production build is needed when articles reach their publication dates. Confirm those dates reflect the actual editorial schedule; do not invent or refresh dates for search appearance.
4. **Verify author and business information.** Confirm the named author, claimed experience, stock portrait, social profiles, contact addresses, and editorial claims against actual business information. Update both visible copy and `src/site.ts` from verified facts.
5. **Complete production measurement.** Set the real `SITE_URL`, configure Google Search Console verification, submit `/sitemap-index.xml`, inspect representative URLs, and measure field performance. External fonts, photos, Pinterest scripts, and configured ads need production performance checks before claiming a Core Web Vitals improvement.

## References

- [Google: crawling and robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: canonical URLs and duplicate content](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Astro: components](https://docs.astro.build/en/basics/astro-components/), [routing](https://docs.astro.build/en/guides/routing/), and [sitemaps](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
