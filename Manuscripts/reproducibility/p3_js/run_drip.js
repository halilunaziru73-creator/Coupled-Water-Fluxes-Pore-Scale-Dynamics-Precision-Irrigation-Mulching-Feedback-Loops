const { chromium } = require('playwright'); const fs=require('fs');
const NEW='file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/SWAFL_Desktop/app/engine/engine.html')), OLD='file://'+(process.env.SWAFL_ENGINE_V1||require('path').resolve(__dirname,'../lib/engine_v1_pre_correction.html'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const out={};
for (const [name,url] of [['new',NEW],['old',OLD]]){
  const p=await b.newPage(); await p.goto(url); await p.waitForTimeout(2500);
  out[name]=await p.evaluate(()=>{
    let seed=11; const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;}; const rows=[];
    for(let i=0;i<400;i++){ const kind=['online','inline','tape','pc'][i%4]; const K=IRM.DKIND[kind];
      const q=K.q*(0.6+0.9*rnd()), Se=0.2+0.8*rnd(), LL=30+270*rnd(), H0=6+18*rnd(), D=[10,13,16,20,25,32][Math.floor(rnd()*6)];
      const r=IRM.latProfile(kind,q,Se,LL,H0,D); rows.push({kind,q,Se,LL,H0,D,x:K.x,Hmin:K.Hmin,cv:K.cv,ne:K.ne,N:r.N,hf:r.hf,Hend:r.Hend,Eu:r.Eu,qa:r.qa,qmin:r.qmin,conv:r.conv,iters:r.iters,hfFrac:r.hfFrac,warn:r.warn}); }
    // constant-outlet-flow hydraulics for the Christiansen check
    IRM.DKIND.ctest={label:'t',cv:0,x:0,ne:1,Hmin:0,q:4,Se:0.5,D:16};
    const chr=[]; for(const N of [5,10,20,50,100,200,400]){ const q=4,Se=0.5,D=16,H0=40,LL=N*Se; const r=IRM.latProfile('ctest',q,Se,LL,H0,D); chr.push({N:r.N,hf:r.hf,q,Se,D}); }
    return {rows,chr}; });
  await p.close();}
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/drip_out.json',JSON.stringify(out)); console.log(out.new.rows.length, out.new.chr.slice(0,3)); await b.close()})();
