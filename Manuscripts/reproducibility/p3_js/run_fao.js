const { chromium } = require('playwright'); const fs=require('fs');
const NEW='file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/SWAFL_Desktop/app/engine/engine.html'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']}); const p=await b.newPage(); await p.goto(NEW); await p.waitForTimeout(2500);
const out=await p.evaluate(()=>{
 const cases=[
  {id:'first',k:0.00484,A:0.388,f0:0.00008,n:0.04,L:200,S:0.001,rows:[[0.036,6.36],[0.0545,3.11],[0.072,2.14],[0.09,1.64]],treq:388.5,qmin:0.0226},
  {id:'later',k:0.0053,A:0.327,f0:0.000052,n:0.10,L:200,S:0.001,rows:[[0.018,15.55],[0.036,5.03],[0.0545,3.15]],treq:678.9,qmin:0.0226},
  {id:'first100',k:0.00484,A:0.388,f0:0.00008,n:0.04,L:100,S:0.008,rows:[[0.018,5.27],[0.0269,2.35],[0.036,1.44],[0.045,1.03]],treq:388.5,qmin:0.032},
  {id:'later100',k:0.0053,A:0.327,f0:0.000052,n:0.10,L:100,S:0.008,rows:[[0.009,12.89],[0.018,3.45]],treq:678.9,qmin:0.032}];
 const res=[];
 for(const c of cases){ const Zn=0.08; const Zf=t=>c.k*Math.pow(t,c.A)+c.f0*t; const treq=SIDM.solveT(Zf,Zn);
  const qm=0.000357*c.L*Math.sqrt(c.S)/0.10; // FAO-45 Qmin (m3/min/m) from Qmin=0.000357 L S0^0.5/n
  const rr=[]; for(const [q,ref] of c.rows){ const wd=SIDM.manningWide(q/60,c.S,c.n);
    const R=SIDM.compute({L:c.L,w:1,q,k:c.k,A:c.A,f0:c.f0,Zn,A0:wd.A0,sy:0.77,sz:null}); rr.push({q,ref,adv:R.tL/60,err:(R.tL/60/ref-1)*100}); }
  res.push({id:c.id,treq,treqRef:c.treq,qm,qmRef:c.qmin,rows:rr}); }
 return res;});
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/fao_out.json',JSON.stringify(out,null,1)); 
for(const c of out){console.log(c.id,'Treq',c.treq.toFixed(1),c.treqRef,'Qmin',c.qm.toFixed(4),c.qmRef); for(const r of c.rows)console.log('  q',r.q,'adv h',r.adv.toFixed(2),'ref',r.ref,'err%',r.err.toFixed(1));}
await b.close();})();
