from h import *
k=3
lead(k,"classify irrigation triggers and sensors; compute the depletion that a suction trigger means and the suction that a depletion means; derive and evaluate the reach of a trigger; apply the dose law for the fate of an irrigation millimetre; define and use the memory fate of a flux; and choose a trigger for a soil in a design.")
kap=3.5e-10;ell=0.5
def reach(s):
    nm,a,n,*_=SOIL[s];m=1-1/n;E=2*n+ell*(n-1);return (1/a)*(m*m/kap)**(1/E),E
b=''
b+=sec('Introduction: when to irrigate')
b+=P(r"Every irrigation system answers two questions: \emph{when} to apply water and \emph{how much}. The second is a matter of the root zone and the system (Chapters~1 and~6); the first is a matter of a \kw{trigger}, a rule that turns the state of the soil, the crop or the weather into a decision. This chapter studies the simplest trigger, a threshold on the suction measured by a sensor in the root zone, and asks three questions of it: how far can a soil dry before the trigger fires (the \emph{reach}), where does the water go after it is applied (the \emph{fate}), and how long does the soil remember a change of management (the \emph{memory}). The answers are laws derived in the studies on which this book is based from an ensemble of 10\,190 Daisy simulations over ten soils.")
b+=sec('Types of irrigation triggers and sensors')
b+=P(r"Irrigation scheduling methods are grouped into four classes. \kw{Calendar} (fixed interval or fixed dose) methods ignore the state of the crop and are the oldest; they waste water when it rains and starve the crop in a hot spell. \kw{Water balance} (or budget) methods keep a running account of the depletion $D_r$ of the root zone from the weather ($ET_c$) and the water applied, and irrigate when $D_r$ reaches the readily available water; they need no sensor but drift without correction. \kw{Soil-based} methods read a sensor: a \emph{tensiometer} (a porous cup on a water-filled tube with a vacuum gauge, reading 0--80 kPa), a \emph{gypsum block} or \emph{granular matrix sensor} (electrical resistance, 0--200 kPa), or a \emph{dielectric probe} (water content). \kw{Plant-based} methods read leaf water potential, canopy temperature or stem diameter.",
 r"Soil-based triggers are of two kinds: a \emph{suction trigger} $h_t$ (irrigate when the sensor reads more than $h_t$ cm) and a \emph{depletion trigger} $f_t$ (irrigate when a fraction $f_t$ of the available water has gone). The two are linked by the retention curve of the soil, $f=f(h)$ (Equation~\ref{eq:fdep}, Chapter~8). A suction of 300 cm is a light depletion in a sand and a deep one in a silt loam; that is the reason the same trigger behaves differently in different soils.")
b+=ex(r"For the sand S03 ($\alpha=0.145$, $n=2.68$) and the silt loam S07 ($\alpha=0.020$, $n=1.41$) find the depletion $f$ that a suction trigger of 300 cm means (field capacity at 100 cm, wilting point at 15\,849 cm).",
 '; '.join(r"%s: $f(300)=[S_e(100)-S_e(300)]/[S_e(100)-S_e(15849)]=(%.4f-%.4f)/(%.4f-%.4f)=%.3f$"%(SOIL[s][0],Se(SOIL[s][1],SOIL[s][2],100),Se(SOIL[s][1],SOIL[s][2],300),Se(SOIL[s][1],SOIL[s][2],100),Se(SOIL[s][1],SOIL[s][2],15849),fdep(SOIL[s][1],SOIL[s][2],300)) for s in ('S03','S07'))+r" \ans The same 300 cm trigger is a near-complete depletion in the sand and a modest one in the silt loam.",'A suction trigger as a depletion')
b+=sec('The reach of a trigger')
b+=P(r"A trigger can fire only if the soil can reach the suction at which it is set. A crop dries the soil until the conductivity around its roots falls so low that the soil can no longer supply the demand; beyond that suction the roots meet a wall. Writing that $K_r(h_c)=\kappa$ at that point, and using the dry-end form $K_r\simeq m^2(\alpha h)^{-E}$ with $E=2n+\ell(n-1)$ (Chapter~3, Equations on the reach), the reach is",
 eqn(r"h_c=\frac1\alpha\Bigl(\frac{m^2}{\kappa}\Bigr)^{1/E},\qquad m=1-\frac1n,\ \kappa=3.5\times10^{-10},\ \ell=0.5.\label{eq:reach3}"),
 r"A trigger $h_t<h_c$ can fire and irrigates; a trigger $h_t>h_c$ never fires and the field behaves as rainfed. For a design, this gives an upper limit for the trigger of each soil.")
rows=[]
for s in IDS:
    hc,E=reach(s);rows.append([s,SOIL[s][0],f'{SOIL[s][2]:.2f}',f'{E:.2f}',f'{hc:,.0f}'.replace(',','\\,'),'yes' if 300<hc else 'no'])
b+=tabl(['Soil','Class','$n$','$E$','$h_c$ (cm)','300 cm fires?'],rows,'Reach of a suction trigger for the ten soils ($\\kappa=3.5\\times10^{-10}$, $\\ell=0.5$) computed from the rounded parameters.','llrrrr')
hc6,E6=reach('S06');m6=1-1/1.56
b+=ex(r"Compute the reach of the loam S06 ($\alpha=0.036$, $n=1.56$) step by step, and say whether a trigger of 1000 cm would fire.",
 r"$m=1-1/1.56=%.4f$, $m^2=%.4f$; $E=2n+\ell(n-1)=3.12+0.5\times0.56=%.2f$. $m^2/\kappa=%.4f/3.5\times10^{-10}=%.3e$; its power $1/E=%.4f$ is $%.2f$, so $h_c=%.2f/0.036=%.0f$ cm \ans A trigger of 1000 cm is %s the reach and %s."%(m6,m6**2,E6,m6**2,m6**2/kap,1/E6,(m6**2/kap)**(1/E6),(m6**2/kap)**(1/E6),hc6,'below' if 1000<hc6 else 'beyond','fires' if 1000<hc6 else 'does not fire'),'Reach of a loam')
b+=sec('The fate of an irrigation millimetre: the dose law')
b+=P(r"An irrigation millimetre does not all go to the crop. Written against a rainfed twin of the same run, the water applied $I$ is shared among transpiration, soil evaporation, other evaporation, drainage and storage; the shares $\eta_X$ (the \kw{marginal fate} in flux $X$) sum to one. The drained share depends mostly on the dose $d$ per event, because a larger dose wets deeper and exceeds the capacity of the root zone more often:",
 eqn(r"\phi_D(d)=\eta_D\bigl(1-e^{-d/d_D}\bigr),\label{eq:dose3}"),
 r"where $\eta_D$ is the saturation level of the drained share and $d_D$ the dose scale. The law is a fit to the ensemble, not a derivation; its use is to choose a dose that keeps drainage low.")
eta,dd=0.45,9.0
doses=[5,10,15,20,30]
b+=ex(r"A soil with $\eta_D=0.45$ and $d_D=9$ mm gives the dose law. Find the drained share at doses of 5, 10, 15, 20 and 30 mm per event, and the dose at which half of the saturation level is reached.",
 '; '.join(r"$d=%d$: $\phi_D=0.45(1-e^{-%d/9})=%.3f$"%(d,d,eta*(1-math.exp(-d/dd))) for d in doses)+r". Half of saturation: $1-e^{-d/9}=0.5$, $d=9\ln2=%.1f$ mm \ans Doses below about 6 mm lose less than a third of the saturation level to drainage, so frequent small doses are efficient in this soil; a 30 mm dose loses almost the full 0.45."%(dd*math.log(2)),'Drained share against dose')
b+=sec('Hydraulic memory')
b+=P(r"When irrigation is changed (a mulch is added, a trigger lowered), the soil does not respond at once, because the water that was held before the change must drain or be used. This persistence is the \kw{hydraulic memory}. If a saving of $s$ millimetres is made in a flux in year~1, the \kw{memory fate} $\phi_x$ of a flux $x$ is the share of the saving that appears in $x$ in the following years; it behaves as a pooled slope of the flux change on the storage change. Large in soils that hold water (fine soils) and small in free-draining soils, it limits how much of a saving can be ``banked'' in the root zone. Chapter~6 of the application tabulates it for ten soils (Table at the end of this chapter).")
write(k,'bg',b)
# project: choosing triggers for a design
rows=[];sel={}
for s in ['S03','S05','S06','S07','S09','S10']:
    nm,a,n,awc,*_=SOIL[s];hc,E=reach(s)
    h50=hof(a,n,0.5);hsel=min(h50,0.8*hc)
    f=fdep(a,n,hsel);Zn=f*awc*10*60/10 # f*AWC(mm/cm)*Rmax(cm)=mm, Rmax=60 cm
    Zn=f*awc*60
    rows.append([s,nm,f'{h50:,.0f}'.replace(',','\\,'),f'{hc:,.0f}'.replace(',','\\,'),f'{hsel:,.0f}'.replace(',','\\,'),f'{f:.2f}',f'{Zn:.0f}',f'{Zn/5.0:.1f}'])
p='\\banner{Design project 3: choosing a suction trigger for six soils}\n'
p+=P(r"\textbf{Brief.} A sensor-controlled system is to be installed on six soils of a farm. The crop (a vegetable) roots to 0.6 m and tolerates a depletion of 50 per cent of the available water before it is stressed; its peak demand is 5 mm\,d$^{-1}$. The designer must set the trigger of each sensor so that (i) the depletion stays below 50 per cent, (ii) the trigger is within the reach of the soil (taken as 80 per cent of $h_c$ to allow a margin), and (iii) the net dose $Z_n$ and the interval at the peak are known.",
 r"\textbf{Method.} For each soil: the suction at 50 per cent depletion $h_{50}$ is found by bisection of $f(h)=0.5$ with the van Genuchten curve; the reach $h_c$ from Equation~(\ref{eq:reach3}); the trigger is $h_t=\min(h_{50},0.8h_c)$; the actual depletion $f_t=f(h_t)$; the net dose $Z_n=f_t\cdot\mathrm{AWC}\cdot R_{max}$ with $R_{max}=60$ cm; and the interval at the peak $T=Z_n/5$.")
p+=tabl(['Soil','Class','$h_{50}$','$h_c$','$h_t$','$f_t$','$Z_n$ (mm)','Interval (d)'],rows,'Design of the trigger for six soils: suction at 50 \\% depletion, reach, chosen trigger, depletion at the trigger, net dose and interval at the peak demand.','llrrrrrr')
p+=P(r"\textbf{Reading the table.} In coarse soils (sand, sandy loam) the depletion limit $h_{50}$ is low and is the binding constraint; the trigger is $h_{50}$ and the dose is small, so the sensors call for frequent small irrigations (the interval is a day or two). In the fine soils the reach is the binding limit when $h_{50}$ exceeds $0.8h_c$: the trigger cannot be set at a depletion of 50 per cent because the roots could not dry the soil that far, and the practical depletion at the trigger is lower than the design limit. The designer should then choose a drip or a pulsed system in the coarse soils and accept that the fine soils will be irrigated at less than their allowed depletion.",
 r"\textbf{Check.} For the loam, the trigger of %s cm gives a depletion of %s per cent; a net dose of %s mm every %s days at the peak. The drained share of such a dose is read from the dose law of this chapter."%(rows[2][4],str(round(100*float(rows[2][5]))),rows[2][6],rows[2][7]))
write(k,'proj',p)
exl=[]
exl.append((r"For the sandy loam S05 ($\alpha=0.075$, $n=1.89$), compute the reach with $\kappa=3.5\times10^{-10}$, $\ell=0.5$.","%.0f cm"%reach('S05')[0]))
exl.append((r"Is a trigger of 600 cm within the reach of the clay loam S09? Give its reach.","%s; %.0f cm"%('yes' if 600<reach('S09')[0] else 'no',reach('S09')[0])))
exl.append((r"Find the depletion $f$ at 500 cm for the loam S06.","%.3f"%fdep(0.036,1.56,500)))
exl.append((r"Find the suction at 40 per cent depletion in the loam S06 by bisection.","%.0f cm"%hof(0.036,1.56,0.4)))
exl.append((r"A crop in a silt loam (AWC 2.0 mm per cm) roots to 80 cm and is irrigated at depletion 0.45. Find the net dose and the interval at ET = 4.5 mm\,d$^{-1}$.","%.0f mm; %.1f d"%(0.45*2.0*80,0.45*2.0*80/4.5)))
exl.append((r"With the dose law $\phi_D=0.40(1-e^{-d/12})$, find $\phi_D$ for $d=8$, 16 and 24 mm and the water drained in a season of 10 events of 16 mm.","%.3f; %.3f; %.3f; %.0f mm"%(0.4*(1-math.exp(-8/12)),0.4*(1-math.exp(-16/12)),0.4*(1-math.exp(-24/12)),10*16*0.4*(1-math.exp(-16/12)))))
exl.append((r"The shares of the fate of an irrigation are: transpiration 0.38, soil evaporation 0.24, other evaporation 0.05, drainage 0.28. Find the storage share and the water stored if $I=160$ mm.","0.05; 8 mm"))
exl.append((r"A saving of 40 mm in evaporation is made in year 1 with a memory fate $\phi_D=0.45$ for drainage. How much of the saving appears as drainage?","18 mm"))
exl.append((r"A trigger is set at 900 cm in a soil whose reach is 650 cm. How many irrigations occur? Explain.","none (rainfed)"))
exl.append((r"A tensiometer at 25 cm reads 32 kPa. Convert to suction in cm and pF.","%.0f cm; pF %.2f"%(32*10.2,math.log10(32*10.2))))
write(k,'ex',exercises(exl))
write(k,'dyk',dyk([r"Name four classes of irrigation scheduling methods and one weakness of each.",r"What is the difference between a suction trigger and a depletion trigger? Why does the same suction mean different depletions in different soils?",r"Define the reach of a trigger and state what happens when the trigger is beyond it.",r"Why is the constant $\kappa$ the same for all soils in the reach law?",r"What is the marginal fate of an irrigation millimetre?",r"Explain why a small dose per event loses less to drainage.",r"What is hydraulic memory, and why does it limit the banking of a saving?",r"How would you choose a trigger for a coarse soil and for a fine soil?"]))
write(k,'obj',obj([
 (r"A tensiometer reads",["water content","suction","salinity","temperature"],1),
 (r"A suction trigger of 300 cm in a sand is",["a light depletion","a near-complete depletion","a saturated soil","a wilting soil"],1),
 (r"The reach formula uses the relative conductivity",["at saturation","at the reach equal to $\\kappa$","at wilting only","of the crop"],1),
 (r"A trigger beyond the reach",["fires often","never fires","fires once","fires at night"],1),
 (r"The drained share increases with",["smaller doses","larger doses","the number of events only","evaporation only"],1),
 (r"The marginal fates of all fluxes sum to",["zero","one","the dose","the reach"],1),
 (r"Water balance (budget) scheduling needs",["a sensor","the weather and the applied water","a lysimeter","satellites"],1),
 (r"The memory fate is large in soils that",["drain freely","hold water","are saline","are frozen"],1),
 (r"A calendar schedule",["responds to the crop","ignores the state of the crop","reads a sensor","needs no water"],1),
 (r"A granular matrix sensor measures",["electrical resistance related to suction","gamma attenuation","neutron counts","leaf temperature"],0)]))
print('ok3')
