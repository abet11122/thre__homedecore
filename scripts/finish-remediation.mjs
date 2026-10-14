import fs from 'node:fs';
function edit(file,fn){fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')));}
edit('src/content/posts/diy-floating-shelves.md',s=>s
  .replace(/^title:.*$/m,'title: "DIY Floating Shelves: Plan Fixings and Load Limits"')
  .replace(/^description:.*$/m,'description: "Plan floating shelves around your wall construction, bracket instructions, intended load and everyday access, without relying on generic weight ratings."')
  .replace(/\*\*For two shelves, 90cm × 20cm:\*\*/,'**Choose materials for your actual dimensions and the selected support system:**\n\n- Shelves or boards compatible with the selected brackets')
  .replace(/- Wood screws, 5×80mm/,'- Screws and fixings specified for the bracket system and confirmed wall substrate')
  .replace(/This is the step that decides everything\. Knock on the wall: a dull thud is masonry, a hollow sound is plasterboard\./,'Confirm the wall construction before choosing fixings. Sound alone is not a reliable identification method. Check for concealed services before drilling; ask a qualified installer when construction or service locations are uncertain.')
  .replace(/\*\*Into timber studs behind plasterboard:\*\*[^\n]*/,'**Into timber studs behind plasterboard:** follow the bracket maker’s requirements for stud engagement, screw type and bracket spacing. Do not assume a particular stud spacing from the shelf width.')
  .replace(/\*\*Into plasterboard with no stud:\*\*[^\n]*\n\n- \*\*Heavy-duty spring toggles\*\*[^\n]*/,'**Into plasterboard without a confirmed stud:** use a support system explicitly approved for the board, loading and condition of the wall. If the instructions do not cover that installation, choose a different location or obtain qualified advice.')
  .replace(/## Build the cleat[\s\S]*?(?=## Fit the shelf)/,'## Choose a compatible support system\n\n<!-- [MY MEASUREMENTS / COST / TIME: record the actual shelf, wall construction, bracket model and installation instructions]. -->\n\nA floating shelf depends on hidden supports. Select the shelf and support system together, then check the full installation requirements. A decorative shelf and a shelf carrying books can need different supports even when they have the same dimensions.\n\nUse the maker’s instructions for fixing locations, wall preparation and compatible hardware. Do not substitute a generic cleat arrangement for a rated bracket without a suitable design. Never test a shelf or cleat by hanging your body weight from it.\n\n')
  .replace(/## Fit the shelf[\s\S]*?(?=## Getting the spacing right)/,'## Fit and inspect the shelf\n\n<!-- [WHAT I TRIED AND WHAT WENT WRONG: document the actual approved installation and checks before claiming a tested result]. -->\n\nMark the position with a level and check that doors, seating and normal movement remain clear. Install the specified fixings and shelf according to the support-system instructions. Inspect alignment, movement and visible damage before adding objects.\n\nLoad only within the manufacturer’s limit for that complete installation. If the shelf moves, sags or the wall deteriorates, unload it and ask for qualified advice. A general decorating guide cannot establish a safe load for an unknown wall.\n\n')
  .replace(/Two shelves need a considered gap or they look like an accident\./,'Choose spacing using the actual objects, people and furniture around the shelf. The dimensions below are illustrative starting points, not measured project results, accessibility standards or installation requirements.')
  .replace(/Fixings determine the load, not the wood\./,'The rated capacity depends on the complete shelf, bracket, fixing and wall system.'));
edit('src/pages/disclaimer.astro',s=>s.replace('We are not licensed designers, architects or contractors.','No professional qualification or personal testing is claimed by the Editorial Team byline.')
  .replace(/We make every effort to ensure the information we publish is accurate and up to date at the\s*time of writing\. However, /,'Product information requires checking before use. ')
  .replace('Affiliate relationships do not influence our editorial opinions.','Recommendations are general references, not evidence of first-hand product tests.'));
const readme=`# Small Cozy Home

A static Astro home-decor archive. The approved inventory is in \`src/data/content-policy.json\`; public listings use the same KEEP filter.

## Develop and check

\`npx astro dev --background\` starts the development server. Manage it with \`npx astro dev status\`, \`npx astro dev logs\` and \`npx astro dev stop\`.

\`npm run build\` generates publishing rules then builds \`dist/\`. Run \`npm run seo:check\`, \`npm run seo:audit\`, and \`node scripts/check-remediation.mjs\` after building.

## Content and identity

Advertising is disabled everywhere. AdSlot is a compatibility component that emits nothing. No advertising loader or tracking snippet is emitted, even if old ad environment variables remain configured.

Editorial Team is a publication byline, not a fictitious personal identity or credential. The legacy author URL is preserved. About and privacy pages describe the current implementation without claiming a verified individual, consent service or delivered contact form.

The 48 KEEP files contain owner prompts in Markdown comments. The Markdown processor strips those comments before public HTML is emitted. The private \`editorial/keep/\` worksheets list the photos, actual measurements/cost/time, real attempts and personal opinions needed. Comments are not completed evidence. Keep unfinished drafts unindexed; never remove \`noindex\` just to reach a target count.

Originals of all 250 articles are preserved in \`editorial/source-archive/\`. The one-time migration scripts must not be rerun to reset edited drafts. \`editorial/merge-ledger.json\` records retained/discarded source material. \`scripts/generate-keyword-posts.mjs\` is disabled to prevent restoring repeated templates.

## Images

Public image rendering uses local files only. \`src/data/stock-images.json\` resolves legacy Unsplash IDs to optimized WebP assets; \`src/data/article-images.json\` contains dimensions, responsive sizes, sources and license links. A missing mapping fails the build. These are stock illustrations, not owner photographs. Legacy Unsplash photographer names and photo-page provenance remain owner verification tasks; original CDN URLs are retained without inventing credits.

## Publishing and removals

The build activates a merge redirect only when its KEEP destination has a public route. Other retired sources have a noindex retirement notice and are absent from listings, RSS, sitemap, search and related links. This uses the approved noindex option rather than pretending static HTML can return HTTP 410.

\`public/_redirects\` contains forced HTTP 301 rules for **Netlify**. \`public/.htaccess\` provides equivalent rules for **Apache** where mod_alias and AllowOverride are enabled. For **Cloudflare Pages**, copy \`editorial/cloudflare-redirects.txt\` to \`dist/_redirects\` after the build. Other hosts need equivalent rules configured before deployment. Astro's generated HTML redirect is a fallback, not proof of a production HTTP 301. Verify actual response codes after deployment.

\`scripts/prepare-publishing.mjs --clean-links\` is an explicit maintenance command to update links/tags after editorial policy changes. Normal builds generate rules without rewriting article sources.

The valid sitemap endpoint is \`/sitemap-index.xml\`. \`public/ads.txt\` retains the existing publisher declaration; account ownership must be confirmed by the owner.

See \`REMEDIATION-REPORT.md\` for what changed, checks performed and manual inputs still required. The baseline audit CSVs are preserved as the pre-change inventory.
`;
fs.writeFileSync('README.md',readme);
