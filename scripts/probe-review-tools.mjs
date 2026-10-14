for(const name of ['sharp','@astrojs/markdown-satteri','satteri','playwright','@playwright/test']) {
  try {console.log(name,import.meta.resolve(name));}catch{console.log(name,'unavailable');}
}
try {const r=await fetch('http://localhost:9334/json/version');console.log('browser',await r.json());} catch(error) {console.log('browser',error.message);}
