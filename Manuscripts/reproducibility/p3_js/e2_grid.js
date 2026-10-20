const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/SWAFL_Desktop/app/engine/engine.html')));await p.waitForTimeout(3000);
const res=await p.evaluate(()=>{
  const out=[];
  for(const soil of DATA.soils) for(const trig of [-100,-200,-300,-500,-1000]) for(const method of ['M02_Surface','M01_Overhead']) {
    const S=state; Object.assign(S,{soil,till:'conv',tcIdx:TC_VALUES.indexOf(0.005),vffIdx:VFF_VALUES.length-1,capIdx:1,rainIdx:RAIN_VALUES.indexOf(1),tempIdx:TEMP_VALUES.indexOf(0),trigIdx:TRIG_VALUES.indexOf(trig),zIdx:Z_VALUES.indexOf(20),nIdx:NRATE_VALUES.indexOf(100),method,crop:'cereal',trigMode:'common'});
    current=model(VFF_VALUES[S.vffIdx],RAIN_VALUES[S.rainIdx]);
    const sim=computeSim(); const awc=AWC[soil]*DZ; const nd=ND;
    let thr=0,irr=0,dr=0,ev=0,tr=0; for(let d=0;d<nd;d++){thr+=sim.thr[d];irr+=sim.irr[d];dr+=sim.drain[d];ev+=sim.dE[d];tr+=sim.dT[d];}
    const sEnd=(()=>{let t=0;const v=sim.s[nd-1];for(let i=0;i<NLAY;i++)t+=v[i]*awc;return t;})();
    out.push({soil,trig,method,irrT:current.irr,irrS:sim.meanIrr,drT:current.drain,drS:sim.meanDrain,ET:current.evap,ES:ev/(nd/DPY),TT:current.transp,TS:tr/(nd/DPY),kt:sim.kt,relres:(NLAY*awc*0.72+thr+irr-dr-ev-tr-sEnd)/(thr+irr)});
  } return out;});
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_e2_grid.json',JSON.stringify(res));
await b.close()})();
