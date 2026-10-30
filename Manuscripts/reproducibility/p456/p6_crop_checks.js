// P6: structure and internal consistency of the 48-crop library and of its Kc curve
const fs=require('fs');global.window=global;
require('/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/engine/crops.js');
const L=window.CROPLIB, keys=Object.keys(L.crops);
const out={n:keys.length,groups:{},habits:{},combos:0,issues:[],rows:[],kySrc:{},groupDefault:0};
for(const k of keys){const c=L.crops[k];out.groups[c.group]=(out.groups[c.group]||0)+1;out.habits[c.habit]=(out.habits[c.habit]||0)+1;
 out.kySrc[c.kySrc]=(out.kySrc[c.kySrc]||0)+1; if(c.rootSrc==='group default'||c.stSrc==='group default')out.groupDefault++;
 const nd=c.group==='field'?1:c.densities.length;
 for(let d=0;d<nd;d++){out.combos++;const p=L.params(k,d),iss=[];
  if(!(p.kcMid>=p.kcIni-1e-9))iss.push('Kc mid < Kc ini');if(!(p.kcMid>0.3&&p.kcMid<1.4))iss.push('Kc mid '+p.kcMid);if(p.st.some(x=>!(x>0)))iss.push('stage<=0');
  if(!(p.len>=60&&p.len<=365))iss.push('length '+p.len);if(!(p.p>0.1&&p.p<0.8))iss.push('p');if(p.ky!=null&&!(p.ky>0.2&&p.ky<1.6))iss.push('Ky');if(!(p.root>20&&p.root<400))iss.push('root');
  const kc=L.kcCurve(p);let mx=0,jump=0,prev=null;for(let i=0;i<365;i++){mx=Math.max(mx,kc[i]);if(prev!=null&&kc[i]>0&&prev>0)jump=Math.max(jump,Math.abs(kc[i]-prev));prev=kc[i];}
  if(Math.abs(mx-Math.max(p.kcMid,p.kcIni,p.kcEnd))>1e-4)iss.push('curve max '+mx.toFixed(3));if(jump>0.05)iss.push('daily jump '+jump.toFixed(3));
  const sum=kc.reduce((a,b)=>a+b,0);
  out.rows.push({key:k,dens:p.dens,group:c.group,habit:c.habit,kcIni:p.kcIni,kcMid:p.kcMid,kcEnd:p.kcEnd,len:p.len,root:p.root,p:p.p,ky:p.ky,kcSum:sum,iss});if(iss.length)out.issues.push([k,p.dens,iss]);}}
out.curves={};for(const k of ['wheat','maize','rice','tomato','potato','olive','apple','citrus']){if(L.crops[k]){const p=L.params(k);out.curves[k]={label:p.label,kc:Array.from(L.kcCurve(p),v=>+v.toFixed(3))};}}
fs.writeFileSync(__dirname+'/out_p6_crops.json',JSON.stringify(out,null,1));
console.log(out.n,'crops',out.combos,'crop x density',JSON.stringify(out.groups),JSON.stringify(out.habits),JSON.stringify(out.kySrc),'group default',out.groupDefault);console.log(JSON.stringify(out.issues));
