from h import *
k=5
lead(k,"compute reference evapotranspiration by the Penman--Monteith equation; build a crop coefficient curve from the four growth stages; split evaporation into its two stages and compute the duration of stage 1; write the yield response to water stress; compute the net and gross irrigation requirement of a season; and read the crop library of the application.")
CROPS={'Maize':(0.30,1.20,0.60,(15,30,40,20),1.5,135,0.50,1.28),'Wheat':(0.40,1.15,0.41,(20,30,45,25),0.9,150,0.50,1.05),'Tomato':(0.60,1.10,1.00,(30,40,40,25),0.6,120,0.40,1.20),'Potato':(0.50,1.10,0.40,(25,30,45,30),0.6,60,0.40,1.10),'Onion':(0.70,1.05,0.70,(15,25,70,40),0.5,60,0.30,1.18),'Soybean':(0.40,1.10,0.50,(20,30,45,25),0.8,95,0.50,1.07)}
def kc_t(c,t):
    ki,km,ke,(L1,L2,L3,L4)=c[0],c[1],c[2],c[3]
    if t<L1: return ki
    if t<L1+L2: return ki+(km-ki)*(t-L1)/L2
    if t<L1+L2+L3: return km
    return km+(ke-km)*min(1,(t-L1-L2-L3)/L4)
def PM(Tm,Tx,Tn,Rn,u2,RH,z=100.,G=0.):
    es=(0.6108*math.exp(17.27*Tx/(Tx+237.3))+0.6108*math.exp(17.27*Tn/(Tn+237.3)))/2;ea=es*RH/100
    D=4098*0.6108*math.exp(17.27*Tm/(Tm+237.3))/(Tm+237.3)**2;P=101.3*((293-0.0065*z)/293)**5.26;g=0.000665*P
    return (0.408*D*(Rn-G)+g*900/(Tm+273)*u2*(es-ea))/(D+g*(1+0.34*u2)),es,ea,D,g
et0,es,ea,D,g=PM(24.0,31.0,17.0,14.5,2.0,55)
b=''
b+=sec('Introduction: the water that a crop uses')
b+=P(r"A growing crop returns most of the water that reaches its root zone to the atmosphere, by \kw{transpiration} through its leaves and by \kw{evaporation} from the soil and from wet surfaces; the two together are \kw{evapotranspiration} (ET). ET is the largest outflow of the water balance of Chapter~1, it fixes the quantity of water that an irrigation system must supply, and it is the flux that a mulch or a trigger can change. It is driven by energy (the sun evaporates the water) and limited by supply (a dry soil cannot yield it). The standard method, developed by the FAO, separates these two aspects: the \emph{atmospheric demand} is expressed by a reference evapotranspiration $ET_0$ computed from weather alone; the \emph{crop} is expressed by a coefficient $K_c$ that scales $ET_0$ to its own demand $ET_c=K_cET_0$; and the \emph{stress} of a dry soil is a further factor $K_s\le1$ so that the actual rate is $ET_a=K_sK_cET_0$.")
b+=sec('Reference evapotranspiration: the Penman--Monteith equation')
b+=P(r"The reference crop is a hypothetical grass of 0.12 m, with a fixed surface resistance of 70 s\,m$^{-1}$ and an albedo of 0.23, well watered and covering the ground. The FAO Penman--Monteith equation for a daily time step is",
 eqn(r"ET_0=\frac{0.408\,\Delta\,(R_n-G)+\gamma\dfrac{900}{T+273}\,u_2\,(e_s-e_a)}{\Delta+\gamma\,(1+0.34\,u_2)},\label{eq:pm}"),
 r"where $R_n$ is the net radiation (MJ\,m$^{-2}$\,d$^{-1}$), $G$ the soil heat flux (about zero daily), $T$ the mean temperature ($^\circ$C), $u_2$ the wind speed at 2 m (m\,s$^{-1}$), $e_s-e_a$ the vapour-pressure deficit (kPa), $\Delta$ the slope of the saturation vapour-pressure curve (kPa\,$^\circ$C$^{-1}$) and $\gamma$ the psychrometric constant (kPa\,$^\circ$C$^{-1}$). The first term of the numerator is the \emph{radiation} term, the second the \emph{aerodynamic} term; in humid climates the first dominates, in arid windy ones the second. Simpler equations (Hargreaves, Priestley--Taylor, pan evaporation with a pan coefficient) are used when data are missing; they are calibrated against Penman--Monteith.")
b+=ex(r"Compute $ET_0$ for a summer day at 100 m altitude: $T_{max}=31$, $T_{min}=17$ $^\circ$C ($T=24$), $R_n=14.5$ MJ\,m$^{-2}$\,d$^{-1}$, $u_2=2.0$ m\,s$^{-1}$, mean relative humidity 55 \%.",
 r"Saturation vapour pressures: $e^\circ(31)=%.3f$, $e^\circ(17)=%.3f$, so $e_s=%.3f$ kPa and $e_a=0.55e_s=%.3f$ kPa; deficit $%.3f$ kPa. $\Delta=4098\times0.6108\,e^{17.27\cdot24/(24+237.3)}/(24+237.3)^2=%.4f$. Pressure $P=101.3[(293-0.0065\times100)/293]^{5.26}=%.1f$ kPa, $\gamma=0.000665P=%.4f$. Numerator: $0.408\times%.4f\times14.5=%.3f$; $\gamma(900/297)\times2.0\times%.3f=%.3f$; sum $%.3f$. Denominator: $%.4f+%.4f(1+0.68)=%.4f$. $ET_0=%.2f$ mm\,d$^{-1}$ \ans The radiation term gives %.1f mm and the aerodynamic term %.1f mm of the total."%(0.6108*math.exp(17.27*31/(31+237.3)),0.6108*math.exp(17.27*17/(17+237.3)),es,ea,es-ea,D,101.3*((293-0.65)/293)**5.26,g,D,0.408*D*14.5,es-ea,g*900/297*2*(es-ea),0.408*D*14.5+g*900/297*2*(es-ea),D,g,D+g*1.68,et0,0.408*D*14.5/(D+g*1.68),g*900/297*2*(es-ea)/(D+g*1.68)),'Penman--Monteith for a summer day')
b+=sec('The crop coefficient and the four growth stages')
b+=P(r"The crop coefficient $K_c$ changes through the season with the cover of the canopy. The season is divided into four stages: \emph{initial} (germination and early growth, length $L_1$, $K_c=K_{c,ini}$ nearly constant), \emph{development} ($L_2$, $K_c$ rises linearly to $K_{c,mid}$), \emph{mid-season} ($L_3$, $K_c=K_{c,mid}$) and \emph{late season} ($L_4$, $K_c$ falls linearly to $K_{c,end}$). The crop library of the application holds $K_{c,ini}$, $K_{c,mid}$, $K_{c,end}$, the four lengths, the maximum height $h$, the rooting depth $R_{max}$, the depletion fraction $p$ and the yield-response factor $K_y$ for 48 crops. Table~\ref{tab:crops5} shows six of them.")
rows=[[n,v[0],v[1],v[2],'%d+%d+%d+%d = %d'%(v[3]+(sum(v[3]),)),v[4],v[5],v[6],v[7]] for n,v in CROPS.items()]
b+=tabl(['Crop','$K_{c,ini}$','$K_{c,mid}$','$K_{c,end}$','Stage lengths (d)','$h$ (m)','$R_{max}$ (cm)','$p$','$K_y$'],rows,'Six crops of the library: coefficients, stage lengths, height, rooting depth, depletion fraction and yield-response factor.','lrrrlrrrr')
c=CROPS['Maize']
b+=ex(r"For maize (Table~\ref{tab:crops5}), compute $K_c$ on days 10, 30, 60, 90 and 110 after sowing and $ET_c$ if $ET_0=5.5$ mm\,d$^{-1}$ on each of those days.",
 '; '.join(r"day %d: $K_c=%.3f$, $ET_c=%.2f$ mm"%(d,kc_t(c,d),5.5*kc_t(c,d)) for d in (10,30,60,90,110))+r" \ans Day 10 is in the initial stage ($K_c=0.30$); day 30 in development (interpolated between 0.30 at day 15 and 1.20 at day 45: $0.30+0.90\times15/30=0.75$); 60 and 90 are in mid-season (1.20) and 110 is in late season: $1.20-0.60\times(110-85)/20$ is clipped at the end value 0.60 after day 105.",'Maize coefficient through the season')
b+=sec('Evaporation from the soil: stages 1 and 2')
b+=P(r"Soil evaporation follows two stages after a wetting (Ritchie, 1972). In \kw{stage 1} the surface is wet and the evaporation is limited by energy: it proceeds at the potential rate $E_p$ until the cumulative evaporation reaches $U$, the stage-1 capacity (about 5--12 mm, small in sand and large in clay). In \kw{stage 2} the surface layer has dried, evaporation is limited by the conductivity of the soil and falls as the square root of the time since stage 1 ended: $E(t)=\beta\,[\sqrt{t}-\sqrt{t-1}]$ per day, with $\beta$ a soil constant. The duration of stage 1 is $t_1=U/E_p$. A mulch lowers $E_p$ and hence lengthens stage 1 but also reduces the loss of stage 2; Chapter~9 treats it in detail. The two coefficients $K_e$ (evaporation) and $K_{cb}$ (basal, transpiration) of the dual-$K_c$ method split $K_c$ accordingly.")
b+=ex(r"The stage-1 capacity of a loam is $U=9$ mm and the potential evaporation is $E_p=4.5$ mm\,d$^{-1}$ in a hot week and 1.8 mm\,d$^{-1}$ in a cool one. Find the length of stage 1 in each, and the cumulative evaporation after 10 days in the hot week if $\beta=3.5$ mm\,d$^{-1/2}$.",
 r"$t_1=U/E_p$: hot week $9/4.5=2.0$ d; cool week $9/1.8=5.0$ d \ans After 10 days in the hot week: stage 1 gave 9 mm in 2 d; stage 2 lasts 8 d and gives $\beta\sqrt{8}=3.5\times2.83=%.1f$ mm; total $=%.1f$ mm \ans"%(3.5*math.sqrt(8),9+3.5*math.sqrt(8)),'Duration of stage 1')
b+=sec('Water stress and yield response')
b+=P(r"When the soil is drier than the allowed depletion the crop closes its stomata, transpires less than the demand and yields less. The FAO relation (Doorenbos and Kassam) relates the relative yield loss to the relative evapotranspiration deficit:",
 eqn(r"1-\frac{Y_a}{Y_m}=K_y\Bigl(1-\frac{ET_a}{ET_c}\Bigr),\label{eq:ky}"),
 r"with $K_y$ the yield-response factor: above 1 for crops that are sensitive to water (maize, 1.28; tomato, 1.20), below 1 for tolerant ones (sorghum, 0.90; groundnut, 0.70). The stress coefficient, within the daily model, is $K_s=(TAW-D_r)/[(1-p)TAW]$ once $D_r>p\,TAW=RAW$, and 1 before.")
b+=ex(r"A maize crop with $ET_c=520$ mm in the season gets $ET_a=430$ mm because irrigation was short. Find the relative yield and the yield if $Y_m=11.5$ Mg\,ha$^{-1}$. What is the yield of a tolerant crop with $K_y=0.7$ for the same deficit?",
 r"Relative deficit $1-430/520=%.3f$. Maize: $1-Y_a/Y_m=1.28\times%.3f=%.3f$, so $Y_a/Y_m=%.3f$ and $Y_a=%.2f$ Mg\,ha$^{-1}$ \ans Tolerant crop: $1-0.7\times%.3f=%.3f$, so a loss of %.1f per cent against %.1f per cent for maize."%(1-430/520,1-430/520,1.28*(1-430/520),1-1.28*(1-430/520),11.5*(1-1.28*(1-430/520)),1-430/520,1-0.7*(1-430/520),100*0.7*(1-430/520),100*1.28*(1-430/520)),'Yield loss from a deficit')
write(k,'bg',b)
# project: seasonal irrigation requirement of a maize field
ET0=[3.8,4.9,5.6,5.9,5.2,4.1]  # monthly mean mm/d for 6 months (May..Oct)
Pm=[68,52,31,24,45,64]
days=[31,30,31,31,30,31]
# weekly via month: Kc at mid month day of season (sowing 1 May)
rows=[];tot=0;totr=0;mid=0;cum=0
for i,(e0,pr,dd) in enumerate(zip(ET0,Pm,days)):
    dmid=cum+dd/2;kc=kc_t(CROPS['Maize'],dmid);etc=kc*e0*dd;peff=0.8*pr if pr<75 else 0.8*75
    nir=max(0,etc-peff);rows.append([['May','Jun','Jul','Aug','Sep','Oct'][i],e0,'%.2f'%kc,'%.0f'%etc,pr,'%.0f'%peff,'%.0f'%nir]);tot+=etc;totr+=nir;mid+=peff;cum+=dd
p='\\banner{Design project 5: seasonal irrigation requirement of a maize field}\n'
p+=P(r"\textbf{Brief.} A maize crop is sown on 1 May on a loam. Monthly reference evapotranspiration and rainfall are given in Table~\ref{tab:nir5}. The task is to find the monthly crop evapotranspiration, the effective rainfall, the net irrigation requirement, the gross requirement for a sprinkler system (efficiency 75 per cent) and a drip system (90 per cent), the volume for a field of 30 ha, and the yield if the farmer supplies only 70 per cent of the net requirement.",
 r"\textbf{Method.} $K_c$ is evaluated at the middle day of each month; $ET_c=K_cET_0\times$days; effective rainfall is taken as 80 per cent of the monthly rain (capped at 60 mm); net irrigation requirement $NIR=\max(0,ET_c-P_{eff})$; gross $GIR=NIR/E_a$.")
p+=tabl(['Month','$ET_0$ (mm/d)','$K_c$','$ET_c$ (mm)','Rain (mm)','$P_{eff}$ (mm)','NIR (mm)'],rows,'Monthly computation of the net irrigation requirement of maize.')
ETc=tot;NIR=totr;Gs=NIR/0.75;Gd=NIR/0.90;vol_s=Gs*30*10;vol_d=Gd*30*10;etaf=(0.7*NIR+mid)/ETc;Yr=1-1.28*(1-etaf)
p+=P(r"\textbf{Season totals.} $ET_c=%.0f$ mm, effective rain $=%.0f$ mm, net requirement $NIR=%.0f$ mm. A sprinkler system with $E_a=0.75$ needs $%.0f$ mm gross, which over 30 ha is $%.0f$ m$^3$ ($%.0f$ thousand m$^3$); a drip system with $E_a=0.90$ needs $%.0f$ mm and $%.0f$ m$^3$, a saving of %.0f per cent of the water of the sprinkler system."%(ETc,mid,NIR,Gs,vol_s,vol_s/1000,Gd,vol_d,100*(1-Gd/Gs)),
 r"\textbf{Deficit irrigation.} If only 70 per cent of $NIR$ is applied, $ET_a\approx0.7NIR+P_{eff}=%.0f$ mm and $ET_a/ET_c=%.3f$; by Equation~(\ref{eq:ky}) with $K_y=1.28$, the relative yield is $1-1.28\times(1-%.3f)=%.3f$, a loss of %.1f per cent of a yield for a saving of %.0f m$^3$ of water on the 30 ha (sprinkler). The decision between full and deficit irrigation then depends on the price of water against the price of grain; the break-even price ratio is the loss in yield value per cubic metre saved."%(0.7*NIR+mid,etaf,etaf,Yr,100*(1-Yr),0.3*Gs*30*10*0.75/0.75*1.0*0+0.3*Gs*300))
write(k,'proj',p)
exl=[]
exl.append((r"Find $e_s$ for $T_{max}=28$, $T_{min}=14$ and $e_a$ for RH = 60 \%.","%.3f kPa; %.3f kPa"%((0.6108*math.exp(17.27*28/(28+237.3))+0.6108*math.exp(17.27*14/(14+237.3)))/2,0.6*(0.6108*math.exp(17.27*28/(28+237.3))+0.6108*math.exp(17.27*14/(14+237.3)))/2)))
exl.append((r"Compute $ET_0$ for $T_m=20$, $T_x=26$, $T_n=14$, $R_n=11$, $u_2=1.5$, RH = 65 \%, altitude 100 m.","%.2f mm d$^{-1}$"%PM(20,26,14,11,1.5,65)[0]))
exl.append((r"Find $K_c$ for wheat on days 10, 35 and 100.",", ".join('%.2f'%kc_t(CROPS['Wheat'],d) for d in (10,35,100))))
exl.append((r"Find $ET_c$ of tomato at day 50 for $ET_0=6.0$.","%.2f mm d$^{-1}$"%(6*kc_t(CROPS['Tomato'],50))))
exl.append((r"If $U=7$ mm and $E_p=3.5$ mm\,d$^{-1}$, how long does stage 1 last?","2 d"))
exl.append((r"Cumulative stage-2 evaporation after 6 days with $\beta=3.0$ mm\,d$^{-1/2}$.","%.1f mm"%(3*math.sqrt(6))))
exl.append((r"$ET_c=480$, $ET_a=400$, $K_y=1.1$, $Y_m=9$ Mg\,ha$^{-1}$: find $Y_a$.","%.2f Mg ha$^{-1}$"%(9*(1-1.1*(1-400/480)))))
exl.append((r"A field of 12 ha has NIR = 340 mm and uses drip ($E_a=0.9$). Give the volume.","%.0f m$^3$"%(340/0.9*12*10)))
exl.append((r"Find the stress coefficient $K_s$ when TAW = 120 mm, $p=0.5$, $D_r=84$ mm.","%.2f"%((120-84)/(0.5*120))))
exl.append((r"Explain why $K_{c,end}$ is low for grain crops and high for fresh vegetables.","grain dries to maturity; fresh crops stay green"))
write(k,'ex',exercises(exl))
write(k,'dyk',dyk([r"What is the difference between $ET_0$, $ET_c$ and $ET_a$?",r"Name the two terms of the Penman--Monteith equation and when each dominates.",r"Describe the four stages of the $K_c$ curve.",r"What limits evaporation in stage 1 and in stage 2?",r"State the Doorenbos--Kassam yield relation and the meaning of $K_y$.",r"Why is the effective rainfall less than the rainfall?",r"How does a mulch change stage 1?",r"Why is a drip system more water-saving than a sprinkler system on the same crop?"]))
write(k,'obj',obj([
 (r"$ET_c$ is",[r"$K_cET_0$",r"$ET_0/K_c$",r"$K_c+ET_0$","$K_cK_s$"],0),
 (r"The reference crop is a",["well-watered grass of 0.12 m","bare soil","maize","forest"],0),
 (r"Stage 1 of soil evaporation is limited by",["soil conductivity","energy","roots","salt"],1),
 (r"Stage 2 evaporation falls as",["the square root of time","the square of time","a constant","a step"],0),
 (r"$K_y>1$ means the crop is",["tolerant of stress","sensitive to stress","dead","a tree only"],1),
 (r"The development stage has $K_c$",["constant","rising linearly","falling","zero"],1),
 (r"The effective rainfall is",["greater than the rain","part of the rain that the crop can use","the runoff","the drainage"],1),
 (r"Sprinkler efficiency of 0.75 means the gross requirement is NIR",["$\\times0.75$","$/0.75$","$-0.75$","$+0.75$"],1),
 (r"The psychrometric constant is about",["0.067 kPa/$^\\circ$C","6.7 kPa/$^\\circ$C","67 kPa/$^\\circ$C","0.0067 kPa/$^\\circ$C"],0),
 (r"In deficit irrigation the crop receives",["more than $ET_c$","less than $ET_c$","no water","only rain"],1)]))
print('ok5')
