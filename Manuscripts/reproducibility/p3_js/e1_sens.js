const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/v1.1.0/SWAFL_Desktop/app/engine/engine.html')));await p.waitForTimeout(3000);
const res=await p.evaluate(()=>{
 const S=state; const base=()=>{S.soil='S01_CoarseLoam';S.till='conv';S.tcIdx=TC_VALUES.indexOf(0.005);S.vffIdx=VFF_VALUES.length-1;S.tempIdx=TEMP_VALUES.indexOf(0);S.nIdx=NRATE_VALUES.indexOf(100);S.method='M02_Surface';S.trigIdx=TRIG_VALUES.indexOf(-300);S.zIdx=Z_VALUES.indexOf(20);S.rainIdx=RAIN_VALUES.indexOf(1);S.capIdx=0;};
 const run=()=>{const o=model(VFF_VALUES[S.vffIdx],RAIN_VALUES[S.rainIdx]);return {irr:o.irr,et:o.et,drain:o.drain,yield:o.yield,nl:o.nl,evap:o.evap,transp:o.transp};};
 base(); const b0=run(); const F=[];
 const test=(name,lo,hi,setLo,setHi,labLo,labHi)=>{base();setLo();const a=run();base();setHi();const c=run();base();F.push({name,labLo,labHi,lo:a,hi:c});};
 test('Rainfall scale',0,0,()=>S.rainIdx=RAIN_VALUES.indexOf(0.7),()=>S.rainIdx=RAIN_VALUES.indexOf(1.3),'x0.7','x1.3');
 test('Warming',0,0,()=>S.tempIdx=TEMP_VALUES.indexOf(-1),()=>S.tempIdx=TEMP_VALUES.indexOf(2),'-1 C','+2 C');
 test('Trigger suction',0,0,()=>S.trigIdx=TRIG_VALUES.indexOf(-150),()=>S.trigIdx=TRIG_VALUES.indexOf(-1000),'-150 cm','-1000 cm');
 test('Sensor depth',0,0,()=>S.zIdx=Z_VALUES.indexOf(10),()=>S.zIdx=Z_VALUES.indexOf(40),'10 cm','40 cm');
 test('Mulch vapour-flux factor',0,0,()=>S.vffIdx=VFF_VALUES.indexOf(0.4),()=>S.vffIdx=VFF_VALUES.indexOf(0.7),'0.4','0.7');
 test('Irrigation method',0,0,()=>S.method='M01_Overhead',()=>S.method='M06_Drip20-30cm','overhead','drip 20-30 cm');
 test('Tillage',0,0,()=>S.till='notill',()=>S.till='conv','no-till','conv (base)');
 test('Nitrogen rate',0,0,()=>S.nIdx=NRATE_VALUES.indexOf(55),()=>S.nIdx=NRATE_VALUES.indexOf(130),'55%','130%');
 // soils
 const soils=['S01_CoarseLoam','S02_CoarseSand','S03_Sand','S04_LoamySand','S05_SandyLoam','S06_Loam','S07_SiltLoam','S08_SandyClayLoam','S09_ClayLoam','S10_SiltyClayLoam'];
 const SO=soils.map(s=>{base();S.soil=s;const o=run();base();return {soil:s,...o};});
 return {base:b0,F,SO};});
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_e1_sens.json',JSON.stringify(res,null,1)); console.log(JSON.stringify(res.F.map(f=>[f.name,f.lo.irr.toFixed(0),f.hi.irr.toFixed(0),f.lo.drain.toFixed(0),f.hi.drain.toFixed(0)])));console.log(JSON.stringify(res.SO.map(s=>[s.soil.slice(0,3),s.irr.toFixed(0),s.drain.toFixed(0)])));await b.close()})();
