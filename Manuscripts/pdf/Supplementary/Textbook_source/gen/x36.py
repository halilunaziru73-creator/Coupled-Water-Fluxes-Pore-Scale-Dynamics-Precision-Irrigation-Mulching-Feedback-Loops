import sys,math
sys.path.insert(0,'/tmp/kh/gen')
from h import *
def W(t): return '\\par\\noindent where '+t+'\n\n'
def E(eq,wh,lab=''): return '\\begin{equation}'+(('\\boxed{'+eq+'}') if len(eq)<170 else eq)+(('\\label{%s}'%lab) if lab else '')+'\\end{equation}\n'+W(wh)
b=sec('Salinity under drip irrigation')
b+=P(r"Drip irrigation keeps the soil wet at the emitter and drives the salt to the edge of the wetted bulb, where it accumulates between irrigations and where the roots do not go. At the emitter the soil water has nearly the salinity of the irrigation water, $EC_w$; at the edge of the bulb it may be several times larger. The salt balance of the bulb, in the steady state, is $EC_{dw}=EC_w/LF$ for the drainage water of salinity $EC_{dw}$ at a leaching fraction $LF$, and the average salinity of the root zone is intermediate. The yield response of a crop to salinity is the piecewise-linear law of Maas and Hoffman,",
 E(r"\frac{Y}{Y_m}=\max\left\{0,\ 1-\frac{b}{100}\,(EC_e-a)\right\}\quad(EC_e>a),",r"$Y/Y_m$ is the relative yield, $EC_e$ the mean salinity of the saturation extract of the root zone (dS\,m$^{-1}$), $a$ the threshold salinity below which there is no loss (dS\,m$^{-1}$) and $b$ the slope, the percentage loss per dS\,m$^{-1}$ above the threshold.",'eq:d-mh'),
 r"With the mean root-zone salinity estimated as $EC_e\approx\tfrac32EC_w$ at a leaching fraction of 0.15 to 0.2 (the usual rule of thumb for a leaching requirement met), the table gives the relative yield of crops for three irrigation waters.")
CR=[('Maize',1.7,12),('Wheat',6.0,7.1),('Cotton',7.7,5.2),('Tomato',2.5,9.9),('Potato',1.7,12),('Soybean',5.0,20),('Sugar beet',7.0,5.9),('Sunflower',4.8,5.0),('Onion',1.2,16),('Alfalfa',2.0,7.3)]
rows=[]
for n,a,bb in CR:
    r=[n,a,bb]
    for ecw in (0.5,1.5,3.0): r.append('%.0f'%(100*max(0,1-bb/100*max(0,1.5*ecw-a))))
    rows.append(r)
b+=tabl(['Crop','threshold $a$','slope $b$','$Y/Y_m$ (\\%) at $EC_w=0.5$','1.5','3.0'],rows,'Relative yield from Eq.~\\ref{eq:d-mh} with $EC_e=1.5\\,EC_w$ (typical published values of $a$ and $b$).','lrrrrr')
b+=ex(r"Onion ($a=1.2$, $b=16$) and cotton ($a=7.7$, $b=5.2$) are drip-irrigated with water of 2.0 dS\,m$^{-1}$. Compare the relative yields and say what the leaching requirement of Chapter~14 would be.",
 r"$EC_e=1.5\times2.0=3.0$ dS\,m$^{-1}$ \ans Onion: $1-0.16(3.0-1.2)=%.3f$, i.e.\ %.1f per cent \ans Cotton: $3.0<7.7$, so $Y/Y_m=1.000$ \ans Leaching requirement $LR=EC_w/(5EC_e-EC_w)$ with the crop's own threshold: onion $2.0/(6.0-2.0)=%.3f$; cotton $2.0/(38.5-2.0)=%.3f$ \ans The sensitive crop must be leached nine times harder: for it, drip irrigation of saline water needs frequent irrigation to keep the salt at the bulb edge away from the roots, while cotton needs no special care \ans"%(1-.16*1.8,100*(1-.16*1.8),2/(6-2),2/(38.5-2)),'Salinity under drip')
write(12,'deep3',b);print('ok36')
