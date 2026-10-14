import fs from 'node:fs';
function edit(file, fn) { const before=fs.readFileSync(file,'utf8');fs.writeFileSync(file,fn(before)); }
edit('src/layouts/Layout.astro',s=>s
  .replace(/const adsenseId =[^\n]*\r?\n/,'')
  .replace(/    \{\/\*\s*Google Consent Mode[\s\S]*?(?=  <\/head>)/,'')
  .replace(/    <link rel="preconnect" href="https:\/\/images\.unsplash\.com" crossorigin \/>\r?\n/,'')
  .replace(/    \{\/\* Fonts:[\s\S]*?(?=    \{\/\* Open Graph)/,'')
  .replace(/    \{\/\* Pinterest save button[\s\S]*?(?=  <\/body>)/,'')
  .replace(/#person/g,'#editorial-team')
  .replace("'@type': 'Person'","'@type': 'Organization'")
  .replace("worksFor: { '@id': ORG_ID }","parentOrganization: { '@id': ORG_ID }")
  .replace(/  sameAs: \[SITE\.pinterest, SITE\.instagram\][^\n]*\r?\n/,'')
  .replace(/              <a href=\{SITE\.pinterest\}[^\n]*\r?\n/,'')
  .replace(/              <a href=\{SITE\.instagram\}[^\n]*\r?\n/,''));
for(const file of ['src/layouts/PostLayout.astro','src/pages/index.astro','src/pages/category/[slug].astro']) edit(file,s=>s
  .replace(/^import AdSlot[^\n]*\r?\n/gm,'')
  .replace(/<AdSlot\b[^>]*\/>/g,''));
// Keep a harmless compatibility component so old imports cannot revive advertising.
fs.writeFileSync('src/components/AdSlot.astro',`---\n/** Advertising is disabled during the content remediation. No code or slots are emitted. */\ninterface Props { placement?: string; class?: string; mobile?: unknown; desktop?: unknown; }\n---\n`);
edit('src/pages/author/[slug].astro',s=>s
  .replace(/#person/g,'#editorial-team')
  .replace(/const description =[^\n]*/,"const description = 'The Editorial Team publication byline, image policy and current home decorating guides from Small Cozy Home.';")
  .replace("'@type': 'ProfilePage'","'@type': 'CollectionPage'")
  .replace(/What \{SITE\.author\} writes about/,'Topics in this archive')
  .replace(/Latest byline/,'Latest guide'));
edit('src/components/AuthorBox.astro',s=>s.replace('Written by','Publication byline').replace("More stories from {SITE.author.split(' ')[0]}",'More from {SITE.author}'));
edit('src/site.ts',s=>s.replace("pinterest: 'https://pinterest.com/smallcozyhome'","pinterest: ''")
  .replace("instagram: 'https://instagram.com/smallcozyhome'","instagram: ''")
  .replace("twitter: '@smallcozyhome'","twitter: ''"));
edit('src/pages/llms.txt.ts',s=>s
  .replace('Written and edited by ${SITE.author}, ${SITE.authorRole}. ${SITE.authorBio}','Publication byline: ${SITE.author}. ${SITE.authorBio}')
  .replace(/\$\{posts.length\} articles across \$\{CATEGORIES.length\} rooms\.[^`]+/,'${posts.length} current articles. Stock photographs are illustrative; the guides are not evidence of tested personal projects.'));
edit('src/pages/terms-and-conditions.astro',s=>s.replace('title="Terms & Conditions"','title="Terms of Service"')
  .replace('updated="August 29, 2026"','updated="October 14, 2026"')
  .replace('Some links are affiliate links and some pages carry advertising. See our','Some links are affiliate links. Advertising is currently disabled. See our'));
edit('src/layouts/Layout.astro',s=>s.replace('>Terms</a>','>Terms of Service</a>'));
// Nothing in README should instruct someone to reinstate ads as the fix for low-value content.
edit('README.md',s=>s.replace(/Open the URL it prints[^\n]*/,'Open the URL it prints (usually `http://localhost:4321`). Advertising is disabled throughout the site.')
  .replace(/## Where to paste your AdSense ID[\s\S]*?(?=## |$)/,'## Content remediation\n\nAdvertising is disabled: no loader, Auto ads, ad slots or Pinterest tracking script is emitted. Do not add ads while the archive is under review. See `REMEDIATION-REPORT.md` and the private `editorial/` worksheets. `public/ads.txt` retains the previously configured publisher declaration; the owner must confirm account ownership.\n\n'));
console.log('Applied author, advertising, disclosure and setup documentation corrections.');
