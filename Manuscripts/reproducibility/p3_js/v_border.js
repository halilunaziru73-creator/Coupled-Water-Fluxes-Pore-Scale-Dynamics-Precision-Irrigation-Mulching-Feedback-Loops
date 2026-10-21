const WSB=require(require('path').resolve(__dirname,'../lib')+'/wsmodel.js');
const K1={k:0.0032,a:0.49,f0:0.000107},K2={k:0.00327,a:0.474,f0:0.0000987};
const Z=0.0525;
console.log('Treq first',WSB.treq(K1,Z),'later',WSB.treq(K2,Z),'(book 146.4, 162.8)');
console.log('Qmax',WSB.borderQmax(0.001,false),'(book 1.88)');
for (const [nm,K] of [['first',K1],['later',K2]]) {
  const a=WSB.advance({Q0:0.14,L:360,K,n:0.04,S0:0.001,sh:WSB.SH_WIDE}); console.log(nm,'tL(Q=0.14,L=360)',a.tL,'r',a.r,'A0',a.A0,'(book ~158 min for Q=0.14)');
}
const out={book:{Treq_first:146.4,Treq_later:162.8,Qmax:1.88,tL_first_Q014_L360:158,A0:0.0303},
 computed:{Treq_first:WSB.treq(K1,Z),Treq_later:WSB.treq(K2,Z),Qmax:WSB.borderQmax(0.001,false)}};
const a1=WSB.advance({Q0:0.14,L:360,K:K1,n:0.04,S0:0.001,sh:WSB.SH_WIDE}); out.computed.tL_first_Q014_L360=a1.tL; out.computed.A0=a1.A0;
require('fs').writeFileSync((process.env.SWAFL_MS||'.')+'/out/p3_border.json',JSON.stringify(out,null,1));
console.log(Object.keys(WSB.EXAMPLES));
