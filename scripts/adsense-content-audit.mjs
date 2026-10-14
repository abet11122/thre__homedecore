import fs from 'node:fs';
import path from 'node:path';

// Read-only content analysis. Writes review artifacts only; never edits routes or posts.
const root = process.cwd();
const base = fs.readFileSync('src/site.ts', 'utf8').match(/url:\s*'([^']+)'/)[1];
const imageData = JSON.parse(fs.readFileSync('src/data/article-images.json', 'utf8'));
const auditDate = '2026-10-15';
const dir = 'src/content/posts';
// Preserve the pre-remediation inventory once a content policy has been applied.
const appliedPolicy = fs.existsSync('src/data/content-policy.json') ? JSON.parse(fs.readFileSync('src/data/content-policy.json','utf8')) : null;
const outputDirectory = appliedPolicy ? 'editorial/current-audit' : '.';
fs.mkdirSync(outputDirectory,{recursive:true});
const scalar = (source, key) => {
  const value = source.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
  return value.replace(/^(['"])(.*)\1$/, '$2');
};
const plain = s => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]*>/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/https?:\/\/\S+/g, ' ').replace(/[#*_`>|~]/g, ' ');
const words = s => plain(s).match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) ?? [];
function prose(body) {
  // Remove caption text and whole FAQ/related sections through the next same/higher heading.
  let skip = 0;
  return body.replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/gi, '')
    .replace(/^\s*\*(?:Photo|Image|Source|Credit|Caption)[^\n]*$/gim, '')
    .split('\n').filter(line => {
      const h = line.match(/^(#{1,6})\s+(.+)/);
      if (h) {
        if (skip && h[1].length <= skip) skip = 0;
        if (/^(?:faq\b|frequently asked|related\b|you (?:may|might) also|further reading)/i.test(h[2])) skip = h[1].length;
      }
      return !skip;
    }).join('\n');
}
const csv = (file, rows) => {
  const keys = Object.keys(rows[0]);
  const quote = x => `"${String(x ?? '').replaceAll('"', '""')}"`;
  fs.writeFileSync(path.join(outputDirectory,file), '\uFEFF' + [keys, ...rows.map(r => keys.map(k => r[k]))].map(r => r.map(quote).join(',')).join('\r\n') + '\r\n');
};
const records = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(file => {
  const source = fs.readFileSync(path.join(dir, file), 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Unrecognized frontmatter: ${file}`);
  const [, fm, raw] = match;
  const body = prose(raw);
  const slug = file.slice(0, -3);
  const sections = [...body.matchAll(/^##\s+\d+[.)]\s+([^\n]+)\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/gm)];
  const bullets = (body.match(/^\s*(?:[-+*]|\d+[.)])\s+\S/gm) ?? []).length;
  const bulletWords = [...body.matchAll(/^[ \t]*(?:[-+*]|\d+[.)])[ \t]+([^\n]+(?:\n[ \t]{2,}[^\n]+)*)/gm)].map(m => words(m[1]).length);
  const images = new Set([scalar(fm, 'heroImage'), scalar(fm, 'pinImage'),
    ...[...raw.matchAll(/!\[[^\]]*\]\(([^\s)]+)/g)].map(m => m[1]),
    ...[...raw.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1])].filter(Boolean));
  const identities = new Map();
  for (const src of images) {
    const meta = imageData[src];
    const stock = /^(?:photo-|https?:\/\/(?:images\.)?(?:unsplash|pexels)\.com)/.test(src) || /(?:pexels|unsplash)\.com/.test(meta?.sourceUrl ?? '');
    const identity = meta?.sourceUrl || src.match(/photo-[\w-]+/)?.[0] || src;
    identities.set(identity, stock ? 'stock' : 'unknown');
  }
  const paragraphs = body.split(/\n\s*\n/).map(p => plain(p).trim().replace(/\s+/g, ' ')).filter(p => words(p).length >= 25);
  const counts = new Map();
  for (const p of paragraphs) counts.set(p, (counts.get(p) ?? 0) + 1);
  const repeated = Math.max(0, ...counts.values());
  const tokens = words(body).map(w => w.toLowerCase());
  const shingles = new Set(tokens.slice(0, -4).map((_, i) => tokens.slice(i, i + 5).join(' ')));
  const noindex = scalar(fm, 'noindex') === 'true';
  const date = scalar(fm, 'publishDate');
  let currentStatus = noindex ? 'WITHHELD_NO_ROUTE' : date > auditDate ? 'SCHEDULED_NO_ROUTE' : 'PUBLISHED';
  if(appliedPolicy?.[slug]?.action==='KEEP+IMPROVE'&&!appliedPolicy[slug].publicationReady) currentStatus='OWNER_REVIEW_WITHHELD';
  if(appliedPolicy?.[slug]?.action==='REMOVE') currentStatus='REMOVED_NOINDEX_NOTICE';
  if(appliedPolicy?.[slug]?.action==='MERGE') {
    const targetSource=fs.readFileSync(path.join(dir,appliedPolicy[slug].target+'.md'),'utf8');
    const ready=scalar(targetSource,'noindex')!=='true'&&scalar(targetSource,'publishDate')<=auditDate;
    currentStatus=ready?'MERGED_REDIRECT_CONFIGURED':'MERGE_PENDING_NOINDEX_NOTICE';
  }
  return { slug, fm, raw, body, sections, paragraphs, shingles, repeated,
    url: `${base}/post/${slug}/`, title: scalar(fm, 'title'), category: scalar(fm, 'category'), publish_date: date,
    current_status: currentStatus,
    body_word_count: tokens.length, list_item_count: sections.length || bullets,
    average_words_per_list_item: sections.length ? (sections.reduce((n, m) => n + words(m[2]).length, 0) / sections.length).toFixed(1) : bullets ? (bulletWords.reduce((a,b) => a+b,0) / bullets).toFixed(1) : '0.0',
    list_count_method: sections.length ? 'numbered H2 ideas; heading excluded from average' : 'Markdown bullet/ordered entries including indented continuation lines',
    markdown_bullet_count: bullets, original_image_count: 0,
    stock_image_count: [...identities.values()].filter(x => x === 'stock').length,
    unknown_image_count: [...identities.values()].filter(x => x === 'unknown').length,
    image_asset_references: images.size, remote_image_references: [...images].filter(x => !x.startsWith('/')).length,
    off_topic_flag: /costume|boo-basket|gift-basket|spooky-basket/.test(slug) ? 'YES' : /wedding|bridal-shower|baby-shower|elf-on-the-shelf/.test(slug) ? 'BORDERLINE_EVENT_OR_ACTIVITY' : 'NO',
    near_duplicate_group: '', repeated_paragraph_max: repeated,
  };
});

// Explicit editorial consolidation groups. Pattern order determines specific destinations.
// MERGE means preserve only useful distinct material, never concatenate boilerplate.
const groups = [
  ['small-boys-bedroom-ideas', /boys-bedroom|boy-bedroom|space-themed-bedroom/],
  ['small-bedroom-decor-ideas', /bedroom|nightstand|dresser|nursery/],
  ['small-apartment-organization-ideas', /apartment-(?:organization|storage)/],
  ['apartment-decor-ideas-budget', /apartment-decor/],
  ['studio-apartment-zoning', /studio-apartment/],
  ['small-living-room-decor-ideas', /small-living-room|very-small-living-room|first-apartment-living|small-apartment-living|narrow-living|l-shaped-sofa|empty-corner/],
  ['minimalist-living-room-guide', /living-room/],
  ['living-room-gallery-wall-ideas', /gallery-wall|above-couch|around-a-tv/],
  ['coffee-table-decor-ideas', /coffee-table|sofa-table/],
  ['entryway-table-decor-ideas', /entryway-table|fall-entryway|fall-vignette/],
  ['small-entryway-organization-ideas', /entryway|drop-zone|hallway/],
  ['small-home-office-ideas', /home-office|homework-station/],
  ['dorm-room-decor-ideas', /dorm|college-cork/],
  ['bathroom-storage-ideas-small-spaces', /bathroom.*(?:organization|storage|closet|shelf)|under-sink-bathroom|powder-room/],
  ['small-bathroom-decor-ideas', /bathroom|toilet/],
  ['small-kitchen-organization-ideas', /kitchen.*(?:organization|storage)|pantry|refrigerator|under-kitchen/],
  ['kitchen-open-shelving-styling', /kitchen-open-shelving/],
  ['kitchen-counter-decor-ideas', /kitchen-counter|kitchen-countertop/],
  ['above-kitchen-cabinet-decor-ideas', /above-kitchen|above-kitchen-cabinets/],
  ['kitchen-window-sill-decor-ideas', /kitchen-window/],
  ['flooring-ideas-for-white-kitchen-cabinets', /flooring.*kitchen|kitchen-flooring/],
  ['summer-kitchen-decor-ideas', /summer-kitchen/],
  ['coffee-station-ideas', /coffee-station|coffee-bar|cocoa-bar/],
  ['small-kitchen-living-room-ideas', /kitchen-living|open-concept|breakfast-bar/],
  ['small-laundry-room-ideas', /laundry|mudroom|washer/],
  ['balcony-decor-ideas', /balcony|pool-towel/],
  ['diy-floating-shelves', /floating-shelves|bookshelf|trinket-shelf|skateboard-wall/],
  ['fall-porch-decor-ideas', /fall-porch|porch-fall|fall-front-door|fall-wreath|summer-to-fall-porch/],
  ['fall-crafts-for-adults', /fall-crafts/],
  ['autumn-mantel-styling', /autumn-mantel/],
  ['fall-living-room-decor-ideas', /fall-living-room|fall-decorations-indoor|fall-apartment|neutral-fall-decor/],
  ['fall-table-centerpiece-ideas', /fall.*(?:centerpiece|centrepiece|flower|tray|tablescape|table-setting)/],
  ['fall-kitchen-decor-ideas', /fall-kitchen/],
  ['small-apartment-halloween-decor-ideas', /small.*halloween|elegant-halloween|halloween-living|halloween-fireplace/],
  ['halloween-porch-decor-ideas', /halloween-door|halloween-porch/],
  ['halloween-yard-ideas', /halloween-yard|halloween-decor-outdoor|outdoor-halloween|backyard-halloween/],
  ['halloween-centerpieces', /halloween-centerpieces/],
  ['halloween-crafts-for-adults', /halloween-crafts|pumpkin-painting|pumpkin-carving/],
  ['small-apartment-christmas-decor', /small.*christmas|christmas-bedroom|christmas-entryway|christmas-kitchen|bathroom-christmas/],
  ['apartment-christmas-door-decor-ideas', /apartment-christmas-door/],
  ['outdoor-christmas-decor-ideas', /outdoor-christmas|christmas-porch/],
  ['christmas-table-centerpieces', /christmas-centerpieces|christmas-table|centrepiece-for-christmas/],
  ['diy-christmas-ornaments', /christmas-craft|christmas-ornaments/],
  ['christmas-window-decor', /christmas-window/],
  ['vintage-christmas-decor-ideas', /vintage-christmas|farmhouse-christmas/],
  ['thanksgiving-table-decor-ideas', /thanksgiving|friendsgiving/],
  ['spring-home-decor-ideas', /spring-decor|spring-home|cozy-winter/],
  ['dough-bowl-centrepiece-ideas', /dough-bowl|mason-jar/],
];
// Exact KEEP lookup takes precedence over patterns. Seasonal cases take precedence over room cases.
const keep = new Set(groups.map(g => g[0]));
const seasonal = groups.filter(([s]) => /fall|autumn|halloween|christmas|thanksgiving|spring/.test(s));
for (const r of records) {
  let target;
  if (keep.has(r.slug)) target = r.slug;
  else if (r.off_topic_flag !== 'NO') target = null;
  else target = [...seasonal, ...groups].find(([, re]) => re.test(r.slug))?.[0];
  r.action = target === r.slug ? 'KEEP+IMPROVE' : target ? 'MERGE' : 'REMOVE';
  r.merge_into = r.action === 'MERGE' ? `${base}/post/${target}/` : '';
  r.topic_overlap_group = target ?? '';
  r.reason = r.action === 'KEEP+IMPROVE' ? 'Distinct destination in focused archive; not approval-ready until evidence and editorial work complete'
    : r.action === 'MERGE' ? 'Overlapping intent; transfer only useful distinct material; verify intent equivalence before enabling a 301'
    : r.off_topic_flag === 'YES' ? 'Off-topic costume or gift guide; no equivalent home-decor destination'
    : r.off_topic_flag !== 'NO' ? 'Event/party or activity focus outside proposed home-decor archive; not prohibited content'
    : 'Outside focused destination set; no sufficiently equivalent destination selected; preserve source pending approval';
}
for (const slug of keep) if (!records.some(r => r.slug === slug)) throw new Error(`Missing KEEP: ${slug}`);

const pairs = [];
const parent = records.map((_, i) => i);
const find = i => parent[i] === i ? i : parent[i] = find(parent[i]);
for (let i = 0; i < records.length; i++) for (let j = i + 1; j < records.length; j++) {
  const a = records[i], b = records[j];
  const intersection = [...a.shingles].filter(s => b.shingles.has(s)).length;
  const union = a.shingles.size + b.shingles.size - intersection;
  const score = union ? intersection / union : 0;
  const shared = a.paragraphs.filter(p => b.paragraphs.includes(p));
  // Detect topic-substituted repeated templates separately from verbatim shingles.
  const template = a.repeated >= 3 && b.repeated >= 3 && a.raw.includes('this step works best when it supports the way the space is used every day') && b.raw.includes('this step works best when it supports the way the space is used every day');
  if (score >= 0.45 || new Set(shared).size >= 2 || template) {
    parent[find(j)] = find(i);
    pairs.push({ url_a: a.url, url_b: b.url, five_word_shingle_jaccard: score.toFixed(3), shared_long_paragraphs: new Set(shared).size, evidence: template ? 'Topic-substituted repeated template' : score >= 0.45 ? 'High verbatim shingle overlap' : 'At least two identical 25+ word paragraphs' });
  }
}
const clusters = new Map();
for (let i = 0; i < records.length; i++) {
  const key = find(i);
  clusters.set(key, [...(clusters.get(key) ?? []), i]);
}
let group = 0;
for (const members of clusters.values()) if (members.length > 1) {
  group++;
  for (const i of members) records[i].near_duplicate_group = `TEXT-${String(group).padStart(3, '0')}`;
}
const auditKeys = ['url','title','category','publish_date','current_status','body_word_count','list_item_count','average_words_per_list_item','list_count_method','markdown_bullet_count','original_image_count','stock_image_count','unknown_image_count','image_asset_references','remote_image_references','off_topic_flag','near_duplicate_group','topic_overlap_group','repeated_paragraph_max'];
csv('audit.csv', records.map(r => Object.fromEntries(auditKeys.map(k => [k, r[k]]))));
csv('triage.csv', records.map(r => ({url:r.url,title:r.title,current_status:r.current_status,action:r.action,merge_into:r.merge_into,reason:r.reason,implementation_status:'PROPOSED_ONLY_AWAITING_APPROVAL'})));
if (pairs.length) csv('audit-similarity.csv', pairs);
const structures = ['Measured layout walkthrough','Options comparison with tradeoffs','One project with steps and failure notes','Problem and solution by constraint','Photo-led edit with before/after evidence'];
csv('keep-editorial-worksheet.csv', records.filter(r => r.action === 'KEEP+IMPROVE').map((r, i) => ({
  url:r.url,current_status:r.current_status,proposed_structure:structures[i % structures.length],
  photo_placeholder:`[MY PHOTO: photograph your own ${r.title.replace(/^\d+\s+/, '')} setup, wide view and detail of the main constraint; credit the photographer]`,
  measurements_placeholder:'[MY MEASUREMENTS / COST / TIME: record dimensions, currency and dated receipts, active and elapsed time; label estimates]',
  experience_placeholder:'[WHAT I TRIED AND WHAT WENT WRONG: describe the actual attempt, failed choice, correction and remaining limitation]',
  opinion_placeholder:'[MY OPINION: which idea I would pick and why, based on my room and constraints]',
  per_idea_depth:'For each retained idea add the specific constraint, material/installation needs, tradeoff, who should skip it, maintenance and evidence; omit unsupported prices or claims',
  stock_only_status:r.stock_image_count > 0 && r.unknown_image_count === 0 ? 'ALL_REFERENCED_PHOTOS_STOCK' : 'NO_ORIGINAL_PROVENANCE_CONFIRMED; UNKNOWN_ASSETS_REQUIRE_REVIEW',
  release_gate:'Keep worksheet placeholders out of public pages; supply real evidence and review before indexing; never reactivate repeated templates as-is',
})));
const summary = {audit_date:auditDate,posts:records.length,counts:Object.fromEntries(['KEEP+IMPROVE','MERGE','REMOVE'].map(a=>[a,records.filter(r=>r.action===a).length])),statuses:Object.fromEntries([...new Set(records.map(r=>r.current_status))].map(s=>[s,records.filter(r=>r.current_status===s).length])),off_topic:records.filter(r=>r.off_topic_flag==='YES').length,repeated_paragraph_posts:records.filter(r=>r.repeated>=3).length,text_clusters:group,similarity_pairs:pairs.length,keep_withheld:records.filter(r=>r.action==='KEEP+IMPROVE'&&r.current_status!=='PUBLISHED').map(r=>r.slug),unmatched_removals:records.filter(r=>r.action==='REMOVE'&&r.off_topic_flag==='NO').map(r=>r.slug)};
fs.writeFileSync(path.join(outputDirectory,'audit-summary.json'), JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
