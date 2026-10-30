// P4: do the three optimisers of the workbench recover known parameters? Target: the 792 stored Daisy denitrification outputs.
const fs=require('fs');global.window=global;
const C=require('/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/js/daisycalc.js');
const L=fs.readFileSync('/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/data/daisy/dlf/denitrification-args-and-targets.csv','utf8').trim().split('\n');const h=L[0].split(',');
const rows=L.slice(1).map(l=>{const v=l.split(',').map(Number),o={};h.forEach((k,i)=>o[k]=v[i]);return o}).filter(r=>r.N2_deni>0&&r.N2O_deni>0);
const tgt=rows.map(r=>Math.log10(r.N2_deni));
const truth={alphaF:0.05302701196829458,Kd:0.020833,alpha:0.0001};
const ps=[{name:'alphaF',lo:0.005,hi:0.5,log:true,init:0.15},{name:'Kd',lo:0.002,hi:0.2,log:true,init:0.06},{name:'alpha',lo:1e-5,hi:1e-3,log:true,init:3e-4}];
const f=x=>{const p=rows.map(r=>{const o=C.denitrification(Object.assign({},r,{alphaF:x.alphaF,Kd:x.Kd,alpha:x.alpha}));return Math.log10(Math.max(1e-30,o['N2-Denit']))});return C.loss.mse(p,tgt)};
(async()=>{const out={truth,loss0:f(truth),start:f({alphaF:0.15,Kd:0.06,alpha:3e-4}),runs:[]};
 for(const [nm,fn] of [['sequential',C.optSequential],['cma',C.optCMA],['bayes',C.optBayes]]){
  for(const seed of [1,2,3,4,5]){C.seed(seed);const t0=Date.now();const r=await fn(ps,f,{budget:150,samples:5});
   out.runs.push({method:nm,seed,evals:r.evals,loss:r.y,x:r.x,ms:Date.now()-t0,err:Object.keys(truth).map(k=>Math.abs(Math.log10(r.x[k]/truth[k])))});}}
 fs.writeFileSync(__dirname+'/out_p4_calibration.json',JSON.stringify(out,null,1));
 for(const r of out.runs)console.log(r.method,r.seed,r.evals,r.loss.toExponential(2),r.err.map(v=>v.toFixed(3)).join(' '),r.ms+'ms');
 console.log('start loss',out.start.toExponential(2));})();
