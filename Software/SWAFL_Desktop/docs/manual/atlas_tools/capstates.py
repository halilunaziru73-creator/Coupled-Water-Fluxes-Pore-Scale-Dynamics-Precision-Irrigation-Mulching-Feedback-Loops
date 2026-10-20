import sys,json,os
from playwright.sync_api import sync_playwright
W,H=1600,3200
OUT='/tmp/atlas/full3'
def run(plan,only=None):
    with sync_playwright() as p:
        b=p.chromium.launch()
        ctx=b.new_context(viewport={'width':W,'height':H},device_scale_factor=2)
        pg=ctx.new_page()
        pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(4000)
        pg.get_by_role('button',name='Start',exact=True).click(); pg.wait_for_timeout(500)
        pg.click('[data-act=expandAll]'); pg.wait_for_timeout(300)
        for sc,key,actions in plan:
            if only and sc not in only: continue
            pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(3000)
            try: pg.get_by_role('button',name='Start',exact=True).click(timeout=2500); pg.wait_for_timeout(400)
            except Exception: pass
            pg.click('[data-act=expandAll]'); pg.wait_for_timeout(200)
            pg.click('#layerTree [data-scene="%s"]:not([data-sec])'%sc); pg.wait_for_timeout(2200)
            f=[f for f in pg.frames if f!=pg.main_frame][0]
            if f.evaluate("document.getElementById('playBtn').textContent.trim()")=='Pause': f.click('#playBtn'); pg.wait_for_timeout(300)
            cv=f.locator('#profileCanvas')
            def click(px,py): cv.click(position={'x':px/2,'y':py/2}); pg.wait_for_timeout(600)
            def drag(x0,y0,x1,y1):
                bb=cv.bounding_box()
                pg.mouse.move(bb['x']+x0/2,bb['y']+y0/2); pg.mouse.down(); 
                for k in range(1,9): pg.mouse.move(bb['x']+(x0+(x1-x0)*k/8)/2,bb['y']+(y0+(y1-y0)*k/8)/2)
                pg.mouse.up(); pg.wait_for_timeout(700)
            def rng(v):
                f.evaluate("(v)=>{const r=document.getElementById('playRange');r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}))}",v); pg.wait_for_timeout(700)
            def btn(text):
                f.get_by_role('button',name=text,exact=True).first.click(); pg.wait_for_timeout(700)
            def js(code): f.evaluate(code); pg.wait_for_timeout(700)
            ns=dict(click=click,drag=drag,rng=rng,btn=btn,js=js,wait=lambda ms:pg.wait_for_timeout(ms))
            for a in actions: a(ns)
            pg.mouse.move(2,2); pg.wait_for_timeout(700)
            cv.screenshot(path=f'{OUT}/{sc}_{key}.png'); print(sc,key,flush=True)
        b.close()
