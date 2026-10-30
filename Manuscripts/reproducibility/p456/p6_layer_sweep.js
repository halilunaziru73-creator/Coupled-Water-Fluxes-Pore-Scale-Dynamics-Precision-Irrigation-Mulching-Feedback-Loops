// P6: open and run every SWAFL layer in the shipped workbench (Chromium via Playwright); record errors, dashboard content and time.
// usage: SERVER=http://localhost:8765/app/index.html NODE_PATH=$(npm root -g) node p6_layer_sweep.js
const { chromium } = require('playwright'); const fs=require('fs');
const URL=process.env.SERVER||'http://localhost:8765/app/index.html';
const IDS=['sid','drip','spr','v1','n1','v4','v6','e1','n2','n3','v3','v7','r1','dph','field','spac','v2','yby','wb2','nb','crop','v5'];
(async()=>{
  const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:1700,height:1000}}),p=await ctx.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await p.goto(URL); await p.waitForTimeout(3500);
  const res=[];
  for(const id of IDS){
    errs.length=0;
    await p.evaluate(()=>{document.getElementById('modalRoot').innerHTML='';});
    await p.evaluate(id=>Layers.open(id),id); await p.waitForTimeout(1200);
    await p.evaluate(()=>{[...document.querySelectorAll('#modalRoot button')].filter(x=>/Benchmark/.test(x.textContent)).forEach(x=>x.click());}); await p.waitForTimeout(700);
    const pre=await p.evaluate(()=>({tabs:[...document.querySelectorAll('#dashTabs [data-tab]')].map(x=>x.textContent.trim()),inputs:document.querySelectorAll('#propBody input,#propBody select,#propBody textarea').length}));
    const t0=Date.now();const inE=await p.evaluate(()=>E.ev('document.querySelectorAll("input,select").length'));
    await p.evaluate(id=>{const f=['sid','drip','spr'].includes(id)?"runDesign('"+id+"')":"runLayer('"+id+"')";E.ev(f);E.poll(true);try{Dash.render();}catch(e){}},id);
    await p.waitForTimeout(4000);
    await p.evaluate(()=>{const t=document.querySelector('#dashTabs [data-tab="results"]'); if(t) t.click();}); await p.waitForTimeout(500);
    const post=await p.evaluate(id=>{const d=document.getElementById('dashBody');const cv=document.getElementById('cv')||document.querySelector('canvas');
      return {kpi:d?d.querySelectorAll('.kpi,.kv').length:0,msgs:d?d.querySelectorAll('.msg,.note,li').length:0,charts:d?d.querySelectorAll('canvas,svg').length:0,textLen:d?d.innerText.length:0,canvas:cv?[cv.width,cv.height]:null};},id);
    // the charts tab
    let ch=0; try{ch=await p.evaluate(async()=>{const t=document.querySelector('#dashTabs [data-tab="charts"]'); if(!t) return -1; t.click(); await new Promise(r=>setTimeout(r,1800)); return document.querySelectorAll('#dashBody canvas,#dashBody svg').length;});}catch(e){}
    const ran=await p.evaluate(id=>E.ev("typeof layerRan==='function'?layerRan('"+id+"'):null"),id);
    res.push(Object.assign({id,ran,engineInputs:inE,ms:Date.now()-t0,tabs:pre.tabs,inputs:pre.inputs,chartsTab:ch,errors:errs.slice()},post));
    console.log(id,JSON.stringify(res[res.length-1]).slice(0,260));
  }
  fs.writeFileSync(__dirname+'/out_p6_sweep.json',JSON.stringify(res,null,1)); await b.close();
})();
