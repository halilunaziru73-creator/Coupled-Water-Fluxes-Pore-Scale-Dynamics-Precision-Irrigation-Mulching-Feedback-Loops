import json,re,os
from playwright.sync_api import sync_playwright
OUT='/tmp/atlas/img'
meta=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1440,'height':810},device_scale_factor=2)
    pg=ctx.new_page()
    pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(5000)
    pg.screenshot(path=f'{OUT}/u00_welcome.jpg',type='jpeg',quality=88)
    pg.get_by_role('button',name='Start',exact=True).click(); pg.wait_for_timeout(800)
    pg.click('[data-act=expandAll]'); pg.wait_for_timeout(300)
    pg.click('#layerTree [data-scene="field"]'); pg.wait_for_timeout(1500)
    pg.screenshot(path=f'{OUT}/u01_workbench.jpg',type='jpeg',quality=88)
    # menus
    n=pg.evaluate("document.querySelectorAll('#menus > *').length")
    for i in range(n):
        el=pg.query_selector_all('#menus > *')[i]
        t=el.inner_text().strip()
        el.click(); pg.wait_for_timeout(500)
        pg.screenshot(path=f'{OUT}/u02_menu_{t.lower()}.jpg',type='jpeg',quality=88,clip={'x':0,'y':0,'width':760,'height':620})
        meta.append(('menu',t)); pg.keyboard.press('Escape'); pg.mouse.click(1000,400); pg.wait_for_timeout(200)
    # palette
    pg.keyboard.press('Control+k'); pg.wait_for_timeout(600)
    pg.screenshot(path=f'{OUT}/u03_palette.jpg',type='jpeg',quality=88); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    # toolbox expanded
    for t in pg.query_selector_all('#toolTree .tn'):
        try: t.click(timeout=300)
        except: pass
    pg.wait_for_timeout(300)
    pg.query_selector('#toolboxDock').screenshot(path=f'{OUT}/u04_toolbox.jpg',type='jpeg',quality=88)
    # dashboard tabs
    for tab in ['results','design','charts','messages']:
        pg.click(f'#dashTabs [data-tab={tab}]'); pg.wait_for_timeout(700)
        pg.query_selector('#dashDock').screenshot(path=f'{OUT}/u05_dash_{tab}.jpg',type='jpeg',quality=90)
    pg.click('#dashTabs [data-tab=results]')
    # properties tall
    pg.set_viewport_size({'width':1440,'height':2600}); pg.wait_for_timeout(800)
    try: pg.click('[data-act=expandProps]')
    except Exception as e: print(e)
    pg.wait_for_timeout(500)
    pg.query_selector('#rightDock').screenshot(path=f'{OUT}/u06_properties.jpg',type='jpeg',quality=90)
    print(pg.evaluate("Array.from(document.querySelectorAll('#props .grp, #props section, #props details')).map(e=>(e.querySelector('summary,.gh,h3,.head')||e).textContent.trim().slice(0,40))"))
    pg.set_viewport_size({'width':1440,'height':810}); pg.wait_for_timeout(500)
    # toolbar strip
    pg.query_selector('#toolbar').screenshot(path=f'{OUT}/u07_toolbar.jpg',type='jpeg',quality=90)
    pg.query_selector('#statusbar').screenshot(path=f'{OUT}/u08_statusbar.jpg',type='jpeg',quality=90)
    # help
    pg.click('#menus > *:last-child'); pg.wait_for_timeout(400)
    its=pg.evaluate("Array.from(document.querySelectorAll('.menu *, .dd *, [class*=drop] *')).filter(e=>e.children.length==0&&e.textContent.trim()).map(e=>e.textContent.trim())")
    print(its[:20])
    b.close()
