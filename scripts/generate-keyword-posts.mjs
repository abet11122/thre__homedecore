import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/content/posts');

// Canonical topics from the supplied keyword list. Near-identical search intents
// are represented once, and existing filenames are skipped without overwriting.
const topics = [
  ['small bathroom organization ideas', 'bathroom'],
  ['small bathroom decor ideas', 'bathroom'],
  ['small bathroom ideas', 'bathroom'],
  ['bathroom counter decor ideas', 'bathroom'],
  ['bathroom over the toilet storage ideas', 'bathroom'],
  ['bathroom tray decor ideas', 'bathroom'],
  ['toilet tank decor ideas', 'bathroom'],
  ['fun bathroom ideas', 'bathroom'],
  ['guest bathroom decor ideas', 'bathroom'],
  ['bathroom shelf decor ideas', 'bathroom'],
  ['green bathroom ideas', 'bathroom'],
  ['renter friendly bathroom ideas', 'bathroom'],
  ['modern farmhouse bathroom ideas', 'bathroom'],
  ['bathroom closet organization ideas', 'bathroom'],
  ['clever back of toilet ideas', 'bathroom'],
  ['under bathroom sink organization ideas', 'bathroom'],
  ['very small powder room storage ideas', 'bathroom'],
  ['bathroom gallery wall ideas', 'bathroom'],
  ['bathroom christmas decor', 'bathroom'],
  ['whimsy bathroom ideas', 'bathroom'],

  ['kitchen window sill decor ideas', 'kitchen'],
  ['kitchen window decor ideas', 'kitchen'],
  ['above kitchen cabinets decor ideas', 'kitchen'],
  ['decorating above kitchen cabinets', 'kitchen'],
  ['above kitchen cabinet decor ideas', 'kitchen'],
  ['flooring ideas for white kitchen cabinets', 'kitchen'],
  ['kitchen flooring ideas with oak cabinets', 'kitchen'],
  ['breakfast bar ideas for small kitchens', 'kitchen'],
  ['kitchen counter styling ideas', 'kitchen'],
  ['kitchen counter decor ideas', 'kitchen'],
  ['kitchen counter organization ideas', 'kitchen'],
  ['kitchen countertop decor ideas', 'kitchen'],
  ['coffee station ideas', 'kitchen'],
  ['fall coffee station ideas', 'kitchen'],
  ['farmhouse coffee bar ideas', 'kitchen'],
  ['christmas kitchen decor ideas', 'kitchen'],
  ['fall kitchen decor ideas', 'kitchen'],
  ['fall kitchen decorations', 'kitchen'],
  ['fall kitchen countertop decor ideas', 'kitchen'],
  ['summer kitchen decor ideas', 'kitchen'],
  ['under kitchen sink organization ideas', 'kitchen'],
  ['ideas for kitchen window sills', 'kitchen'],
  ['small kitchen cabinet organization ideas', 'kitchen'],
  ['small kitchen living room ideas', 'kitchen'],
  ['open concept kitchen living room ideas', 'kitchen'],
  ['very small open plan kitchen living room ideas', 'kitchen'],
  ['over the refrigerator storage ideas', 'kitchen'],

  ['grey couch living room ideas', 'living-room'],
  ['how to arrange l-shaped sofa in living room', 'living-room'],
  ['small living room decor ideas', 'living-room'],
  ['very small living room ideas', 'living-room'],
  ['empty corner in living room ideas', 'living-room'],
  ['how to decorate around a tv', 'living-room'],
  ['minimalist bohemian living room ideas', 'living-room'],
  ['moody living room ideas', 'living-room'],
  ['coastal living room ideas', 'living-room'],
  ['budget friendly boho living room ideas', 'living-room'],
  ['how to decorate a narrow living room', 'living-room'],
  ['cozy living room ideas', 'living-room'],
  ['colorful living room ideas', 'living-room'],
  ['first apartment living room ideas', 'living-room'],
  ['living room gallery wall ideas', 'living-room'],
  ['above couch decor ideas', 'living-room'],
  ['sofa table decor ideas', 'living-room'],
  ['coffee table decor ideas', 'living-room'],
  ['coffee table decorating ideas', 'living-room'],
  ['coffee table tray decor ideas', 'living-room'],
  ['summer coffee table decor ideas', 'living-room'],
  ['fall coffee table ideas', 'living-room'],
  ['christmas coffee table decor ideas', 'living-room'],

  ['little girls bedroom ideas', 'bedroom'],
  ['dark boho bedroom ideas', 'bedroom'],
  ['moody bedroom ideas', 'bedroom'],
  ['leopard print bedroom ideas', 'bedroom'],
  ['cozy neutral bedroom ideas', 'bedroom'],
  ['space themed bedroom', 'bedroom'],
  ['small bedroom decor ideas', 'bedroom'],
  ['small bedroom decor ideas for kids', 'bedroom'],
  ['summer bedroom decor ideas', 'bedroom'],
  ['fall bedroom ideas', 'bedroom'],
  ['christmas bedroom ideas', 'bedroom'],
  ['top of dresser decor ideas', 'bedroom'],
  ['nightstand decor ideas', 'bedroom'],
  ['neutral nursery ideas', 'bedroom'],

  ['laundry room mudroom combo ideas', 'laundry-mudroom'],
  ['mudroom laundry room combo ideas', 'laundry-mudroom'],
  ['small laundry room ideas', 'laundry-mudroom'],
  ['small narrow laundry room ideas', 'laundry-mudroom'],
  ['laundry room ideas', 'laundry-mudroom'],
  ['stacked washer and dryer ideas', 'laundry-mudroom'],
  ['drop zone ideas', 'laundry-mudroom'],

  ['dorm decorating ideas for guys', 'dorm-college'],
  ['dorm room decor ideas', 'dorm-college'],
  ['dorm room storage ideas', 'dorm-college'],
  ['dorm desk ideas', 'dorm-college'],
  ['pink and blue dorm room ideas', 'dorm-college'],
  ['pink and green dorm room ideas', 'dorm-college'],
  ['college cork board ideas', 'dorm-college'],
  ['studio apartment ideas', 'dorm-college'],
  ['homework station ideas for small spaces', 'dorm-college'],

  ['entryway table decor ideas', 'entryway'],
  ['entryway organization ideas for small spaces', 'entryway'],
  ['fall entryway decor ideas', 'entryway'],
  ['fall entryway table decor ideas', 'entryway'],
  ['back to school entryway ideas', 'entryway'],
  ['hallway decor ideas', 'entryway'],
  ['trinket shelf ideas', 'entryway'],

  ['bookshelf ideas', 'organization-storage'],
  ['small pantry organization ideas', 'organization-storage'],
  ['how to organize small pantry deep shelves', 'organization-storage'],
  ['pool towel and float storage ideas', 'organization-storage'],
  ['skateboard wall decor', 'organization-storage'],
];

const imageByCategory = {
  bathroom: ['photo-1552321554-5fefe8c9ef14', 'photo-1584622650111-993a426fbf0a'],
  kitchen: ['photo-1600489000022-c2086d79f9d4', 'photo-1556911220-bff31c812dba'],
  'living-room': ['photo-1600210492486-724fe5c67fb0', 'photo-1618221195710-dd6b41faaea6'],
  bedroom: ['photo-1595526114035-0d45ed16cfbf', 'photo-1616486338812-3dadae4b4ace'],
  'laundry-mudroom': ['photo-1626806787461-102c1bfaaea1', 'photo-1558618666-fcd25c85cd64'],
  'dorm-college': ['photo-1555854877-bab0e564b8d5', 'photo-1522708323590-d24dbb6b0267'],
  entryway: ['photo-1765766599670-a625d0fef258', 'photo-1600566753190-17f0baa2a6c3'],
  'organization-storage': ['photo-1558997519-83ea9252edf8', 'photo-1616486338812-3dadae4b4ace'],
};

const ideasByCategory = {
  bathroom: ['Start with the sightline', 'Use wall space with intention', 'Choose moisture-safe materials', 'Build in concealed storage', 'Layer practical lighting', 'Repeat one finish', 'Keep the counter edited', 'Add texture with textiles', 'Create one focal point', 'Leave useful breathing room'],
  kitchen: ['Protect the working triangle', 'Clear the main prep zone', 'Use vertical space', 'Repeat existing finishes', 'Choose washable materials', 'Group everyday essentials', 'Add warm task lighting', 'Make storage easy to reset', 'Style one focal point', 'Edit before adding more'],
  'living-room': ['Map the walking route', 'Anchor the main seating', 'Choose a clear focal point', 'Layer three light sources', 'Use an appropriately sized rug', 'Repeat color around the room', 'Add closed storage', 'Vary height and texture', 'Keep tables useful', 'Finish with personal art'],
  bedroom: ['Begin with the bed', 'Keep the palette connected', 'Layer soft lighting', 'Make bedside storage useful', 'Add texture through bedding', 'Use the wall above the headboard', 'Create a calm landing spot', 'Choose furniture to scale', 'Hide visual clutter', 'Leave room to rest'],
  'laundry-mudroom': ['Plan the daily route', 'Use the full wall height', 'Give each person a zone', 'Add a folding surface', 'Choose wipeable finishes', 'Contain small supplies', 'Create a drying spot', 'Label only where helpful', 'Add task lighting', 'Make the reset effortless'],
  'dorm-college': ['Measure before move-in day', 'Use removable wall decor', 'Lift storage off the floor', 'Create a compact study zone', 'Layer comfortable lighting', 'Choose double-duty pieces', 'Keep essentials within reach', 'Repeat a simple color palette', 'Contain cables and chargers', 'Leave space for daily life'],
  entryway: ['Define the landing zone', 'Use a narrow footprint', 'Add hooks at useful heights', 'Contain small essentials', 'Include a place to sit', 'Use a mirror to spread light', 'Choose durable materials', 'Keep the floor route clear', 'Add one welcoming detail', 'Plan a quick weekly reset'],
  'organization-storage': ['Edit the collection first', 'Measure every opening', 'Group items by real use', 'Use the full vertical space', 'Choose containers that fit', 'Label changing categories', 'Keep frequent items accessible', 'Create a simple return path', 'Allow a little spare capacity', 'Review the system seasonally'],
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titleCase = (value) => value.split(' ').map((word) => ['a','an','and','for','in','of','on','the','to','with'].includes(word) ? word : word[0].toUpperCase() + word.slice(1)).join(' ').replace(/^./, (c) => c.toUpperCase());
const esc = (value) => value.replaceAll('"', '\\"');

let created = 0;
let skipped = 0;
let retitled = 0;
for (const [keyword, category] of topics) {
  const slug = slugify(keyword);
  const target = path.join(root, `${slug}.md`);
  const title = titleCase(keyword);
  if (fs.existsSync(target)) {
    const current = fs.readFileSync(target, 'utf8');
    const updated = current.replace(/^title: .*$/m, `title: "${esc(title)}"`);
    if (updated !== current) {
      fs.writeFileSync(target, updated, 'utf8');
      retitled++;
    }
    skipped++;
    continue;
  }

  const subject = keyword.replace(/\bideas?\b/gi, '').trim();
  const [heroImage, pinImage] = imageByCategory[category];
  const headings = ideasByCategory[category];
  const sections = headings.map((heading, index) => `## ${index + 1}. ${heading}\n\nFor ${subject}, this step works best when it supports the way the space is used every day. Begin with what you already own, check the available dimensions, and introduce one change at a time so the result feels considered instead of crowded.\n\nKeep the arrangement practical by leaving doors, drawers, switches, and walking paths unobstructed. Repeating a color, material, or finish already present in the room will help the new addition look connected rather than temporary.`).join('\n\n');
  const body = `---\ntitle: "${esc(title)}"\ndescription: "Explore 10 practical ${esc(keyword)} with layout, storage, color, lighting, and styling tips designed for comfortable, realistic homes."\ncategory: ${category}\ntags: ["${esc(subject)}", "home decor ideas", "practical decorating", "small space styling"]\npublishDate: 2026-09-07\nheroImage: "${heroImage}"\nheroImageAlt: "A thoughtfully styled ${esc(subject)}"\npinImage: "${pinImage}"\nfeatured: false\nkeyTakeaways:\n  - "Measure the space and solve the biggest practical problem before buying decor."\n  - "Repeat a limited palette and a few materials for a more cohesive result."\n  - "Keep frequently used surfaces clear enough to work comfortably every day."\n  - "Make changes one layer at a time and stop before the room feels crowded."\nfaqs:\n  - q: "How do I start with ${esc(keyword)}?"\n    a: "Start by removing anything the space no longer needs, then measure the available surfaces and walking paths. Choose the one change that will make daily use easier. Once that works, add color, lighting, texture, or art in small layers so every choice has a clear purpose."\n  - q: "How can I try these ideas on a small budget?"\n    a: "Restyle useful pieces you already own before shopping. Move a lamp, gather objects onto a tray, swap textiles between rooms, and use paint or removable hardware for a focused update. If you buy something, prioritize an item that improves both function and appearance."\n---\n\nThe most successful ${keyword} are not about filling every surface. They begin with a useful layout, solve a real frustration, and then add enough personality to make the space feel like home.\n\nUse the ten ideas below as a menu rather than a checklist. Pick two or three that suit your room, budget, and routine, then live with the result before adding another layer.\n\n${sections}\n\n## A Simple Plan to Pull It Together\n\nTake one wide photo of the room and note the area that looks busiest or least useful. Remove what does not belong, measure the available space, and make the smallest change that solves the problem. Then repeat one color in two or three places and add a warmer light source if the room needs atmosphere.\n\nA finished room should still be easy to use. If the new setup creates an extra chore, blocks a pathway, or needs constant rearranging, simplify it. The best version of ${subject} is the one you can comfortably maintain.\n`;
  fs.writeFileSync(target, body, 'utf8');
  created++;
}

console.log(`Created ${created} posts; retitled ${retitled}; found ${skipped} existing posts.`);
