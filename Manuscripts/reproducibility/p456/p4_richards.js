// P4: the Richards solver of the Daisy workbench (daisycalc.js) - mass balance, grid convergence, scenarios for the Python reference
const fs=require('fs');global.window=global;
const C=require('/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/js/daisycalc.js');
const SOILS={sand:{alpha:0.145,n:2.68,Ks:29.7,Ths:0.43,Thr:0.045,l:0.5},loam:{alpha:0.036,n:1.56,Ks:1.04,Ths:0.43,Thr:0.078,l:0.5},siltclayloam:{alpha:0.010,n:1.23,Ks:0.07,Ths:0.50,Thr:0.089,l:0.5}};
const out={};
for(const [nm,hy] of Object.entries(SOILS)){
  out[nm]={};
  for(const dz of (nm==='siltclayloam'?[4,2,1]:[4,2,1,0.5])){
    const days=6,rain=[200,0,0,0,0,0];
    const t0=Date.now();console.error(nm,dz);
    const r=C.richards({layers:[{depth:100,hy}],dz,days,rain,Es:[],Tp:[],h0:-300,bottom:{type:'free'}});
    const sum=a=>a.reduce((x,y)=>x+y,0);
    out[nm][dz]={infil:sum(r.infil),drain:sum(r.drain),runoff:sum(r.runoff),store0:null,storeEnd:r.store[days-1],maxErr:Math.max(...r.err.map(Math.abs)),sumErr:sum(r.err),iters:r.totalIterations,ms:Date.now()-t0,
      infilD:r.infil,drainD:r.drain,store:r.store};
  }
}
// initial storage for the reference
const init={};for(const [nm,hy] of Object.entries(SOILS)){const H=C.hydraulics(hy);init[nm]=H.theta(-300)*1000;}
fs.writeFileSync(__dirname+'/out_p4_richards_js.json',JSON.stringify({SOILS,init,out}));
for(const nm in out)for(const dz in out[nm]){const o=out[nm][dz];console.log(nm,dz,'infil',o.infil.toFixed(2),'drain',o.drain.toFixed(2),'end',o.storeEnd.toFixed(1),'maxErr',o.maxErr,'ms',o.ms,'it',o.iters)}
