from h import *
k=6
lead(k,"classify irrigation methods and compute their efficiencies and uniformities; size a pipe by the Hazen--Williams and Darcy--Weisbach equations and find the pump head and power; use the continuity and Bernoulli equations; prepare and check weather data; estimate missing radiation; and compute vegetation indices from satellite bands.")
b=''
b+=sec('Introduction: designing a system that delivers the water')
b+=P(r"The first five chapters answered how much water a soil holds, how it moves, when to irrigate and how much a crop uses. A farmer has still to get that water to the plant: from a well or a canal, through pipes or channels, into the soil, with what pressure and at what cost. This is \kw{irrigation design}. It rests on a few ideas from hydraulics (continuity, energy, friction), on a clear idea of efficiency (how much of the water taken from the source reaches the roots), and on data about the weather and the field that set the demand. This chapter collects these ideas; the later chapters apply them to surface, drip and sprinkler systems and to drainage.")
b+=sec('Classification of irrigation methods')
b+=P(r"Irrigation methods divide into three families by the way the water reaches the soil. In \kw{surface irrigation} the water flows over the field by gravity: \emph{basin} irrigation floods a levelled area, \emph{border} irrigation uses long strips with a free downstream end, and \emph{furrow} irrigation runs the water in small channels between the crop rows. It needs no pressure, but the application is non-uniform unless the field is well levelled and the inflow well chosen; efficiencies are 50--70 per cent. In \kw{sprinkler irrigation} water is sprayed through nozzles under pressure: \emph{set} systems (solid set, hand-move, side-roll), \emph{moving} systems (centre pivot, lateral move, travelling gun) and \emph{rotating} or \emph{impact} sprinklers differ in cost and labour; efficiencies are 70--85 per cent. In \kw{micro-irrigation} (drip, micro-sprinkler, subsurface drip) small flows are given to each plant through emitters at low pressure; efficiencies are 85--95 per cent and the wetted volume is a fraction of the soil, which suits row crops, trees and vines and needs filtration to prevent clogging.")
b+=sec('Efficiency and uniformity')
b+=P(r"Not all water taken from the source benefits the crop. Four efficiencies are used. The \kw{conveyance efficiency} $E_c$ is the ratio of the water that reaches the field to the water taken at the source; the \kw{application efficiency} $E_a=V_{stored}/V_{applied}$ is the share of the applied water stored in the root zone; the \kw{storage efficiency} $E_s=V_{stored}/V_{needed}$ is the share of the needed depth that has been supplied; and the \kw{distribution uniformity} $DU_{lq}$ is the mean depth of the lowest quarter divided by the mean depth. The overall field efficiency is $E=E_cE_a$. The \kw{Christiansen coefficient} $CU=1-\sum|z_i-\bar z|/(n\bar z)$ is the other standard measure of uniformity, and, for emitters, the \kw{emission uniformity} $EU=q_{min}/\bar q$.")
z=np.array([12.,14,15,15,16,17,17,18,19,22,10,13])
cu=1-abs(z-z.mean()).sum()/(len(z)*z.mean());s=np.sort(z);q=len(z)//4;du=s[:q].mean()/z.mean()
b+=ex(r"Twelve catch cans in a sprinkler field collect (mm): 12, 14, 15, 15, 16, 17, 17, 18, 19, 22, 10, 13. Find the mean, Christiansen's coefficient, and the distribution uniformity of the lowest quarter.",
 r"Sum $=%.0f$, mean $\bar z=%.2f$ mm. Absolute deviations sum to $%.2f$; $CU=1-%.2f/(12\times%.2f)=%.3f$ \ans Lowest quarter: the three smallest values $%s$, mean $%.2f$; $DU_{lq}=%.2f/%.2f=%.3f$ \ans"%(z.sum(),z.mean(),abs(z-z.mean()).sum(),abs(z-z.mean()).sum(),z.mean(),cu,'10, 12, 13',s[:q].mean(),s[:q].mean(),z.mean(),du),'Uniformity from catch cans')
b+=sec('Hydraulics: continuity, energy and friction')
b+=P(r"Pressurised systems obey three relations. \kw{Continuity}: the flow $Q=vA$ is the same at every section of a pipe without branches, so a pipe of diameter $D$ carries the velocity $v=4Q/(\pi D^2)$. \kw{Energy} (Bernoulli): the total head $H=z+p/(\rho g)+v^2/(2g)$ falls along a pipe by the friction head loss $h_f$ and the local losses $h_m=K_mv^2/(2g)$ of fittings. \kw{Friction}: for water in a smooth plastic pipe the empirical Hazen--Williams equation in SI units is",
 eqn(r"h_f=10.67\,\frac{L\,Q^{1.852}}{C^{1.852}\,D^{4.871}},\label{eq:hw6}"),
 r"with $Q$ in m$^3$\,s$^{-1}$, $D$ in m, $L$ in m and $C$ the roughness coefficient (140 for new PVC and polyethylene pipe, 150 for the smooth laterals; lower for old steel). The Darcy--Weisbach form $h_f=f\,(L/D)\,v^2/(2g)$ with the friction factor $f$ from the Moody diagram is more general. A pipe is sized so that the velocity lies between 0.3 m\,s$^{-1}$ (to keep sediment moving) and 1.5 m\,s$^{-1}$ (to limit water hammer), and so that the head loss in the pipe and the cost of the pipe together are the least. The power of a pump that delivers $Q$ at a total dynamic head $H$ with an efficiency $\eta$ is $P=\rho g Q H/\eta$.")
def hw(Q,D,L,C=140): return 10.67*L*Q**1.852/(C**1.852*D**4.871)
Q=0.045;D=0.2;L=600
hf=hw(Q,D,L);v=4*Q/(math.pi*D*D)
b+=ex(r"A PVC mainline of $L=600$ m and $D=200$ mm ($C=140$) carries $Q=45$ L\,s$^{-1}$. Find the velocity, the head loss, and the extra pump power needed to overcome it ($\eta=0.65$).",
 r"$Q=0.045$ m$^3$\,s$^{-1}$; $v=4\times0.045/(\pi\times0.2^2)=%.2f$ m\,s$^{-1}$ (within 0.3--1.5). Head loss: $10.67\times600\times0.045^{1.852}/(140^{1.852}\times0.2^{4.871})=%.2f$ m \ans Power $=\rho gQh_f/\eta=1000\times9.81\times0.045\times%.2f/0.65=%.0f$ W $=%.2f$ kW \ans"%(v,hf,hf,9810*Q*hf/0.65,9810*Q*hf/0.65/1000),'Mainline friction and power')
b+=sec('Weather data for a design')
b+=P(r"Every design and every model needs the weather: rainfall, maximum and minimum temperature, solar radiation (or sunshine hours), humidity (or dew point) and wind speed, daily, for many years. The data may come from a weather station near the field, from the national service, from a gridded reanalysis or from a satellite product. Three checks are needed before use: \emph{completeness} (gaps are filled by interpolation from neighbouring days or stations), \emph{plausibility} (negative rain, $T_{min}>T_{max}$, radiation above the extraterrestrial value are errors) and \emph{homogeneity} (a change of instrument shows as a step in the mean). When radiation is missing it may be estimated from the temperature range by Hargreaves' relation $R_s=k_{Rs}\sqrt{T_{max}-T_{min}}\,R_a$ with $k_{Rs}\approx0.16$ (interior) to 0.19 (coastal) and $R_a$ the extraterrestrial radiation. For a design the \emph{dependable} (e.g. 80 per cent probability) rainfall and the \emph{peak} $ET_0$ of the design period are used, not the means.")
Ra=38.0;Rs=0.17*math.sqrt(31-17)*Ra
b+=ex(r"A station lacks radiation. For $T_{max}=31$, $T_{min}=17$ $^\circ$C and an extraterrestrial radiation $R_a=38$ MJ\,m$^{-2}$\,d$^{-1}$ (mid-latitude summer day), estimate $R_s$ with $k_{Rs}=0.17$ and the net shortwave radiation for an albedo 0.23.",
 r"$R_s=0.17\sqrt{31-17}\times38=0.17\times3.742\times38=%.1f$ MJ\,m$^{-2}$\,d$^{-1}$ \ans $R_{ns}=(1-0.23)R_s=%.1f$ MJ\,m$^{-2}$\,d$^{-1}$ \ans The clear-sky bound is $0.75R_a=28.5$, so the estimate is plausible."%(Rs,0.77*Rs),'Radiation from the temperature range')
b+=sec('Field data from satellites: vegetation indices')
b+=P(r"A satellite measures the reflectance of the surface in bands of the spectrum. Healthy green vegetation absorbs red light (chlorophyll) and reflects near-infrared strongly (leaf structure); bare soil reflects both moderately; water absorbs both. The \kw{normalised difference vegetation index} is",
 eqn(r"\mathrm{NDVI}=\frac{\rho_{NIR}-\rho_{red}}{\rho_{NIR}+\rho_{red}},\label{eq:ndvi6}"),
 r"from $-1$ (water) through 0 (bare soil) to about 0.9 (dense canopy). Other indices use other bands: the \emph{normalised difference water index} with a shortwave band follows the water in the canopy, and the \emph{soil-adjusted} index corrects for soil brightness. The fraction of the ground covered by the canopy is estimated from NDVI by $f_c=[(\mathrm{NDVI}-\mathrm{NDVI}_s)/(\mathrm{NDVI}_v-\mathrm{NDVI}_s)]^2$, and the basal crop coefficient from $f_c$; this is how an image can drive a schedule.")
b+=ex(r"A pixel has reflectances $\rho_{red}=0.08$ and $\rho_{NIR}=0.42$. Find the NDVI and the cover fraction if $\mathrm{NDVI}_s=0.15$ (bare) and $\mathrm{NDVI}_v=0.85$ (full cover).",
 r"$\mathrm{NDVI}=(0.42-0.08)/(0.42+0.08)=0.34/0.50=0.680$ \ans $f_c=[(0.680-0.15)/(0.85-0.15)]^2=(0.757)^2=%.3f$ \ans About %.0f per cent of the ground is covered."%(((0.68-0.15)/0.7)**2,100*((0.68-0.15)/0.7)**2),'NDVI and cover')
write(k,'bg',b)
# project: mainline design
Q=0.060;L=800;opts=[110,125,140,160,180,200,225,250];rows=[];best=None
for Dm in opts:
    D=Dm/1000;v=4*Q/(math.pi*D*D);hf=hw(Q,D,L);cost=0.012*Dm**1.6*L/1000*0+ (0.0004*Dm**1.7)*L  # arbitrary unit cost per m
    pw=9810*Q*(hf+35)/0.65/1000
    rows.append([Dm,'%.2f'%v,'%.1f'%hf,'%.1f'%pw,'%.0f'%cost,'ok' if 0.3<=v<=1.5 else 'v>1.5' if v>1.5 else 'v<0.3'])
p='\\banner{Design project 6: sizing the mainline and the pump of a sprinkler block}\n'
p+=P(r"\textbf{Brief.} A sprinkler block needs $Q=60$ L\,s$^{-1}$ at 35 m of working head (operating pressure at the block plus lateral losses, and the lift). The mainline is 800 m of PVC ($C=140$). The designer chooses between standard diameters from 110 to 250 mm, balancing the cost of pipe (taken as $0.0004D^{1.7}$ currency units per metre, $D$ in mm, an assumed price law) against the cost of the energy to overcome the friction, with a pump efficiency of 65 per cent, 1\,200 h of pumping per year and an energy price of 0.12 units per kWh over a 15-year life at a discount of 6 per cent (present-value factor 9.71).")
for r in rows:
    Dm=r[0];pw=float(r[3]);ann=pw*1200*0.12;pv=ann*9.71;r.append('%.0f'%pv);r.append('%.0f'%(float(r[4])+pv))
p+=tabl(['$D$ (mm)','$v$ (m/s)','$h_f$ (m)','Power (kW)','Pipe cost','Velocity','Energy PV','Total'],[[r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7]] for r in rows],'Design table of the mainline: velocity, friction loss, pump power for friction plus 35 m, pipe cost, the check on velocity, present value of energy and total cost.','rrrrrlrr')
okrows=[r for r in rows if r[5]=='ok'];bestr=min(okrows,key=lambda r:float(r[7]))
p+=P(r"\textbf{Decision.} Among the diameters with an acceptable velocity the least total cost is for $D=%s$ mm: velocity %s m\,s$^{-1}$, friction loss %s m, pump power %s kW, total %s units. Smaller pipes are cheaper but the energy to push the water through them dominates; larger pipes cost more than the energy they save. The optimum is shallow, so a neighbouring standard size within a few per cent of the cost may be chosen for availability. The pump must deliver $60$ L\,s$^{-1}$ at a head of $35+%s=%.1f$ m."%(bestr[0],bestr[1],bestr[2],bestr[3],bestr[7],bestr[2],35+float(bestr[2])),
 r"\textbf{Check.} Water hammer: for a closing time of 10 s in a PVC pipe of wave speed 400 m\,s$^{-1}$ and length 800 m, the surge is $\Delta H=2Lv/(gt)=2\times800\times%s/(9.81\times10)=%.0f$ m, well above the 35 m working head: a slow-closing valve or an air vessel must be specified."%(bestr[1],2*800*float(bestr[1])/(9.81*10)))
write(k,'proj',p)
exl=[]
exl.append((r"A pipe of 150 mm carries 30 L\,s$^{-1}$. Find the velocity.","%.2f m s$^{-1}$"%(4*0.03/(math.pi*0.15**2))))
exl.append((r"Hazen--Williams head loss ($C=140$) for $L=400$ m, $D=150$ mm, $Q=30$ L\,s$^{-1}$.","%.1f m"%hw(0.03,0.15,400)))
exl.append((r"A pump delivers 40 L\,s$^{-1}$ at 55 m head with $\eta=0.7$. Find the power.","%.1f kW"%(9810*0.04*55/0.7/1000)))
exl.append((r"The application efficiency is 0.72 and the conveyance efficiency 0.9. Find the overall efficiency and the gross water for a net need of 400 mm.","%.3f; %.0f mm"%(0.72*0.9,400/(0.72*0.9))))
exl.append((r"Catch cans: 8, 10, 11, 12, 12, 13, 14, 16 mm. Find CU.","%.3f"%(1-abs(np.array([8,10,11,12,12,13,14,16])-12).sum()/(8*12))))
exl.append((r"Emitter flows (L\,h$^{-1}$): 3.6, 3.8, 3.9, 4.0, 4.0, 4.1, 4.2, 4.4. Find EU (lowest value over mean).","%.3f"%(3.6/np.mean([3.6,3.8,3.9,4.0,4.0,4.1,4.2,4.4]))))
exl.append((r"Estimate $R_s$ for $T_{max}=26$, $T_{min}=12$, $R_a=30$, $k_{Rs}=0.16$.","%.1f MJ m$^{-2}$ d$^{-1}$"%(0.16*math.sqrt(14)*30)))
exl.append((r"NDVI for $\rho_{red}=0.06$, $\rho_{NIR}=0.50$.","%.3f"%((0.5-0.06)/(0.5+0.06))))
exl.append((r"A 12 m$^3$\,h$^{-1}$ flow goes through a 63 mm pipe. Is the velocity acceptable?","%.2f m/s; yes"%(12/3600*4/(math.pi*0.063**2))))
exl.append((r"How many cubic metres does 25 mm over 8 ha need?","%.0f m$^3$"%(25*8*10)))
write(k,'ex',exercises(exl))
write(k,'dyk',dyk([r"Describe basin, border and furrow irrigation. Where is each used?",r"Distinguish conveyance, application and storage efficiency.",r"What do CU, $DU_{lq}$ and EU measure?",r"State the Hazen--Williams equation and the limits of velocity in a pipe.",r"Why is the optimum pipe diameter found by a cost balance?",r"What checks should be made on weather data before use?",r"How can radiation be estimated from temperature?",r"Explain NDVI and how it gives the cover of a crop."]))
write(k,'obj',obj([
 (r"Furrow irrigation is a",["surface method","sprinkler method","micro-irrigation method","drainage method"],0),
 (r"Application efficiency is the share of applied water that is",["lost","stored in the root zone","evaporated","pumped"],1),
 (r"The Hazen--Williams coefficient of new PVC is about",["40","90","140","400"],2),
 (r"Pump power is proportional to",[r"$Q H/\eta$",r"$Q/H$",r"$\eta/H$","$QH\\eta$"],0),
 (r"The suitable velocity in a pipe lies between",["0 and 0.1","0.3 and 1.5 m/s","3 and 10 m/s","10 and 20 m/s"],1),
 (r"NDVI of water is",["negative","about 0.9","about 5","exactly zero always"],0),
 (r"Hargreaves' radiation formula uses",["rainfall","temperature range","wind","humidity only"],1),
 (r"Drip systems have efficiencies of about",["20 \\%","50 \\%","90 \\%","150 \\%"],2),
 (r"The overall field efficiency is",[r"$E_c+E_a$",r"$E_cE_a$",r"$E_c/E_a$",r"$E_a^2$"],1),
 (r"Dependable rainfall means",["the mean","rain exceeded with a stated probability","the maximum","zero rain"],1)]))
print('ok6')
