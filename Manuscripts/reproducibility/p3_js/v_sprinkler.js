const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/SWAFL_Desktop/app/engine/engine.html')));await p.waitForTimeout(3000);
const res=await p.evaluate(()=>{
  state.soil='S07_SiltLoam'; SPD.pan=false; SPD.top=16;
  // textbook example: 180x180 m field, 12x15 m, Zn=42 mm, Ea=0.7 -> gross 60 mm, T=10 d, 16 h/d, Q=21 m3/h, slope 10 %
  const out={};
  for (const qs of [0.675,1.35,2.03]) {            // m3/h per sprinkler for 1,2,3 sets/day
    const Qlmin=qs*1000/60;                          // L/min
    const R={Q:Qlmin, nz:{R:14.4}, AR:qs/(12*15)*1000, gross:60};
    const o={P:240,u:1.5,S:10,Ss:12,Sl:15,Zn:42,type:'impact',d:4.8};
    const C={s:{ks:30},ETpk:4.2};
    const B=spBook(R,o,C,180,3.24,21/3.6,0,0);
    out[qs]={umax:B.umax,qmax:B.qmax,tset:B.tset,sets:B.sets,N:B.N,Nm:B.Nm,Tint:B.Tint,opts:B.opts.map(q=>({n:q.n,Nd:q.Nd,Qin:q.Qin,okT:q.okT,okQ:q.okQ})),pick:B.pick.n,Rw_ok:B.k, chk:B.chk? B.chk.map(c=>[c[0],c[1]]):null};
  }
  // nozzle of textbook sprinkler: d=4.8 mm, P=24 m (=235.4 kPa)
  const nz=IRM.nozzle({P:24*9.81,d:4.8,type:'impact',alpha:25}); out.nozzle=nz;
  out.nozzle_check=IRM.nozzle({P:24*9.81,d:4.8,type:'impact'});
  return out;});
console.log(JSON.stringify(res,null,1)); fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_sprinkler.json',JSON.stringify(res)); await b.close()})();
