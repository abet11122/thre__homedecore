import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const status=JSON.parse(fs.readFileSync('editorial/publishing-status.json','utf8'));
const redirects=new Map(status.redirects.flatMap(r=>[[r.source,r.destination],[r.source.replace(/\/$/,''),r.destination]]));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost:4330');
  if(redirects.has(url.pathname)){res.writeHead(301,{Location:redirects.get(url.pathname)+url.search});res.end();return;}
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname),url.pathname.endsWith('/')?'index.html':'');
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(root,'404.html')));return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'});fs.createReadStream(file).pipe(res);
}).listen(4330,'127.0.0.1',()=>console.log('Built site review: http://127.0.0.1:4330'));
