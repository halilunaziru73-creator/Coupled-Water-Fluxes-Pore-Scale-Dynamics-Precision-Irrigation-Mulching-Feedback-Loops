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
s = re.sub(r'<script src="([a-z_]+\.js)(?:\?v=[0-9a-z]+)?"></script>', inline_js, s)
s = re.sub(r'<link rel="stylesheet" href="(classic\.css)">', lambda m: '<style>/* ' + m.group(1) + ' */\n' + open(os.path.join(ENG, m.group(1)), encoding='utf-8').read() + '\n</style>', s)
s = s.replace('href="../assets/logo-64.png"', 'href="' + os.path.relpath(os.path.join(APP, 'assets', 'logo-64.png'), os.path.dirname(OUT)).replace(os.sep, '/') + '"')
left = re.findall(r'<script src="(?!https?:)[^"]+"', s)
assert not left, left
open(OUT, 'w', encoding='utf-8').write(s)
print('web explorer written:', OUT, round(len(s) / 1e6, 2), 'MB; data from', REL)
