import fs from 'node:fs';
import sharp from 'sharp';
const mapping=JSON.parse(fs.readFileSync('src/data/stock-images.json','utf8'));
const items=Object.entries(mapping);
const width=1200,cellWidth=200,cellHeight=145;
const layers=[];
for(let i=0;i<items.length;i++) {
  const [id,src]=items[i],left=(i%6)*cellWidth,top=Math.floor(i/6)*cellHeight;
  const thumb=await sharp('public'+src).resize(196,112,{fit:'contain',background:'#eee'}).webp().toBuffer();
  layers.push({input:thumb,left,top});
  const text=Buffer.from(`<svg width="200" height="30"><rect width="200" height="30" fill="white"/><text x="3" y="12" font-size="10">${i+1}: ${id.slice(6)}</text></svg>`);
  layers.push({input:text,left,top:top+112});
}
await sharp({create:{width,height:Math.ceil(items.length/6)*cellHeight,channels:3,background:'white'}}).composite(layers).webp().toFile('editorial/stock-review.webp');
fs.writeFileSync('editorial/stock-review-index.json',JSON.stringify(items.map(([id,src],i)=>({number:i+1,id,src})),null,2)+'\n');
