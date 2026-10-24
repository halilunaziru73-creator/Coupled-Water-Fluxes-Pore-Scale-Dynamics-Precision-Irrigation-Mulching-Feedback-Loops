TEXTJS = r'''
window.__texts = function(){
  const dW = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width').get; const k = dW.call(canvas)/W; const out=[]; const of=ctx.fillText;
  ctx.fillText=function(t,x,y){ try{ const s=String(t); if(s.trim().length){ const m=this.measureText(s), M=this.getTransform();
      const x0=x-m.actualBoundingBoxLeft, x1=x+m.actualBoundingBoxRight, y0=y-m.actualBoundingBoxAscent, y1=y+m.actualBoundingBoxDescent;
      out.push({t:s, x0:(M.a*x0+M.e)/k, x1:(M.a*x1+M.e)/k, y0:(M.d*y0+M.f)/k, y1:(M.d*y1+M.f)/k}); } }catch(e){} return of.apply(this,arguments); };
  try { ctx.clearRect(0,0,W,H); hotspots.length=0; currentScene.draw(); } finally { ctx.fillText=of; }
  return {W:W, H:H, k:k, texts:out, hs:hotspots.map(h=>({x:h.x,y:h.y,w:h.w,h:h.h,tip:String(h.tip||'')}))};
};
window.__cvrect = function(){ const r=canvas.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,W:W,H:H}; };
'''
