import fs from 'node:fs';
import path from 'node:path';

if(fs.existsSync('src/data/content-policy.json'))throw new Error('One-time migration already applied. Edit the approved policy and existing drafts directly; originals are in editorial/source-archive.');

function parseCSV(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') { if(quoted && text[i+1]==='"') {cell+='"';i++;} else quoted=!quoted; }
    else if(c===','&&!quoted) {row.push(cell);cell='';}
    else if(c==='\n'&&!quoted) {row.push(cell.replace(/\r$/, ''));if(row.some(Boolean))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(cell||row.length) {row.push(cell.replace(/\r$/, ''));rows.push(row);}
  const keys=rows.shift();return rows.map(row=>Object.fromEntries(keys.map((key,i)=>[key,row[i]??''])));
}
const triage=parseCSV(fs.readFileSync('triage.csv','utf8'));
const worksheet=parseCSV(fs.readFileSync('keep-editorial-worksheet.csv','utf8'));
const scalar=(s,key)=>s.match(new RegExp(`^${key}:\\s*["']?([^\\r\\n"']*)`, 'm'))?.[1].trim()??'';
const slugFromURL=url=>new URL(url).pathname.split('/').filter(Boolean).pop();
const policy={};
fs.mkdirSync('editorial/source-archive',{recursive:true});
for(const r of triage) {
  const slug=slugFromURL(r.url);
  const file=`src/content/posts/${slug}.md`;
  const source=fs.readFileSync(file,'utf8');
  const original=`editorial/source-archive/${slug}.md`;
  if(!fs.existsSync(original))fs.writeFileSync(original,source);
  policy[slug]={action:r.action,target:r.merge_into?slugFromURL(r.merge_into):null,
    originalStatus:r.current_status, reason:r.reason};
}
if(Object.keys(policy).length!==250)throw new Error('Expected the complete approved 250-post inventory');
for(const [slug,p]of Object.entries(policy))if(p.action==='MERGE'&&policy[p.target]?.action!=='KEEP+IMPROVE')throw new Error(`Invalid target for ${slug}`);
fs.writeFileSync('src/data/content-policy.json',JSON.stringify(policy,null,2)+'\n');

const cleanText=s=>s.replace(/<[^>]*>/g,' ').replace(/[#*_`]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const sources=Object.fromEntries(triage.map(r=>{const slug=slugFromURL(r.url);return[slug,fs.readFileSync(`editorial/source-archive/${slug}.md`,'utf8')];}));
const mergeLog=[];
for(const w of worksheet) {
  const slug=slugFromURL(w.url), original=sources[slug];
  const m=original.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  let fm=m[1],body=m[2];
  const isTemplate=body.includes('this step works best when it supports the way the space is used every day');
  // Remove repeated boilerplate in unfinished KEEP drafts; retain the existing ideas as prompts.
  if(isTemplate) {
    body=body.replace(/For [^\n]+this step works best[^\n]+\r?\n/g,'')
      .replace(/Keep the arrangement practical by leaving doors, drawers, switches, and walking paths unobstructed\.[^\n]+\r?\n/g,'');
    fm=fm.replace(/keyTakeaways:[\s\S]*?(?=\r?\n---)/,'');
  }
  // Consolidate existing substantive source sections, with provenance in a private merge ledger.
  const imports=[]; const seen=new Set([cleanText(body)]);
  for(const [sourceSlug,p] of Object.entries(policy)) {
    if(p.target!==slug)continue;
    const source=sources[sourceSlug].replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
    if(source.includes('this step works best when it supports the way the space is used every day')) {
      mergeLog.push({source:sourceSlug,target:slug,result:'Repeated template discarded; no unique guidance transferred'});continue;
    }
    const sections=[...source.matchAll(/^##\s+([^\n]+)\r?\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/gm)];
    let transferred=0;
    for(const section of sections) {
      const heading=section[1].replace(/^\d+[.)]\s*/,'').trim();
      const text=section[2].trim();
      if(/final thoughts|conclusion|related|faq|frequently|bottom line/i.test(heading)||text.split(/\s+/).length<35||/<img|<figure|!\[/.test(text))continue;
      if(/\b(?:I|my|we tried|we tested)\b|[£$€]|\b\d+\s*(?:kg|lbs|pounds)\b/i.test(text))continue;
      const normalized=cleanText(text);
      if([...seen].some(s=>s.includes(normalized)||normalized.includes(s)))continue;
      // Skip paragraphs already present in destination, not merely differently titled lists.
      const unique=text.split(/\r?\n\s*\r?\n/).filter(p=>!cleanText(body).includes(cleanText(p))).join('\n\n');
      if(unique.split(/\s+/).length<35)continue;
      seen.add(normalized); imports.push(`### ${heading}\n\n${unique}`);transferred++;
      if(transferred===2)break;
    }
    mergeLog.push({source:sourceSlug,target:slug,result:transferred?`${transferred} existing substantive section(s) transferred`:'No distinct sufficiently supported section to transfer; source preserved for owner review'});
  }
  if(imports.length)body+=`\n\n## More options for this space\n\n${imports.join('\n\n')}\n`;
  // Never claim generic installation ratings, example prices or time are measured project results.
  if(slug==='diy-floating-shelves') {
    body=body.replace(/This is the version that holds\.[^\n]*/,'Choose a bracket, shelf and fixing system with manufacturer instructions for your wall construction. Do not infer a safe load from shelf depth alone.')
      .replace(/Practical limits,[\s\S]*?(?=## Materials)/,'Use the manufacturer’s rated capacity for the complete installed system, including the wall substrate, bracket spacing and fixings. If those details are unknown, ask a qualified installer before loading the shelf.\n\n')
      .replace(/^.*(?:£|\b\d+[–-]\d+kg|\b\d+kg each|halve the load figures|anything on the table above|four times the problem).*$/gm,'')
      .replace(/A 20cm shelf is trivial to support; a 40cm shelf is four times the problem it looks like\./,'Greater depth increases the turning force; capacity depends on the complete installation.');
  }
  const placeholder=`<!-- OWNER INPUT — not rendered publicly. No experience or credentials may be invented.\nProposed structure: ${w.proposed_structure}\n${w.photo_placeholder}\n${w.measurements_placeholder}\n${w.experience_placeholder}\n${w.opinion_placeholder}\nFor each idea: ${w.per_idea_depth}\nPhoto status: ALL_REFERENCED_PHOTOS_STOCK. Replace with documented originals when available.\n-->`;
  // Locate owner prompts at the existing ideas rather than publishing a new article or boilerplate.
  let idea=0;
  body=body.replace(/^(#{2,3}\s+[^\n]+)$/gm, heading=>`${heading}\n\n<!-- IDEA ${++idea}: [MY MEASUREMENTS / COST / TIME: record constraints for this option]. [WHAT I TRIED AND WHAT WENT WRONG: actual result only]. Add suitability, tradeoff, installation and maintenance evidence. -->`);
  body=`${placeholder}\n\n${body.trim()}\n`;
  const title=scalar(fm,'title');
  const ownerRecord=`# Owner input: ${title}\n\nURL: ${w.url}\n\nSuggested structure: ${w.proposed_structure}\n\n${w.photo_placeholder}\n\n${w.measurements_placeholder}\n\n${w.experience_placeholder}\n\n${w.opinion_placeholder}\n\n${w.per_idea_depth}\n\nStock-only imagery: yes. Comments inside the existing Markdown locate the input needed for each section. Comments never constitute completed evidence.\n`;
  fs.mkdirSync('editorial/keep',{recursive:true});fs.writeFileSync(`editorial/keep/${slug}.md`,ownerRecord);
  fs.writeFileSync(`src/content/posts/${slug}.md`,fm+body);
}
fs.writeFileSync('editorial/merge-ledger.json',JSON.stringify(mergeLog,null,2)+'\n');
console.log(`Applied approved inventory: ${Object.keys(policy).length} records; ${worksheet.length} existing KEEP drafts prepared; originals preserved.`);
