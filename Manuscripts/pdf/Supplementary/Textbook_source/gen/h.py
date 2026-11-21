import sys,math,re
sys.path.insert(0,'/tmp/kh/gen')
from lib import *
import numpy as np
OUT='/tmp/kh/extra/'
def g3(x,d=3):
    if x==0: return '0'
    a=abs(x)
    if a>=1000: return f'{x:,.0f}'.replace(',','\\,')
    if a>=100: return f'{x:.0f}'
    if a>=10: return f'{x:.1f}'
    if a>=1: return f'{x:.{d-1}f}'.rstrip('0').rstrip('.') if d>2 else f'{x:.2f}'
    return f'{x:.{d}g}'
def sec(t,lab=''): return '\\section{%s}%s\n'%(t,('\\label{%s}'%lab if lab else ''))
def P(*a): return '\n\n'.join(a)+'\n\n'
def ex(stmt,sol,title=''): return '\\exbox{%s}{%s}\\sol %s\n\n'%(title,stmt.strip(),sol.strip())
def eqn(s): return '\\begin{equation}%s\\end{equation}\n'%s
def tabl(cols,rows,cap,spec=None):
    spec=spec or 'l'+'r'*(len(cols)-1)
    s='\\begin{table}[!htbp]\\centering\\small\\caption{'+cap+'}\n\\begin{tabular}{'+spec+'}\\toprule\n'+' & '.join('\\hd{%s}'%c for c in cols)+'\\\\\\midrule\n'
    s+='\\\\\n'.join(' & '.join(str(c) for c in r) for r in rows)+'\\\\\\bottomrule\\end{tabular}\\end{table}\n\n'
    return s
def exercises(items):
    s='\\backhead{EXERCISES}{khred}\n\\begin{exlist}\n'
    for q,a in items: s+='\\item %s\\exans{%s}\n'%(q.strip(),a)
    return s+'\\end{exlist}\n'
def dyk(items):
    s='\\dykband{DO YOU KNOW ?}\n\\begin{exlist}\n'
    for q in items: s+='\\item %s\n'%q
    return s+'\\end{exlist}\n'
def obj(items):
    s='\\dykband{OBJECTIVE TYPE QUESTIONS}\n\\begin{exlist}\n';key=[]
    for q,o,c in items:
        s+='\\item %s\\opt{%s}{%s}{%s}{%s}\n'%((q,)+tuple(o));key.append('%d.~(%s)'%(len(key)+1,'abcd'[c]))
    return s+'\\end{exlist}\n\\objkey{'+'\\quad '.join(key)+'}\n'
def write(k,name,txt): open(OUT+'%s%02d.tex'%(name,k),'w').write(txt)
def lead(k,txt): write(k,'lead','\\chapterlead{\\subhd{After this chapter you can} '+txt+'}\n')
