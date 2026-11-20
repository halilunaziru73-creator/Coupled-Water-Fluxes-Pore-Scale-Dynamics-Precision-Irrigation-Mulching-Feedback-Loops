import numpy as np, math
SOIL={ # id: (name, alpha, n, AWC mm/cm, sand, silt, clay, TAW)
'S01':('Coarse loam',0.0961,1.353,1.5,45,35,20),'S02':('Coarse sand',0.0536,1.600,0.5,88,8,4),
'S03':('Sand',0.1450,2.680,0.6,92,5,3),'S04':('Loamy sand',0.1240,2.280,0.9,82,12,6),
'S05':('Sandy loam',0.0750,1.890,1.2,65,25,10),'S06':('Loam',0.0360,1.560,1.7,40,40,20),
'S07':('Silt loam',0.0200,1.410,2.0,20,65,15),'S08':('Sandy clay loam',0.0590,1.480,1.4,55,15,30),
'S09':('Clay loam',0.0190,1.310,1.6,30,35,35),'S10':('Silty clay loam',0.0100,1.230,1.7,10,55,35)}
IDS=sorted(SOIL)
def Se(a,n,h): m=1-1/n; return (1+(a*h)**n)**(-m)
def Kr(a,n,h,l=.5):
    m=1-1/n;s=Se(a,n,h);return s**l*(1-(1-s**(1/m))**m)**2
def fdep(a,n,h):
    f=(Se(a,n,100)-Se(a,n,h))/(Se(a,n,100)-Se(a,n,15849));return min(1,max(0,f))
def hof(a,n,f,trace=None):
    lo,hi=0.0,4.6
    for k in range(60):
        mid=(lo+hi)/2
        if fdep(a,n,10**mid)<f: lo=mid
        else: hi=mid
        if trace is not None and k<8: trace.append((k+1,mid,10**mid,fdep(a,n,10**mid)))
    return 10**((lo+hi)/2)
def fx(x,d=2): 
    return f"{x:,.{d}f}".replace(',','{,}') if abs(x)>=1000 else f"{x:.{d}f}"
def ex(title,body): return "\\begin{example}{"+title+"}\n"+body.strip()+"\n\\end{example}\n"
def tab(cols,rows,cap,label=None,spec=None):
    spec=spec or 'l'+'r'*(len(cols)-1)
    s="\\begin{table}[H]\\centering\\small\\caption{"+cap+"}"+("\\label{"+label+"}" if label else "")+"\n\\begin{tabular}{"+spec+"}\\toprule\n"+" & ".join(cols)+"\\\\\\midrule\n"
    s+="\\\\\n".join(" & ".join(str(c) for c in r) for r in rows)+"\\\\\\bottomrule\\end{tabular}\\end{table}\n"
    return s
