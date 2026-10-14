import fs from 'node:fs';
import path from 'node:path';
import { policy, keptSourceIsPublic } from '../src/lib/contentPolicy.mjs';
const dist = path.resolve('dist');
const names = fs.readdirSync(dist, {recursive:true}).filter(f => f.endsWith('.html'));
const pages = new Map(names.map(file => {
  const route = '/' + file.replaceAll('\\','/').replace(/index\.html$/, '');
  return [route, fs.readFileSync(path.join(dist,file),'utf8')];
}));
const origin = fs.readFileSync('src/site.ts','utf8').match(/url:\s*'([^']+)'/)[1];
const links = html => [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].flatMap(m => {
  try { const u = new URL(m[1].replaceAll('&amp;','&'), origin); return u.origin === origin ? [u.pathname] : []; } catch { return []; }
});
const reached = new Set(['/']);
const queue = ['/'];
for(let i=0;i<queue.length;i++) for(const url of links(pages.get(queue[i]) ?? '')) {
  if(pages.has(url) && !reached.has(url)) { reached.add(url); queue.push(url); }
}
const ads = [], thinCategories = [], noViewport = [], missingAlt = [], genericAlt = [], h1Errors = [], remoteImages = [], redirectPages = [];
for(const [route,html] of pages) {
  if(/http-equiv="refresh"/i.test(html)) { redirectPages.push(route); continue; }
  if(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle/.test(html)) ads.push(route);
  if(!/<meta[^>]*name="viewport"/.test(html)) noViewport.push(route);
  if((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1) h1Errors.push(route);
  for(const m of html.matchAll(/<img\b[^>]*>/g)) {
    if(!/\balt(?:\s*=|\s|>)/.test(m[0])) missingAlt.push(route);
    if(/\balt="[^"]*(?:thoughtfully styled|beautifully styled|home decor inspiration)/i.test(m[0])) genericAlt.push(route);
    if(/\bsrc="https?:/.test(m[0])) remoteImages.push(route);
  }
  if(route.startsWith('/category/')) {
    const slug = route.split('/')[2];
    let count = 0;
    for(const file of fs.readdirSync('src/content/posts')) {
      const s = fs.readFileSync(path.join('src/content/posts',file),'utf8');
      const date = s.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
      const category = s.match(/^category:\s*["']?([a-z-]+)["']?\s*$/m)?.[1];
      if(category === slug && keptSourceIsPublic(file.slice(0,-3),s)) count++;
    }
    if(count < 2) thinCategories.push({route,published_posts:count,noindex:/name="robots"[^>]*content="[^"]*noindex/.test(html)});
  }
}
const sitemap = fs.readFileSync('dist/sitemap-0.xml','utf8');
const feed = fs.readFileSync('dist/rss.xml','utf8');
const postRoutes = [...pages.keys()].filter(r => r.startsWith('/post/') && !redirectPages.includes(r) && policy[r.split('/')[2]]?.action==='KEEP+IMPROVE');
const report = {
  scope:'Fresh local production build; not a production HTTP audit. Browser review is separately recorded in editorial/browser-review.json.',
  html_files:pages.size, post_routes:postRoutes.length,
  unreachable_content_pages:[...pages.keys()].filter(r => !reached.has(r) && r !== '/404.html' && !redirectPages.includes(r) && !(r.startsWith('/post/') && policy[r.split('/')[2]]?.action!=='KEEP+IMPROVE')),
  redirect_pages:redirectPages,
  h1_errors:h1Errors, missing_viewport:noViewport, missing_alt_occurrences:missingAlt.length,
  generic_alt_pages:[...new Set(genericAlt)],
  remote_image_occurrences:remoteImages.length, remote_image_pages:new Set(remoteImages).size,
  pages_loading_adsense:ads.length,
  utility_pages_loading_adsense:ads.filter(r=>!r.startsWith('/post/') && !r.startsWith('/category/') && r !== '/'),
  categories_with_fewer_than_two_posts:thinCategories,
  published_posts_missing_sitemap:postRoutes.filter(r=>!sitemap.includes(origin+r)),
  published_posts_missing_rss:postRoutes.filter(r=>!feed.includes(origin+r)),
  robots_sitemap_pointer:fs.readFileSync('dist/robots.txt','utf8').match(/Sitemap:.*/)?.[0],
  ads_txt:fs.readFileSync('dist/ads.txt','utf8').trim(),
  notes:['External link HTTP status, image semantic accuracy, identity, content provenance and mobile interactions need manual verification.', 'Viewport and responsive CSS do not establish mobile usability or Core Web Vitals.'],
};
fs.writeFileSync('editorial/current-technical.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
