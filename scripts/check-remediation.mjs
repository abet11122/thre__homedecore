import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { policy, keptSourceIsPublic } from '../src/lib/contentPolicy.mjs';
const dist='dist',issues=[],checks={};
const source=slug=>fs.readFileSync(`src/content/posts/${slug}.md`,'utf8');
const publicIds=new Set(Object.keys(policy).filter(slug=>keptSourceIsPublic(slug,source(slug))));
for(const [slug,p]of Object.entries(policy))if(p.action==='KEEP+IMPROVE'&&!p.publicationReady) {
  assert.equal(keptSourceIsPublic(slug,'publishDate: 2020-01-01\nnoindex: false\n',Date.parse('2050-01-01')),false,'An unfinished KEEP must not auto-publish when its date passes');
}
const files=fs.readdirSync(dist,{recursive:true}).filter(f=>f.endsWith('.html'));
const pages=new Map(files.map(file=>['/'+file.replaceAll('\\','/').replace(/index\.html$/,''),fs.readFileSync(path.join(dist,file),'utf8')]));
const isRedirect=s=>/http-equiv="refresh"/i.test(s);
const noindex=s=>/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(s);
const sitemap=fs.readFileSync('dist/sitemap-0.xml','utf8'),feed=fs.readFileSync('dist/rss.xml','utf8'),llms=fs.readFileSync('dist/llms.txt','utf8');
for(const [url,html]of pages) {
  if(/adsbygoogle|googlesyndication\.com|<ins\b|assets\.pinterest\.com\/js/.test(html))issues.push(`${url}: advertising/tracking markup`);
  if(/\[MY PHOTO|\[MY MEASUREMENTS|OWNER INPUT|<!-- IDEA \d+:/.test(html))issues.push(`${url}: private owner notes leaked`);
  for(const m of html.matchAll(/<(?:img|script|link)\b[^>]*\b(?:src|href)="([^"]+)"[^>]*>/g)) {
    if(/^https?:/.test(m[1])&&(/<img|<script|stylesheet/.test(m[0])))issues.push(`${url}: external image, script or stylesheet ${m[1]}`);
  }
  if(isRedirect(html))continue;
  const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  if(/Sophie Lane|Elena Marsh|certified consent management platform has been published/.test(text))issues.push(`${url}: unverified identity or process claim`);
  for(const m of html.matchAll(/<a\b[^>]*href="(\/post\/([^/]+)\/)[^"]*"/g))if(!publicIds.has(m[2]))issues.push(`${url}: public link still points at retired source ${m[1]}`);
  if(url.startsWith('/post/')&&publicIds.has(url.split('/')[2])) {
    if(!/Stock photograph|stock photographs/.test(html))issues.push(`${url}: stock-photo disclosure missing`);
    const sections=[...html.matchAll(/<section\b[^>]*class="product-recommendations"[^>]*>([\s\S]*?)<\/section>/g)];
    for(const [,section]of sections) {
      const firstLink=section.indexOf('rel="sponsored');
      const disclosure=section.indexOf('As an Amazon Associate');
      if(firstLink>=0&&(disclosure<0||disclosure>firstLink))issues.push(`${url}: affiliate block lacks adjacent disclosure`);
    }
  }
}
for(const [slug,p]of Object.entries(policy)) {
  const url=`/post/${slug}/`,html=pages.get(url);
  const targetReady=p.action==='MERGE'&&publicIds.has(p.target);
  if(p.action==='KEEP+IMPROVE') {
    const s=source(slug);
    for(const token of ['[MY PHOTO:','[MY MEASUREMENTS / COST / TIME:','[WHAT I TRIED AND WHAT WENT WRONG:','[MY OPINION:'])if(!s.includes(token))issues.push(`${slug}: missing owner-input prompt ${token}`);
    if(!fs.existsSync(`editorial/keep/${slug}.md`))issues.push(`${slug}: missing owner worksheet`);
    if(publicIds.has(slug)&&(!html||noindex(html)))issues.push(`${slug}: published KEEP missing/indexing incorrect`);
    if(!publicIds.has(slug)&&html&&!noindex(html))issues.push(`${slug}: unfinished KEEP is indexable`);
  }else if(targetReady) {
    if(!html||!isRedirect(html)||!html.includes(`/post/${p.target}/`))issues.push(`${slug}: merge redirect missing`);
    if(!pages.has(`/post/${p.target}/`))issues.push(`${slug}: redirect target missing`);
    const rules=fs.readFileSync('dist/_redirects','utf8');
    if(!rules.includes(`${url} /post/${p.target}/ 301!`))issues.push(`${slug}: HTTP redirect config missing`);
  }else if(!html||!noindex(html)||!html.includes('This article has been retired'))issues.push(`${slug}: retired URL not safely noindexed`);
  if(p.action!=='KEEP+IMPROVE') {
    for(const [name,document]of [['sitemap',sitemap],['RSS',feed],['LLM map',llms]])if(document.includes(url))issues.push(`${slug}: retired source leaked into ${name}`);
  }
  if(!fs.existsSync(`editorial/source-archive/${slug}.md`))issues.push(`${slug}: original source not preserved`);
}
const links=html=>[...html.matchAll(/<a\b[^>]*href="(\/[^"?#]*)[^"\s]*"/g)].map(m=>m[1]);
const reached=new Set(['/']),queue=['/'];
for(let i=0;i<queue.length;i++)for(const url of links(pages.get(queue[i])??''))if(pages.has(url)&&!reached.has(url)){reached.add(url);queue.push(url);}
for(const id of publicIds)if(!reached.has(`/post/${id}/`))issues.push(`${id}: orphaned KEEP post`);
checks.inventory=Object.keys(policy).length;
checks.publicKeep=publicIds.size;
checks.activeMergeRedirects=Object.values(policy).filter(p=>p.action==='MERGE'&&publicIds.has(p.target)).length;
checks.pendingMergeNoindex=Object.values(policy).filter(p=>p.action==='MERGE'&&!publicIds.has(p.target)).length;
checks.removeNoindex=Object.values(policy).filter(p=>p.action==='REMOVE').length;
checks.withheldKeep=Object.values(policy).filter(p=>p.action==='KEEP+IMPROVE').length-publicIds.size;
checks.htmlFiles=pages.size;
checks.sitemapUrls=(sitemap.match(/<loc>/g)??[]).length;
checks.adMarkupPages=[...pages.values()].filter(html=>/adsbygoogle|googlesyndication\.com/.test(html)).length;
checks.privatePlaceholderPages=[...pages.values()].filter(html=>/\[MY PHOTO|OWNER INPUT/.test(html)).length;
const httpIndex=process.argv.indexOf('--http');
if(httpIndex>=0) {
  const origin=process.argv[httpIndex+1];
  const redirects=Object.entries(policy).filter(([,p])=>p.action==='MERGE'&&publicIds.has(p.target));
  let cursor=0;
  async function worker(){while(cursor<redirects.length){const[slug,p]=redirects[cursor++];const response=await fetch(`${origin}/post/${slug}/`,{redirect:'manual'});const location=response.headers.get('location');if(response.status!==301||new URL(location||'/',origin).pathname!==`/post/${p.target}/`)issues.push(`${slug}: preview HTTP redirect ${response.status} ${location}`);}}
  await Promise.all(Array.from({length:4},worker));
  checks.previewHttp301Verified=redirects.length;
  const odd=await fetch(`${origin}/tag/onthecorner/`);
  if(odd.status!==404)issues.push('Odd tag must resolve to the error page, not an indexable hub');
  checks.oddTag404=odd.status===404;
}
const report={checkedAt:new Date().toISOString(),checks,issues,scope:'Local source and built output; production HTTP status, ownership and originality require owner verification.'};
fs.writeFileSync('editorial/remediation-checks.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
assert.equal(issues.length,0,'Remediation checks failed');
