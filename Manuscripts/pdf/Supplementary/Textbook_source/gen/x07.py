from h import *
k=7
lead(k,"name the layers of the SWAFL application and state what each one computes, from which inputs and with which equations; reproduce one number of every layer by hand; and chain the layers into a complete design for a farm, from the soil and crop to the pump.")
b=''
b+=sec('Introduction: the idea of a layer')
b+=P(r"The SWAFL application (Soil Water, Atmosphere, Feedback and Layout) is organised in \emph{layers}. A layer is a self-contained view of one question about a field: when to irrigate, what a mulch does, how the structure of the soil changes drainage, how a plant grows, how the water balance of the field closes. All layers read the same inputs (the soil, the crop, the weather, the management) and write to a shared summary, so that a change in one place reaches all of them. The layers belong to two groups: those that \emph{read} the archived results of the ten-thousand Daisy simulations (control, mulch, structure, loops) and those that \emph{compute} with an engine (the field balance, the seasonal data, the crops, the designs, the phenotyping). The application also contains the \emph{Daisy workbench}, in which a user plans and reads a Daisy experiment. This chapter tours the layers in the order of the project tree; each section gives the background of the question, the main relation the layer uses, and one number reproduced by hand. The following chapters take each family to depth.")
b+=sec('Irrigation design: surface, drip and sprinkler')
b+=P(r"The design layer takes a soil, a crop and a field and returns a system that can irrigate it: for surface irrigation the inflow, the advance and the cut-off time; for drip the emitter, the lateral and the wetted bulb; for sprinklers the nozzle, spacing and pressure; for all of them the main pipe and the pump. Its first relation is the \kw{system capacity}: to apply a net depth $d$ over an area $A$ in $T$ days of $h$ working hours each, with application efficiency $E_a$,",
 eqn(r"Q=\frac{10\,A\,d}{E_a\,T\,h}\quad(\mathrm{m^3\,h^{-1}};\ A\ \text{in ha},\ d\ \text{in mm}).\label{eq:cap7}"))
Qc=10*40*45/(0.75*10*20)
b+=ex(r"A 40-ha maize field must receive a net 45 mm in 10 days, working 20 h per day, with sprinklers of $E_a=0.75$. Find the system capacity in m$^3$\,h$^{-1}$ and in L\,s$^{-1}$.",
 r"$Q=10\times40\times45/(0.75\times10\times20)=%.0f$ m$^3$\,h$^{-1}$ $=%.1f$ L\,s$^{-1}$ \ans That is the flow to be carried by the mainline and delivered by the pump (Chapter~6); at 60 L\,s$^{-1}$ per block it needs %.1f blocks working at once."%(Qc,Qc/3.6,Qc/3.6/60),'System capacity')
b+=sec('Irrigation control: sensor and trigger')
b+=P(r"The control layer plays a season of soil water and shows when a sensor at a chosen depth passes the trigger. The soil column is a daily model; the sensor reads the suction from the retention curve; the trigger is a suction or a depletion. The numbers that come out are the days beyond the trigger, the irrigation applied and the yield, taken for each soil and trigger from the archived experiments (Chapter~3). A simple version of the same logic can be run by hand with a depletion model.")
Zn,ET=30.0,5.0;seas=100
irr=seas//(Zn/ET)
b+=ex(r"A crop uses 5 mm\,d$^{-1}$ for 100 days from a root zone with RAW = 30 mm refilled at each irrigation. How many irrigations are triggered, and what is the net water applied?",
 r"The interval is $30/5=6$ d; irrigations on days 6, 12, \dots, 96: $\lfloor100/6\rfloor=%d$ irrigations \ans Net water $=%d\times30=%d$ mm \ans The remaining 4 days draw the store down by 20 mm, which is the end-of-season depletion."%(irr,irr,irr*30),'Count of irrigations')
b+=sec('Mulch and evaporation')
b+=P(r"A mulch lowers the vapour flux from the soil by the \emph{strength} $s$ (the fraction by which the flux is reduced) and holds a depth of rain, the \emph{capacity} $c$, that evaporates from the mulch itself. The layer reads the Daisy experiments over strength, rain and capacity and shows the evaporation, drainage, irrigation and yield of the mulched run against the bare one, and the fate of the water saved (Chapter~9). To first order, the evaporation from a mulched soil is $E_m\approx(1-s)E_s+E_{int}$, with $E_{int}=\sum\min(P_j,c)$ over the rain events.")
Es=180;s=0.6;c=2.0;ev=35
Em=(1-s)*Es+ev*c
b+=ex(r"Bare-soil evaporation is 180 mm per season. A mulch with strength 0.6 and capacity 2 mm meets 35 rain events of more than 2 mm. Estimate the evaporation of the mulched soil and the apparent saving.",
 r"$E_m=(1-0.6)\times180+35\times2=72+70=%.0f$ mm; apparent saving $180-%.0f=%.0f$ mm \ans The interception of the mulch gives back %.0f per cent of the saving of 108 mm, which is why a mulch of large capacity saves less than its strength suggests."%(Em,Em,Es-Em,100*ev*c/108),'Evaporation from a mulched soil')
b+=sec('Soil structure and tillage')
b+=P(r"Tillage loosens the topsoil (lowers the bulk density, raises the porosity and the conductivity) and the soil then consolidates with time and rain. The layer shows the effect of tillage (conventional, reduced, none) and of the consolidation rate on drainage, evaporation and yield (Chapter~9). A simple model: the bulk density relaxes exponentially, $\rho_b(t)=\rho_\infty-(\rho_\infty-\rho_0)e^{-kt}$, and the saturated conductivity scales with the Kozeny--Carman factor $K_s\propto\phi^3/(1-\phi)^2$.")
rb0,rbi=1.15,1.45;kk=0.02
def Kfac(rb): ph=1-rb/2.65;return ph**3/(1-ph)**2
rows=[(t,rbi-(rbi-rb0)*math.exp(-kk*t)) for t in (0,30,60,120,240)]
b+=ex(r"After ploughing, $\rho_b=1.15$ Mg\,m$^{-3}$ and it relaxes towards $1.45$ with $k=0.02$ d$^{-1}$. Find $\rho_b$ at 0, 30, 60, 120 and 240 days and the relative saturated conductivity $K_s(t)/K_s(0)$ ($\rho_s=2.65$).",
 '; '.join(r"$t=%d$: $\rho_b=%.3f$, $K_s/K_{s0}=%.3f$"%(t,r,Kfac(r)/Kfac(rb0)) for t,r in rows)+r" \ans The conductivity of the tilled layer falls to about a third within the first two months, which is the reason the benefit of tillage on drainage is short.",'Consolidation after tillage')
b+=sec('Phenotyping: the deterministic plant and the volumetric scan')
b+=P(r"The two phenotyping layers grow a plant by a deterministic crop model and then scan it with a virtual camera rig to measure its traits (Chapter~10). The traits are height, crown size, volume, leaf area and biomass. A convenient geometric model of a plant is an ellipsoid of semi-axes $a$, $a$ (horizontal) and $b$ (vertical): volume $V=\frac43\pi a^2b$, and the leaf area index of the ground area $A_g=\pi a^2$ is $\mathrm{LAI}=\mathrm{LA}/A_g$ with LA the leaf area.")
a_,b_=0.35,0.9/2
b+=ex(r"A plant of height $H=0.9$ m has a crown of horizontal radius 0.35 m and is modelled as an ellipsoid. Find its volume and, if its leaf area is 0.85 m$^2$, the LAI of the ground area it covers.",
 r"Semi-axes $a=0.35$ m, $b=H/2=0.45$ m: $V=\frac43\pi\times0.35^2\times0.45=%.3f$ m$^3$ \ans Ground area $A_g=\pi a^2=%.3f$ m$^2$, so $\mathrm{LAI}=0.85/%.3f=%.2f$ \ans"%(4/3*math.pi*a_*a_*b_,math.pi*a_*a_,math.pi*a_*a_,0.85/(math.pi*a_*a_)),'Volume and LAI of a plant')
b+=sec('Field water balance')
b+=P(r"The field-balance layer runs the daily bucket (Chapter~8): the depletion $D_r$ of the root zone is updated each day, $D_{r,i}=D_{r,i-1}-P_i-I_i+ET_{a,i}+D_{p,i}$, with deep percolation $D_{p}=\max(0,P+I-ET_a-D_{r,i-1})$ when the soil is refilled beyond field capacity, and $ET_a=K_sK_cET_0$.")
Dr=40.;TAW=120;RAW=60;ET0=[5,5.5,6,6,5.5,5,4.5];Kc=1.1;Prn=[0,0,0,12,0,0,0]
rowsd=[]
for i,(e0,pr) in enumerate(zip(ET0,Prn),1):
    Ks=1 if Dr<=RAW else (TAW-Dr)/(TAW-RAW);eta=Ks*Kc*e0;Dn=Dr-pr+eta;Dp=0
    if Dn<0:Dp=-Dn;Dn=0
    rowsd.append([i,e0,pr,'%.2f'%Ks,'%.2f'%eta,'%.1f'%Dn]);Dr=Dn
b+=tabl(['Day','$ET_0$','Rain','$K_s$','$ET_a$','$D_r$ end'],rowsd,'One week of the daily bucket: TAW = 120 mm, RAW = 60 mm, $K_c=1.1$, initial depletion 40 mm; all in mm.','rrrrrr')
b+=P(r"Day by day the depletion grows by the actual evapotranspiration; the rain of 12 mm on day 4 lowers it; and as $D_r$ approaches RAW the stress factor $K_s$ starts to fall below 1. Seven days after the start the depletion is "+rowsd[-1][5]+r" mm: the crop is %s the readily available water."%('beyond' if float(rowsd[-1][5])>60 else 'within'))
b+=sec('Seasonal data and projections')
b+=P(r"The seasonal layers summarise a year of weather and the water balance as charts and tables, and project them forward by a rate of warming and of rainfall change per decade. A projection to the year $y$ after the record applies $\Delta T=r_T\,y/10$ and $P\to P(1+r_P\,y/10)$; the reference evapotranspiration rises by about 2 to 4 per cent per $^\circ$C of warming in humid climates. The aridity index $AI=P/ET_0$ classifies the climate: below 0.2 is arid, 0.2--0.5 semi-arid, 0.5--0.65 dry sub-humid, above 0.65 humid.")
b+=ex(r"A site has $P=560$ mm and $ET_0=1\,120$ mm. The projection is $+0.3$ $^\circ$C and $-2$ per cent rainfall per decade. Find the aridity index now and after 30 years if $ET_0$ rises 3 per cent per $^\circ$C.",
 r"Now: $AI=560/1120=0.50$ (dry sub-humid, at the limit with semi-arid). After 30 years: $\Delta T=0.9$ $^\circ$C; $ET_0=1120\times(1+0.03\times0.9)=%.0f$ mm; $P=560\times(1-0.02\times3)=%.0f$ mm; $AI=%.3f$ \ans The climate moves to the semi-arid class, and the net irrigation requirement rises by about %.0f per cent for a crop of $ET_c\approx0.9ET_0$."%(1120*1.027,560*0.94,560*0.94/(1120*1.027),100*((1120*1.027*0.9-560*0.94*0.7)/(1120*0.9-560*0.7)-1)),'Aridity index and projection')
b+=sec('Crops and the crop water requirement')
b+=P(r"The crop layer holds the library of 48 crops (Chapter~5) and computes, for a crop, a soil and a climate, the seasonal $ET_c$, the net and gross irrigation requirement, the water productivity and the water footprint. The water productivity is $WP=Y/ET_a$ (kg of yield per m$^3$ of water evapotranspired); typical values are 1.2--2.0 kg\,m$^{-3}$ for maize grain and 0.8--1.2 for wheat.")
b+=ex(r"Maize yields 10.8 Mg\,ha$^{-1}$ with $ET_a=560$ mm; wheat yields 6.4 Mg\,ha$^{-1}$ with $ET_a=420$ mm. Compare their water productivities.",
 r"Maize: $WP=10\,800/5\,600=%.2f$ kg\,m$^{-3}$; wheat: $6\,400/4\,200=%.2f$ kg\,m$^{-3}$ \ans Maize gets more grain per cubic metre of water, as a C4 crop does."%(10800/5600,6400/4200),'Water productivity')
b+=sec('Feedback loops')
b+=P(r"The loops layer draws the links between climate, management, soil water, crop and nitrogen as arrows, and runs the Daisy results around them: more irrigation raises the soil water, which raises transpiration and yield but also drainage and nitrogen leaching; a mulch lowers evaporation, which raises the store and so drainage. A loop has a sign (positive if it reinforces, negative if it balances) equal to the product of the signs of its arrows. The nitrogen lost by leaching is $L_N=D\,c_N$ with $D$ the drainage and $c_N$ the concentration of nitrate in the drainage water.")
b+=ex(r"An extra 120 mm of irrigation raises drainage by 30 mm. The drainage water carries 18 mg\,L$^{-1}$ of nitrate-nitrogen. Find the extra nitrogen lost per hectare and the sign of the loop irrigation $\to$ drainage $\to$ nitrogen loss $\to$ yield.",
 r"$L_N=30\,\mathrm{mm}\times18\,\mathrm{mg\,L^{-1}}=30\,\mathrm{L\,m^{-2}}\times0.018\,\mathrm{g\,L^{-1}}=0.54$ g\,m$^{-2}=5.4$ kg\,ha$^{-1}$ \ans Signs: irrigation $\to$ drainage $(+)$; drainage $\to$ nitrogen loss $(+)$; nitrogen loss $\to$ yield $(-)$; the product is negative, so the loop is a \emph{balancing} loop: the extra water that the crop does not use removes the nitrogen that it needs.",'Nitrogen lost with drainage')
b+=sec('The Daisy model in the application')
b+=P(r"The last branch of the project tree is the Daisy workbench, with which a user chooses a Daisy experiment from a ready list or builds one, runs the combinations, reads the results in tables and charts and exports them (Chapters~2 and~8). The experiments of this book are read from the archive of 10\,190 runs; the workbench itself runs on any Daisy installation. The workbench teaches the \emph{logic of an experiment}: a base case, a set of factors with levels, the full factorial of their combinations, and a response. For $k$ factors with $L_i$ levels the number of runs is $\prod L_i$; main effects are the differences of the mean response between levels, and interactions are the departures from additivity.")
b+=ex(r"A design has three factors: soil (3 levels), mulch strength (3 levels) and rain scale (2 levels). Find the number of runs. In the table of mean yield (Mg\,ha$^{-1}$): mulch 0 = 6.1, mulch 0.5 = 6.5, mulch 1.0 = 6.8; find the main effect of the strongest mulch against none and its relative size.",
 r"Runs $=3\times3\times2=18$ \ans Main effect $=6.8-6.1=0.7$ Mg\,ha$^{-1}$ \ans Relative $=0.7/6.1=11.5$ per cent \ans")
write(k,'bg',b)
# integrated project
ETc=5.6;A=40;Zn=0.5*140*0.9 if False else 60;Ea=0.75;T=10;hh=20
RAWm=0.5*2*0+60
p='\\banner{Design project 7: a complete design for a 40-ha maize farm, layer by layer}\n'
p+=P(r"\textbf{Brief.} A farm of 40 ha on loam (S06) grows maize. The weather is that of a semi-arid summer, with a peak $ET_0$ of 7 mm\,d$^{-1}$. The farmer asks for a sensor-controlled sprinkler system with a trigger, a pipe and a pump. This project chains the layers of the application: the crop and weather layer gives the demand, the soil and control layers the dose and the interval, the design layer the capacity, and the pipe and the pump follow. Every step of the table is computed by hand.")
rows=[]
Kcm=1.20;ET0pk=7.0;ETcp=Kcm*ET0pk
Rz=0.9;AWC=1.7;TAW=AWC*10*Rz*100/10*1.0
TAWv=1.7*90;RAWv=0.5*TAWv;Tint=RAWv/ETcp;Zg=RAWv/Ea;Qs=10*A*RAWv/(Ea*(math.floor(Tint))*hh);Qls=Qs/3.6
Dp=0.2;vv=4*(Qls/1000)/(math.pi*Dp**2);hfm=10.67*800*(Qls/1000)**1.852/(140**1.852*Dp**4.871);H=35+hfm;Pk=9810*(Qls/1000)*H/0.65/1000
rows=[['Crop','$K_{c,mid}\\,ET_{0,peak}$','$1.20\\times7.0=%.1f$ mm/d'%ETcp],['Soil','TAW $=1.7\\times90$','%.0f mm'%TAWv],['Control','RAW $=0.5\\,$TAW','%.0f mm'%RAWv],['Control','Interval $=RAW/ET_c$','%.1f d $\\to$ %d d'%(Tint,math.floor(Tint))],['Design','Gross depth $RAW/0.75$','%.0f mm'%Zg],['Design','Capacity $10Ad/(E_aTh)$','%.0f m$^3$/h = %.1f L/s'%(Qs,Qls)],['Pipe','Velocity in $D=200$ mm','%.2f m/s'%vv],['Pipe','$h_f$ (800 m, $C=140$)','%.1f m'%hfm],['Pump','Head $35+h_f$','%.1f m'%H],['Pump','Power $\\rho gQH/0.65$','%.1f kW'%Pk]]
p+=tabl(['Layer','Quantity','Result'],rows,'The chain of the design: each line uses the result above it.','lll')
p+=P(r"\textbf{Reading.} The soil can store %.0f mm of readily available water, which a crop at the peak demand of %.1f mm\,d$^{-1}$ uses in %.1f days; the cycle is therefore %d days. A gross depth of %.0f mm every %d days on 40 ha, applied in 20 h per day, calls for %.1f L\,s$^{-1}$. In a 200 mm mainline this flow runs at %.2f m\,s$^{-1}$ (%s the limit of 1.5) and loses %.1f m of head, so the pump has to give %.1f m and draws %.1f kW."%(RAWv,ETcp,Tint,math.floor(Tint),Zg,math.floor(Tint),Qls,vv,'above' if vv>1.5 else 'within',hfm,H,Pk),
 r"\textbf{Sensitivity.} If the system efficiency falls from 0.75 to 0.65 (a worn sprinkler package), the capacity rises by $0.75/0.65-1=%.0f$ per cent and the friction loss by about $(1.154)^{1.852}-1=%.0f$ per cent, so the pump power grows by about %.0f per cent: an efficiency lost in the field is paid for in the pump house."%(100*(0.75/0.65-1),100*(1.154**1.852-1),100*(1.154*(1.154**1.852)*0.5+0.5*1.154-1)))
write(k,'proj',p)
exl=[]
exl.append((r"Find the capacity of a system for 25 ha, net depth 40 mm, $E_a=0.8$, 8 days, 18 h per day.","%.0f m$^3$ h$^{-1}$"%(10*25*40/(0.8*8*18))))
exl.append((r"RAW = 45 mm and $ET_c=6.4$ mm\,d$^{-1}$. Find the interval.","%.1f d"%(45/6.4)))
exl.append((r"Evaporation from bare soil is 150 mm. A mulch of strength 0.5 and capacity 1.5 mm meets 30 events. Find $E_m$.","%.0f mm"%(0.5*150+30*1.5)))
exl.append((r"$\rho_b$ relaxes from 1.20 to 1.50 with $k=0.015$ d$^{-1}$. Find $\rho_b$ at 100 d.","%.3f Mg m$^{-3}$"%(1.5-0.3*math.exp(-1.5))))
exl.append((r"An ellipsoidal plant has $a=0.4$, $b=0.6$ m. Find its volume.","%.3f m$^3$"%(4/3*math.pi*0.16*0.6)))
exl.append((r"With $D_r=70$ mm, TAW = 120, RAW = 60, find $K_s$.","%.2f"%((120-70)/(120-60))))
exl.append((r"$P=450$, $ET_0=1\,050$ mm. Find AI and its class.","%.2f; semi-arid"%(450/1050)))
exl.append((r"Wheat yields 5.2 Mg\,ha$^{-1}$ with $ET_a=380$ mm. Find WP.","%.2f kg m$^{-3}$"%(5200/3800)))
exl.append((r"Drainage rises 45 mm at 15 mg\,L$^{-1}$ nitrate-N. Find the extra N loss (kg\,ha$^{-1}$).","%.2f kg/ha"%(45*15/100)))
exl.append((r"A factorial of four factors with 3, 2, 4 and 2 levels: how many runs?","48"))
write(k,'ex',exercises(exl))
write(k,'dyk',dyk([r"What is a layer of the application, and which layers compute rather than read?",r"State the system capacity formula and its terms.",r"How does a mulch change evaporation, and why is the saving smaller than the strength suggests?",r"Why does the benefit of tillage on drainage decline with time?",r"Explain the daily bucket in words.",r"How is the aridity index used?",r"What is water productivity?",r"What is the sign of a balancing loop?"]))
write(k,'obj',obj([
 (r"The system capacity $Q=10Ad/(E_aTh)$ is in",["L/s","m$^3$/h","mm","ha"],1),
 (r"A mulch's strength is",["its capacity","the fraction by which it lowers vapour flux","its thickness","its price"],1),
 (r"The bulk density after tillage",["stays low","relaxes to a higher value","falls","is zero"],1),
 (r"$AI<0.2$ is",["humid","arid","semi-arid","sub-humid"],1),
 (r"WP is yield divided by",["rainfall","$ET_a$","area","runoff"],1),
 (r"A balancing loop has a",["positive product of signs","negative product of signs","zero signs","no arrows"],1),
 (r"Layers that read archived results include",["control and mulch","design only","none","phenotyping only"],0),
 (r"The number of runs of a factorial is the",["sum of levels","product of levels","maximum level","mean level"],1),
 (r"In the daily bucket, deep percolation occurs when",["the soil is below wilting","the root zone is refilled beyond field capacity","it is dark","there is no rain"],1),
 (r"An ellipsoid of semi-axes $a,a,b$ has volume",[r"$\frac43\pi a^2b$",r"$\pi a^2b$",r"$2\pi ab$",r"$\frac13\pi ab$"],0)]))
print('ok7')
