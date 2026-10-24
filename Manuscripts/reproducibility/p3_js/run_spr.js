const { chromium } = require('playwright'); const fs=require('fs');
const NEW='file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/v1.1.0/SWAFL_Desktop/app/engine/engine.html')), OLD='file://'+(process.env.SWAFL_ENGINE_V1||require('path').resolve(__dirname,'../lib/engine_v1_pre_correction.html'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']}); const out={};
for (const [name,url] of [['new',NEW],['old',OLD]]){ const p=await b.newPage(); await p.goto(url); await p.waitForTimeout(2500);
 out[name]=await p.evaluate(()=>{
  const nz=IRM.nozzle({P:24*9.81,d:4.8,type:'impact',alpha:25});
  const res={nozzle:nz,D:2*nz.R};
  // CU against spacing / wetted diameter, no wind and 3 m/s, square layout, d=4.8 mm, P=24 m head
  res.cu=[]; for(const u of [0,3.0]) for(const ratio of [0.4,0.5,0.6,0.65,0.7,0.8,1.0,1.2]){ const D=2*nz.R, S=ratio*D;
    const o={type:'impact',d:4.8,P:24*9.81,alpha:25,u,Ss:S,Sl:S,tri:false,Tair:24,K:0.002,A:0.4,Sd:2,S:1,Zn:20,intc:0,T:60}; const r=IRM.sprinkler(o); res.cu.push({u,ratio,S,CU:r.CU,AR:r.AR,Ea:r.Ea}); }
  // triangular
  res.cutri=[]; for(const ratio of [0.5,0.6,0.7,0.8]){ const D=2*nz.R,S=ratio*D; const o={type:'impact',d:4.8,P:24*9.81,alpha:25,u:0,Ss:S,Sl:S*0.866,tri:true,Tair:24,K:0.002,A:0.4,Sd:2,S:1,Zn:20,intc:0,T:60}; res.cutri.push({ratio,CU:IRM.sprinkler(o).CU}); }
  // nozzle discharge across diameters/pressures vs orifice theory (independent formula) 
  res.q=[]; for(const d of [2.4,3.2,4.0,4.8,6.0,8.0]) for(const P of [200,300,400]){ const n=IRM.nozzle({P,d,type:'impact',alpha:25}); const h=P/9.81; const A=Math.PI*(d/2000)**2; res.q.push({d,P,q:n.q,qth:0.95*A*Math.sqrt(2*9.81*h)*60000,R:n.R,Rkb:1.35*Math.sqrt(d*h)}); }
  return res; }); await p.close(); }
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/spr_out.json',JSON.stringify(out)); console.log(JSON.stringify(out.new.nozzle),JSON.stringify(out.old.nozzle)); 
console.log(out.new.cu.map(c=>[c.u,c.ratio,(c.CU*100).toFixed(1)].join(':')).join('  ')); console.log(out.old.cu.map(c=>[c.u,c.ratio,(c.CU*100).toFixed(1)].join(':')).join('  ')); console.log(out.new.cutri.map(c=>[c.ratio,(c.CU*100).toFixed(1)].join(':')).join('  ')); await b.close()})();
