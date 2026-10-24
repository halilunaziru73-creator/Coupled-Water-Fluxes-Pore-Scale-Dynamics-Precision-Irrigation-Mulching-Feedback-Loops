const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/v1.1.0/SWAFL_Desktop/app/engine/engine.html')));await p.waitForTimeout(3000);
const res=await p.evaluate(()=>{
  let seed=12345; const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
  const pick=a=>a[Math.floor(rnd()*a.length)]; const out=[];
  for(let k=0;k<60;k++){
    const S=state; S.soil=pick(DATA.soils); S.till=pick(['conv','reduced','notill']); S.tcIdx=Math.floor(rnd()*TC_VALUES.length); S.vffIdx=Math.floor(rnd()*VFF_VALUES.length); S.capIdx=Math.floor(rnd()*CAP_VALUES.length);
    S.rainIdx=Math.floor(rnd()*RAIN_VALUES.length); S.tempIdx=Math.floor(rnd()*TEMP_VALUES.length); S.trigIdx=Math.floor(rnd()*TRIG_VALUES.length); S.zIdx=Math.floor(rnd()*Z_VALUES.length); S.nIdx=Math.floor(rnd()*NRATE_VALUES.length); S.method=pick(METHODS.map(q=>q.k)); S.crop=pick(['cereal','legume','vegetable']);
    current=model(VFF_VALUES[S.vffIdx],RAIN_VALUES[S.rainIdx]);
    const sim=computeSim(); const awc=AWC[S.soil]*DZ; const nd=ND;
    // storage in mm: s fraction * awc per layer
    const stor=d=>{let t=0;const v=sim.s[d];for(let i=0;i<NLAY;i++)t+=v[i]*awc;return t;};
    const s0=NLAY*awc*0.72; const sEnd=stor(nd-1);
    let thr=0,irr=0,dr=0,ev=0,tr=0; for(let d=0;d<nd;d++){thr+=sim.thr[d];irr+=sim.irr[d];dr+=sim.drain[d];ev+=sim.dE[d];tr+=sim.dT[d];}
    const resid=s0+thr+irr-dr-ev-tr-sEnd; const inflow=thr+irr;
    out.push({soil:S.soil,method:S.method,crop:S.crop,meanIrrTarget:current.irr,meanIrrSim:sim.meanIrr,meanDrainTarget:current.drain,meanDrainSim:sim.meanDrain,resid,inflow,relres:resid/inflow,
      Esim:ev/(nd/DPY),Etarget:current.evap,Tsim:tr/(nd/DPY),Ttarget:current.transp,kt:sim.kt});
  } return out;});
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_e2_closure.json',JSON.stringify(res));
const rr=res.map(r=>Math.abs(r.relres)); console.log('n',res.length,'max |rel resid|',Math.max(...rr),'median',rr.sort((a,b)=>a-b)[30]);
const m=(f)=>{const e=res.map(f);return e.reduce((a,b)=>a+Math.abs(b),0)/e.length};
console.log('mean abs irr rel err',m(r=>(r.meanIrrSim-r.meanIrrTarget)/Math.max(1,r.meanIrrTarget)),'drain abs err mm',m(r=>r.meanDrainSim-r.meanDrainTarget),'E err',m(r=>(r.Esim-r.Etarget)/Math.max(1,r.Etarget)),'T',m(r=>(r.Tsim-r.Ttarget)/Math.max(1,r.Ttarget)));
await b.close()})();
