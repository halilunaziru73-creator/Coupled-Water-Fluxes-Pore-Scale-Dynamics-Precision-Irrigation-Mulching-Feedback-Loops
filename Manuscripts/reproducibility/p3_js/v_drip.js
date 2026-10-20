const IRM=require(require('path').resolve(__dirname,'../lib')+'/model.js'); const fs=require('fs');
const out=[]; let seed=7; const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
for(let i=0;i<60;i++){ const kind=['online','inline','tape'][i%3]; const K=IRM.DKIND[kind];
  const q=K.q*(0.8+0.6*rnd()), Se=0.2+0.8*rnd()*(kind==='tape'?0.5:1.5), LL=40+160*rnd(), H0=8+12*rnd(), D=[13,16,20,25][Math.floor(rnd()*4)];
  const r=IRM.latProfile(kind,q,Se,LL,H0,D); out.push({kind,q,Se,LL,H0,D,x:K.x,Hmin:K.Hmin,cv:K.cv,ne:K.ne,hf:r.hf,Hend:r.Hend,Eu:r.Eu,qa:r.qa,qmin:r.qmin,N:r.N});}
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_drip_swafl.json',JSON.stringify(out)); console.log(out.length, IRM.DKIND);
