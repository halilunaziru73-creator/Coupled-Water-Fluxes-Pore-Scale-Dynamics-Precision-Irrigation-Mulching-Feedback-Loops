import json,re,os,sys
sys.path.insert(0,'/tmp/atlas')
from playwright.sync_api import sync_playwright
import spec_atlas as SP
OUT='/tmp/atlas/img2'; os.makedirs(OUT,exist_ok=True)
JS='''
window.__ann=function(items,rect,letters){
  document.getElementById('__ann')?.remove();
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');svg.id='__ann';
  svg.setAttribute('style','position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99999;pointer-events:none');
  const defs=document.createElementNS(NS,'defs');
  defs.innerHTML='<marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#d90429"/></marker><marker id="ahw" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M-1,-1 L9,4 L-1,9 z" fill="#fff"/></marker>';
  svg.appendChild(defs);
  const placed=[];
  const R=11;
  items.forEach((it,i)=>{
    const tx=it.x,ty=it.y;
    let cand=it.pref?[it.pref]:[[-52,-42],[52,-42],[-52,42],[52,42],[0,-60],[0,60],[-80,0],[80,0]];
    let pos=null;
    for(const [dx,dy] of cand){
      const bx=tx+dx,by=ty+dy;
      if(rect && (bx<rect.x+R+4||bx>rect.x+rect.w-R-4||by<rect.y+R+4||by>rect.y+rect.h-R-4)) continue;
      if(placed.some(p=>Math.hypot(p[0]-bx,p[1]-by)<30)) continue;
      pos=[bx,by];break;
    }
    if(!pos){ pos=[Math.min(Math.max(tx-72,(rect?rect.x:0)+R+4),(rect?rect.x+rect.w:innerWidth)-R-4),Math.min(Math.max(ty-58,(rect?rect.y:0)+R+4),(rect?rect.y+rect.h:innerHeight)-R-4)]; }
    placed.push(pos);
    const [bx,by]=pos; const d=Math.hypot(tx-bx,ty-by)||1; const ux=(tx-bx)/d,uy=(ty-by)/d;
    const x1=bx+ux*R,y1=by+uy*R,x2=tx-ux*(R+1),y2=ty-uy*(R+1);
    const mk=(tag,attrs)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);svg.appendChild(e);return e;};
    if(!it.nohead){
      mk('line',{x1,y1,x2,y2,stroke:'#fff','stroke-width':7,'stroke-linecap':'round'});
      mk('line',{x1,y1,x2,y2,stroke:'#d90429','stroke-width':2.6,'stroke-linecap':'round','marker-end':'url(#ah)'});
      mk('circle',{cx:tx,cy:ty,r:R-3,fill:'none',stroke:'#fff','stroke-width':5.5});
      mk('circle',{cx:tx,cy:ty,r:R-3,fill:'none',stroke:'#d90429','stroke-width':2.4});
    }
    mk('circle',{cx:bx,cy:by,r:R+1,fill:'#fff'});
    mk('circle',{cx:bx,cy:by,r:R-1,fill:'#d90429'});
    const t=mk('text',{x:bx,y:by+4.5,'text-anchor':'middle','font-size':13,'font-weight':'bold','font-family':'Arial,sans-serif',fill:'#fff'});
    t.textContent=it.label||(letters?String.fromCharCode(65+i):String(i+1));
  });
  (it=>0);
  document.body.appendChild(svg);
};
window.__box=function(sel,label,pref){
  const e=typeof sel==='string'?document.querySelector(sel):sel; if(!e) return null;
  const r=e.getBoundingClientRect();
  let svg=document.getElementById('__box');
  if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='__box';svg.setAttribute('style','position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99998;pointer-events:none');document.body.appendChild(svg);}
  const NS='http://www.w3.org/2000/svg';
  const rc=document.createElementNS(NS,'rect');
  rc.setAttribute('x',r.x+2);rc.setAttribute('y',r.y+2);rc.setAttribute('width',r.width-4);rc.setAttribute('height',r.height-4);
  rc.setAttribute('rx',6);rc.setAttribute('fill','none');rc.setAttribute('stroke','#d90429');rc.setAttribute('stroke-width',3.5);rc.setAttribute('stroke-dasharray','10 5');
  svg.appendChild(rc);
  return {x:r.x,y:r.y,w:r.width,h:r.height};
};
window.__clear=function(){document.getElementById('__ann')?.remove();document.getElementById('__box')?.remove();};
window.__find=function(root,text){
  const els=Array.from((typeof root==='string'?document.querySelector(root):root).querySelectorAll('*')).filter(e=>e.children.length===0&&e.textContent.trim().startsWith(text));
  if(!els.length) return null; const r=els[0].getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};
};
'''
def slug(s): return re.sub(r'[^a-z0-9]+','_',s.lower()).strip('_')[:40]
def rectof(pg,sel):
    return pg.evaluate("(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}",sel)
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1440,'height':810},device_scale_factor=2)
    pg=ctx.new_page()
    pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(5000)
    pg.add_script_tag(content=JS)
    # welcome
    r=pg.evaluate("(()=>{const b=Array.from(document.querySelectorAll('#modalRoot button')).find(e=>e.textContent.trim()==='Start');const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    pg.evaluate("(a)=>window.__ann([{x:a.x,y:a.y,pref:[-110,-70]}],null,false)",r)
    pg.screenshot(path=f'{OUT}/u00_welcome.jpg',type='jpeg',quality=84); pg.evaluate("__clear()")
    pg.get_by_role('button',name='Start',exact=True).click(); pg.wait_for_timeout(800)
    pg.click('[data-act=expandAll]'); pg.wait_for_timeout(500)
    items=pg.evaluate("Array.from(document.querySelectorAll('#layerTree [data-scene]')).map(e=>[e.dataset.scene,e.dataset.sec||'',e.querySelector('.lbl').textContent.trim()])")
    meta=[]
    for i,(sc,sec,lbl) in enumerate(items):
        sel='#layerTree [data-scene="%s"]'%sc + ('[data-sec="%s"]'%sec.replace('"','\\"') if sec else ':not([data-sec])')
        pg.click(sel,timeout=5000); pg.wait_for_timeout(1800)
        name=f"{i:02d}_{sc}" + (('_'+slug(lbl)) if sec else '')
        # full: boxes + letters
        pg.mouse.move(5,5)
        L=pg.evaluate("(()=>{const e=document.querySelector('#layerTree .tn.sel');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()")
        regs=[('L',L,'tree'),('D',rectof(pg,'#engineHost'),'box'),('R',rectof(pg,'#dashDock'),'box'),('C',rectof(pg,'#rightDock'),'box')]
        pg.evaluate("(a)=>{__box('#layerTree .tn.sel');__box('#engineHost');__box('#dashDock');__box('#rightDock')}",None)
        marks=[]
        for lab,r,k in regs:
            if k=='tree' and r: marks.append(dict(x=r['x']+r['w']-6,y=r['y']+r['h']/2,label='L',pref=[190,0]))
            elif r: marks.append(dict(x=r['x']+22,y=r['y']+22,label=lab,nohead=True,pref=[0,0]))
        pg.evaluate("(m)=>__ann(m,null,false)",marks)
        pg.screenshot(path=f'{OUT}/{name}_full.jpg',type='jpeg',quality=84); pg.evaluate("__clear()")
        # drawing with markers
        er=rectof(pg,'#engineHost')
        ms=[dict(x=er['x']+er['w']*x/100,y=er['y']+er['h']*y/100) for x,y,t in SP.D[name]]
        pg.evaluate("(a)=>__ann(a.m,a.r,a.l)",dict(m=ms,r=er,l=name in SP.LETTERS))
        pg.query_selector('#engineHost').screenshot(path=f'{OUT}/{name}_draw.jpg',type='jpeg',quality=86); pg.evaluate("__clear()")
        meta.append(dict(name=name,scene=sc,sec=sec,label=lbl)); print(name,flush=True)
        if name=='45_field':
            # extra UI screens come from the field scene
            pass
    json.dump(meta,open('/tmp/atlas/meta2.json','w'),indent=1)
    # ---- UI screens
    pg.click('#layerTree [data-scene="field"]'); pg.wait_for_timeout(1500); pg.mouse.move(5,5)
    def box(sel): return rectof(pg,sel)
    # workbench
    for s in ['#layerTree','#toolboxDock','#toolbar','#engineHost','#dashDock','#rightDock']: pg.evaluate("(s)=>__box(s)",s)
    def c(r,dx=22,dy=22): return dict(x=r['x']+dx,y=r['y']+dy,nohead=True,pref=[0,0])
    ms=[c(box('#layerDock')) if False else c(box('#layersDock')),c(box('#toolboxDock')),c(box('#toolbar'),12,12),c(box('#engineHost')),c(box('#dashDock')),c(box('#rightDock'))]
    pg.evaluate("(m)=>__ann(m,null,true)",ms); pg.screenshot(path=f'{OUT}/u01_workbench.jpg',type='jpeg',quality=84); pg.evaluate("__clear()")
    # menus
    n=pg.evaluate("document.querySelectorAll('#menus > *').length")
    for i in range(n):
        el=pg.query_selector_all('#menus > *')[i]; t=el.inner_text().strip(); bb=el.bounding_box()
        el.click(); pg.wait_for_timeout(500)
        ms=[dict(x=bb['x']+bb['width']/2,y=bb['y']+bb['height']-4,pref=[60,90]),dict(x=bb['x']+90,y=bb['y']+bb['height']+60,pref=[260,40])]
        pg.evaluate("(m)=>__ann(m,null,false)",ms)
        pg.screenshot(path=f'{OUT}/u02_menu_{t.lower()}.jpg',type='jpeg',quality=86,clip={'x':0,'y':0,'width':760,'height':620}); pg.evaluate("__clear()")
        pg.keyboard.press('Escape'); pg.mouse.click(1000,400); pg.wait_for_timeout(200)
    # palette
    pg.keyboard.press('Control+k'); pg.wait_for_timeout(600)
    r=pg.evaluate("(()=>{const e=Array.from(document.querySelectorAll('input')).filter(e=>e.offsetParent&&/Type what you want/.test(e.placeholder))[0];const r=e.getBoundingClientRect();return {x:r.x+80,y:r.y+r.height/2}})()")
    pg.evaluate("(a)=>__ann([{x:a.x,y:a.y,pref:[-30,-90]}],null,false)",r)
    pg.screenshot(path=f'{OUT}/u03_palette.jpg',type='jpeg',quality=84); pg.evaluate("__clear()"); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    # toolbox
    for t in pg.query_selector_all('#toolTree .tn'):
        try: t.click(timeout=300)
        except: pass
    pg.wait_for_timeout(300)
    names=['Simulation','Ready-made cases','Irrigation design','Compare and review','Export']
    ms=[]
    tb=box('#toolboxDock')
    for nm in names:
        r=pg.evaluate("(n)=>{const e=Array.from(document.querySelectorAll('#toolTree .tn')).find(e=>e.textContent.replace(/[▶▼]/g,'').trim().startsWith(n));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}",nm)
        if r: ms.append(dict(x=r['x']+r['w']-30,y=r['y']+r['h']/2,pref=[-0,0]))
    # place badges to the right of the toolbox, aligned with each row
    for m in ms: m['pref']=[190,0]
    pg.evaluate("(m)=>__ann(m,null,false)",ms)
    pg.query_selector('#toolboxDock').screenshot(path=f'{OUT}/u04_toolbox_raw.jpg',type='jpeg',quality=86)
    pg.screenshot(path=f'{OUT}/u04_toolbox_page.jpg',type='jpeg',quality=84,clip={'x':0,'y':tb['y'],'width':tb['w']+260,'height':tb['h']})
    pg.evaluate("__clear()")
    # toolbar
    tbx=box('#toolbar'); ms=[]
    for key in ['Run or pause','Run the 20-year','Pin results','Surface irrigation design','Working date']:
        r=pg.evaluate("(k)=>{const e=Array.from(document.querySelectorAll('#toolbar > *')).find(e=>((e.title||e.getAttribute('data-l')||'')).startsWith(k));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}",key)
        if r: ms.append(dict(x=r['x'],y=r['y']+10,pref=[0,0]))
    pg.evaluate("(m)=>__ann(m,null,false)",ms)
    for m in ms: pass
    pg.evaluate("__clear()")
    # toolbar: badges below the bar (extend clip downward)
    for m in ms: m['pref']=[0,70]
    pg.evaluate("(m)=>__ann(m,null,false)",ms)
    pg.screenshot(path=f'{OUT}/u07_toolbar.jpg',type='jpeg',quality=86,clip={'x':0,'y':tbx['y'],'width':1440,'height':tbx['h']+95}); pg.evaluate("__clear()")
    # status bar
    sb=box('#statusbar'); ms=[]
    for sel in ['#stScene','#stDate','#stCase']:
        r=rectof(pg,sel); ms.append(dict(x=r['x']+r['w']/2,y=r['y']+2,pref=[0,-70]))
    pg.evaluate("(m)=>__ann(m,null,false)",ms)
    pg.screenshot(path=f'{OUT}/u08_statusbar.jpg',type='jpeg',quality=86,clip={'x':0,'y':sb['y']-95,'width':1440,'height':sb['h']+95}); pg.evaluate("__clear()")
    # dashboard tabs
    dd=box('#dashDock')
    def dash(tab,finders,name,open_design=False):
        if open_design:
            pg.click('#layerTree [data-scene="spr"]:not([data-sec])'); pg.wait_for_timeout(1500)
        pg.click(f'#dashTabs [data-tab={tab}]'); pg.wait_for_timeout(800)
        ms=[]
        for f in finders:
            r=pg.evaluate("(a)=>{return window.__find(a[0],a[1])}",['#dashDock',f]) if f else None
            if r: ms.append(dict(x=r['x']+min(r['w'],200)/2,y=r['y']+r['h']/2,pref=[130,0]))
        tabr=rectof(pg,f'#dashTabs [data-tab={tab}]')
        ms.append(dict(x=tabr['x']+tabr['w']/2,y=tabr['y']+tabr['h']-2,pref=[0,80]))
        dd=box('#dashDock')
        pg.evaluate("(a)=>__ann(a.m,a.r,false)",dict(m=ms,r=dd))
        pg.query_selector('#dashDock').screenshot(path=f'{OUT}/{name}.jpg',type='jpeg',quality=86); pg.evaluate("__clear()")
    dash('results',['On ','Next 14','Whole year',None][:3],'u05_dash_results')
    dash('design',['The Design tab'],'u05_dash_design',open_design=True)
    pg.click('#layerTree [data-scene="field"]:not([data-sec])'); pg.wait_for_timeout(1200)
    dash('charts',['Rainfall and irrigation','Drainage below','Evaporation and'],'u05_dash_charts')
    dash('messages',['17:'],'u05_dash_messages') if False else dash('messages',[],'u05_dash_messages')
    pg.click('#dashTabs [data-tab=results]')
    # properties
    pg.set_viewport_size({'width':1440,'height':2600}); pg.wait_for_timeout(800)
    try: pg.click('[data-act=expandProps]')
    except Exception as e: print(e)
    pg.wait_for_timeout(500)
    rd=box('#rightDock'); ms=[]
    for nm in ['Scenario','Soil and field','Mulch','Weather and climate','Irrigation','Nutrients']:
        r=pg.evaluate("(n)=>{const e=Array.from(document.querySelectorAll('#props .pg')).map(g=>g.firstElementChild).find(h=>h&&h.textContent.replace('▼','').trim().startsWith(n));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}",nm)
        if r: ms.append(dict(x=r['x']+r['w']-20,y=r['y']+r['h']/2,pref=[-150,0]))
    pg.evaluate("(m)=>__ann(m,null,false)",ms)
    pg.screenshot(path=f'{OUT}/u06_properties_page.jpg',type='jpeg',quality=86,clip={'x':rd['x']-210,'y':rd['y'],'width':rd['w']+210,'height':rd['h']}); pg.evaluate("__clear()")
    b.close()
