import json,sys
from playwright.sync_api import sync_playwright
LAY=sys.argv[1].split(',') if len(sys.argv)>1 else ['field','spac','v2','v1','n1','v3','v7','r1','v4','v6','e1','n2','n3','v5']
FR=[0,.33,.66,1]
meta=json.load(open('/tmp/atlas/full2/meta.json')) if __import__('os').path.exists('/tmp/atlas/full2/meta.json') else {}
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1600,'height':3200},device_scale_factor=2)
    pg=ctx.new_page()
    pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(4000)
    pg.get_by_role('button',name='Start',exact=True).click(); pg.wait_for_timeout(500)
    pg.click('[data-act=expandAll]'); pg.wait_for_timeout(300)
    for sc in LAY:
        pg.click('#layerTree [data-scene="%s"]:not([data-sec])'%sc); pg.wait_for_timeout(2500)
        f=[f for f in pg.frames if f!=pg.main_frame][0]
        if f.evaluate("document.getElementById('playBtn').textContent.trim()")=='Pause': f.click('#playBtn'); pg.wait_for_timeout(300)
        meta[sc]=[]
        for k,fr in enumerate(FR):
            f.evaluate("(v)=>{const r=document.getElementById('playRange');r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}))}",1000*fr)
            pg.wait_for_timeout(700)
            f.locator('#profileCanvas').screenshot(path=f'/tmp/atlas/full2/{sc}_{k}.png')
            st=f.evaluate("()=>{const r=document.getElementById('playRange');let t='';let e=r.nextElementSibling;while(e&&!t){t=(e.textContent||'').trim();e=e.nextElementSibling}return t}")
            meta[sc].append(st); print(sc,k,st,flush=True)
    json.dump(meta,open('/tmp/atlas/full2/meta.json','w'),indent=1)
    b.close()
