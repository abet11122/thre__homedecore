import fs from 'node:fs';
import policy from '../src/data/content-policy.json' with {type:'json'};
const metadataFile='src/data/article-images.json';
const metadata=JSON.parse(fs.readFileSync(metadataFile,'utf8'));
const stock=JSON.parse(fs.readFileSync('src/data/stock-images.json','utf8'));
// Descriptions come from visual inspection of the downloaded contact sheet, not the article title.
const descriptions={
  'photo-1595526114035-0d45ed16cfbf':'White bedroom with a bed, wall art, bedside table and a black chair.',
  'photo-1600210492486-724fe5c67fb0':'Living room with light upholstered seating, framed art, plants and a coffee table.',
  'photo-1600489000022-c2086d79f9d4':'Compact kitchen with pale upper cabinets, dark lower cabinets and a window.',
  'photo-1765766599670-a625d0fef258':'Narrow hallway with dark doors and daylight at the far end.',
  'photo-1502672023488-70e25813eb80':'Small living and dining area with a round table, plants and open shelving.',
  'photo-1591382696684-38c427c7547a':'Laptop and desk beside a sunlit window with a green chair and houseplants.',
  'photo-1693643449872-67f203f99560':'Outdoor seating with a low sofa and chairs beside shrubs and a lawn.',
  'photo-1512389142860-9c449e58a543':'Evergreen wreaths and small hanging decorations against a pale wall.',
  'photo-1618579252366-f431305ada51':'White wall shelves holding small plants and decorative objects.',
  'photo-1594026112284-02bb6f3352fe':'Wooden sideboard and wall shelves with framed pictures and books.',
  'photo-1584622650111-993a426fbf0a':'Bright bathroom with a glass shower screen, white surfaces and pale floor tiles.',
  'photo-1556909172-54557c7e4fb7':'Kitchen with a range hood, counter appliances, cabinets and open shelves.',
  'photo-1560185007-cde436f6a4d0':'Wooden dining table and chairs in a room with tall windows and pendant lighting.',
};
for(const [id,src]of Object.entries(stock))if(metadata[src]) {
  if(descriptions[id])metadata[src].alt=descriptions[id];
  metadata[src].sourceUrl=`https://images.unsplash.com/${id}`;
}
const replacements={
  'photo-1507003211169-0a1dd7228f2d':'photo-1693643449872-67f203f99560', // Portrait is unrelated to porch decor.
  'photo-1572635196237-14b3f281503f':'photo-1560185007-cde436f6a4d0', // Sunglasses replaced by a dining room illustration.
  'photo-1508193638397-1c4234db14d8':'photo-1600210492486-724fe5c67fb0', // Landscape replaced by a room illustration.
  'photo-1558618666-fcd25c85cd64':'photo-1765766599670-a625d0fef258', // Hobby scene replaced by a hallway.
  'photo-1556909114-f6e7ad7d3136':'photo-1556909172-54557c7e4fb7', // People cooking replaced by the kitchen itself.
};
let duplicateParagraphsRemoved=0;
for(const [slug,p]of Object.entries(policy))if(p.action==='KEEP+IMPROVE') {
  const file=`src/content/posts/${slug}.md`;
  let s=fs.readFileSync(file,'utf8');
  const fm=s.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)[0];
  let body=s.slice(fm.length);
  const seen=new Set();
  body=body.split(/\r?\n\s*\r?\n/).filter(paragraph=>{
    const normalized=paragraph.replace(/\s+/g,' ').trim();
    if(normalized.startsWith('<!--')||normalized.startsWith('#')||normalized.length<=100)return true;
    if(seen.has(normalized)){duplicateParagraphsRemoved++;return false;}
    seen.add(normalized);return true;
  }).join('\n\n');
  s=fm+body+'\n';
  for(const [from,to]of Object.entries(replacements))s=s.replaceAll(from,to);
  // Outdoors rather than an interior illustration on the yard/porch guides.
  if(/halloween-(?:yard|porch)|fall-porch/.test(slug))s=s.replace(/^heroImage:.*$/m,'heroImage: "photo-1693643449872-67f203f99560"');
  if(/halloween-centerpieces/.test(slug))s=s.replace(/^heroImage:.*$/m,'heroImage: "photo-1560185007-cde436f6a4d0"');
  if(slug==='small-entryway-organization-ideas')s=s.replace(/^heroImage:.*$/m,'heroImage: "photo-1765766599670-a625d0fef258"');
  fs.writeFileSync(file,s);
}
fs.writeFileSync(metadataFile,JSON.stringify(metadata,null,2)+'\n');
console.log(`Removed ${duplicateParagraphsRemoved} duplicate KEEP paragraphs; replaced unrelated portraits, products and activity illustrations.`);
