const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/SWAFL_Desktop/app/engine/engine.html')));await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{
  const time=(f,n)=>{f();const t0=performance.now();for(let i=0;i<n;i++)f();return (performance.now()-t0)/n;};
  const S=state; const out={};
  out.engine1_model_ms=time(()=>model(VFF_VALUES[S.vffIdx],RAIN_VALUES[S.rainIdx]),2000);
  out.sprinkler_ms=time(()=>IRM.sprinkler({type:'impact',P:300,d:4.4,u:2,alpha:25,Ss:12,Sl:18,tri:false,Zn:40,K:0.02,A:0.6,Sd:3,S:2,Tair:22,intc:0.5}),50);
  out.drip_ms=time(()=>IRM.drip({kind:'online',q:4,Se:0.75,Sl:1.5,LL:100,H0:10,D:16,Zn:25,psi:200,ks:10,fT:0.5,fc:0.3,wp:0.12,dep:0,Rmax:60,E0:4}),200);
  out.engine2_s=(()=>{state.soil='S01_CoarseLoam';current=model(VFF_VALUES[S.vffIdx],RAIN_VALUES[S.rainIdx]);const t0=performance.now();computeSim();return (performance.now()-t0)/1000;})();
  return out;});
console.log(r); fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_bench.json',JSON.stringify(r)); await b.close()})();
