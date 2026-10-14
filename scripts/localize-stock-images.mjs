import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import policy from '../src/data/content-policy.json' with { type: 'json' };

const imageFile='src/data/article-images.json';
const data=JSON.parse(fs.readFileSync(imageFile,'utf8'));
const mapFile='src/data/stock-images.json';
const mapping=fs.existsSync(mapFile)?JSON.parse(fs.readFileSync(mapFile,'utf8')):{};
const sources=[fs.readFileSync('src/site.ts','utf8'),fs.readFileSync('src/layouts/Layout.astro','utf8'),
  ...Object.keys(policy).filter(slug=>policy[slug].action==='KEEP+IMPROVE').map(slug=>fs.readFileSync(`src/content/posts/${slug}.md`,'utf8'))];
const ids=[...new Set(sources.flatMap(s=>[...s.matchAll(/photo-\d+-[a-zA-Z0-9]+/g)].map(m=>m[0])))];
fs.mkdirSync('public/images/stock',{recursive:true});
const failed=[];
let cursor=0;
async function worker() {
  while(cursor<ids.length) {
    const id=ids[cursor++],src=`/images/stock/${id}.webp`;
    if(mapping[id]&&fs.existsSync('public'+src))continue;
    try {
      const url=`https://images.unsplash.com/${id}?w=1440&fit=max&auto=format&q=80`;
      const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const input=Buffer.from(await response.arrayBuffer());
      const main=await sharp(input).rotate().resize({width:1440,withoutEnlargement:true}).webp({quality:78}).toBuffer();
      fs.writeFileSync('public'+src,main);
      const {width,height}=await sharp(main).metadata();
      const candidates=[];
      for(const size of [480,960])if(width>size) {
        const p=`/images/stock/${id}-${size}.webp`;
        fs.writeFileSync('public'+p,await sharp(main).resize({width:size}).webp({quality:75}).toBuffer());
        candidates.push(`${p} ${size}w`);
      }
      candidates.push(`${src} ${width}w`);
      mapping[id]=src;
      data[src]={width,height,srcset:candidates.join(', '),alt:'',photographer:'Unsplash contributor (name not recorded)',
        sourceUrl:`https://images.unsplash.com/${id}`,
        downloadUrl:url,licenseUrl:'https://unsplash.com/license',provenance:'Stock; legacy source ID retained. Photographer and original photo-page URL require owner verification.',originalSourceId:id};
      console.log(`Localized ${id}`);
    }catch(error){failed.push({id,error:error.message});console.error(`${id}: ${error.message}`);}
    fs.writeFileSync(mapFile,JSON.stringify(mapping,null,2)+'\n');
    fs.writeFileSync(imageFile,JSON.stringify(data,null,2)+'\n');
  }
}
await Promise.all(Array.from({length:4},worker));
fs.mkdirSync('editorial',{recursive:true});
fs.writeFileSync('editorial/image-download-report.json',JSON.stringify({requested:ids.length,localized:ids.filter(id=>mapping[id]).length,failed},null,2)+'\n');
if(failed.length)process.exitCode=1;
