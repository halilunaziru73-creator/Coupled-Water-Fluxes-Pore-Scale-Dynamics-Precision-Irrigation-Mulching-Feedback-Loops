const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:1700,height:1000}}),p=await ctx.newPage();
 await p.goto('http://localhost:8765/app/index.html');await p.waitForTimeout(3500);
 for(const id of ['chem','dsum']){
 await p.evaluate(()=>{document.getElementById('modalRoot').innerHTML=''});
 await p.evaluate(id=>Layers.open(id),id);await p.waitForTimeout(2500);
 console.log(id,(await p.evaluate(()=>document.getElementById('dashBody').innerText)).replace(/\n+/g,' | ').slice(0,400));
 console.log(await p.evaluate(()=>E.ev("typeof window.DAISYLIVE")));}
 await b.close()})();
