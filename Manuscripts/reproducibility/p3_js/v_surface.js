const WSB=require(require('path').resolve(__dirname,'../lib')+'/wsmodel.js');
const sh={rho1:0.325,rho2:2.734};
const K1={k:0.0028,a:0.534,f0:0.00022}, K2={k:0.0021,a:0.331,f0:0.00015};
const n=0.04,S0=0.008,L=200;
console.log('Qmax', WSB.furrowQmax?WSB.furrowQmax(13,n,S0,sh):'NA','A0(0.10)',WSB.advance({Q0:0.10,L,K:K1,n,S0,sh}).A0);
const out={};
for (const [nm,K] of [['first',K1],['later',K2]]) {
  const Tq=WSB.treq?WSB.treq(K,0.15):NaN; out[nm]={Treq:Tq,rows:[]};
  for (const Q of [0.10,0.075,0.0625,0.05,0.0375,0.025,0.0125]) { const ad=WSB.advance({Q0:Q,L,K,n,S0,sh}); const Ea=0.15*L/(Q*(Tq+ad.tL)); out[nm].rows.push({Q,tL:ad.tL,r:ad.r,Ea}); }
}
console.log(JSON.stringify(out,null,1));
require("fs").writeFileSync((process.env.SWAFL_MS||".")+"/out/p3_surface.json",JSON.stringify(out));
