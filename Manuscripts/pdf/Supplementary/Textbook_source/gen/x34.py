import sys,math
sys.path.insert(0,'/tmp/kh/gen')
from h import *
from sidport import saxton
from lib import SOIL
TEX={'S01':(45,20),'S02':(88,4),'S03':(92,3),'S04':(82,6),'S05':(65,10),'S06':(40,20),'S07':(20,15),'S08':(55,30),'S09':(30,35),'S10':(10,35)}
PIPES=[80,100,125,160,200,250,315,400,500]
def W(t): return '\\par\\noindent where '+t+'\n\n'
def E(eq,wh,lab=''): return '\\begin{equation}'+(('\\boxed{'+eq+'}') if len(eq)<170 else eq)+(('\\label{%s}'%lab) if lab else '')+'\\end{equation}\n'+W(wh)
def dEq(L,D,u):
    x=2*math.pi*D/L;F=0
    for n in range(1,30,2):
        e=math.exp(-2*n*x);F+=4*e/(n*(1-e))
    d=(math.pi*L/8)/(max(.05,math.log(L/u))+F);return min(d,D)
def hoogL(q,h,K1,K2,D,u):
    L=math.sqrt((4*K1*h*h+8*K2*D*h)/q)
    for i in range(60):
        d=dEq(max(L,2),D,u);Ln=math.sqrt((8*K2*d*h+4*K1*h*h)/q)
        if abs(Ln-L)<.01:L=Ln;break
        L=.5*(L+Ln)
    return L
def glover(K1,K2,mu,D,u,h0,ht,t):
    L=30
    for i in range(60):
        d=dEq(max(L,2),D,u);hm=.5*(h0+ht);K=(K1*hm+K2*d)/(hm+d);Ln=math.pi*math.sqrt(K*d*t/(mu*math.log(1.16*h0/ht)))
        if abs(Ln-L)<.01:L=Ln;break
        L=.5*(L+Ln)
    return L
def hMid(q,L,K1,K2,d):
    a=4*K1;b=8*K2*d;c=-q*L*L;return (-b+math.sqrt(b*b-4*a*c))/(2*a)
manQ=lambda Dm,s,n:(1/n)*math.pi*Dm*Dm/4*(Dm/4)**(2/3)*math.sqrt(s)
def pipeFor(Q,s,f=.8):
    for D in PIPES:
        if manQ(D/1000,s,.016)*f>=Q:return D
    return PIPES[-1]
def soil(sid,ksub=1.0):
    sd,cl=TEX[sid];s=saxton(sd/100,cl/100,1.5);K1=max(.005,s['ks']*24/1000);K2=max(.003,K1*ksub);mu=min(.25,max(.03,s['sat']-s['fc']));return K1,K2,mu,s
def design(sid,depth=1.2,D=3.,ksub=1.,q=6.,zc=.5,tdraw=5):
    K1,K2,mu,s=soil(sid,ksub);r0=.5*.1;u=math.pi*r0;h=depth-zc
    Ls=hoogL(q/1000,h,K1,K2,D,u);Lu=glover(K1,K2,mu,D,u,depth-.1,h,tdraw);L=max(5,min(200,math.floor(Ls)))
    d=dEq(L,D,u);return dict(K1=K1,K2=K2,mu=mu,Ls=Ls,Lu=Lu,L=L,d=d,h=h,hD=hMid(q/1000,L,K1,K2,d),u=u)
b=''
b+=sec('Drainage: what the layer does')
b+=P(r"The drainage layer answers three questions of the farm that is irrigated: how far apart must the drains be to keep the water table below the roots; how large must the pipes be to carry the water away; and how much extra water must be applied, and drained, to wash out the salt. It takes the recharge of the water table from the field water balance (the deep percolation of rain and the loss of the irrigation design), the conductivity of the soil from the Saxton and Rawls functions, and the crop's tolerance of salinity and of a shallow water table.")
b+=sec('Types of drains')
b+=P(r"The application offers three. A \textbf{buried pipe drain} is a perforated corrugated pipe in a gravel envelope; the flow enters through the perforations, the pipe runs half full, and the effective wetted perimeter is $u=\pi r_0$ with $r_0=0.05$ m (a 100-mm pipe). A \textbf{pipe drain with a control gate} has an adjustable outlet that holds the water table at a chosen height $g$ above the drain level, so that in the dry months the water is kept in the soil for the crop; it is the \emph{controlled drainage} of the application. An \textbf{open ditch} is an excavated channel with side slope 1.5 and bottom width $b_w$; the wetted perimeter is $u=b_w+2D_w\sqrt{1+1.5^2}$ with a water depth $D_w=0.3$ m, Manning $n=0.03$, and it takes more land (the ditch occupies $b_w+1.5\,\text{depth}$ of the width) and is cleaned each year. Pipe drains use $n=0.016$ (corrugated polyethylene).")
b+=tabl(['','Buried pipe','Pipe with gate','Open ditch'],[['Wetted perimeter $u$','$\\pi r_0=0.157$ m','$\\pi r_0=0.157$ m','$b_w+2D_w\\sqrt{1+z^2}$'],['Manning $n$','0.016','0.016','0.030'],['Default depth of drain (m)','1.2','1.2','1.2'],['Controls water table','no','yes (gate $g$)','no'],['Land lost','none','none','ditch and spoil bank'],['Maintenance','low','low','high (annual cleaning)']],'The drain types of the application.','llll')
b+=sec('Steady design: Hooghoudt and the equivalent depth')
b+=P(r"When the recharge $q$ is steady, the water table between two parallel drains of spacing $L$ rises to a height $h$ above the drain level in the middle; Hooghoudt's equation relates them:",
 E(r"q=\frac{8K_2\,d_e\,h+4K_1\,h^{2}}{L^{2}},\qquad L=\sqrt{\frac{8K_2d_eh+4K_1h^2}{q}},",r"$q$ is the design discharge (recharge) (m\,d$^{-1}$), $L$ the spacing of the drains (m), $h$ the allowed height of the water table midway above the drain level (m), $K_1$ the saturated conductivity of the layer above the drain level and $K_2$ that of the layer below it (m\,d$^{-1}$) and $d_e$ the equivalent depth (m). In the application $K_1=K_s$ of the soil (Saxton and Rawls) and $K_2=K_1\times K_{sub}$ with $K_{sub}$ chosen by the user (default 1).",'eq:dr-h'),
 r"Close to the drain the flow lines converge, which lengthens the path and raises the head needed; Hooghoudt replaced the real depth $D$ of the barrier below the drains by a smaller \emph{equivalent depth} $d_e$ that allows for this. The application computes it from the exact solution of Moody (van Beers' form):",
 E(r"d_e=\min\left\{D,\ \frac{\pi L/8}{\ln(L/u)+F(x)}\right\},\quad F(x)=\sum_{n=1,3,5,\ldots,29}\frac{4e^{-2nx}}{n\,(1-e^{-2nx})},\quad x=\frac{2\pi D}{L},",r"$d_e$ is the equivalent depth (m), $D$ the depth of the impermeable layer below the drains (m), $L$ the spacing (m), $u$ the wetted perimeter of the drain (m), $x$ a dimensionless number and $F(x)$ the series (15 terms) that tends to zero when the barrier is deep ($x$ large) and corrects for the finite depth otherwise.",'eq:dr-de'),
 r"Since $d_e$ depends on $L$ the equation is solved by iteration: start with $L=\sqrt{(4K_1h^2+8K_2Dh)/q}$, compute $d_e(L)$, update $L$, and average the old and the new value until the change is below 1 cm. The critical depth of the water table is $z_c=\mathrm{clip}(0.3+0.4R_{max}/100,\ 0.4,\ 0.9)$ m (the root zone plus a margin), so that the allowed head is $h=z_{drain}-z_c$.")
rows=[]
for dep in (1.0,1.2,1.5,1.8,2.0):
    for D in (2,4,8):
        r=design('S06',depth=dep,D=D);rows.append([dep,D,'%.2f'%r['h'],'%.2f'%r['d'],'%.1f'%r['Ls'],'%.0f'%(1e4/max(r['L'],1))])
b+=tabl(['Drain depth (m)','Barrier $D$ (m)','$h$ (m)','$d_e$ (m)','$L$ (m)','pipe (m/ha)'],rows,'Hooghoudt spacing for the loam S06 ($K_1=K_2=%.2f$ m/d, $q=6$ mm/d, $z_c=0.5$ m) at several drain depths and barrier depths.'%soil('S06')[0],'rrrrrr')
K1,K2,mu,s=soil('S06');r=design('S06')
b+=ex(r"Loam S06 ($K_1=K_2=%.3f$ m\,d$^{-1}$, $\mu=%.3f$). Drains of 100 mm lie at 1.2 m with the barrier $D=3$ m below them; the design recharge is 6 mm\,d$^{-1}$ and the water table must not rise within 0.5 m of the surface. Find the allowed head, the spacing and the water table at that spacing."%(K1,mu),
 r"$h=1.2-0.5=0.70$ m; $u=\pi(0.05)=0.157$ m \ans First estimate: $L_0=\sqrt{(4K_1h^2+8K_2Dh)/q}=\sqrt{(4\times%.3f\times0.49+8\times%.3f\times3\times0.7)/0.006}=%.1f$ m \ans Equivalent depth at $L_0$ (Eq.~\ref{eq:dr-de}): $x=2\pi(3)/%.1f$, $d_e=%.2f$ m; new $L=\sqrt{(8K_2d_eh+4K_1h^2)/q}$ \ans After iteration $L=%.1f$ m, $d_e=%.2f$ m; the spacing is taken as $\lfloor L\rfloor=%d$ m \ast Check: $h_{mid}=%.3f$ m at that spacing from the quadratic $4K_1h^2+8K_2d_eh-qL^2=0$ \ans Pipe per hectare $10^4/%d=%.0f$ m \ans"%(K1,K2,math.sqrt((4*K1*.49+8*K2*3*.7)/.006),math.sqrt((4*K1*.49+8*K2*3*.7)/.006),dEq(math.sqrt((4*K1*.49+8*K2*3*.7)/.006),3,.157),r['Ls'],r['d'],r['L'],r['hD'],r['L'],1e4/r['L']),'Drain spacing by Hooghoudt')
b=b.replace(r"\ast","\\ans")
b+=sec('Transient design: Glover--Dumm')
b+=P(r"For a rain that raises the water table, the farmer wants to know how fast it falls. The \emph{falling-water-table} basis of the application gives the spacing that lowers the water table from $h_0=z_{drain}-0.1$ to the allowed height $h_t$ in $t$ days:",
 E(r"L=\pi\sqrt{\frac{K\,d_e\,t}{\mu\,\ln\bigl(1.16\,h_0/h_t\bigr)}},\qquad K=\frac{K_1\bar h+K_2d_e}{\bar h+d_e},\quad\bar h=\tfrac12(h_0+h_t),",r"$L$ is the spacing (m), $K$ the weighted conductivity (m\,d$^{-1}$), $d_e$ the equivalent depth (m), $t$ the time allowed to draw the water table down (d; default 5), $\mu$ the drainable porosity ($\theta_s-\theta_{33}$, between 0.03 and 0.25), $h_0$ and $h_t$ the initial and final heights of the water table above the drain level (m) and 1.16 is the factor of the Glover--Dumm solution for a water table that starts as a flat horizontal line.",'eq:dr-gd'),
 r"The design basis may be the steady spacing, the falling spacing, or the smaller of the two (the default for a drain that must satisfy both). The water table midway for any chosen $L$ follows from the quadratic of Hooghoudt, $h_{mid}=\bigl[-8K_2d_e+\sqrt{(8K_2d_e)^2+16K_1qL^2}\bigr]/(8K_1)$, and the discharge for any height $h$ is $q=(8K_2d_eh+4K_1h^2)/L^2$.")
rows=[]
for tdr in (2,3,5,7,10):
    r=design('S06',tdraw=tdr);rows.append([tdr,'%.1f'%r['Ls'],'%.1f'%r['Lu'],'%.1f'%min(r['Ls'],r['Lu'])])
b+=tabl(['draw-down time $t$ (d)','steady $L$ (m)','falling $L$ (m)','design (smaller) (m)'],rows,'Steady and falling-water-table spacings for the loam S06 ($D=3$ m, drain at 1.2 m, $q=6$ mm/d, $z_c=0.5$ m).','rrrr')
b+=sec('The ten soils')
rows=[]
for sid in sorted(TEX):
    r=design(sid);rows.append([sid,SOIL[sid][0],'%.3f'%r['K1'],'%.3f'%r['mu'],'%.1f'%r['Ls'],'%.1f'%r['Lu'],'%.0f'%r['L'],'%.0f'%(1e4/r['L'])])
b+=tabl(['ID','Soil','$K_1$ (m/d)','$\\mu$','steady $L$ (m)','falling $L$ (m)','$L$ used (m)','pipe (m/ha)'],rows,'Drain spacing for each of the ten soils (drain 1.2 m, barrier 3 m, $q=6$ mm/d, $z_c=0.5$ m, $t=5$ d); $L$ is limited to 5--200 m.','llrrrrrr')
b+=P(r"The conductivity of the soil governs everything: on the sands a single drain serves 200 m of field or more (the limit of the application) and drainage is rarely necessary; on the silty and clay soils the spacing falls to a few metres, the pipe per hectare multiplies, and drainage becomes expensive. This is one reason why the drainage layer is read together with the irrigation design: a design with less deep percolation lowers the recharge $q$ and widens the spacing.")
b+=sec('Pipes and structures')
b+=P(r"The lateral pipe must carry the discharge collected from a strip of width $L$ along its length $L_f$, $Q_l=q\,L\,L_f/86400$ (m$^3$\,s$^{-1}$, $q$ in m\,d$^{-1}$), and the collector the discharge of the whole field, $Q_c=qL_fW_f/86400$. The smallest standard diameter from 80, 100, 125, 160, 200, 250, 315, 400, 500 mm that carries the flow at 80 per cent of the full-pipe capacity is chosen. For a full circular pipe, Manning's equation reduces to",
 E(r"Q_{cap}=\frac1n\,\frac{\pi D^2}{4}\left(\frac D4\right)^{2/3}s^{1/2},\qquad L_{\max}=\min\left\{1500,\ \frac{0.8\,Q_{cap}}{q\,L/86400}\right\},",r"$Q_{cap}$ is the full-pipe capacity (m$^3$\,s$^{-1}$), $n$ the Manning coefficient (0.016 for the pipe), $D$ the inside diameter (m), $s$ the slope of the pipe (m\,m$^{-1}$), $L_{\max}$ the longest lateral that the pipe can serve (m, limited to 1500 m), $q$ the design discharge (m\,d$^{-1}$) and $L$ the drain spacing (m).",'eq:dr-pipe'))
rows=[]
for D in PIPES:
    rows.append([D,'%.1f'%(manQ(D/1000,.0015,.016)*1000),'%.1f'%(manQ(D/1000,.003,.016)*1000),'%.1f'%(manQ(D/1000,.005,.016)*1000)])
b+=tabl(['$D$ (mm)','$Q_{cap}$ at 0.15\\% (L/s)','at 0.30\\% (L/s)','at 0.50\\% (L/s)'],rows,'Full-pipe capacity of corrugated pipe ($n=0.016$) at three slopes.','rrrr')
Af=300*200/1e4;L=r['L'] if False else design('S06')['L'];q=.006;Ql=q*L*300/86400;Qc=q*300*200/86400;Dl=pipeFor(Ql,.0015);Dc=pipeFor(Qc,.0015)
b+=ex(r"A field of 300 m by 200 m on the loam is drained with laterals along the 300-m side, at the spacing of the previous example, slope 0.15 per cent, $q=6$ mm\,d$^{-1}$. Find the number of laterals, the flow in a lateral, the pipe size, the longest lateral and the collector.",
 r"Spacing $L=%d$ m; number of laterals $\lfloor200/%d\rfloor+1=%d$ \ans $Q_l=qLL_f/86400=0.006\times%d\times300/86400=%.2e$ m$^3$\,s$^{-1}$ ($%.3f$ L\,s$^{-1}$) \ans Smallest pipe with $0.8Q_{cap}\ge Q_l$ at $s=0.0015$: $D=%d$ mm ($Q_{cap}=%.2f$ L\,s$^{-1}$) \ans $L_{\max}=\min\{1500,\ 0.8Q_{cap}/(qL/86400)\}=%.0f$ m \ans Collector: $Q_c=0.006\times300\times200/86400=%.2e$ m$^3$\,s$^{-1}$ ($%.2f$ L\,s$^{-1}$), diameter $%d$ mm \ans Pipe in the field: $%d\times300+200=%d$ m, i.e.\ $%.0f$ m\,ha$^{-1}$ over $%.1f$ ha \ans"%(L,L,200//L+1,L,Ql,Ql*1000,Dl,manQ(Dl/1000,.0015,.016)*1000,min(1500,.8*manQ(Dl/1000,.0015,.016)/(q*L/86400)),Qc,Qc*1000,Dc,200//L+1,(200//L+1)*300+200,((200//L+1)*300+200)/Af,Af),'Pipes of a drained field')
b+=sec('Salinity and the leaching requirement')
b+=P(r"Drainage and salinity are one problem. Each irrigation brings salt; the crop takes the water and leaves the salt; unless a fraction of the water passes below the roots the salt accumulates. Rhoades' leaching requirement gives the fraction of the water that must leave the root zone for the crop to see no more than its tolerable salinity,",
 E(r"LR=\mathrm{clip}\left\{\frac{EC_w}{5EC_e-EC_w},\ 0,\ 0.9\right\},\qquad I_{leach}=\frac{LR}{1-LR}\,I_n,",r"$LR$ is the leaching requirement (fraction of the applied water), $EC_w$ the electrical conductivity of the irrigation water (dS\,m$^{-1}$), $EC_e$ the salinity of the saturation extract that the crop tolerates without loss (dS\,m$^{-1}$; the user enters the threshold of the crop), $I_{leach}$ the extra water to be applied for leaching (mm) and $I_n$ the net irrigation of the season (mm).",'eq:dr-lr'),
 r"The deep percolation caused by the irrigation (the recharge) already provides some leaching; the design is complete when the leaching fraction of the field water balance is at least $LR$ and the drains carry that water away.")
rows=[]
for ece in (1.2,1.7,3.0,4.8,7.0,7.7):
    r_=['%.1f'%ece]
    for ecw in (0.5,1.0,1.5,2.5,4.0):
        LR=min(.9,max(0,ecw/(5*ece-ecw))) if 5*ece>ecw else .9;r_.append('%.3f'%LR)
    rows.append(r_)
b+=tabl(['$EC_e$ (dS/m)','$EC_w=0.5$','1.0','1.5','2.5','4.0'],rows,'Leaching requirement for crops of different tolerance and waters of different salinity.','rrrrrr')
b+=ex(r"Maize ($EC_e$ threshold 1.7 dS\,m$^{-1}$) is irrigated with water of 1.0 dS\,m$^{-1}$; the net irrigation of the season is $I_n=480$ mm. Cotton ($EC_e=7.7$) is irrigated with the same water. Find the leaching requirement and the extra water in each case.",
 r"Maize: $LR=1.0/(5\times1.7-1.0)=%.3f$ \ans $I_{leach}=\frac{%.3f}{1-%.3f}\times480=%.0f$ mm \ans Cotton: $LR=1.0/(5\times7.7-1.0)=%.3f$ \ans $I_{leach}=\frac{%.3f}{1-%.3f}\times480=%.0f$ mm \ans The tolerant crop needs one-fifth of the leaching of the sensitive one; with water of 1 dS\,m$^{-1}$ the maize needs about %.0f per cent more water, which the drains must carry away \ans"%(1/(8.5-1),1/(8.5-1),1/(8.5-1),1/(8.5-1)/(1-1/(8.5-1))*480,1/(38.5-1),1/(38.5-1),1/(38.5-1),1/(38.5-1)/(1-1/(38.5-1))*480,100*1/(8.5-1)/(1-1/(8.5-1))),'Leaching for a sensitive and a tolerant crop')
b+=sec('Controlled drainage')
b+=P(r"With a gate on the outlet the drain does not discharge until the water table rises above the gate level $g$. The water table then follows, day by day, the balance",
 E(r"\mu\frac{dh}{dt}=R(t)-q_{out}(h-g),\qquad q_{out}(h')=\frac{8K_2d_eh'+4K_1h'^2}{L^2}\ (h'>0),",r"$\mu$ is the drainable porosity, $h$ the height of the water table midway above the drain level (m), $g$ the height of the gate (m), $R(t)$ the recharge of the day (m\,d$^{-1}$), $q_{out}$ the discharge of the drain (m\,d$^{-1}$) and $h'=h-g$ the head above the gate. The application integrates it in six sub-steps per day over the whole record, with the water table capped at the soil surface (the excess is runoff) and reports the days on which the water table is shallower than the critical depth $z_c$, the sum of the exceedance of the depth of 0.3 m (the SEW$_{30}$ index, in cm\,d), and the total drainage.",'eq:dr-ctl'),
 r"Raising the gate from 0 to 0.3 m keeps more of the winter rain in the profile and cuts the discharge (and the loss of nitrate with it), at the price of more days with a shallow water table. The balance between these two is what the controlled-drainage design is for.")
write(14,'deep',b)
print('ok34')
