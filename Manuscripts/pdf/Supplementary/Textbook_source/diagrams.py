import re,math
def pts(fx,fy,x0,x1,n=60):
    return ' '.join('(%.3f,%.3f)'%(fx(x0+(x1-x0)*i/n),fy(x0+(x1-x0)*i/n)) for i in range(n+1))
def Se(a,n,h): m=1-1/n;return (1+(a*h)**n)**(-m)
def Kr(a,n,h):
    m=1-1/n;s=Se(a,n,h);return s**0.5*(1-(1-s**(1/m))**m)**2
D={}
D['c1|The effective saturation']=r'''\begin{kfig}{The water balance of a root zone: rain $P$ and irrigation $I$ enter; transpiration $T$, evaporation $E$, drainage $D$ and runoff $Q$ leave; the store changes by $\Delta S$.}
\draw[soil] (0,0) rectangle (7,1.8);\draw[ln] (0,1.8)--(7,1.8);
\node[lab] at (3.5,0.9) {root zone: store $S$, change $\Delta S$};
\foreach \x/\l in {1.2/P,2.4/I}{\draw[vec] (\x,3.4)--(\x,1.9);\node[lab,above] at (\x,3.4) {$\l$};}
\foreach \x/\l in {4.4/T,5.6/E}{\draw[vec] (\x,1.9)--(\x,3.4);\node[lab,above] at (\x,3.4) {$\l$};}
\draw[vec] (3.5,0)--(3.5,-1.1);\node[lab,below] at (3.5,-1.1) {$D$};
\draw[vec] (7,1.4)--(8.1,1.4);\node[lab,right] at (8.1,1.4) {$Q$};
\draw[gd] (0,-0.5)--(7,-0.5);\node[lab,left] at (0,-0.5) {root depth};
\node[lab] at (3.5,-1.9) {$P+I=T+E+D+Q+\Delta S$};
\end{kfig}'''
D['c1|Where the parameters come from']=r'''\begin{kfig}{Capillary rise in a tube of radius $r$: the meniscus (contact angle $\gamma$) holds the water column $h$ above the free surface, $h=2\sigma\cos\gamma/(\rho g r)$.}
\draw[wtr] (-2.2,0) rectangle (2.2,-1);\draw[ln] (-2.2,0)--(2.2,0);
\draw[ln] (-0.35,0)--(-0.35,3.2);\draw[ln] (0.35,0)--(0.35,3.2);
\fill[khcyan!25] (-0.35,0) rectangle (0.35,2.5);\draw[crv] (-0.35,2.5) to[bend right=40] (0.35,2.5);
\draw[<->,ln] (1.2,0)--(1.2,2.45);\node[lab,right] at (1.2,1.2) {$h$};
\draw[<->,ln] (-0.35,3.55)--(0.35,3.55);\node[lab,above] at (0,3.55) {$2r$};
\draw[vec] (0,2.0)--(0,1.1);\node[lab,left] at (-0.45,1.6) {$\rho g h$};
\draw[gd] (-1.4,2.5)--(1.1,2.5);\node[lab,right] at (2.3,0) {free water surface};
\node[lab] at (0.9,2.75) {$\gamma$};
\end{kfig}'''
D['c1|Mualem']=r'''\begin{kfig}{Retention curve of a loam (van Genuchten, $\alpha=0.036$ cm$^{-1}$, $n=1.56$): effective saturation against the logarithm of suction; field capacity at 100 cm and wilting point at 15\,849 cm.}
\draw[axis] (0,0)--(7.4,0);\draw[axis] (0,0)--(0,4.6);
\node[lab,below] at (3.7,-0.55) {Suction $h$ (cm, log scale)};\node[lab,rotate=90] at (-0.9,2.3) {Effective saturation $S_e$};
\foreach \x/\t in {0/1,1.5/10,3/100,4.5/1000,6/10000}{\draw[ln] (\x,0)--(\x,-0.1);\node[lab,below] at (\x,-0.1) {\t};}
\foreach \y/\t in {0/0,1.9/0.5,3.8/1}{\draw[ln] (0,\y)--(-0.1,\y);\node[lab,left] at (-0.1,\y) {\t};}
\draw[crv,smooth] plot coordinates {'''+pts(lambda x:1.5*x,lambda x:3.8*Se(0.036,1.56,10**x),-0.3,4.2)+r'''};
\draw[gd] (3,0)--(3,1.52);\node[lab,above] at (3,0.05) {FC};
\draw[gd] (6.3,0)--(6.3,1);\node[lab,above] at (6.3,1.05) {WP};
\end{kfig}'''
D['c1|Derivation of the closed form']=r'''\begin{kfig}{Relative conductivity of two soils against suction: the conductivity falls by orders of magnitude as the soil dries, and falls sooner in a coarse soil.}
\draw[axis] (0,0)--(7.4,0);\draw[axis] (0,0)--(0,4.4);
\node[lab,below] at (3.7,-0.55) {Suction $h$ (cm, log scale)};\node[lab,rotate=90] at (-0.9,2.2) {$\log_{10}K_r$};
\foreach \x/\t in {0/1,1.5/10,3/100,4.5/1000,6/10000}{\draw[ln] (\x,0)--(\x,-0.1);\node[lab,below] at (\x,-0.1) {\t};}
\draw[crv,smooth] plot coordinates {'''+pts(lambda x:1.5*x,lambda x:4.0+0.5*math.log10(max(Kr(0.145,2.68,10**x),10**-7.5)),-0.2,4.2)+r'''};
\draw[ln,smooth] plot coordinates {'''+pts(lambda x:1.5*x,lambda x:4.0+0.5*math.log10(max(Kr(0.020,1.41,10**x),10**-7.5)),-0.2,4.2)+r'''};
\node[lab,text=khmag] at (2.2,0.7) {sand};\node[lab,text=khcyan!70!black] at (5.5,3.3) {silt loam};
\end{kfig}'''
D['c4|What Daisy is']=r'''\begin{kfig}{Radial flow to a root: water moves through the soil from the radius $r_1$ to the root surface $r_0$; the conductance of this path is the soil term in the uptake law.}
\draw[soil] (0,0) circle (2.3);\draw[wtr] (0,0) circle (0.45);\fill[khcyan!60] (0,0) circle (0.2);
\foreach \a in {0,60,...,300}{\draw[vec] ({2.15*cos(\a)},{2.15*sin(\a)})--({0.6*cos(\a)},{0.6*sin(\a)});}
\draw[<->,ln] (0,0)--(0.45,0);\draw[gd] (0,0)--(2.3,-0.0);
\node[lab,above] at (1.2,0.05) {$r_1$};\node[lab] at (0.0,-0.75) {$r_0$};\node[lab,right] at (2.45,0) {soil, $h_1$};\node[lab] at (-0.75,0.3) {root, $h_0$};
\end{kfig}'''
D['c4|The dry-end asymptote']=r'''\begin{kfig}{Sensor suction through a season: the days beyond the trigger $h_T$ are counted; rainfed (dashed) crosses the trigger earlier and stays beyond it for longer than irrigated.}
\draw[axis] (0,0)--(7.6,0);\draw[axis] (0,0)--(0,4.2);
\node[lab,below] at (3.8,-0.45) {Day of the season};\node[lab,rotate=90] at (-0.8,2.1) {Suction $h$ (cm)};
\draw[gd] (0,2.6)--(7.4,2.6);\node[lab,right] at (7.4,2.6) {$h_T$};
\draw[crv,smooth] plot coordinates {(0,0.4)(1,0.6)(2,1.2)(3,2.0)(3.5,2.75)(3.6,1.0)(4.4,1.4)(5.2,2.0)(5.9,2.8)(6.0,1.0)(6.8,1.5)(7.4,2.1)};
\draw[ln,dashed,smooth] plot coordinates {(0,0.4)(1,0.9)(2,1.8)(3,2.7)(4,3.3)(5,3.7)(6,3.9)(7.4,4.0)};
\fill[khcyan!25] (3.0,2.6) rectangle (3.5,2.75);\node[lab] at (1.4,3.6) {irrigated: ---};\node[lab] at (1.5,3.2) {rainfed: - - -};
\end{kfig}'''
D['c7|The dose law']=r'''\begin{kfig}{The drained share of the water applied rises with the dose per event $d$ and saturates at $\eta_D$: $\phi_D=\eta_D\,(1-e^{-d/d_D})$.}
\draw[axis] (0,0)--(7.4,0);\draw[axis] (0,0)--(0,4.2);
\node[lab,below] at (3.7,-0.55) {Dose per event $d$ (mm)};\node[lab,rotate=90] at (-0.9,2.1) {Drained share $\phi_D$};
\foreach \x/\t in {0/0,1.5/10,3/20,4.5/30,6/40}{\draw[ln] (\x,0)--(\x,-0.1);\node[lab,below] at (\x,-0.1) {\t};}
\draw[gd] (0,3.4)--(7.2,3.4);\node[lab,above right] at (0.1,3.4) {$\eta_D$};
\draw[crv,domain=0:7,samples=50,smooth] plot (\x,{3.4*(1-exp(-\x/1.9))});
\draw[gd] (1.9,0)--(1.9,2.149);\draw[gd] (0,2.149)--(1.9,2.149);\node[lab,below] at (1.9,-0.5) {$d_D$};
\end{kfig}'''
D['c7|Results across soils']=r'''\begin{kfig}{Hydraulic memory: the response to a saving decays as the store drains; the memory fate $\phi$ is the share of the saving still held by the soil after a season.}
\draw[axis] (0,0)--(7.4,0);\draw[axis] (0,0)--(0,4.2);
\node[lab,below] at (3.7,-0.45) {Time after the saving};\node[lab,rotate=90] at (-0.8,2.1) {Retained saving};
\draw[crv,domain=0:7,samples=40,smooth] plot (\x,{3.8*exp(-\x/5)});
\draw[ln,domain=0:7,samples=40,smooth] plot (\x,{3.8*exp(-\x/1.6)});
\draw[gd] (6.0,0)--(6.0,{3.8*exp(-6/5)});\node[lab,above] at (6.0,{3.8*exp(-6/5)+0.05}) {$\phi$};
\node[lab,text=khmag] at (5.2,2.5) {fine soil};\node[lab,text=khcyan!70!black] at (2.1,1.0) {coarse soil};
\end{kfig}'''
D['c9|The unattributed evaporative term']=r'''\begin{kfig}{Closing the balance: the inputs $P+I$ equal the outputs plus the change of storage; what is left after all the reported fluxes is the unattributed term $R$.}
\def\u{0.032}
\draw[axis] (0,0)--(0,4.6);\node[lab,rotate=90] at (-0.7,2.3) {Water (mm)};
\fill[khcyan!35] (0.5,0) rectangle (1.7,{620*\u/3});\fill[khcyan!75] (0.5,{620*\u/3}) rectangle (1.7,{784*\u/3});
\node[lab] at (1.1,{310*\u/3}) {$P$};\node[lab] at (1.1,{702*\u/3}) {$I$};
\fill[khsalmon!60] (3.2,0) rectangle (4.4,{560*\u/3});\fill[khgreen!80!black!40] (3.2,{560*\u/3}) rectangle (4.4,{640*\u/3});\fill[khpurple!70] (3.2,{640*\u/3}) rectangle (4.4,{780*\u/3});\fill[khmag!40] (3.2,{780*\u/3}) rectangle (4.4,{784*\u/3+0.0});
\node[lab] at (3.8,{280*\u/3}) {$ET$};\node[lab] at (3.8,{600*\u/3}) {$D$};\node[lab] at (3.8,{710*\u/3}) {$\Delta S$};\node[lab,right] at (4.5,{784*\u/3}) {$Q,\,R$};
\draw[ln] (0,0)--(5,0);\draw[gd] (0.5,{784*\u/3})--(4.4,{784*\u/3});
\node[lab,below] at (1.1,-0.05) {inputs};\node[lab,below] at (3.8,-0.05) {outputs};
\end{kfig}'''
D['p2a|Table of critical suctions']=r'''\begin{kfig}{Depletion $f$ of plant-available water against suction: zero at field capacity (100 cm), one at the wilting point (15\,849 cm); the loam S06 is drawn.}
\draw[axis] (0,0)--(7.4,0);\draw[axis] (0,0)--(0,4.4);
\node[lab,below] at (3.7,-0.55) {Suction $|h|$ (cm, log scale)};\node[lab,rotate=90] at (-0.8,2.2) {Depletion $f$};
\foreach \x/\t in {1.5/10,3/100,4.5/1000,6/10000}{\draw[ln] (\x,0)--(\x,-0.1);\node[lab,below] at (\x,-0.1) {\t};}
\foreach \y/\t in {0/0,2/0.5,4/1}{\draw[ln] (0,\y)--(-0.1,\y);\node[lab,left] at (-0.1,\y) {\t};}
\draw[crv,smooth] plot coordinates {'''+pts(lambda x:1.5*x,lambda x:4*(Se(0.036,1.56,100)-Se(0.036,1.56,10**x))/(Se(0.036,1.56,100)-Se(0.036,1.56,15849)),2.0,4.2)+r'''};
\draw[gd] (3,0)--(3,4.2);\draw[gd] (6.3,0)--(6.3,4.2);\node[lab,above] at (3,4.2) {FC};\node[lab,above] at (6.3,4.2) {WP};
\end{kfig}'''
D['p2c|Trigger law']=r'''\begin{kfig}{Relative yield against trigger depletion: yield stays near its maximum for small depletions and then falls; the largest trigger with $Y_{rel}\ge0.95$ is read from the dashed lines.}
\draw[axis] (0,0)--(7.4,0);\draw[axis] (0,0)--(0,4.4);
\node[lab,below] at (3.7,-0.5) {Trigger depletion $f$};\node[lab,rotate=90] at (-0.9,2.2) {Relative yield $Y_{rel}$};
\foreach \x/\t in {0/0,2.4/0.25,4.8/0.5,7.2/0.75}{\draw[ln] (\x,0)--(\x,-0.1);\node[lab,below] at (\x,-0.1) {\t};}
\draw[crv,smooth] plot coordinates {(0,4.0)(1.2,3.98)(2.4,3.8)(3.6,3.4)(4.8,2.8)(6,2.1)(7.2,1.3)};
\draw[gd] (0,3.8)--(7.2,3.8);\node[lab,left] at (0,3.8) {0.95};\draw[gd] (2.4,0)--(2.4,3.8);
\end{kfig}'''
out=[]
import glob
for key,code in D.items():
    f,title=key.split('|')
    p=f'/tmp/kh/{f}.tex';s=open(p).read()
    pat=re.compile(r'(\\section\{'+re.escape(title)+r'[^\n]*\n)')
    m=pat.search(s)
    if not m: print('MISS',key);continue
    s=s[:m.start()]+code+'\n\n'+s[m.start():]
    open(p,'w').write(s);out.append(key)
print(len(out))
