import json,re,os,sys
from playwright.sync_api import sync_playwright
OUT='/tmp/atlas/img'; os.makedirs(OUT,exist_ok=True)
def slug(s): return re.sub(r'[^a-z0-9]+','_',s.lower()).strip('_')[:40]
meta=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1440,'height':810},device_scale_factor=2)
    pg=ctx.new_page()
    pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(5000)
    pg.get_by_role('button',name='Start',exact=True).click(); pg.wait_for_timeout(800)
    pg.click('[data-act=expandAll]'); pg.wait_for_timeout(500)
    items=pg.evaluate("Array.from(document.querySelectorAll('#layerTree [data-scene]')).map(e=>[e.dataset.scene,e.dataset.sec||'',e.querySelector('.lbl').textContent.trim()])")
    seen=set()
    for i,(sc,sec,lbl) in enumerate(items):
        key=(sc,sec)
        sel='#layerTree [data-scene="%s"]'%sc + ('[data-sec="%s"]'%sec.replace('"','\\"') if sec else ':not([data-sec])')
        try:
            pg.click(sel,timeout=5000)
        except Exception as e:
            print('fail',sc,sec,e); continue
        pg.wait_for_timeout(1800)
        name=f"{i:02d}_{sc}" + (('_'+slug(lbl)) if sec else '')
        pg.screenshot(path=f'{OUT}/{name}_full.jpg',type='jpeg',quality=88)
        eh=pg.query_selector('#engineHost')
        eh.screenshot(path=f'{OUT}/{name}_draw.jpg',type='jpeg',quality=90)
        meta.append(dict(name=name,scene=sc,sec=sec,label=lbl))
        print(name,flush=True)
    json.dump(meta,open('/tmp/atlas/meta.json','w'),indent=1)
    b.close()
