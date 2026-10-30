"""Builds the SWAFL web explorer of the repository (Results/04_Interactive_Charts/10_SWAFL_Fused_Explorer.html) from the
current engine of SWAFL Desktop: the engine page with its scripts and styles written into the page, and the large data
files (peryear.js, the spreadsheet reader) read from the software folder of the repository. Run it after any change to
the engine:  python3 tools/build_explorer.py"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.join(os.path.dirname(HERE), 'app'); ENG = os.path.join(APP, 'engine')
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..')); OUT = os.path.join(REPO, 'Results', '04_Interactive_Charts', '10_SWAFL_Fused_Explorer.html')
REL = os.path.relpath(ENG, os.path.dirname(OUT)).replace(os.sep, '/')          # from the explorer to the engine folder
s = open(os.path.join(ENG, 'engine.html'), encoding='utf-8').read()
def inline_js(m):
    src = m.group(1); txt = open(os.path.join(ENG, src), encoding='utf-8').read()
    txt = txt.replace("'../../docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf'", "'" + REL + "/../../docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf'")
    txt = txt.replace("sc.src = 'daisydss.js'", "sc.src = '" + REL + "/daisydss.js'").replace("sc.src = 'peryear.js'", "sc.src = '" + REL + "/peryear.js'").replace("loadScript('vendor/xlsx.full.min.js')", "loadScript('" + REL + "/vendor/xlsx.full.min.js')")
    return '<script>/* ' + src + ' */\n' + txt.replace('</script', '<\\/script') + '\n</script>'
s = re.sub(r'<script src="([a-z0-9_]+\.js)(?:\?v=[0-9a-z]+)?"></script>', inline_js, s)
s = re.sub(r'<link rel="stylesheet" href="(classic\.css)">', lambda m: '<style>/* ' + m.group(1) + ' */\n' + open(os.path.join(ENG, m.group(1)), encoding='utf-8').read() + '\n</style>', s)
s = s.replace('href="../assets/logo-64.png"', 'href="' + os.path.relpath(os.path.join(APP, 'assets', 'logo-64.png'), os.path.dirname(OUT)).replace(os.sep, '/') + '"')

# ---- smaller page: comments and white space are removed from every inline script (names are not changed, so nothing that
# refers to a name can break); needs terser (npm i -g terser, or TERSER=path); without it the page is written unminified
import subprocess, tempfile, shutil
def minify(js):
    t = os.environ.get('TERSER') or shutil.which('terser')
    if not t: return js
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(js); fn = f.name
    try:
        r = subprocess.run([t, fn, '--format', 'comments=false', '--no-compress', '--no-mangle'], capture_output=True, text=True, timeout=120)
        return r.stdout if r.returncode == 0 and r.stdout.strip() else js
    finally: os.unlink(fn)
before = len(s)
s = re.sub(r'<script>(.*?)</script>', lambda m: '<script>' + minify(m.group(1).replace('<\\/script', '</script')).replace('</script', '<\\/script') + '</script>', s, flags=re.S)
print('inline scripts minified:', round(before / 1e6, 2), '->', round(len(s) / 1e6, 2), 'MB')
# ---- a visible message while the page loads (removed when the engine has drawn)
splash = '<div id="bootsplash" style="position:fixed;inset:0;z-index:99999;background:#D4D0C8;display:flex;align-items:center;justify-content:center;font:14px Tahoma,Arial,sans-serif;color:#0A246A"><div style="border:2px solid #0A246A;padding:18px 28px;background:#fff"><b>SWAFL web explorer</b><br>Loading the simulation engine, one moment...</div></div>'
s = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + splash, s, count=1)
s = s.replace('</body>', '<script>(function(){var g=function(){var e=document.getElementById("bootsplash");if(e)e.remove()};addEventListener("load",function(){setTimeout(g,300)});setTimeout(g,20000)})();</script></body>', 1)
left = re.findall(r'<script src="(?!https?:)[^"]+"', s)
assert not left, left
open(OUT, 'w', encoding='utf-8').write(s)
print('web explorer written:', OUT, round(len(s) / 1e6, 2), 'MB; data from', REL)
