import fs from 'node:fs';
const file='src/data/content-policy.json';
const policy=JSON.parse(fs.readFileSync(file,'utf8'));
for(const p of Object.values(policy))p.publicationReady=p.action==='KEEP+IMPROVE'&&p.originalStatus==='PUBLISHED';
fs.writeFileSync(file,JSON.stringify(policy,null,2)+'\n');
const shelfFile='src/content/posts/diy-floating-shelves.md';
let source=fs.readFileSync(shelfFile,'utf8');
source=source.replace(/\*\*The shelf sags in the middle\.\*\*[^\n]*/,'**The shelf sags or tilts.** Unload it. The cause may be the board, supports, fixings or wall; a generic adjustment is not a safe diagnosis. Check the complete installation against its manufacturer’s instructions or ask an installer.')
  .replace(/\*\*It tips forward at the front edge\.\*\*[^\n]*\n?/,'')
  .replace(/\*\*The screws spin without biting\.\*\*[^\n]*/,'**The screws spin without biting.** Stop loading or tightening the shelf. Identify the wall and fixing failure before choosing a repair; do not assume moving the hole a fixed distance solves the problem.')
  .replace(/## Cost breakdown[\s\S]*?(?=\*Once they are up)/,'<!-- [MY MEASUREMENTS / COST / TIME: add a dated, itemized cost breakdown from your actual project; do not invent prices]. -->\n\n');
fs.writeFileSync(shelfFile,source);
