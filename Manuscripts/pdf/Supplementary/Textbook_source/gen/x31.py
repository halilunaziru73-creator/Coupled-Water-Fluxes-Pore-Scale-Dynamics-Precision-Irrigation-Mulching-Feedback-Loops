import sys,math
sys.path.insert(0,'/tmp/kh/gen')
from h import *
from sidport import *
from lib import SOIL
def W(t): return '\\par\\noindent where '+t+'\n\n'
def E(eq,wh,lab=''): return '\\begin{equation}'+(('\\boxed{'+eq+'}') if len(eq)<170 else eq)+(('\\label{%s}'%lab) if lab else '')+'\\end{equation}\n'+W(wh)
TEX={'S01':(45,20),'S02':(88,4),'S03':(92,3),'S04':(82,6),'S05':(65,10),'S06':(40,20),'S07':(20,15),'S08':(55,30),'S09':(30,35),'S10':(10,35)}
def soilhyd(sid,om=1.5,ftrig=.5):
    sd,cl=TEX[sid];s=saxton(sd/100,cl/100,om);a,n=SOIL[sid][1],SOIL[sid][2]
    psi=psiF(a,n);dth=max(.05,.95*s['sat']-(s['fc']-ftrig*(s['fc']-s['wp'])))
    fit=fitK(lambda t:gaF(t,s['ks'],psi,dth)/1000,10,600);return s,psi,dth,fit
b=''
b+=sec('Surface irrigation: what the layer does')
b+=P(r"In the application the surface-irrigation layer turns the soil of the field into a working layout. It takes the texture of the soil, the trigger of the crop and the geometry of the field, and it returns the advance of the water front, the time to cut off the inflow, the water that is stored, lost to deep percolation and lost as runoff, and the uniformity of the depth applied. Three layouts are offered: the \emph{border strip}, the \emph{furrow} and the \emph{basin}. They share one calculation, the volume balance of Section~\ref{sec:vbal}, and differ in the geometry of the flow, the default dimensions and the allowed ranges of the inflow, as the next table shows.")
b+=tabl(['','Border strip','Furrow','Basin'],[['Default length $L$ (m)','150','180','80'],['Range of $L$ (m)','50--400','60--400','20--200'],['Default slope $S_0$ (\\%)','0.20','0.30','0.05'],['Range of $S_0$ (\\%)','0.02--1','0.05--1.5','0.02--0.2'],['Manning $n$','0.15','0.04','0.15'],['Default inflow $q_0$','6 L/s per m width','1.2 L/s per furrow','25 L/s per m width'],['Range of $q_0$','0.2--20','0.2--4','5--60'],['Analysed width $w$','1 m strip','furrow spacing (0.75 m)','1 m strip'],['Typical crops','wheat, alfalfa, pasture','maize, cotton, vegetables','orchards, rice, level fields']],'Defaults and ranges of the three layouts of the surface-irrigation layer.','lccc')
b+=sec('The three layouts in detail')
b+=P(r"\textbf{Border strips.} A border is a long, narrow, levelled strip bounded by low dikes. Water enters at the head of the strip as a sheet, advances down the gentle slope and is cut off when the front has reached the end (or a fraction of it). The flow depth is small and uniform across the strip, so the calculation is done per metre of width, with the wide-channel form of Manning's equation below. Borders suit close-growing crops and soils of moderate to low intake; they require accurate grading. The strip width is usually 3 to 30 m and is fixed by the inflow available and the cross-slope.",
 r"\textbf{Furrows.} A furrow is a small channel between the crop rows. Water runs in the furrow and infiltrates through its wetted perimeter, so both the bed and the sides take water, and the crop does not stand in water. The furrow is analysed as a V-section with side slope $z=1$ and depth $D=0.25$ m and with the spacing $w$ of the rows as the width over which the infiltration is spread. Furrows suit row crops on a slope up to about 1.5 per cent; the main limit is the erosion of the channel, so the inflow is limited to $q_{\max}=\dfrac{0.04}{S}\cdot\dfrac{1000}{60}$ L\,s$^{-1}$ per furrow, where $S$ is the slope in per cent (for $S=0.3$ per cent, $q_{\max}=2.2$ L\,s$^{-1}$).",
 r"\textbf{Basins.} A basin is a level plot surrounded by dikes. A large inflow floods it quickly and the soil drinks the ponded water, so the design reduces to making the advance short compared with the opportunity time. Basins suit orchards, rice and any crop that tolerates ponding, and their uniformity depends mainly on the levelling of the floor. Because the slope is almost nil, Manning's equation gives a very deep sheet for a given flow, and the large defaults (25 L\,s$^{-1}$ per metre of width) are therefore not unusual.")
b+=sec('The flow in the channel: Manning')
b+=P(r"In a furrow of V-section of side slope $z$ the flow area, wetted perimeter and hydraulic radius at depth $y$ are $A=zy^2$, $P=2y\sqrt{1+z^2}$ and $R=A/P$, and Manning's equation gives the discharge",
 E(r"Q=\frac{1}{n}A\,R^{2/3}S_0^{1/2},",r"$Q$ is the discharge of one furrow (m$^3$\,s$^{-1}$), $n$ the Manning roughness coefficient (s\,m$^{-1/3}$), $A$ the flow area (m$^2$), $R=A/P$ the hydraulic radius (m), $P$ the wetted perimeter (m) and $S_0$ the slope of the bed (m\,m$^{-1}$).",'eq:s-man'),
 r"The depth $y$ is found by bisection of this equation for the given $Q$; the area at the inlet, $A_0=zy^2$, is the surface storage that enters the volume balance. For a wide border or basin the flow per unit width is $q_w=\frac1n y^{5/3}S_0^{1/2}$, so",
 E(r"y=\left(\frac{q_w\,n}{\sqrt{S_0}}\right)^{3/5},\qquad A_0=y\ (\text{per metre of width}),",r"$q_w$ is the inflow per metre of width (m$^2$\,s$^{-1}$), $y$ the normal depth (m), $n$ the Manning coefficient and $S_0$ the slope (m\,m$^{-1}$); $A_0$ is the cross-section per unit width.",'eq:s-wide'))
rows=[]
for S in (0.1,0.3,0.6,1.0):
    r_=[('%.1f'%S)]
    for q in (0.5,1.0,1.5,2.0): m=manning_furrow(q/1000,S/100,0.04);r_.append('%.1f / %.1f'%(m['y']*100,m['A0']*1e4))
    rows.append(r_)
b+=tabl(['Slope (\\%)','0.5 L/s','1.0 L/s','1.5 L/s','2.0 L/s'],rows,'Flow depth $y$ (cm) and inlet area $A_0$ (cm$^2$) of a V-furrow ($z=1$, $n=0.04$) from Manning.','rrrrr')
m=manning_furrow(1.2/1000,.003,.04)
b+=ex(r"A furrow ($z=1$, $D=0.25$ m, $n=0.04$) on a slope of 0.30 per cent carries 1.2 L\,s$^{-1}$. Find the flow depth, the inlet area and say whether the furrow overtops.",
 r"At depth $y$: $A=y^2$, $P=2y\sqrt2$, $R=y/(2\sqrt2)=0.3536y$ \ans Manning: $Q=\frac1{0.04}y^2(0.3536y)^{2/3}(0.003)^{1/2}=%.4f\,y^{8/3}$ \ans Solving $Q=0.0012$ m$^3$\,s$^{-1}$ by bisection gives $y=%.3f$ m $=%.1f$ cm \ans $A_0=y^2=%.5f$ m$^2$ (%.0f cm$^2$) \ans $y<D=0.25$ m, so the furrow does not overtop; the water surface width is $2zy=%.0f$ cm \ans"%(1/0.04*0.3536**(2/3)*math.sqrt(.003),m['y'],m['y']*100,m['A0'],m['A0']*1e4,2*m['y']*100),'Normal depth in a furrow')
b+=sec('The soil intake chain')
b+=P(r"When the intake of the soil is taken from the explorer's own soil (the default), it is built in four steps from the texture, so that no infiltrometer test is needed. First the Saxton and Rawls pedotransfer functions give the water contents and the saturated conductivity from sand $S$ and clay $C$ (fractions) and organic matter $OM$ (per cent):",
 E(r"\theta_{1500}'=-0.024S+0.487C+0.006OM+0.005S\,OM-0.013C\,OM+0.068SC+0.031,\quad \theta_{1500}=\theta_{1500}'+0.14\theta_{1500}'-0.02,",r"$\theta_{1500}$ is the water content at wilting (1500 kPa), $S$ the sand and $C$ the clay fractions, $OM$ the organic matter (per cent by mass) and the prime marks the first estimate.",'eq:s-sax1'),
 E(r"\theta_{33}'=-0.251S+0.195C+0.011OM+0.006S\,OM-0.027C\,OM+0.452SC+0.299,\quad\theta_{33}=\theta_{33}'+(1.283\theta_{33}'^{2}-0.374\theta_{33}'-0.015),",r"$\theta_{33}$ is the water content at field capacity (33 kPa); the other symbols are as above.",'eq:s-sax2'),
 E(r"\theta_{s}=\theta_{33}+\theta_{(s-33)}-0.097S+0.043,\qquad K_s=1930\,(\theta_s-\theta_{33})^{3-\lambda},\quad\lambda=\frac{\ln\theta_{33}-\ln\theta_{1500}}{\ln1500-\ln33},",r"$\theta_s$ is the saturated water content, $\theta_{(s-33)}$ the saturated-minus-field-capacity water content from its own regression (the third regression of Saxton and Rawls, 2006), $K_s$ the saturated conductivity (mm\,h$^{-1}$) and $\lambda$ the slope of the logarithmic retention curve.",'eq:s-sax3'),
 r"Second, the suction at the wetting front is taken from the van Genuchten parameters of the soil with $m=1-1/n$,",
 E(r"\psi_f=\frac{10}{\alpha}\cdot\frac{0.046m+2.07m^2+19.5m^3}{1+4.7m+16m^2}\quad(\text{mm}),",r"$\psi_f$ is the suction at the wetting front (mm), $\alpha$ the van Genuchten scale parameter (cm$^{-1}$), $m=1-1/n$ and $n$ the shape parameter.",'eq:s-psi'),
 r"Third, the Green--Ampt cumulative infiltration $F(t)$ follows from",
 E(r"F-\psi_f\Delta\theta\ln\!\left(1+\frac{F}{\psi_f\Delta\theta}\right)=K_s\frac{t}{60},\qquad\Delta\theta=\max\{0.05,\ 0.95\theta_s-[\theta_{33}-f_T(\theta_{33}-\theta_{1500})]\},",r"$F$ is the cumulative infiltration (mm), $t$ the time (min), $\Delta\theta$ the water-content change at the front (m$^3$\,m$^{-3}$), $f_T$ the depletion fraction at the trigger (0 to 1; the soil is irrigated when it has lost this fraction of the available water) and $0.95\theta_s$ the water content behind the front (5 per cent of the pores hold trapped air).",'eq:s-ga'),
 r"Fourth, the curve is replaced by the power law of Kostiakov, $Z=k\tau^{A}$, fitted by least squares on the logarithms over contact times from 10 to 600 min:",
 E(r"Z(\tau)=k\,\tau^{A}\ \ (\text{m}),\qquad A=\frac{\sum(\ln\tau_i-\overline{\ln\tau})(\ln Z_i-\overline{\ln Z})}{\sum(\ln\tau_i-\overline{\ln\tau})^2},\quad k=e^{\overline{\ln Z}-A\overline{\ln\tau}},",r"$Z$ is the cumulative intake (m of water), $\tau$ the intake opportunity time (min), $k$ (m\,min$^{-A}$) and $A$ (dimensionless) the Kostiakov parameters and the overbar denotes the mean over the 25 times of the fit (equally spaced on a logarithmic scale); the coefficient of determination $R^2$ is reported.",'eq:s-kos'))
rows=[]
for sid in sorted(TEX):
    s,psi,dth,fit=soilhyd(sid)
    rows.append([sid,SOIL[sid][0],'%.3f'%s['fc'],'%.3f'%s['wp'],'%.3f'%s['sat'],'%.1f'%s['ks'],'%.0f'%psi,'%.3f'%dth,'%.4f'%fit['k'],'%.3f'%fit['A'],'%.4f'%fit['r2']])
b+=tabl(['ID','Soil','$\\theta_{33}$','$\\theta_{1500}$','$\\theta_s$','$K_s$ (mm/h)','$\\psi_f$ (mm)','$\\Delta\\theta$','$k$','$A$','$R^2$'],rows,'The intake chain for the ten soils (organic matter 1.5 per cent, trigger at 50 per cent depletion).','llrrrrrrrrr')
s,psi,dth,fit=soilhyd('S06')
b+=ex(r"Build the Kostiakov intake of the loam S06 (sand 40, clay 20 per cent, organic matter 1.5 per cent, $\alpha=0.036$ cm$^{-1}$, $n=1.56$, trigger at 50 per cent).",
 r"$\theta_{1500}'=-0.024(0.40)+0.487(0.20)+0.006(1.5)+0.005(0.4)(1.5)-0.013(0.2)(1.5)+0.068(0.08)+0.031=0.1288$; $\theta_{1500}=%.4f$ \ans $\theta_{33}=%.4f$; $\theta_s=%.4f$; $\lambda=%.4f$; $K_s=1930(%.4f)^{%.3f}=%.1f$ mm\,h$^{-1}$ \ans $m=1-1/1.56=0.359$; $\psi_f=%.1f$ mm \ans $\Delta\theta=0.95(%.4f)-[%.4f-0.5(%.4f-%.4f)]=%.4f$ \ans Green--Ampt at $t=10,\ 60,\ 600$ min: $F=%.1f,\ %.1f,\ %.1f$ mm \ans Log--log fit: $A=%.3f$, $k=%.5f$ m\,min$^{-A}$, $R^2=%.4f$ \ans Check: $Z(120)=%.5f\times120^{%.3f}=%.1f$ mm against Green--Ampt %.1f mm \ans"%(saxton(.4,.2,1.5)['wp'],saxton(.4,.2,1.5)['fc'],saxton(.4,.2,1.5)['sat'],saxton(.4,.2,1.5)['lam'],saxton(.4,.2,1.5)['sat']-saxton(.4,.2,1.5)['fc'],3-saxton(.4,.2,1.5)['lam'],saxton(.4,.2,1.5)['ks'],psi,saxton(.4,.2,1.5)['sat'],saxton(.4,.2,1.5)['fc'],saxton(.4,.2,1.5)['fc'],saxton(.4,.2,1.5)['wp'],dth,gaF(10,s['ks'],psi,dth),gaF(60,s['ks'],psi,dth),gaF(600,s['ks'],psi,dth),fit['A'],fit['k'],fit['r2'],fit['k'],fit['A'],fit['k']*120**fit['A']*1000,gaF(120,s['ks'],psi,dth)),'The intake of a loam from its texture')
b+=sec('Advance by volume balance',)
b=b.replace(r"\section{Advance by volume balance}",r"\section{Advance by volume balance}\label{sec:vbal}")
b+=P(r"The water that has entered the field at time $t$ equals the water stored on the surface plus the water that has infiltrated. For a front at distance $x$ at time $t$ the balance, per unit of the analysed width $w$, is",
 E(r"q\,t=\sigma_yA_0\,x+\left[\sigma_z\,k\,t^{A}+\frac{f_0\,t}{1+r}\right]w\,x,",r"$q$ is the inflow (m$^3$\,min$^{-1}$ per furrow or per metre of width), $t$ the time since the start (min), $x$ the position of the front (m), $\sigma_y$ the surface shape factor (default 0.8), $A_0$ the flow area at the inlet (m$^2$), $\sigma_z$ the subsurface shape factor, $k$ and $A$ the Kostiakov parameters, $f_0$ the steady-intake term of the Kostiakov--Lewis law (m\,min$^{-1}$, zero for the pure Kostiakov law), $r$ the exponent of the advance curve $x\propto t^{r}$ and $w$ the width over which the water infiltrates (m).",'eq:s-vb'),
 r"The first term on the right stores the water in the channel, the second infiltrates it. The shape factor $\sigma_z$ depends on the advance exponent, which itself depends on the answer, so the application iterates:",
 E(r"\sigma_z=\frac{A+r(1-A)+1}{(1+A)(1+r)},\qquad r=\frac{\ln2}{\ln\bigl(t_L/t_{L/2}\bigr)},",r"$\sigma_z$ is the subsurface shape factor, $t_L$ and $t_{L/2}$ the times for the front to reach the end of the run $L$ and its middle $L/2$ (min), and $r$ the resulting advance exponent; the iteration starts with $\sigma_z=0.8$ and converges in a few passes.",'eq:s-sz'))
fur=lambda sid,L=180,q=1.2,S=.3,Zn=.06,cut='es1',w=.75,cb=1.0:(lambda s,psi,dth,fit,m:compute(L,w,q*.06,fit['k'],fit['A'],Zn,m['A0'],cut=cut,cb=cb))(*soilhyd(sid),manning_furrow(q/1000,S/100,0.04))
R=fur('S06')
b+=ex(r"Advance of the loam furrow: $L=180$ m, $S_0=0.30$ per cent, $q_0=1.2$ L\,s$^{-1}$, $w=0.75$ m, $A_0=%.5f$ m$^2$, $k=%.5f$, $A=%.3f$, net depth 60 mm. Find the advance time and the shape factors."%(m['A0'],fit['k'],fit['A']),
 r"Inflow $q=1.2\times0.06=0.072$ m$^3$\,min$^{-1}$ \ans Start with $\sigma_z=0.8$; solve $qt=0.8A_0L+\sigma_zkt^{A}wL$ for $t$ at $x=180$ and at $x=90$: the first pass gives $r=\ln2/\ln(t_L/t_{L/2})$ and, by Eq.~(\ref{eq:s-sz}), a new $\sigma_z$ \ans After the iteration $r=%.3f$, $\sigma_z=%.4f$ \ans The advance time is $t_L=%.1f$ min ($%.2f$ h) \ans The required contact time for 60 mm is $\tau_n=(0.060/k)^{1/A}=%.1f$ min \ans"%(R['r'],R['sz'],R['tL'],R['tL']/60,R['tst']),'Advance in a loam furrow')
b+=sec('Cut-off and the performance indicators')
b+=P(r"The inflow is cut off when the soil at the tail has had the contact time $\tau_n$ needed for the net depth $Z_n$. Three rules are available: \emph{full run} (\texttt{es1}), in which the inflow stops at $t_{co}=t_L+\tau_n$; \emph{85 per cent} (\texttt{r85}), in which it stops when the front is at $0.85L$, so $t_{co}=t_{0.85L}+\tau_n$ and the last 15 per cent is watered by the extension of the wetted front; and \emph{set by the user}, in which a time is typed. A \emph{cutback} factor $c_b<1$ reduces the inflow after the front has reached the end, so the volume applied is $V_{app}=q\,t_L+q\,c_b(t_{co}-t_L)$. The depth infiltrated at $x$ is $Z(x)=k\,(t_{co}-t_x)^{A}$ where $t_x$ is the arrival time of the front. The indicators are",
 E(r"E_a=\frac{V_{st}}{V_{app}},\quad E_s=\frac{V_{st}}{V_{req}},\quad DP=\frac{V_{dp}}{V_{app}},\quad RO=\frac{V_{ro}}{V_{app}},\quad CU=100\Bigl(1-\frac{\overline{|Z-\bar Z|}}{\bar Z}\Bigr),",r"$E_a$ is the application efficiency, $E_s$ the storage (requirement) efficiency, $DP$ the share lost to deep percolation, $RO$ the share lost as runoff, $V_{st}=\int\min(Z,Z_n)\,w\,dx$ the volume stored in the root zone, $V_{app}$ the volume applied, $V_{req}=Z_nLw$ the volume required, $V_{dp}=\int\max(Z-Z_n,0)\,w\,dx$ the deep percolation, $V_{ro}=\max(V_{app}-V_{inf},0)$ the runoff with $V_{inf}=\int Zw\,dx$ the volume infiltrated, $Z$ the infiltrated depth at a point and $\bar Z$ its mean along the run.",'eq:s-ind'))
b+=ex(r"For the furrow of the previous example find the cut-off time, the volume applied, and the five indicators.",
 r"$t_{co}=t_L+\tau_n=%.1f+%.1f=%.1f$ min ($%.2f$ h) \ans $V_{app}=q\,t_{co}=0.072\times%.1f=%.2f$ m$^3$ per furrow \ans $V_{req}=Z_nLw=0.060\times180\times0.75=%.2f$ m$^3$ \ans Integrating the depth $Z(x)=k(t_{co}-t_x)^A$ along the run: $V_{inf}=%.2f$, $V_{st}=%.2f$, $V_{dp}=%.2f$ m$^3$ \ans $E_a=%.3f$, $E_s=%.3f$, $DP=%.3f$, $RO=%.3f$, $CU=%.1f$ per cent \ans Because the whole depth is stored ($E_s=1$) but the run-off is large, the flow is too small for the length: see the design sweeps below \ans"%(R['tL'],R['tst'],R['tco'],R['tco']/60,R['tco'],.072*R['tco'],R['Vreq'],R['Vinf'],R['Vst'],R['Vdp'],R['Ea'],R['Es'],R['dp'],R['ro'],R['cu']),'Cut-off and efficiencies of a furrow')
b=b.replace('Because the whole depth is stored ($E_s=1$) but the run-off is large, the flow is too small for the length: see the design sweeps below','The whole requirement is stored ($E_s=1$), and the loss is shared between runoff and deep percolation: the inflow can still be improved, see the design sweeps below')
b+=sec('Design sweeps: inflow, length and slope')
b+=P(r"The design tool varies one variable at a time. The first table sweeps the inflow of the loam furrow; the second the length; the third the slope. In every row the cut-off is the full-run rule.")
rows=[]
for q in (0.4,0.6,0.8,1.0,1.2,1.6,2.0,2.5):
    try:
        R=fur('S06',q=q);rows.append(['%.1f'%q,'%.0f'%R['tL'],'%.0f'%R['tco'],'%.1f'%(100*R['Ea']),'%.1f'%(100*R['Es']),'%.1f'%(100*R['dp']),'%.1f'%(100*R['ro']),'%.1f'%R['cu']])
    except Exception as e: rows.append([str(q)]+['--']*7)
b+=tabl(['$q_0$ (L/s)','$t_L$ (min)','$t_{co}$ (min)','$E_a$ (\\%)','$E_s$ (\\%)','$DP$ (\\%)','$RO$ (\\%)','$CU$ (\\%)'],rows,'Sweep of the inflow: loam furrow, $L=180$ m, $S_0=0.30$ per cent, $Z_n=60$ mm.','rrrrrrrr')
rows=[]
for L in (60,100,140,180,240,300,400):
    R=fur('S06',L=L);rows.append([L,'%.0f'%R['tL'],'%.0f'%R['tco'],'%.1f'%(100*R['Ea']),'%.1f'%(100*R['Es']),'%.1f'%(100*R['dp']),'%.1f'%(100*R['ro']),'%.1f'%R['cu']])
b+=tabl(['$L$ (m)','$t_L$ (min)','$t_{co}$ (min)','$E_a$ (\\%)','$E_s$ (\\%)','$DP$ (\\%)','$RO$ (\\%)','$CU$ (\\%)'],rows,'Sweep of the length: loam furrow, $q_0=1.2$ L\\,s$^{-1}$, $S_0=0.30$ per cent.','rrrrrrrr')
rows=[]
for S in (0.05,0.1,0.2,0.3,0.5,0.8,1.2):
    R=fur('S06',S=S);m_=manning_furrow(1.2/1000,S/100,.04);rows.append(['%.2f'%S,'%.1f'%(m_['y']*100),'%.0f'%R['tL'],'%.0f'%R['tco'],'%.1f'%(100*R['Ea']),'%.1f'%(100*R['ro']),'%.1f'%R['cu']])
b+=tabl(['$S_0$ (\\%)','$y$ (cm)','$t_L$ (min)','$t_{co}$ (min)','$E_a$ (\\%)','$RO$ (\\%)','$CU$ (\\%)'],rows,'Sweep of the slope: loam furrow, $L=180$ m, $q_0=1.2$ L\\,s$^{-1}$.','rrrrrrr')
b+=P(r"\textbf{How the application chooses the inflow.} It scans 25 values of $q_0$ between the lower limit of the layout and an upper limit (for furrows, the smaller of the range and the erosive limit $q_{\max}=0.04/S\times1000/60$ L\,s$^{-1}$, $S$ in per cent) and takes the one that maximises the product $E_aE_s$. The same search then adjusts the cut-off time, the cutback factor and the length, one at a time, until $E_a\ge0.85$ while at least 80 per cent of the root zone is refilled.")
rows=[]
for sid in sorted(TEX):
    s,psi,dth,fit=soilhyd(sid);bestq=None
    for i in range(25):
        q=0.2+(min(4,.04/0.3*1000/60)-0.2)*i/24
        try:
            R=fur(sid,q=q)
            if R['stall']: continue
            sc=R['Ea']*R['Es']
            if bestq is None or sc>bestq[0]: bestq=(sc,q,R)
        except Exception: pass
    if bestq: sc,q,R=bestq;rows.append([sid,SOIL[sid][0],'%.2f'%q,'%.0f'%R['tL'],'%.0f'%R['tco'],'%.0f'%(100*R['Ea']),'%.0f'%(100*R['Es']),'%.0f'%R['cu']])
    else: rows.append([sid,SOIL[sid][0],'--','no advance in 48 h','','','',''])
b+=tabl(['ID','Soil','best $q_0$ (L/s)','$t_L$ (min)','$t_{co}$ (min)','$E_a$ (\\%)','$E_s$ (\\%)','$CU$ (\\%)'],rows,'Best inflow and performance of a 180-m furrow on each of the ten soils ($S_0=0.30$ per cent, $Z_n=60$ mm).','llrrrrrr')
b+=P(r"The table shows what every irrigation engineer knows: surface irrigation works on soils of medium intake and fails on the sands, where the advance is stopped by the intake (the application does not run a set for more than 48 h; when the front has not reached the end by then, the inflow stops and only part of the run is watered). On those soils the designer shortens the run, goes to a basin or changes to drip or sprinklers.")
write(11,'deep',b)
print('ok31')
