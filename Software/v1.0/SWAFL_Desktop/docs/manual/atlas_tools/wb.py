import sys,io,json
sys.path.insert(0,'/tmp/atlas')
from playwright.sync_api import sync_playwright
from PIL import Image
import annot
LAY=['field','spac','v2','v1','n1','v3','v7','r1','v4','v6','e1','n2','n3','v5','sid','drip','spr']
OUT='/tmp/atlas/wb'
import os; os.makedirs(OUT,exist_ok=True)
def rect(pg,sel):
    return pg.evaluate("(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}",sel)
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1440,'height':810},device_scale_factor=2)
    pg=ctx.new_page()
    pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(4000)
    pg.get_by_role('button',name='Start',exact=True).click(); pg.wait_for_timeout(500)
    pg.click('[data-act=expandAll]'); pg.wait_for_timeout(300)
    for sc in LAY:
        pg.click('#layerTree [data-scene="%s"]:not([data-sec])'%sc); pg.wait_for_timeout(2200); pg.mouse.move(5,5)
        L=rect(pg,'#layerTree .tn.sel'); E=rect(pg,'#engineHost'); T=rect(pg,'#dashTabs [data-tab]'); P=rect(pg,'#props .pg')
        f=[f for f in pg.frames if f!=pg.main_frame][0]
        bb=f.locator('#playBtn').bounding_box() if f.locator('#playBtn').count() else None
        png=pg.screenshot()
        im=Image.open(io.BytesIO(png)).convert('RGB')
        S=2
        m=[]
        m.append((( L['x']+L['w']-8)*S,(L['y']+L['h']/2)*S))
        m.append(((E['x']+E['w']*0.5)*S,(E['y']+E['h']*0.45)*S))
        if bb: m.append(((bb['x']+bb['width']/2)*S,(bb['y']+bb['height']/2)*S))
        else: m.append(((E['x']+E['w']*0.5)*S,(E['y']+E['h']-30)*S))
        m.append(((T['x']+T['w']/2)*S,(T['y']+T['h']/2)*S))
        m.append(((P['x']+90)*S,(P['y']+12)*S))
        mk=[(x,y,pr) for (x,y),pr in zip(m,[(150,60),(-150,-150),(-60,-130),(0,110),(-170,40)])]
        o=annot.annotate(im,mk,S=2,R=40)
        o=o.resize((1800,int(o.height*1800/o.width)),Image.LANCZOS)
        o.save(f'{OUT}/wb_{sc}.jpg',quality=80,optimize=True)
        print(sc,flush=True)
    b.close()
