// P4: can the workbench regenerate the designs of the 17 experiments of the study?
const fs=require('fs'),zlib=require('zlib'),path=require('path');
const J='/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/js/';
global.window=global; 
const S=require(J+'daisyscen.js'); global.DaisyScen=S; const E=require(J+'daisyexp.js');
const rows=E.parseEnsemble(zlib.gunzipSync(fs.readFileSync('/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/data/daisy/ensemble.csv.gz')).toString());
console.log('ensemble rows',rows.length,'valid',rows.filter(r=>r.valid).length);
const out=[];
for(const p of E.PRESETS){
  const er=rows.filter(r=>r.exp===p.id);
  if(!p.plan){out.push({id:p.id,name:p.name,unsupported:true,study:er.length});continue;}
  let d; try{d=E.design(Object.assign({max:100000},p.plan));}catch(e){out.push({id:p.id,err:e.message});continue;}
  const fids=p.plan.factors.map(f=>f.id);
  const norm=v=>{const x=parseFloat(v);return isFinite(x)&&String(v).trim()!==''?+x.toFixed(6):String(v);};
  // ensemble factor space for the experiment: distinct combos of those factors available in the ensemble rows
  const key=(val)=>fids.map(f=>norm(val[f]===undefined?'':val[f])).join('|');
  const ensKeys=new Set(er.filter(r=>!/rainfed/i.test(r.treatment)).map(r=>key(r.f)));
  const guiKeys=d.runs.filter(r=>!/^Rainfed/.test(r.label)).map(r=>key(r.val));
  out.push({id:p.id,name:p.name,gui:d.runs.length,study:er.length,guiFactorCombos:new Set(guiKeys).size,ensCombos:ensKeys.size});
}
console.log(JSON.stringify(out,null,0));
fs.writeFileSync(__dirname+'/out_p4_design.json',JSON.stringify(out,null,1));
