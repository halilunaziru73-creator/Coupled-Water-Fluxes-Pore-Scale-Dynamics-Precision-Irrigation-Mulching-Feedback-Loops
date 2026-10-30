// P5: checks of the Daisy -> SWAFL bridge code (daisysum.js, daisycalc.js) against the files bundled from the Daisy project
const fs=require('fs'),zlib=require('zlib');global.window=global;
const A='/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/';
const C=require(A+'js/daisycalc.js'),D=require(A+'js/daisysum.js');
const dl=A+'data/daisy/dlf/';
const res={};
// 1. denitrification function against the 792 target rows of the Daisy python-extensions test
{const L=fs.readFileSync(dl+'denitrification-args-and-targets.csv','utf8').trim().split('\n');const h=L[0].split(',');const rows=L.slice(1).map(l=>{const v=l.split(',').map(Number),o={};h.forEach((k,i)=>o[k]=v[i]);return o});
 const e2=[],e1=[],arr=[];let n=0;
 for(const r of rows){const o=C.denitrification({Theta:r.Theta,NO3:r.NO3,rho_b:r.rho_b,CO2_C:r.CO2_C,CO2_C_fast:r.CO2_C_fast,Theta_sat:r.Theta_sat,h:r.h});
  const o2=C.denitrification({Theta:r.Theta,NO3:r.NO3,rho_b:r.rho_b,CO2_C:r.CO2_C,CO2_C_fast:r.CO2_C_fast,Theta_sat:r.Theta_sat,h:r.h,rawCO2:true});arr.push([r.N2_deni,o['N2-Denit'],o2['N2-Denit'],r.N2O_deni,o['N2O-Denit'],o2['N2O-Denit']]);
  if(r.N2_deni>0)e2.push(Math.abs(o['N2-Denit']-r.N2_deni)/r.N2_deni); if(r.N2O_deni>0)e1.push(Math.abs(o['N2O-Denit']-r.N2O_deni)/r.N2O_deni); n++;}
 const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(p*(s.length-1))]};
 res.deniArr=arr;res.deni={n,rawN2_median:(()=>{const a=arr.filter(x=>x[0]>0).map(x=>Math.abs(x[2]-x[0])/x[0]);return q(a,.5)})(),N2_median:q(e2,.5),N2_p95:q(e2,.95),N2_max:Math.max(...e2),N2O_median:q(e1,.5),N2O_p95:q(e1,.95),N2O_max:Math.max(...e1)};}
// 2. dlf parser: every cell of every bundled log, JS values dumped for the independent Python reading
{const out={};for(const f of fs.readdirSync(dl).filter(f=>/\.dlf$/.test(f))){const d=D.parseDlf(fs.readFileSync(dl+f,'utf8'));if(!d){out[f]=null;continue}out[f]={names:d.names,nrows:d.rows.length,sum:d.names.map((n,j)=>d.rows.reduce((a,r)=>a+(typeof r[j]==='number'&&isFinite(r[j])?r[j]:0),0))};}
 res.parse=out;}
// 3. nitrogen summary: balance closure of the bundled annual N logs after the bridge summary
{const out={};for(const f of ['annual-field-nitrogen-3b.dlf','annual-field-nitrogen-4b.dlf']){const d=D.parseDlf(fs.readFileSync(dl+f,'utf8'));const s=D.summarise(n=>n==='Annual-FN'||n==='Annual-FN_100cm'?d:null,false);out[f]=s;}res.nsum=out;}
fs.writeFileSync(__dirname+'/out_p5_bridge_js.json',JSON.stringify(res,null,1));
console.log(JSON.stringify(res.deni));console.log(Object.keys(res.parse).map(k=>k+':'+(res.parse[k]?res.parse[k].nrows:null)).join(' '));console.log(JSON.stringify(res.nsum['annual-field-nitrogen-3b.dlf']).slice(0,600));
