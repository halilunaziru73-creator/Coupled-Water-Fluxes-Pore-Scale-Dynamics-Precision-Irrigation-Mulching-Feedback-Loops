from h import *
k=8
lead(k,"classify soil-water models and state the assumptions of the tipping-bucket model; compute runoff by the curve-number method; run a daily bucket by hand and by program; read the dashboard indicators of the application; and design the trigger of a season by comparing simulated seasons.")
b=''
b+=sec('Introduction: models of the soil water balance')
b+=P(r"Chapter~2 gave the physics of water flow in a soil: the Richards equation. For many purposes (scheduling, design, planning) that is more detail than needed, and a simpler model is used: the soil is a \emph{bucket} whose content changes each day by what comes in and what goes out. Models of the soil water balance can be ranked by their detail. The \emph{tipping bucket} has one store, refilled by rain and irrigation and emptied by evapotranspiration, and spills the excess as drainage. The \emph{cascading bucket} has several stores in series, each spilling to the next. The \emph{capacity models} add a rate of drainage that depends on the content. The \emph{mechanistic} models solve Richards' equation. The application uses two engines: Engine~1, which reproduces the relations of the Daisy ensemble by ratios, and Engine~2, a daily bucket with the FAO stress function; the dashboard presents their results as indicators.")
b+=sec('Assumptions and equations of the tipping bucket')
b+=P(r"The root zone is one layer of depth $Z_r$ with capacity $TAW$ between field capacity and wilting point. Each day $i$: (1) rain $P_i$ is reduced by interception and runoff to the infiltration $f_i$; (2) irrigation $I_i$ is added; (3) the actual evapotranspiration is $ET_{a,i}=K_{s,i}K_{c,i}ET_{0,i}$; (4) the depletion is updated and the excess over field capacity drains in the same day. The depletion is",
 eqn(r"D_i=\min\bigl\{TAW,\ \max\{0,\ D_{i-1}-f_i-I_i+ET_{a,i}\}\bigr\},\qquad DP_i=\max\{0,\ f_i+I_i-ET_{a,i}-D_{i-1}\},\label{eq:bucket8}"),
 r"with the stress coefficient $K_s=1$ for $D\le RAW$ and $K_s=(TAW-D)/(TAW-RAW)$ beyond it. The model assumes that drainage is instantaneous, that there is no capillary rise and that the root zone is homogeneous; these hold best for deep, freely drained soils.")
b+=sec('Runoff: the curve-number method')
b+=P(r"Rain that arrives faster than the soil can take it, or on a saturated soil, runs off. The \kw{curve-number} method of the US Soil Conservation Service estimates the direct runoff $Q$ from a storm of depth $P$ by",
 eqn(r"Q=\frac{(P-I_a)^2}{P-I_a+S},\quad I_a=0.2S,\quad S=\frac{25\,400}{CN}-254\ \ (\text{mm}),\ \ P>I_a,\label{eq:cn8}"),
 r"with the curve number $CN$ from 30 (very permeable, dry) to 100 (impervious). A cultivated loam in fair condition has $CN\approx75$ at average antecedent moisture, 87 when the soil is wet and 57 when dry.")
S=25400/75-254;Ia=0.2*S;Pp=60;Q=(Pp-Ia)**2/(Pp-Ia+S)
b+=ex(r"A storm of 60 mm falls on a loam with $CN=75$. Find $S$, $I_a$ and the runoff. How does the runoff change if the soil is wet ($CN=87$)?",
 r"$S=25400/75-254=%.1f$ mm; $I_a=0.2S=%.1f$ mm; $Q=(60-%.1f)^2/(60-%.1f+%.1f)=%.1f$ mm \ans For $CN=87$: $S=%.1f$, $I_a=%.1f$, $Q=%.1f$ mm \ans Wet soil converts %.0f per cent of the storm to runoff, against %.0f per cent when it is average."%(S,Ia,Ia,Ia,S,Q,25400/87-254,0.2*(25400/87-254),(60-0.2*(25400/87-254))**2/(60-0.2*(25400/87-254)+25400/87-254),100*(60-0.2*(25400/87-254))**2/(60-0.2*(25400/87-254)+25400/87-254)/60,100*Q/60),'Runoff of a storm')
b+=sec('A season of the bucket, by program')
b+=P(r"The bucket is easy to program, and a season can be run in a fraction of a second. The program of this book (and the engine of the application) reads a daily record of $ET_0$ and rain, builds $K_c(t)$ from the four stages, applies the irrigation rule (a trigger on depletion with a dose that refills to field capacity) and writes the totals: $ET_a$, irrigation, drainage, runoff and the relative yield from the Doorenbos--Kassam relation. The result of one season is a number of tables and charts; the design question is what the best trigger is. Section~\ref{sec:proj8} below compares triggers for a maize season.")
b+=sec('The dashboard of the application')
b+=P(r"The dashboard is the summary page of the application: one set of indicators read from the layers. The most important are (i) the \emph{irrigation} applied, (ii) the \emph{evapotranspiration} and its split into $T$, $E_s$ and $E_o$, (iii) the \emph{drainage} and the nitrogen it carries, (iv) the \emph{yield} and the \emph{water productivity} $WP=Y/ET_a$, (v) the \emph{irrigation efficiency} $IE=(ET_a-ET_{rain})/I$ (the share of the applied water that the crop transpired), and (vi) the \emph{closure} of the balance. Each indicator has a formula, and the chapter on the dashboard shows how every number is produced; here we compute two of them by hand.")
b+=ex(r"A season gives $P=380$, $I=240$, $ET_a=520$, $D=70$, $Q=10$ mm, yield 11.2 Mg\,ha$^{-1}$, and the rainfed twin has $ET_a=410$. Find WP, the irrigation efficiency based on the extra evapotranspiration, and the closure.",
 r"$WP=11\,200/5\,200=%.2f$ kg\,m$^{-3}$ \ans $IE=(520-410)/240=%.3f$ \ans Balance: $P+I=620$; outputs $ET+D+Q=600$, so $\Delta S=20$ mm if the storage has changed by that amount; the residual is zero by definition once $\Delta S$ is entered \ans Only %.0f per cent of the irrigation became extra evapotranspiration; the rest drained, ran off or stayed in the soil."%(11200/5200,110/240,100*110/240),'Dashboard indicators')
write(k,'bg',b)
# project: compare triggers by bucket simulation
rng=np.random.default_rng(5)
days=125;ET0=5.2+2.0*np.sin(np.linspace(0,math.pi,days))+rng.normal(0,0.5,days);ET0=ET0.clip(1.5)
rain=np.where(rng.random(days)<0.12,rng.gamma(2.0,6.0,days),0.)
c=(0.30,1.20,0.60,(15,30,50,30))
def kc_t(c,t):
    ki,km,ke,(L1,L2,L3,L4)=c[0],c[1],c[2],c[3]
    if t<L1: return ki
    if t<L1+L2: return ki+(km-ki)*(t-L1)/L2
    if t<L1+L2+L3: return km
    return km+(ke-km)*min(1,(t-L1-L2-L3)/L4)
def season(trig_f,TAW=150.,p=0.5,Ky=1.28,dose_cap=None):
    RAW=p*TAW;D=0.;irr=0.;n=0;dr=0.;eta=0.;etc=0.;
    for i in range(days):
        Kc=kc_t(c,i);e0=ET0[i]
        Ks=1.0 if D<=RAW else max(0,(TAW-D)/(TAW-RAW))
        ea=Ks*Kc*e0;etc+=Kc*e0;eta+=ea
        D=D-rain[i]+ea
        if D<0: dr+=-D;D=0
        if D>=trig_f*TAW:
            amt=D;irr+=amt;n+=1;D=0
    return irr,n,dr,eta,etc,1-Ky*(1-eta/etc)
rows=[]
for tf in (0.3,0.4,0.5,0.6,0.7,0.8,1.01):
    irr,n,dr,eta,etc,yr=season(tf);rows.append(['%.2f'%tf if tf<1 else 'rainfed',n,'%.0f'%irr,'%.0f'%dr,'%.0f'%eta,'%.3f'%yr,'%.1f'%(yr*11.5/(irr+1e-9)*100/1.0 if irr>0 else 0)])
p='\\banner{Design project 8: choosing the trigger of a maize season by simulation}\\label{sec:proj8}\n'
p+=P(r"\textbf{Brief.} A season of 125 days of maize on a soil with TAW = 150 mm and $p=0.5$ is simulated with the daily bucket on a weather record of seeded rain events (a mean of %.0f mm of rain, $\Sigma ET_0=%.0f$ mm). The irrigation rule applies the whole depletion when it reaches a fraction $f_t$ of TAW. The designer compares triggers from $f_t=0.3$ to 0.8 and the rainfed case on irrigation, drainage, yield and the extra yield per extra millimetre of irrigation. The maximum yield is $Y_m=11.5$ Mg\,ha$^{-1}$ and $K_y=1.28$."%(rain.sum(),ET0.sum()))
p+=tabl(['Trigger $f_t$','Irrigations','Irrigation (mm)','Drainage (mm)','$ET_a$ (mm)','$Y/Y_m$','Yield gain per 100 mm'],[[r[0],r[1],r[2],r[3],r[4],r[5],r[6]] for r in rows],'Seasonal results of the bucket for seven triggers.','lrrrrrr')
ref=[float(r[5]) for r in rows]
p+=P(r"\textbf{Reading the table.} A trigger below the stress threshold ($f_t\le0.5=p$) keeps $K_s=1$, so $ET_a=ET_c$ and the relative yield is 1; lower triggers add irrigations but not yield and send water to drainage. Triggers above $p$ let stress start and the yield fall by $K_y$ times the relative deficit. The rainfed season gives $Y/Y_m=%.3f$. The choice of the designer is $f_t=0.5$: the largest depletion that keeps the yield at its maximum, which needs the least irrigation (%s mm) among the stress-free triggers."%(ref[-1],rows[2][2]),
 r"\textbf{Check.} A trigger of 0.6 saves %s mm of irrigation against 0.5 at a yield loss of %.1f per cent; whether it is worth it depends on the price of water against the price of grain, as in Chapter~5."%('%.0f'%(float(rows[2][2])-float(rows[3][2])),100*(float(rows[2][5])-float(rows[3][5]))))
write(k,'proj',p)
exl=[]
exl.append((r"A storm of 45 mm falls on $CN=80$. Find the runoff.","%.1f mm"%((45-0.2*(25400/80-254))**2/(45-0.2*(25400/80-254)+25400/80-254))))
exl.append((r"With $TAW=100$, $RAW=50$, $D_{i-1}=48$, $ET_0=6$, $K_c=1.15$, no rain: find $K_s$, $ET_a$ and $D_i$.","%.2f; %.2f mm; %.2f mm"%(1.0,6*1.15,48+6*1.15)))
exl.append((r"Same soil, $D_{i-1}=80$: find $K_s$, $ET_a$ and $D_i$.","%.2f; %.2f mm; %.2f mm"%((100-80)/50,0.4*6*1.15,80+0.4*6*1.15)))
exl.append((r"$D_{i-1}=20$, rain 35 mm, $ET_a=5$: find $D_i$ and drainage.","0; 10 mm"))
exl.append((r"A season gives $I=300$, $ET_a$ irrigated 540, $ET_a$ rainfed 430. Find IE.","%.3f"%(110/300)))
exl.append((r"Yield 9.4 Mg\,ha$^{-1}$, $ET_a=480$ mm: find WP.","%.2f kg m$^{-3}$"%(9400/4800)))
exl.append((r"Find the curve number that gives $S=120$ mm.","%.0f"%(25400/(120+254))))
exl.append((r"A bucket with TAW 90 mm starts full (D = 0). ET = 5 mm/d, no rain. After how many days is $D=RAW=45$ mm ($p=0.5$)?","9 d"))
exl.append((r"Relative yield for $ET_a/ET_c=0.85$, $K_y=1.2$.","%.2f"%(1-1.2*0.15)))
exl.append((r"State the assumptions of the tipping bucket in three lines.","one layer; drainage the same day; no capillary rise"))
write(k,'ex',exercises(exl))
write(k,'dyk',dyk([r"Rank soil-water models from the tipping bucket to Richards' equation and say when each is enough.",r"Write the daily update of the bucket with the stress coefficient.",r"What does the curve number represent, and why does it depend on antecedent moisture?",r"Why can a lower trigger give no extra yield?",r"What are the indicators of the dashboard?",r"Define the irrigation efficiency based on extra evapotranspiration.",r"Why is the bucket poor in a shallow soil with a water table?",r"How would you check that a bucket program closes the balance?"]))
write(k,'obj',obj([
 (r"The tipping bucket drains when",["the soil is below wilting","the store exceeds field capacity","there is no rain","at night"],1),
 (r"A larger CN means",["less runoff","more runoff","no runoff","more infiltration"],1),
 (r"$K_s=1$ when",["$D>RAW$","$D\\le RAW$","$D=TAW$","always zero"],1),
 (r"The initial abstraction is",["$0.2S$","$S/2$","$5S$","$S^2$"],0),
 (r"Water productivity is",["$Y/ET_a$","$ET_a/Y$","$P/Y$","$I/Y$"],0),
 (r"The rainfed twin is used to find",["the soil type","the extra effect of irrigation","the weather","nothing"],1),
 (r"A trigger above $p$ causes",["no stress","stress","more rain","drainage only"],1),
 (r"The cascading bucket has",["one store","several stores in series","no stores","no drainage"],1),
 (r"Engine 2 of the application is",["a Richards solver","a daily bucket","a regression","a satellite"],1),
 (r"The dashboard closes the balance with",["the storage change","the price","the wind","the albedo"],0)]))
print('ok8')
