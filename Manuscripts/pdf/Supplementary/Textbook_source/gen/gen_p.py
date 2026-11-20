import sys,math
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
O=[];w=O.append
def T(_s,**kw):
    for k,v in kw.items(): _s=_s.replace('@'+k+'@',str(v))
    return _s
Gsc=0.0820
def Ra(lat,doy):
    phi=math.radians(lat);dr=1+0.033*math.cos(2*math.pi*doy/365);dl=0.409*math.sin(2*math.pi*doy/365-1.39)
    ws=math.acos(max(-1,min(1,-math.tan(phi)*math.tan(dl))))
    return 24*60/math.pi*Gsc*dr*(ws*math.sin(phi)*math.sin(dl)+math.cos(phi)*math.cos(dl)*math.sin(ws)),dr,dl,ws
def harg(Tmax,Tmin,lat,doy):
    ra=Ra(lat,doy)[0];Tm=(Tmax+Tmin)/2
    return 0.0023*(Tm+17.8)*math.sqrt(max(0,Tmax-Tmin))*ra*0.408
def makk(Tm,Rs):
    D=4098*0.6108*math.exp(17.27*Tm/(Tm+237.3))/(Tm+237.3)**2;g=0.066
    return 0.61*D/(D+g)*Rs/2.45-0.12
def pm(Tmax,Tmin,RHmean,u2,Rs,z=100,lat=10,doy=180):
    Tm=(Tmax+Tmin)/2;P=101.3*((293-0.0065*z)/293)**5.26;g=0.000665*P
    es=lambda T:0.6108*math.exp(17.27*T/(T+237.3))
    e_s=(es(Tmax)+es(Tmin))/2;ea=e_s*RHmean/100
    D=4098*es(Tm)/(Tm+237.3)**2
    ra,dr,dl,ws=Ra(lat,doy);Rso=(0.75+2e-5*z)*ra;Rns=0.77*Rs
    Rnl=4.903e-9*(((Tmax+273.16)**4+(Tmin+273.16)**4)/2)*(0.34-0.14*math.sqrt(ea))*(1.35*min(1,Rs/Rso)-0.35)
    Rn=Rns-Rnl
    et=(0.408*D*Rn+g*900/(Tm+273)*u2*(e_s-ea))/(D+g*(1+0.34*u2))
    return dict(Tm=Tm,P=P,g=g,es=e_s,ea=ea,D=D,Ra=ra,Rso=Rso,Rns=Rns,Rnl=Rnl,Rn=Rn,ET0=et)
w(r"""\chapter{Weather and field data}\label{ch:weather}
\markboth{Weather and field data}{Weather and field data}
\textbf{After this chapter you can} compute reference evapotranspiration from temperature or radiation, put a weather record on the model's twenty-year grid, compute the area and slope of a field from coordinates and elevations, derive the vegetation and water indices from satellite bands, run the zone-by-zone water balance from NDVI, and estimate runoff, gully risk and soil loss.

\section{Reference evapotranspiration}
Without an ET$_0$ column in the weather file the program computes it. With daily maximum and minimum temperature it uses Hargreaves--Samani (FAO-56 Eq.~52),
\begin{equation}ET_0=0.0023(T_{\rm mean}+17.8)\sqrt{T_{\max}-T_{\min}}\;R_a\times0.408\ \ (\mathrm{mm\,d^{-1}}),\end{equation}
where $R_a$ (MJ m$^{-2}$ d$^{-1}$) is the extraterrestrial radiation at the latitude typed in the dialog (FAO-56 Eq.~21),
\begin{equation}R_a=\frac{24\cdot60}{\pi}G_{sc}d_r\left[\omega_s\sin\varphi\sin\delta+\cos\varphi\cos\delta\sin\omega_s\right],\ d_r=1+0.033\cos\frac{2\pi J}{365},\ \delta=0.409\sin\left(\frac{2\pi J}{365}-1.39\right),\ \omega_s=\arccos(-\tan\varphi\tan\delta),\end{equation}
$G_{sc}=0.0820$ MJ m$^{-2}$ min$^{-1}$. With the daily mean temperature and the global radiation $R_s$ (MJ m$^{-2}$ d$^{-1}$) it uses Makkink,
\begin{equation}ET_0=0.61\frac{\Delta}{\Delta+\gamma}\frac{R_s}{2.45}-0.12,\quad\Delta=\frac{4098\times0.6108\,e^{17.27T/(T+237.3)}}{(T+237.3)^2},\ \gamma=0.066\ \mathrm{kPa\,K^{-1}}.\end{equation}
""")
ra,dr,dl,ws=Ra(10,180)
body=T(r"""A site at latitude $10^\circ$N on day of year $J=180$ has $T_{\max}=33^\circ$C and $T_{\min}=21^\circ$C. Compute $R_a$ and Hargreaves ET$_0$.

\textbf{Solution.} $\varphi=10^\circ=0.1745$ rad. $d_r=1+0.033\cos(2\pi\times180/365)=1+0.033\times@c@=@dr@$. $\delta=0.409\sin(2\pi\times180/365-1.39)=0.409\sin(@arg@)=@dl@$ rad. $\omega_s=\arccos(-\tan\varphi\tan\delta)=\arccos(-0.1763\times@tdl@)=@ws@$ rad. Then $R_a=(1440/\pi)\times0.0820\times@dr@\times[@ws@\times\sin\varphi\sin\delta+\cos\varphi\cos\delta\sin\omega_s]=@ra@$ MJ m$^{-2}$ d$^{-1}$. $T_{\rm mean}=27^\circ$C, $\sqrt{33-21}=3.464$. $ET_0=0.0023\times(27+17.8)\times3.464\times@ra@\times0.408=@et@$ mm d$^{-1}$.""",
c=fx(math.cos(2*math.pi*180/365),4),dr=fx(dr,4),arg=fx(2*math.pi*180/365-1.39,4),dl=fx(dl,4),tdl=fx(math.tan(dl),4),ws=fx(ws,4),ra=fx(ra,2),et=fx(harg(33,21,10,180),2))
w(ex("Hargreaves at 10$^\\circ$N",body))
rows=[]
for lat in (0,10,30,50):
    rows.append([lat]+[fx(Ra(lat,d)[0],1) for d in (15,105,196,288)]+[fx(harg(30,18,lat,196),2)])
w(tab(["Latitude","$R_a$ J=15","J=105","J=196","J=288","Hargreaves J=196 (30/18$^\\circ$C)"],rows,"Extraterrestrial radiation (MJ m$^{-2}$ d$^{-1}$) by latitude and day, and Hargreaves ET$_0$ at midsummer of the northern hemisphere (mm d$^{-1}$).","tab:ra"))
body=T(r"""Makkink: $T=27^\circ$C, $R_s=20$ MJ m$^{-2}$ d$^{-1}$.

\textbf{Solution.} $e^{17.27\times27/(27+237.3)}=e^{@x@}=@e@$; saturation pressure $0.6108\times@e@=@es@$ kPa; $\Delta=4098\times@es@/(264.3)^2=@D@$ kPa K$^{-1}$. $\Delta/(\Delta+\gamma)=@D@/(@D@+0.066)=@f@$. $ET_0=0.61\times@f@\times20/2.45-0.12=@et@$ mm d$^{-1}$.""",x=fx(17.27*27/264.3,4),e=fx(math.exp(17.27*27/264.3),4),es=fx(0.6108*math.exp(17.27*27/264.3),4),D=fx(4098*0.6108*math.exp(17.27*27/264.3)/264.3**2,4),f=fx(4098*0.6108*math.exp(17.27*27/264.3)/264.3**2/(4098*0.6108*math.exp(17.27*27/264.3)/264.3**2+0.066),4),et=fx(makk(27,20),2))
w(ex("Makkink",body))
p=pm(33,21,60,2.0,20.0,100,10,180)
w(r"\subsection*{The FAO Penman--Monteith value of the online weather}"+"\n"+r"""When the weather of a place is fetched the reference ET$_0$ comes from the weather service (FAO Penman--Monteith). The equation is the literature one (FAO-56 Eq.~6):
\begin{equation}ET_0=\frac{0.408\Delta(R_n-G)+\gamma\frac{900}{T+273}u_2(e_s-e_a)}{\Delta+\gamma(1+0.34u_2)},\quad G\approx0\ \text{(daily)}.\end{equation}
The program does not compute this itself (the service does), so the example below is for understanding and for checking the Hargreaves value, not a reproduction of the app.
""")
body=T(r"""Same day: $T_{\max}=33$, $T_{\min}=21^\circ$C, mean RH 60\%, wind $u_2=2.0$ m s$^{-1}$, $R_s=20$ MJ m$^{-2}$ d$^{-1}$, altitude 100 m.

\textbf{Solution.} $T=27$; pressure $P=101.3[(293-0.0065\times100)/293]^{5.26}=@P@$ kPa, $\gamma=0.000665P=@g@$. $e_s=[e^\circ(33)+e^\circ(21)]/2=@es@$ kPa, $e_a=0.60e_s=@ea@$. $\Delta=@D@$. $R_a=@ra@$; clear-sky $R_{so}=(0.75+2\times10^{-5}\times100)R_a=@rso@$. $R_{ns}=0.77\times20=@rns@$; $R_{nl}=4.903\times10^{-9}[\ldots](0.34-0.14\sqrt{e_a})(1.35R_s/R_{so}-0.35)=@rnl@$; $R_n=@rn@$. Then $ET_0=[0.408\times@D@\times@rn@+@g@\times900/300\times2\times(@es@-@ea@)]/[@D@+@g@(1+0.68)]=@et@$ mm d$^{-1}$. Compare Hargreaves (@h@) and Makkink (@mk@): the three differ by up to about @sp@ mm d$^{-1}$, which is why the layer reports how ET$_0$ was obtained.""",P=fx(p['P'],2),g=fx(p['g'],5),es=fx(p['es'],3),ea=fx(p['ea'],3),D=fx(p['D'],4),ra=fx(p['Ra'],2),rso=fx(p['Rso'],2),rns=fx(p['Rns'],2),rnl=fx(p['Rnl'],2),rn=fx(p['Rn'],2),et=fx(p['ET0'],2),h=fx(harg(33,21,10,180),2),mk=fx(makk(27,20),2),sp=fx(max(p['ET0'],harg(33,21,10,180),makk(27,20))-min(p['ET0'],harg(33,21,10,180),makk(27,20)),1))
w(ex("FAO Penman--Monteith for comparison",body))
# unit conversions & grid
w(r"\section{Reading and gridding a weather file}"+"\n"+r"""Radiation columns are read in MJ m$^{-2}$ d$^{-1}$, or in W m$^{-2}$ when the values exceed 60 (a daily mean power: multiply by $0.0864$); in the Daisy files radiation is in kWh m$^{-2}$ d$^{-1}$ ($\times3.6$ gives MJ m$^{-2}$ d$^{-1}$). Rain in inches is multiplied by 25.4. The program works on twenty years of 365 days: the last twenty complete years (at least 300 days each) are used, leap days dropped, a missing day of rain taken from the same day of another year, a missing ET$_0$ from the mean of that day of the year.
""")
body=r"""A file gives mean radiation 230 W m$^{-2}$, another 5.6 kWh m$^{-2}$ d$^{-1}$, a third 18.4 MJ m$^{-2}$ d$^{-1}$, and a rain value of 0.8 in. Convert all to model units.

\textbf{Solution.} $230>60$, so it is W m$^{-2}$: $230\times0.0864=19.87$ MJ m$^{-2}$ d$^{-1}$. $5.6\times3.6=20.16$ MJ m$^{-2}$ d$^{-1}$. $18.4$ is already in MJ. Rain: $0.8\times25.4=20.3$ mm. Note the threshold: a value of 55 would be read as MJ, which is unphysical (the extraterrestrial maximum is about 45), so the 60 limit is safe for daily totals; a mean power of 55 W m$^{-2}$ would be misread, a limitation of the rule."""
w(ex("units",body))
w(r"""The daily model then uses the rain of the file scaled to the rainfall scale $\rho$ of the Properties panel and a demand weight proportional to the daily ET$_0$:
\begin{equation}P_k^{\rm model}=P_k\frac{\rho}{\rho_{\rm ref}},\qquad e_k=\frac{ET_{0,k}}{\overline{ET_0}/365},\qquad\rho_{\rm ref}=\mathop{\mathrm{nearest}}_{\rho\in\{0.5,\dots,1.4\}}\frac{\bar P}{P_{\rm rec}},\qquad\Delta T_{\rm ref}=\mathop{\mathrm{nearest}}_{\Delta T\in\{-1,\dots,3.5\}}\frac{\overline{ET_0}/E_{\rm rec}-1}{0.035},\end{equation}
with $P_{\rm rec}=464$ mm the mean annual rain of the built-in record, and $E_{\rm rec}\approx870$ mm its reference ET. The annual model (Engine~1) uses the simulated steps nearest the weather.
""")
def nearest(x,grid): return min(grid,key=lambda g:abs(g-x))
rg=[0.5+0.1*i for i in range(10)];tg=[-1+0.5*i for i in range(10)]
body=T(r"""A weather file has mean annual rain $\bar P=640$ mm and $\overline{ET_0}=1{,}150$ mm. Find $\rho_{\rm ref}$ and $\Delta T_{\rm ref}$, and say whether the annual model can represent the file.

\textbf{Solution.} $\bar P/P_{\rm rec}=640/464=@r@$. The nearest step of $\{0.5,0.6,\dots,1.4\}$ is $@rr@$. $\overline{ET_0}/E_{\rm rec}=1150/870=@e@$; $(@e@-1)/0.035=@dt@$ $^\circ$C. The warming steps stop at 3.5, so the nearest is $@tt@$ and the file lies @out@ the simulated range: the annual results use the nearest step and the dialog says so. The daily layers use the file as it is. A second file with $\bar P=900$ mm gives $900/464=@r2@$ and is also capped at 1.4.""",r=fx(640/464,3),rr=fx(nearest(640/464,rg),1),e=fx(1150/870,3),dt=fx((1150/870-1)/0.035,1),tt=fx(nearest((1150/870-1)/0.035,tg),1),out="outside" if (1150/870-1)/0.035>3.5 else "inside",r2=fx(900/464,3))
w(ex("placing a file on the grid",body))
# polygon
w(r"\section{Field geometry}"+"\n"+r"""The field outline $(\varphi_i,\lambda_i)$ (radians) gives the area and the perimeter on a sphere of radius $R=6\,378\,137$ m,
\begin{equation}A=\frac{R^2}2\Big|\sum_i(\lambda_{i+1}-\lambda_i)(2+\sin\varphi_i+\sin\varphi_{i+1})\Big|,\qquad P=\sum_i2R\arcsin\sqrt{\sin^2\tfrac{\Delta\varphi}{2}+\cos\varphi_i\cos\varphi_{i+1}\sin^2\tfrac{\Delta\lambda}{2}}.\end{equation}
""")
lat0,lon0=9.000,7.500
d_lat=300/111320;d_lon=400/(111320*math.cos(math.radians(lat0)))
pts=[(lat0,lon0),(lat0,lon0+d_lon),(lat0+d_lat,lon0+d_lon),(lat0+d_lat,lon0)]
def area_perim(pts):
    R=6378137.0;ph=[math.radians(p[0]) for p in pts];la=[math.radians(p[1]) for p in pts];n=len(pts);S=0;Pm=0
    for i in range(n):
        j=(i+1)%n;S+=(la[j]-la[i])*(2+math.sin(ph[i])+math.sin(ph[j]))
        dph=ph[j]-ph[i];dla=la[j]-la[i]
        Pm+=2*R*math.asin(math.sqrt(math.sin(dph/2)**2+math.cos(ph[i])*math.cos(ph[j])*math.sin(dla/2)**2))
    return abs(S)*R*R/2,Pm
Aa,Pp=area_perim(pts)
body=T(r"""A rectangular field has corners at $9.000^\circ$N, $7.500^\circ$E and extends about 300 m north and 400 m east. Compute the area and the perimeter from the two formulas above.

\textbf{Solution.} The north--south side is $300/111{,}320=@dlat@^\circ$; the east--west side $400/(111{,}320\cos9^\circ)=@dlon@^\circ$. Summing the four terms of the area formula gives $A=@A@$ m$^2=@Ah@$ ha. The haversine perimeter is $@P@$ m, within @dp@ m of the plane value $2(300+400)=1{,}400$ m, and $A$ is within @da@ m$^2$ of $300\times400=120{,}000$ m$^2$. At this size the curvature of the Earth does not matter; the spherical formulas are there so that large or distant outlines are right, and this agreement is the check.""",dlat=fx(d_lat,6),dlon=fx(d_lon,6),A=fx(Aa,0),Ah=fx(Aa/1e4,3),P=fx(Pp,2),dp=fx(abs(Pp-1400),2),da=fx(abs(Aa-120000),0))
w(ex("area of a field from its corners",body))
# slope plane fit
w(r"\subsection*{Slope by a fitted plane}"+"\n"+r"""The ground slope is that of the least-squares plane $z=a+bx+cy$ through the elevations ($x$, $y$ in metres east and north of the centre): $s=100\sqrt{b^2+c^2}$ per cent, falling in the direction of $-(b,c)$.
""")
pts_xy=[(-150,-100,512.3),(0,-100,511.2),(150,-100,510.4),(-150,0,512.9),(0,0,511.6),(150,0,510.7),(-150,100,513.4),(0,100,512.2),(150,100,511.0)]
X=np.array([[1,p[0],p[1]] for p in pts_xy]);zz=np.array([p[2] for p in pts_xy]);coef=np.linalg.lstsq(X,zz,rcond=None)[0]
a,b,c=coef;s=100*math.hypot(b,c);dirn=(math.degrees(math.atan2(-b,-c))%360)
rows=[[p[0],p[1],fx(p[2],1)] for p in pts_xy]
w(tab(["$x$ (m)","$y$ (m)","$z$ (m)"],rows,"Nine elevations over the field.","tab:dem"))
body=T(r"""Fit the plane to Table~\ref{tab:dem}; give the slope in per cent and the downhill direction.

\textbf{Solution.} The nine points are symmetric about the centre, so the normal equations decouple: $a=\bar z=@a@$, $b=\sum xz/\sum x^2=@b@$, $c=\sum yz/\sum y^2=@c@$ ($\sum x^2=6\times150^2=135{,}000$, $\sum y^2=6\times100^2=60{,}000$). $s=100\sqrt{@b@^2+@c@^2}=@s@\%$. The ground falls toward $-(b,c)$, that is toward the east-south-east: bearing $@d@^\circ$ from north. A slope of @s@\% is the value used by the sprinkler layer (Chapter~\ref{ch:sprinkler}) to look up the allowed application rate (0--5\% column).""",a=fx(a,3),b=fx(b,5),c=fx(c,5),s=fx(s,2),d=fx(dirn,0))
w(ex("slope of the field",body))
# water source
w(r"\subsection*{Where to take the water from}"+"\n"+r"""\begin{equation}\mathrm{score}=B_{\rm type}-30[\text{seasonal}]-\min(45,d/60)-\min(20,0.8\Delta z),\end{equation}
with $B=92$ river, 90 canal, 86 reservoir, 82 lake, 74 borehole, 70 well, 62 pond, 60 spring, 58 stream, 50 water seen in the photo, 42 ditch, 30 drain; $d$ the distance from the field edge (m), $\Delta z$ the lift (m). The weights are engineered, not fitted.
""")
srcs=[("River (seasonal)",92,True,900,8),("Canal",90,False,1200,3),("Reservoir",86,False,400,25),("Borehole",74,False,150,0),("Pond",62,False,100,4)]
rows=[];sc=[]
for nm,B,seas,d,dz in srcs:
    sv=B-(30 if seas else 0)-min(45,d/60)-min(20,0.8*dz);sc.append((sv,nm));rows.append([nm,B,"yes" if seas else "no",d,dz,fx(sv,1)])
w(tab(["Source","$B$","seasonal","$d$ (m)","lift (m)","score"],rows,"Five candidate sources.","tab:src"))
best=max(sc)
body=T(r"""Score the sources of Table~\ref{tab:src}.

\textbf{Solution.} River: $92-30-\min(45,900/60)-\min(20,0.8\times8)=92-30-15-6.4=@r@$. Canal: $90-0-20-2.4=@c@$. Reservoir: $86-6.67-20=@s@$ (the lift term is capped at 20). Borehole: $74-2.5-0=@b@$. Pond: $62-1.67-3.2=@p@$. The best is the @best@ ($@sv@$). The seasonal river drops below the canal because of its $-30$ penalty even though its type score is higher.""",r=fx(sc[0][0],1),c=fx(sc[1][0],1),s=fx(sc[2][0],1),b=fx(sc[3][0],1),p=fx(sc[4][0],1),best=best[1],sv=fx(best[0],1))
w(ex("choosing the water source",body))
# indices
w(r"\section{Vegetation and water indices}"+"\n"+r"""For each 10 m cell with blue, red, red-edge, NIR and SWIR reflectances $\rho_B,\rho_R,\rho_{RE},\rho_N,\rho_{SW}$:
\begin{equation}\mathrm{NDVI}=\frac{\rho_N-\rho_R}{\rho_N+\rho_R},\ \mathrm{EVI}=2.5\frac{\rho_N-\rho_R}{\rho_N+6\rho_R-7.5\rho_B+1},\ \mathrm{SAVI}=\frac{(1+L)(\rho_N-\rho_R)}{\rho_N+\rho_R+L},\ L=0.5,\ \mathrm{NDRE}=\frac{\rho_N-\rho_{RE}}{\rho_N+\rho_{RE}},\ \mathrm{NDWI}=\frac{\rho_N-\rho_{SW}}{\rho_N+\rho_{SW}}.\end{equation}
From the colour photo only: $\mathrm{VARI}=\frac{G-R}{G+R-B}$, $\mathrm{GLI}=\frac{2G-R-B}{2G+R+B}$, $\mathrm{ExG}=2g-r-b$ (chromatic coordinates), $\mathrm{NGRDI}=\frac{G-R}{G+R}$.
""")
def idx(B,R,RE,N,SW):
    return dict(NDVI=(N-R)/(N+R),EVI=2.5*(N-R)/(N+6*R-7.5*B+1),SAVI=1.5*(N-R)/(N+R+0.5),NDRE=(N-RE)/(N+RE),NDWI=(N-SW)/(N+SW))
cov={'Dense crop':(0.03,0.04,0.18,0.45,0.20),'Sparse crop':(0.05,0.10,0.20,0.30,0.25),'Bare soil':(0.09,0.20,0.23,0.27,0.35),'Stressed crop':(0.04,0.08,0.20,0.32,0.28)}
rows=[[k]+[fx(v,3) for v in idx(*b).values()] for k,b in cov.items()]
w(tab(["Cell type","NDVI","EVI","SAVI","NDRE","NDWI"],rows,"Indices from illustrative reflectances (blue, red, red-edge, NIR, SWIR): dense (0.03, 0.04, 0.18, 0.45, 0.20), sparse (0.05, 0.10, 0.20, 0.30, 0.25), bare (0.09, 0.20, 0.23, 0.27, 0.35), stressed (0.04, 0.08, 0.20, 0.32, 0.28).","tab:idx"))
d=idx(*cov['Dense crop'])
body=T(r"""Compute the indices of the dense-crop cell $(\rho_B,\rho_R,\rho_{RE},\rho_N,\rho_{SW})=(0.03,0.04,0.18,0.45,0.20)$.

\textbf{Solution.} NDVI $=(0.45-0.04)/(0.45+0.04)=0.41/0.49=@n@$. EVI $=2.5\times0.41/(0.45+0.24-0.225+1)=1.025/1.465=@e@$. SAVI $=1.5\times0.41/(0.45+0.04+0.5)=0.615/0.99=@s@$. NDRE $=(0.45-0.18)/(0.45+0.18)=0.27/0.63=@r@$. NDWI $=(0.45-0.20)/(0.45+0.20)=0.25/0.65=@w@$. For the bare cell NDVI is only @nb@, and its NDWI is negative (@wb@): bare soil reflects more in the SWIR than in the NIR.""",n=fx(d['NDVI'],3),e=fx(d['EVI'],3),s=fx(d['SAVI'],3),r=fx(d['NDRE'],3),w=fx(d['NDWI'],3),nb=fx(idx(*cov['Bare soil'])['NDVI'],3),wb=fx(idx(*cov['Bare soil'])['NDWI'],3))
w(ex("indices of one cell",body))
body=T(r"""A drone photo cell has $R=110$, $G=150$, $B=60$ (8-bit). Compute VARI, GLI, ExG and NGRDI.

\textbf{Solution.} Sum $R+G+B=320$; $r=0.3438$, $g=0.4688$, $b=0.1875$. VARI $=(150-110)/(150+110-60)=40/200=@v@$. GLI $=(300-110-60)/(300+110+60)=130/470=@g@$. ExG $=2\times0.4688-0.3438-0.1875=@x@$. NGRDI $=40/260=@n@$. All four are positive: the cell is greener than red.""",v=fx(40/200,3),g=fx(130/470,3),x=fx(2*150/320-110/320-60/320,3),n=fx(40/260,3))
w(ex("visible-band indices",body))
# z-scores, fc, Kc, zone
w(r"\section{Zones, cover and the zone-by-zone balance}"+"\n"+r"""From the series of scenes each cell gets the standardised index $z_{i,t}=(\mathrm{NDVI}_{i,t}-\overline{\mathrm{NDVI}}_t)/\sigma_t$, the stability $\frac1n\sum_tz_{i,t}$ and the change $\Delta_i=\mathrm{NDVI}_{i,t_n}-\mathrm{NDVI}_{i,t_{n-1}}$. For the zone balance the cover is $f_c=(\mathrm{NDVI}-0.15)/0.7$, scaled by the model's crop development $c(t)$ as $f_{c,z}(t)=\min(1,c(t)f_c(\mathrm{NDVI}_z)/\bar f_c)$, and the crop coefficient $K_c=K_{c,\rm ini}+(K_{c,\rm mid}-K_{c,\rm ini})K_d$ with $K_d=\min(1,1.5f_c,f_c^{0.5})$ (Allen and Pereira, 2009).
""")
nd=np.array([[0.42,0.55,0.66,0.71,0.62],[0.40,0.57,0.70,0.74,0.60],[0.30,0.44,0.52,0.55,0.47],[0.45,0.60,0.72,0.76,0.66]])
mt=nd.mean(0);st=nd.std(0,ddof=0);Z=(nd-mt)/st;stab=Z.mean(1);dl_=nd[:,-1]-nd[:,-2]
rows=[[f"cell {i+1}"]+[fx(v,2) for v in nd[i]]+[fx(stab[i],2),fx(dl_[i],2)] for i in range(4)]
rows.append(["field mean"]+[fx(v,3) for v in mt]+["",""])
rows.append(["$\\sigma_t$"]+[fx(v,3) for v in st]+["",""])
w(tab(["","t1","t2","t3","t4","t5","stability","$\\Delta$"],rows,"NDVI of four cells over five scenes; population standard deviation.","tab:ndvi"))
body=T(r"""For Table~\ref{tab:ndvi} find $z_{3,t}$, the stability of cell 3 and its change since the previous scene, and say which cell belongs in the weakest monitoring zone.

\textbf{Solution.} Field means $@m@$; standard deviations $@s@$. For cell 3: $z=(0.30-@m1@)/@s1@=@z1@$, then @zr@. Stability $=\frac15\sum z=@st@$; $\Delta_3=0.47-0.55=@d@$. Cell 3 is below the field on every date (stability $@st@$), so it belongs to the weakest zone: a zone is a part of the field that is weaker on every date, not on one.""",m="("+", ".join(fx(v,3) for v in mt)+")",s="("+", ".join(fx(v,3) for v in st)+")",m1=fx(mt[0],3),s1=fx(st[0],3),z1=fx(Z[2][0],2),zr=", ".join(fx(v,2) for v in Z[2][1:]),st=fx(stab[2],2),d=fx(dl_[2],2))
w(ex("stability of a cell",body))
f_c=lambda nd:max(0,(nd-0.15)/0.7)
rows=[[fx(n,2),fx(f_c(n),3),fx(min(1,1.5*f_c(n),math.sqrt(f_c(n))),3),fx(0.30+(1.20-0.30)*min(1,1.5*f_c(n),math.sqrt(f_c(n))),3)] for n in (0.20,0.30,0.45,0.60,0.75,0.85)]
w(tab(["NDVI","$f_c$","$K_d$","$K_c$ (maize)"],rows,"Cover and crop coefficient from NDVI ($K_{c,\\rm ini}=0.30$, $K_{c,\\rm mid}=1.20$).","tab:ndvikc"))
body=T(r"""A zone has NDVI = 0.60. Find $f_c$, $K_d$ and the maize $K_c$.

\textbf{Solution.} $f_c=(0.60-0.15)/0.7=@f@$. $K_d=\min(1,1.5\times@f@,\sqrt{@f@})=\min(1,@a@,@b@)=@kd@$. $K_c=0.30+0.90\times@kd@=@kc@$. For a thin canopy (NDVI 0.30), $f_c=0.214$, $K_d=\min(1,0.321,0.463)=0.321$ and $K_c=0.589$: $K_d$ rises faster than the cover at first (the $1.5f_c$ branch) and then follows $\sqrt{f_c}$.""",f=fx(f_c(0.6),3),a=fx(1.5*f_c(0.6),3),b=fx(math.sqrt(f_c(0.6)),3),kd=fx(min(1,1.5*f_c(0.6),math.sqrt(f_c(0.6))),3),kc=fx(0.3+0.9*min(1,1.5*f_c(0.6),math.sqrt(f_c(0.6))),3))
w(ex("crop coefficient from NDVI",body))
# SCS
w(r"\section{Runoff, gullies and soil loss}"+"\n"+r"""\textbf{Runoff.} The runoff of each day follows the SCS curve number (TR-55): with $S=25400/CN-254$ (mm) and $I_a=0.2S$, $Q=(P-I_a)^2/(P+0.8S)$ for $P>I_a$. The curve number depends on the hydrologic soil group (from the SoilGrids texture) and the cover: row crop in good condition, or bare soil when the monthly NDVI is below 0.3. The values below are the standard TR-55 ones for those two classes and are quoted for the worked example; they were not checked against the program.
""")
CN={'A':(67,77),'B':(78,86),'C':(85,91),'D':(89,94)}
def Qs(P,cn):
    S=25400/cn-254;Ia=0.2*S
    return (P-Ia)**2/(P+0.8*S) if P>Ia else 0.0
rows=[[g,cv[0],cv[1]]+[fx(Qs(P,cv[0]),1) for P in (20,40,80)]+[fx(Qs(P,cv[1]),1) for P in (20,40,80)] for g,cv in CN.items()]
w(tab(["Group","CN row","CN bare","Q 20","Q 40","Q 80","bare Q 20","bare Q 40","bare Q 80"],rows,"Runoff $Q$ (mm) from daily rain $P$ = 20, 40, 80 mm.","tab:cn",spec="lrrrrrrrr"))
S78=25400/78-254
body=T(r"""A 40 mm rain falls on a group B soil under a row crop ($CN=78$) and then on the same soil bare ($CN=86$).

\textbf{Solution.} Row crop: $S=25400/78-254=@S@$ mm, $I_a=0.2S=@Ia@$ mm, $Q=(40-@Ia@)^2/(40+0.8\times@S@)=@q@$ mm. Bare ($CN=86$): $S=@S2@$, $I_a=@Ia2@$, $Q=@q2@$ mm. Bare soil sheds @r@ times as much runoff.""",S=fx(S78,1),Ia=fx(0.2*S78,1),q=fx(Qs(40,78),1),S2=fx(25400/86-254,1),Ia2=fx(0.2*(25400/86-254),1),q2=fx(Qs(40,86),1),r=fx(Qs(40,86)/Qs(40,78),2))
w(ex("runoff of one storm",body))
w(r"""\textbf{Ephemeral gullies.} A gully is likely where $G=S\,A^{0.4}/0.025\ge1$, with $A$ the upslope area (ha) and $S$ the slope (m m$^{-1}$) (Vandaele et al., 1996).
\textbf{Soil loss (RUSLE).} $A_s=RKLS\,CP$ with $R=0.0483P_a^{1.61}$ (for $P_a\le850$ mm; $587.8-1.219P_a+0.004105P_a^2$ above), shared over the months by the erosive daily rains ($P_d\ge12.7$ mm, exponent 1.81), $C_i=\sum_m(R_m/R)\,e^{-2\mathrm{NDVI}_{i,m}/(1-\mathrm{NDVI}_{i,m})}$ and $LS=(A/22.13)^{0.4}(\sin\beta/0.0896)^{1.3}$ (Moore and Wilson, 1992; $A$ the specific upslope area).
""")
rows=[]
for Aha in (0.1,0.5,1,2,5):
    for Sm in (0.01,0.03):
        G=Sm*Aha**0.4/0.025;rows.append([fx(Aha,1),fx(100*Sm,0),fx(G,2),"likely" if G>=1 else "no"])
w(tab(["$A$ (ha)","$S$ (\\%)","$G$","gully"],rows,"Gully threshold.","tab:gully"))
Pa=640.0;Rann=0.0483*Pa**1.61
mon_rain=[0,0,10,40,90,130,150,140,100,40,0,0]
mon_share=[0.0,0.0,0.01,0.06,0.14,0.20,0.23,0.19,0.13,0.04,0,0]
mon_nd=[0.25,0.25,0.25,0.30,0.45,0.65,0.72,0.70,0.55,0.35,0.25,0.25]
Cm=[math.exp(-2*n/(1-n)) for n in mon_nd]
Ceff=sum(sh*c for sh,c in zip(mon_share,Cm))/sum(mon_share)
s_=0.04;beta=math.atan(s_);Aspec=60.0
LS=(Aspec/22.13)**0.4*(math.sin(beta)/0.0896)**1.3
SAN,SIL,CLA,OC=40.0,40.0,20.0,1.2;SN1=1-SAN/100
K=(0.2+0.3*math.exp(-0.0256*SAN*(1-SIL/100)))*(SIL/(CLA+SIL))**0.3*(1-0.25*OC/(OC+math.exp(3.72-2.95*OC)))*(1-0.7*SN1/(SN1+math.exp(-5.51+22.9*SN1)))
Ksi=0.1317*K
As=Rann*Ksi*LS*Ceff
rows=[[m+1,fx(100*mon_share[m],0),fx(mon_nd[m],2),fx(Cm[m],3),fx(Rann*mon_share[m],0)] for m in range(12)]
w(tab(["month","erosive share (\\%)","NDVI","$C_m$","$R_m$"],rows,"Months of an illustrative year: erosive-rain share, NDVI and the cover factor $C_m=e^{-2\\mathrm{NDVI}/(1-\\mathrm{NDVI})}$.","tab:rusle"))
body=T(r"""Annual rain 640 mm; loam (40\% sand, 40\% silt, 20\% clay, 1.2\% organic carbon); slope 4\% with a specific upslope area of 60 m; monthly NDVI and erosive-rain share of Table~\ref{tab:rusle}. Find the soil loss with $P=1$.

\textbf{Solution.} $R=0.0483\times640^{1.61}=@R@$ MJ mm ha$^{-1}$ h$^{-1}$ y$^{-1}$. $K$ (EPIC): $0.2+0.3e^{-0.0256\times40(1-0.40)}=@k1@$; $[40/60]^{0.3}=@k2@$; organic-carbon term $@k3@$; sand term $@k4@$; $K=@K@$ (US units), $@Ksi@$ in t ha h ha$^{-1}$ MJ$^{-1}$ mm$^{-1}$. $LS=(60/22.13)^{0.4}(\sin\beta/0.0896)^{1.3}$ with $\beta=\arctan0.04$: $\sin\beta=@sb@$, $LS=@LS@$. $C=\sum(R_m/R)C_m=@C@$ (the erosive months have a green canopy, so the effective $C$ is much smaller than the bare-soil value $e^{-0.667}=0.51$). So $A_s=@R@\times@Ksi@\times@LS@\times@C@\times1=@As@$ t ha$^{-1}$ y$^{-1}$, @cmp@ the tolerable 2 t ha$^{-1}$ y$^{-1}$.""",R=fx(Rann,0),k1=fx(0.2+0.3*math.exp(-0.0256*SAN*(1-SIL/100)),4),k2=fx((SIL/(CLA+SIL))**0.3,4),k3=fx(1-0.25*OC/(OC+math.exp(3.72-2.95*OC)),4),k4=fx(1-0.7*SN1/(SN1+math.exp(-5.51+22.9*SN1)),4),K=fx(K,4),Ksi=fx(Ksi,4),sb=fx(math.sin(beta),4),LS=fx(LS,3),C=fx(Ceff,3),As=fx(As,2),cmp="below" if As<2 else "above")
w(ex("soil loss of a field",body))
w(r"""\begin{keybox}The soil-loss figure is as good as its factors: the $R$ law was fitted to rain regimes quite different from many sites, the $K$ formula is the EPIC approximation of the nomograph, and the $C$ factor from NDVI is an empirical curve. The layer presents the result against the tolerable 2 t ha$^{-1}$ y$^{-1}$ and names the risk window (months when NDVI is below 0.35 meets a large erosive share); it does not predict a gully's depth.\end{keybox}

\section{Summary}
\begin{itemize}
\item ET$_0$ from temperature (Hargreaves), radiation (Makkink), or the service (Penman--Monteith).
\item A weather file is gridded by $\rho_{\rm ref}$ and $\Delta T_{\rm ref}$; the daily layers use the file as is.
\item Area and perimeter on the sphere; slope by a fitted plane; water source by an engineered score.
\item NDVI and companions from reflectances; zones from standardised series; $K_c$ from NDVI cover.
\item Runoff by curve number; gullies by the $SA^{0.4}$ threshold; soil loss by RUSLE.
\end{itemize}
""")
open('/tmp/book/p2p.tex','w').write("\n".join(O))
print(Aa,Pp,s,dirn,As,Ceff,K,LS,best)
