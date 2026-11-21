import re,os
O='/tmp/kh/'
ORDER=['c1','c4','c7','c9','c11','c12','c15']+['p2'+c for c in 'abcdefghijklmnopqr']+['c17','appB']
txt=''.join(open(O+n+'.tex').read()+'\n' for n in ORDER)
txt=re.sub(r'^\\part\{[^\n]*\}\n','',txt,flags=re.M)
blocks=re.split(r'(?=^\\chapimg\{)',txt,flags=re.M)
blocks=[b for b in blocks if b.strip()]
print(len(blocks))
HEAD=re.compile(r'^\\chapimg\{[^}]*\}\n(?:\\chapterlead\{.*\}\n)?\\chapter\{(.*?)\}(\\label\{[^}]*\})?\n(?:\\markboth[^\n]*\n)?',re.S)
parsed=[]
for b in blocks:
    m=HEAD.match(b)
    if not m: print('NOHEAD',b[:80]);continue
    parsed.append((m.group(1),m.group(2) or '',b[m.end():]))
PLAN=[
 ('Soil Water: Balance, Retention and Conductivity',[1,2,3]),
 ('Flow, Roots and the Daisy Model',[4,11,12,32]),
 ('Triggers: Reach, Fate and Hydraulic Memory',[5,6,7,19]),
 ('Auditing a Model: Balance, Statistics and Limits',[8,9,16,33]),
 ('Evapotranspiration, Crop Stress and the Crop Library',[13,14,29]),
 ('Irrigation Design Mathematics, Weather and Field Data',[15,30]),
 ('A Tour of the SWAFL Layers',[10]),
 ('The Engines and the Dashboard',[17,18,20,31]),
 ('Soil Structure, Tillage, Mulch and Feedback Loops',[21,22,23]),
 ('Phenotyping: the Deterministic Plant and the Volumetric Scan',[24]),
 ('Surface Irrigation Design',[25]),
 ('Drip Irrigation Design',[26]),
 ('Sprinkler Irrigation Design',[27]),
 ('Drainage Design',[28]),
 ('Worked Solutions and Reference Tables',[34,35]),
]
used=set();files=[]
for k,(title,idx) in enumerate(PLAN,1):
    out=['\\chapimg{fig/ch%02d.jpg}\n'%k]
    out.append('\\IfFileExists{extra/lead%02d.tex}{\\input{extra/lead%02d}}{}\n'%(k,k))
    out.append('\\chapter{%s}\\label{chap:%02d}\n\\markboth{%s}{%s}\n'%(title,k,title,title))
    out.append('\\IfFileExists{extra/bg%02d.tex}{\\input{extra/bg%02d}}{}\n'%(k,k))
    for j in idx:
        t,lab,body=parsed[j-1];used.add(j)
        out.append('\\banner{%s}%s\n'%(t,lab)+body.strip('\n')+'\n')
    for part in ['proj','ex','dyk','obj']:
        out.append('\\IfFileExists{extra/%s%02d.tex}{\\input{extra/%s%02d}}{}\n'%(part,k,part,k))
    fn=O+'ch%02d.tex'%k;open(fn,'w').write(''.join(out));files.append('ch%02d'%k)
print(sorted(set(range(1,len(parsed)+1))-used))
