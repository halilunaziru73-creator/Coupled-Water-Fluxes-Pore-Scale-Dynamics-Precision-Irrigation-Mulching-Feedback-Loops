const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/v1.1.0/SWAFL_Desktop/app/engine/engine.html')));await p.waitForTimeout(3000);
const info=await p.evaluate(()=>({TRIG:TRIG_VALUES,Z:Z_VALUES,RAIN:RAIN_VALUES,TEMP:TEMP_VALUES,VFF:VFF_VALUES,CAP:CAP_VALUES,TC:TC_VALUES,N:NRATE_VALUES,state:state,keys:Object.keys(DATA.e2).slice(0,3), e2s:JSON.stringify(Object.values(DATA.e2)[0]).slice(0,400)}));
console.log(JSON.stringify(info,null,0));
const rows=JSON.parse(fs.readFileSync((process.env.SWAFL_MS||'.')+'/out/e12.json'));
const res=await p.evaluate((rows)=>{
  const out=[]; 
  for(const r of rows){ const S=state; S.soil='S01_CoarseLoam'; S.till='conv'; S.tcIdx=TC_VALUES.indexOf(0.005); S.vffIdx=VFF_VALUES.length-1; 
    S.tempIdx=TEMP_VALUES.indexOf(0); S.nIdx=NRATE_VALUES.indexOf(100); S.method='M02_Surface';
    S.trigIdx=TRIG_VALUES.indexOf(r.trig); S.zIdx=Z_VALUES.indexOf(r.z); S.rainIdx=RAIN_VALUES.indexOf(r.P);
    if(S.trigIdx<0||S.zIdx<0||S.rainIdx<0){out.push({skip:[r.trig,r.z,r.P]});continue;}
    const o=model(VFF_VALUES[S.vffIdx],RAIN_VALUES[S.rainIdx]); out.push(o);} return out;},rows);
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/e12_pred.json',JSON.stringify(res)); console.log(res.length,res.filter(x=>x.skip).length);await b.close()})();
