import fs from 'node:fs';
const origin=process.env.REVIEW_URL||'http://localhost:4322';
const target=await(await fetch('http://127.0.0.1:9335/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
let sequence=0;const pending=new Map(),events=new Map(),errors=[],failedRequests=[];
socket.addEventListener('message',event=>{
  const m=JSON.parse(event.data);
  if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}}
  else {for(const f of events.get(m.method)??[])f(m.params);}
});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
function on(name,fn){events.set(name,[...(events.get(name)??[]),fn]);}
function once(name,timeout=15000){return new Promise((resolve,reject)=>{const handle=setTimeout(()=>reject(new Error(`Timed out: ${name}`)),timeout);on(name,data=>{clearTimeout(handle);resolve(data);});});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
await send('Page.addScriptToEvaluateOnNewDocument',{source:`
  window.__reviewVitals={lcpMs:null,cls:0};
  new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__reviewVitals.lcpMs=Math.round(entry.startTime);}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__reviewVitals.cls+=entry.value;}).observe({type:'layout-shift',buffered:true});
`});
on('Runtime.exceptionThrown',e=>errors.push(e.exceptionDetails.text+' '+(e.exceptionDetails.exception?.description??'')));
on('Network.responseReceived',e=>{if(e.response.status>=400)failedRequests.push({url:e.response.url,status:e.response.status});});
const reviews=[];
const paths=['/','/post/small-boys-bedroom-ideas/','/post/small-kitchen-organization-ideas/','/contact/','/about/','/search/','/saved/'];
for(const width of [320,375,768,1440]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
  for(const pathname of paths) {
    const loaded=once('Page.loadEventFired');await send('Page.navigate',{url:origin+pathname});await loaded;
    await evaluate(`Promise.all(Array.from(document.images).filter(i=>i.loading!=='lazy').map(i=>i.decode().catch(()=>null)))`);
    const review=await evaluate(`(()=>({
      width:innerWidth,documentWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,
      title:document.title,placeholderVisible:/\\[MY PHOTO|\\[MY MEASUREMENTS|WHAT I TRIED AND WHAT WENT WRONG/.test(document.body.innerText),
      missingImages:Array.from(document.images).filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),
      remoteImages:Array.from(document.images).filter(i=>new URL(i.src).origin!==location.origin).map(i=>i.src),
      externalScripts:Array.from(document.scripts).filter(s=>s.src&&new URL(s.src).origin!==location.origin).map(s=>s.src),
      localVitals:window.__reviewVitals,
      overflowing:Array.from(document.querySelectorAll('main *,header *,footer *')).filter(e=>{let r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(e).position!=='absolute'&&getComputedStyle(e).position!=='fixed'}).slice(0,8).map(e=>({tag:e.tagName,class:e.className})),
      navigation:performance.getEntriesByType('navigation').map(n=>({loadMs:Math.round(n.loadEventEnd),domContentLoadedMs:Math.round(n.domContentLoadedEventEnd),transferBytes:n.transferSize}))
    }))()`);
    reviews.push({pathname,...review});
    if(pathname==='/'&&width===375) {
      await evaluate(`document.querySelector('.mobile-navigation summary').click()`);
      const menu=await evaluate(`(()=>{let e=document.querySelector('.mobile-navigation');return {open:e.open,links:e.querySelectorAll('a').length}})()`);
      if(!menu.open||menu.links<3)throw new Error('Mobile navigation did not open');
      await evaluate(`document.querySelector('.mobile-navigation summary').click()`);
      const image=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      fs.writeFileSync('.browser-audit/home-mobile.png',Buffer.from(image.data,'base64'));
    }
    if(pathname==='/search/'&&width===375) {
      await evaluate(`(()=>{let q=document.querySelector('#q');q.value='boys';q.dispatchEvent(new Event('input',{bubbles:true}))})()`);
      const text=await evaluate(`document.querySelector('#count').textContent`);
      if(!/1/.test(text))throw new Error('Search failed to filter the archive: '+text);
    }
    if(pathname==='/post/small-boys-bedroom-ideas/'&&width===375) {
      const before=await evaluate(`JSON.parse(localStorage.getItem('hearth-saved-ideas')||'[]').includes('small-boys-bedroom-ideas')`);
      await evaluate(`document.querySelector('[data-save-id="small-boys-bedroom-ideas"]').click()`);
      const saved=await evaluate(`JSON.parse(localStorage.getItem('hearth-saved-ideas')||'[]').includes('small-boys-bedroom-ideas')`);
      if(saved===before)throw new Error('Save idea failed to toggle persisted state');
    }
  }
}
const issues=reviews.filter(r=>r.documentWidth>r.width+1||r.h1!==1||r.placeholderVisible||r.remoteImages.length||r.missingImages.length||r.externalScripts.length);
const report={checkedAt:new Date().toISOString(),origin,scope:'Local browser behavior at four widths. Navigation timings are local diagnostics, not Lighthouse scores or production Core Web Vitals.',reviews,issues,errors,failedRequests};
fs.writeFileSync('editorial/browser-review.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pages:reviews.length,issues,errors,failedRequests},null,2));
await send('Page.close');socket.close();
if(issues.length||errors.length||failedRequests.length)process.exitCode=1;
