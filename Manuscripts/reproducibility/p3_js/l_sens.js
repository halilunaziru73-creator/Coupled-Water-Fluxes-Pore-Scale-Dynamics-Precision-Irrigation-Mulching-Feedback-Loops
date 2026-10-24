const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('file://'+(process.env.SWAFL_ENGINE||require('path').resolve(__dirname,'../../../Software/v1.1.0/SWAFL_Desktop/app/engine/engine.html')));await p.waitForTimeout(3000);
const res=await p.evaluate(()=>{
 const out={};
 const s0=IRM.sprinkler({type:'impact',P:300,d:4.4,u:2,alpha:25,Ss:12,Sl:18,tri:false,Zn:40,K:0.02,A:0.6,Sd:3,S:2,Tair:22,intc:0.5});
 out.sprKeys=Object.keys(s0);
 out.spr=[];
 for(const P of [200,300,400]) for(const u of [0,1,2,3,4,5]){const o=IRM.sprinkler({type:'impact',P,d:4.4,u,alpha:25,Ss:12,Sl:18,tri:false,Zn:40,K:0.02,A:0.6,Sd:3,S:2,Tair:22,intc:0.5});out.spr.push({P,u,CU:o.CU,Ea:o.Ea!==undefined?o.Ea:null,drift:o.drift!==undefined?o.drift:null,keys:null});}
 out.drip=[];
 for(const D of [13,16,20,25]) for(let LL=20;LL<=300;LL+=20){const r=IRM.latProfile('online',IRM.DKIND.online.q,0.75,LL,10,D);out.drip.push({D,LL,Eu:r.Eu,hf:r.hf});}
 out.drip2=[];
 for(const H0 of [6,8,10,14,20]) for(let LL=20;LL<=300;LL+=20){const r=IRM.latProfile('online',IRM.DKIND.online.q,0.75,LL,H0,16);out.drip2.push({H0,LL,Eu:r.Eu,hf:r.hf});}
 return out;});
fs.writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_l_sens.json',JSON.stringify(res)); console.log(res.sprKeys.join(','));console.log(JSON.stringify(res.spr.slice(0,8)));console.log(JSON.stringify(res.drip.slice(0,4)));await b.close()})();
