// P5: closure of the chemical budget that the bridge (DaisySum.summarise with chemistry) reports for the bundled annual tracer log
const fs=require('fs');global.window=global;const D=require('/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/js/daisysum.js');
const d=D.parseDlf(fs.readFileSync('/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/data/daisy/dlf/annual-tracer-3b.dlf','utf8'));
const s=D.summarise(n=>n==='Annual-Tracer'?d:null,true).chem;let prev=134.453;const res=[];
for(let i=0;i<10;i++){const dS=s.stock[i]-prev;res.push(dS-(s.spray[i]-s.uptake[i]-s.leach[i]-s.runoff[i]-s.decay[i]));prev=s.stock[i];}
const out={resid:res,maxAbs:Math.max(...res.map(Math.abs)),sumAbs:res.reduce((a,r)=>a+Math.abs(r),0),applied:s.spray.reduce((a,b)=>a+b,0),leachTotal:s.leach.reduce((a,b)=>a+b,0),uptakeTotal:s.uptake.reduce((a,b)=>a+b,0)};
fs.writeFileSync(__dirname+'/out_p5_chem.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out));
