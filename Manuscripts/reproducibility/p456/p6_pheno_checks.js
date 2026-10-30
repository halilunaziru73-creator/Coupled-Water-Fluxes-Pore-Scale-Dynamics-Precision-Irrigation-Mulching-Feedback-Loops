// P6: deterministic phenotyping layer - determinism, water-balance closure and genotype contrasts, taken from the runs the layer itself makes
const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:1700,height:1000}}),p=await ctx.newPage();
 await p.goto(process.env.SERVER||'http://localhost:8765/app/index.html');await p.waitForTimeout(3500);
 await p.evaluate(()=>{document.getElementById('modalRoot').innerHTML='';Layers.open('dph')});await p.waitForTimeout(2000);
 await p.evaluate(()=>{[...document.querySelectorAll('#modalRoot button')].filter(x=>/Benchmark/.test(x.textContent)).forEach(x=>x.click())});await p.waitForTimeout(800);
 await p.evaluate(()=>E.ev(`(function(){const P=window.PHENO,o=P.run;window.__cap=[];P.run=function(c){const r=o(c);window.__cap.push({c,r});return r};window.__phRun()})()`));
 await p.waitForTimeout(6000);
 const out=await p.evaluate(()=>E.ev(`(function(){const P=window.PHENO,c0=window.__cap[0].c;const rows=[];
  const CL={warm:{Tm:15.5,Tamp:9.5},hot:{Tm:23,Tamp:8.5}};
  for(const clim of ['warm','hot']){for(const g of P.GENO){for(const tr of ['ww','dr']){
   const env=Object.assign({},c0.env,{sow:130,Tm:CL[clim].Tm,Tamp:CL[clim].Tamp,rainMode:'none',realRain:null,realT:null,realET0:null,dT:0,rainMult:1,rain:464*(clim==='hot'?0.45:0.7)});
   const W=P.weather(env,140);
   const cfg=Object.assign({},c0,{species:'maize',cropP:null,geno:g,env,weather:W,treatment:tr,drought:{type:'pulse',onset:40,len:28,sev:30,rainOut:true},store:false,proj:null,area:undefined});
   const r=P.run(cfg),r2=P.run(cfg),N=r.N,t=r.totals;let md=0;for(const k of Object.keys(r)){if(r[k] instanceof Float32Array){for(let j=0;j<r[k].length;j++){const d=Math.abs(r[k][j]-r2[k][j]);if(d>md)md=d}}}
   const f=a=>a[N-1],mx=a=>{let m=-1e9;for(let j=0;j<N;j++)if(a[j]>m)m=a[j];return m};
   rows.push({clim,geno:g.name,tr,closure_mm:f(r.store)-(r.store0+t.P+t.I-t.T-t.Es-t.dr),det:md,P:t.P,I:t.I,T:t.T,Es:t.Es,drain:t.dr,grain:f(r.Wg),shoot:f(r.Wl)+f(r.Ws),root:f(r.Wr),rdepth:f(r.Rdepth),cwsiMax:mx(r.CWSI),ctdMax:mx(r.CTD),psiMin:Math.min.apply(null,Array.from(r.psiL)),lai:mx(r.LAIg),height:mx(r.H),stage:f(r.stage)});}}}
  return rows})()`));
 fs.writeFileSync(__dirname+'/out_p6_pheno.json',JSON.stringify(out,null,1));
 console.log(out.length,'runs; max |closure| mm',Math.max(...out.map(r=>Math.abs(r.closure_mm))).toExponential(2),'; max determinism diff',Math.max(...out.map(r=>r.det)));
 out.forEach(r=>console.log(r.clim,r.geno.padEnd(16),r.tr,'T',r.T.toFixed(0),'grain',r.grain.toFixed(0),'shoot',r.shoot.toFixed(0),'root',r.root.toFixed(0),'rd',r.rdepth.toFixed(0),'cwsi',r.cwsiMax.toFixed(2),'psi',r.psiMin.toFixed(2),'st',r.stage.toFixed(2)));
 await b.close()})();
