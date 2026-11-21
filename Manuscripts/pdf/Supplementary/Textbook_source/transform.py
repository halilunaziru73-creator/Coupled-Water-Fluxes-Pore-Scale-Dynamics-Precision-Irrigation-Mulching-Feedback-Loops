import re,sys,glob,os
SRC='/tmp/kh/src';OUT='/tmp/kh'
NM=[("(from the manual, reproduced by the numbers)","(reproduced by the numbers)"),("Check against the manual.","Check against the application."),("Daisy reference manual","Daisy reference"),("the manual's typical figures","the typical figures of the application"),("the manual","the application"),("The manual","The application"),("sprinkler manuals","sprinkler catalogues"),("or manual","or a user-set time"),("Data, code, manual and application are open.","Data, code and application are open."),("workflows and validity chapters of the application","workflows and validity chapters of the application")]
def nomanual(s):
    for a,b in NM: s=s.replace(a,b)
    return s
def cap(t):
    t=t.strip()
    return t[:1].upper()+t[1:] if t else t
def ex(m):
    T,B=m.group(1),m.group(2)
    T='' if re.match(r'\s*problem\s*\d',T,re.I) or re.match(r'\s*exercise',T,re.I) else cap(T)
    B=B.strip('\n')
    if '\\textbf{Solution.}' in B:
        st,so=B.split('\\textbf{Solution.}',1)
        st=re.sub(r'^\s*\\textbf\{Problem\.\}\s*','',st).strip()
        return '\\exbox{%s}{%s}\\sol %s\n'%(T,st,so.strip('\n'))
    parts=re.split(r'\n\s*\n',B.strip(),1)
    st=re.sub(r'^\s*\\textbf\{Problem\.\}\s*','',parts[0]).strip()
    rest=parts[1] if len(parts)>1 else ''
    return '\\exbox{%s}{%s}\n%s\n'%(T,st,rest.strip('\n'))
def eq(m):
    b=m.group(1)
    lab=''.join(re.findall(r'\\label\{[^}]*\}',b)); core=re.sub(r'\\label\{[^}]*\}','',b).strip()
    if len(core)>170 or '\\\\' in core and '\\begin' not in core or '%' in core or '\\tag' in core or '&' in core and '\\begin' not in core: return m.group(0)
    return '\\begin{equation}%s\\boxed{%s}\\end{equation}'%(lab,core)
def hdr(m):
    row=m.group(1)
    if '\\multicolumn' in row or '\\hd' in row: return m.group(0)
    cells=[c.strip() for c in row.split('&')]
    return '\\toprule\n'+' & '.join('\\hd{%s}'%c if c else '' for c in cells)+'\\\\\\midrule'
ORDER=['c1','c4','c7','c9','c11','c12','c15']+['p2'+c for c in 'abcdefghijklmnopqr']+['c17','appB']
CH=[0]
def addimg(s):
    def r(m):
        CH[0]+=1
        return '\\chapimg{fig/ch%02d.jpg}\n'%((CH[0]-1)%27+1)+m.group(0)
    return re.sub(r'^(?:\\chapterlead\{.*\n)?\\chapter\{',r,s,flags=re.M)
for f in [SRC+'/'+n+'.tex' for n in ORDER]:
    s=open(f).read()
    if os.path.basename(f) in ('main.tex','sol.tex','sol2.tex'): continue
    s=re.sub(r'\\begin\{example\}\{([^}\n]*)\}(.*?)\\end\{example\}',ex,s,flags=re.S)
    s=re.sub(r'\\begin\{equation\}(.*?)\\end\{equation\}',eq,s,flags=re.S)
    s=re.sub(r'\\toprule\s*(.*?)\\\\\s*\\midrule',hdr,s,flags=re.S)
    s=re.sub(r'(^|\n\n)\\textbf\{([^}]{1,60}?)\}',lambda m:m.group(1)+'\\subhd{'+m.group(2)+'}',s)
    s=re.sub(r'(\\chapter\{[^\n]*\n(?:\\label\{[^\n]*\n)?(?:\\markboth[^\n]*\n)?)\\textbf\{After this chapter you can\}([^\n]*)\n',lambda m:'\\chapterlead{\\subhd{After this chapter you can}'+m.group(2)+'}\n'+m.group(1),s)
    s=addimg(s)
    s=nomanual(s)
    s=s.replace('\\begin{table}[H]','\\begin{table}[!htbp]')
    open(os.path.join(OUT,os.path.basename(f)),'w').write(s)
print('done')
