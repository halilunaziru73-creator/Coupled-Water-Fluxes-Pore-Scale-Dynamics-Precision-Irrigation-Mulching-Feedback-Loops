const {chromium}=require('playwright');
const scenes=process.argv[2].split(',');const H=+process.argv[3]||7000;
(async()=>{
 const b=await chromium.launch();
 for(const scene of scenes){
 const ctx=await b.newContext({viewport:{width:1900,height:H},deviceScaleFactor:2});
 await ctx.addInitScript(()=>{try{localStorage.setItem('swafl.eula.accepted',JSON.stringify({v:'1.0',t:'x'}));sessionStorage.setItem('swafl.eula.accepted','1.0');localStorage.setItem('swafl.rem.wx','record');localStorage.setItem('swafl.rem.welcome','1')}catch(e){}});
 const p=await ctx.newPage();
 try{
 await p.goto('http://localhost:8765/index.html?v=1.1.0#open='+scene);
 await p.waitForTimeout(8000);
 const fr=p.frames().find(f=>f.url().includes('engine.html'));
 await fr.evaluate(()=>{try{document.getElementById('playBtn').click()}catch(e){}});
 await p.waitForTimeout(6000);
 await p.addStyleTag({content:'#engVeil,#loading,#bootVeil,#modalRoot{display:none!important}'});
 const h=await fr.evaluate(()=>{const c=document.getElementById('canvaswrap')||document.scrollingElement;return c.scrollHeight});
 const box=await (await p.$('#engine')).boundingBox();
 await p.waitForTimeout(1500);
 await p.screenshot({path:'/tmp/sh/'+scene+'_full.png',clip:{x:box.x,y:box.y,width:box.width,height:Math.min(box.height,h)}});
 console.log(scene,h,Math.round(box.width));
 }catch(e){console.log(scene,'ERR',e.message.slice(0,100))}
 await ctx.close();}
 await b.close();})();
