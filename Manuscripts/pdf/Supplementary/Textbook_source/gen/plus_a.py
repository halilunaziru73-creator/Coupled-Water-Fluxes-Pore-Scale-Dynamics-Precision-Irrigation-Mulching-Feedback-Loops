"""Writes extra/plus01.tex ... extra/plus14.tex: one further section with drawings and a worked example for each of
chapters 1 to 14 (the chapters that already have many examples but few drawings)."""
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from plus_lib import *

P = {}
# ------------------------------------------------------------------ 01 soil water
P['01'] = r'''\banner{Further analysis: the three phases and the tensiometer}
\section{The three-phase diagram of a soil}\label{sec:sw3ph}
All the mass and volume relations of a soil follow from one picture: the three phases separated into blocks (Fig.~\ref{fig:sw3ph}). The volumes are written on the left and the masses on the right. Every definition of this chapter is a ratio of two blocks: porosity $\phi=(V_a+V_w)/V_t$, void ratio $e=(V_a+V_w)/V_s$, volumetric water content $\theta=V_w/V_t$, gravimetric water content $w=M_w/M_s$, degree of saturation $S=V_w/(V_a+V_w)$ and bulk density $\rho_b=M_s/V_t$. Two identities follow at once and are worth remembering: $\phi=1-\rho_b/\rho_s$ and $\theta=w\,\rho_b/\rho_w$.

\begin{kfig}{The three-phase diagram: the air, water and solid of a soil sample drawn as separate blocks, volumes on the left and masses on the right.\label{fig:sw3ph}}
\draw[ln,fill=white] (0,3.0) rectangle (3,4.0);\node[lab] at (1.5,3.5) {air};
\draw[wtr] (0,1.8) rectangle (3,3.0);\node[lab] at (1.5,2.4) {water};
\draw[soil] (0,0) rectangle (3,1.8);\node[lab] at (1.5,0.9) {solid};
\foreach \a/\b/\t in {3.0/4.0/V_a,1.8/3.0/V_w,0/1.8/V_s}{\draw[<->,ln] (-0.35,\a)--(-0.35,\b);\node[lab,left] at (-0.4,{(\a+\b)/2}) {$\t$};}
\draw[<->,ln] (-1.5,0)--(-1.5,4.0);\node[lab,left] at (-1.55,2) {$V_t$};
\draw[<->,ln] (-0.95,1.8)--(-0.95,4.0);\node[lab,left] at (-1.0,3.15) {$V_v$};
\node[lab,right] at (3.35,3.5) {$M_a\approx0$};\draw[<->,ln] (3.25,1.8)--(3.25,3.0);\node[lab,right] at (3.3,2.4) {$M_w=\rho_wV_w$};
\draw[<->,ln] (3.25,0)--(3.25,1.8);\node[lab,right] at (3.3,0.9) {$M_s=\rho_sV_s$};
\end{kfig}

\section{Reading a tensiometer}\label{sec:swtens}
A tensiometer is a water-filled tube closed at the bottom by a porous ceramic cup buried at the depth of measurement. Water flows through the cup until the water in the tube is in equilibrium with the soil water; the gauge at the top then shows the pressure, below atmospheric, at its own level. The cup lies a distance $z_g$ below the gauge, and the column of water adds a pressure $\rho_wgz_g$, so the suction at the cup is
\begin{equation}\label{eq:swtens}\boxed{h=\frac{P_g}{\rho_w g}-z_g}\end{equation}
where $P_g$ is the vacuum read on the gauge. A tensiometer works only up to about 80 kPa (about 800 cm), beyond which air enters the cup; it therefore covers the range of the triggers of most irrigation schedules but not the dry end.

\begin{kfig}{A tensiometer: a water-filled tube with a vacuum gauge at the top and a porous ceramic cup at the depth of measurement; the suction at the cup is the gauge reading less the height $z_g$ of the water column.}
\draw[soil] (-2.6,-4.2) rectangle (2.6,0);\draw[ln] (-2.6,0)--(2.6,0);
\fill[white] (-0.25,-3.6) rectangle (0.25,1.2);\draw[ln] (-0.25,-3.6)--(-0.25,1.2);\draw[ln] (0.25,-3.6)--(0.25,1.2);
\fill[khcyan!25] (-0.23,-3.6) rectangle (0.23,1.15);
\draw[ln,fill=khsalmon!20] (0,-3.85) ellipse (0.36 and 0.42);\node[lab,right] at (0.45,-3.9) {porous cup};
\draw[ln,fill=white] (0,1.65) circle (0.48);\draw[vec] (0,1.65)--(0.28,1.92);\node[lab,right] at (0.55,1.65) {vacuum gauge $P_g$};
\draw[<->,ln] (-0.7,1.2)--(-0.7,-3.85);\node[lab,left] at (-0.75,-1.3) {$z_g$};
\foreach \x/\y in {-1.6/-3.4,1.5/-3.0,1.9/-4.0,-1.9/-2.2}{\fill[khcyan!40] (\x,\y) circle (0.12);}
\end{kfig}

\exbox{The suction at the cup}{The gauge of a tensiometer reads a vacuum of 45 kPa. The gauge is 50 cm above the centre of the cup. Find the matric suction at the cup. Has a trigger of 300 cm been reached?}\sol \givenline{$P_g=45$ kPa ; $z_g=50$ cm}
\par\noindent $P_g/(\rho_wg)=45\,000/9810=4.59$ m $=459$ cm. From Equation~\ref{eq:swtens}, $h=459-50=409$ cm.\finans
\par\noindent The suction at the cup exceeds 300 cm, so the trigger has been reached; reading the gauge without the correction for $z_g$ would overstate the suction by 50 cm.
'''
# ------------------------------------------------------------------ 02 flow, roots
P['02'] = r'''\banner{Further analysis: measuring the conductivity and the stress of the roots}
\section{The constant-head permeameter}\label{sec:flperm}
The saturated conductivity of a core is measured by keeping a constant head difference $\Delta H$ across it and collecting the outflow. Darcy's law for the core of length $L$ and cross-section $A$ gives
\begin{equation}\label{eq:flperm}\boxed{K_s=\frac{V\,L}{A\,\Delta H\,t}}\end{equation}
where $V$ is the volume collected in the time $t$. The method suits sands and loams; for clays, whose outflow is small, the falling-head method is used instead.

\begin{kfig}{The constant-head permeameter: water is kept at a constant level above a saturated core of length $L$; the head difference $\Delta H$ drives the flow, and the outflow $V$ is collected in a time $t$.}
\draw[ln] (0,0) rectangle (2.0,2.2);\draw[soil] (0.02,0.02) rectangle (1.98,1.6);\fill[khcyan!25] (0.02,1.6) rectangle (1.98,2.15);
\draw[khcyan,line width=1pt] (0,2.15)--(2.0,2.15);\draw[vec] (1.0,3.1)--(1.0,2.25);\node[lab,above] at (1.0,3.1) {inflow};
\draw[vec] (2.05,2.15)--(2.8,2.15);\node[lab,right] at (2.8,2.15) {overflow};
\draw[ln] (1.0,0)--(1.0,-0.6)--(3.2,-0.6);\draw[vec] (3.2,-0.6)--(3.2,-1.2);\draw[ln] (2.9,-1.2) rectangle (3.5,-2.2);\fill[khcyan!25] (2.92,-1.7) rectangle (3.48,-2.18);\node[lab,right] at (3.55,-1.7) {$V$ in $t$};
\draw[<->,ln] (-0.35,0.02)--(-0.35,1.6);\node[lab,left] at (-0.4,0.8) {$L$};
\draw[<->,ln] (-1.0,-0.6)--(-1.0,2.15);\node[lab,left] at (-1.05,0.8) {$\Delta H$};\draw[gd] (-1.1,-0.6)--(1.0,-0.6);
\end{kfig}

\exbox{Conductivity of a core}{A core of length 20 cm and cross-section 78.5 cm$^2$ under a head difference of 30 cm passes 50 cm$^3$ of water in 10 minutes. Find $K_s$ in cm\,d$^{-1}$.}\sol
\[K_s=\frac{50\times20}{78.5\times30\times10}=0.0425\ \text{cm\,min}^{-1}=61\ \text{cm\,d}^{-1}\quad\text{\finans}\]
This value lies between the loam and the sandy loam of the ten soils.

\section{The reduction of root uptake by stress}\label{sec:flfeddes}
The uptake of Equation~(\ref{eq:dm-feddes}) is reduced by the factor $\alpha_s(h)$ of Feddes, a trapezoid in the suction: zero in a saturated soil (lack of oxygen, $h<h_1$), one between $h_2$ and $h_3$, falling linearly to zero at the wilting point $h_4$. The upper point $h_3$ depends on the demand: when the atmosphere asks for much water, the roots cannot keep up at a lower suction than on a dull day.

\begin{kfig}{The stress-reduction function of root uptake (Feddes): no uptake in a saturated soil and at the wilting point, full uptake between $h_2$ and $h_3$; $h_3$ is lower at high demand (dashed).}
\draw[axis] (0,0)--(7.2,0);\draw[axis] (0,0)--(0,2.8);
\node[lab,below] at (3.6,-0.5) {suction $h$ (log scale)};\node[lab,rotate=90] at (-0.4,1.2) {$\alpha_s$};
\draw[crv] (0.2,0)--(0.9,2.2)--(3.4,2.2)--(6.6,0);\draw[gd] (2.5,2.2)--(6.6,0);
\foreach \x/\t in {0.2/h_1,0.9/h_2,3.4/h_3,6.6/h_4}{\draw[ln] (\x,0)--(\x,-0.1);\node[lab,below] at (\x,-0.1) {$\t$};}
\node[lab,left] at (0,2.2) {1};\node[lab] at (2.3,2.5) {high demand};
\end{kfig}
'''
# ------------------------------------------------------------------ 03 triggers: computed reach curves
ax, mp = axes(1, 1e5, 1e-16, 1, W=7.0, H=4.2, xlab='suction $h$ (cm)', ylab='$K_r$ (log scale)',
              xt=[(1, '1'), (100, '$10^2$'), (1e4, '$10^4$')], yt=[(1e-16, '$10^{-16}$'), (1e-8, '$10^{-8}$'), (1, '1')], logx=True, logy=True)
xs = logspace(1, 1e5, 70)
sand = curve(mp, xs, lambda h: max(Kr(h, 0.145, 2.68), 1e-16), 'crv', clip=(0, 4.2))
loam = curve(mp, xs, lambda h: max(Kr(h, 0.036, 1.56), 1e-16), 'ln', clip=(0, 4.2))
X1, Y = mp(1, KAPPA); X2, _ = mp(1e5, KAPPA); hs = hc(0.145, 2.68); hl = hc(0.036, 1.56)
xs1, _ = mp(hs, KAPPA); xl1, _ = mp(hl, KAPPA)
t3 = theta(300, 'S06'); t1 = theta(100, 'S06')
P['03'] = T(r'''\banner{Further analysis: the reach on the conductivity curve and the interval of a trigger}
\section{Where the conductivity meets $\kappa$}\label{sec:trkr}
The reach of a trigger is not read off a table; it is the suction at which the conductivity curve of the soil crosses the constant $\kappa$ (Fig.~\ref{fig:trkr}). The figure is drawn from Equation~(\ref{eq:asym}) and the exact Mualem curve for the sand and the loam of the study. The sand crosses the line at <<HS>> cm, before the usual triggers of 300 to 600 cm; the loam crosses it at about <<HL>> cm, far beyond them.

\begin{kfig}{Relative conductivity of the sand (magenta) and the loam (blue) against suction, with the line $K_r=\kappa=3.47\times10^{-10}$. The crossings are the reaches: <<HS>> cm for the sand, about <<HL>> cm for the loam.\label{fig:trkr}}
<<AX>>
<<SAND>>
<<LOAM>>
\draw[gd] (<<X1>>,<<Y>>)--(<<X2>>,<<Y>>);\node[lab,above right] at (<<X1>>,<<Y>>) {$\kappa$};
\draw[gd] (<<XS>>,0)--(<<XS>>,<<Y>>);\draw[gd] (<<XL>>,0)--(<<XL>>,<<Y>>);
\fill[khmag] (<<XS>>,<<Y>>) circle (0.07);\fill[khcyan] (<<XL>>,<<Y>>) circle (0.07);
\node[lab,text=khmag] at (2.0,1.4) {sand};\node[lab,text=khcyan!70!black] at (5.6,2.9) {loam};
\end{kfig}

\section{The interval between irrigations at a trigger}\label{sec:trint}
For a trigger inside the reach, the water depleted between two irrigations is the water released by the root zone between field capacity and the trigger suction. With the retention curve of the soil,
\begin{equation}\label{eq:trint}\boxed{\Delta S=1000\,Z_r\bigl[\theta(h_{fc})-\theta(h_t)\bigr],\qquad t_i=\frac{\Delta S}{ET_c}}\end{equation}
where $Z_r$ is the root depth (m), $h_{fc}=100$ cm and $h_t$ the trigger. The formula assumes that the sensor sees the mean state of the root zone; a sensor in the upper roots sees a drier soil and fires earlier.

\begin{kfig}{The sensor in the root zone: water is withdrawn by the roots until the suction at the sensor reaches the trigger $h_t$; the depletion $\Delta S$ is then replaced by irrigation.}
\draw[soil] (0,0) rectangle (5,3.0);\draw[ln] (0,3.0)--(5,3.0);
\foreach \x in {1,2.5,4}{\draw[draw=green!45!black,line width=0.8pt] (\x,3.0)--(\x,3.7);\draw[draw=green!45!black] (\x,3.0)--(\x,1.4) (\x,2.6)--(\x-0.4,1.8) (\x,2.6)--(\x+0.4,1.8) (\x,2.0)--(\x-0.3,1.4) (\x,2.0)--(\x+0.3,1.4);}
\draw[ln,fill=khsalmon!20] (3.2,2.1) rectangle (3.5,2.4);\draw[ln] (3.35,2.4)--(3.35,3.4);\node[lab,right] at (3.5,3.4) {sensor: $h=h_t$?};
\draw[gd] (0,1.2)--(5,1.2);\node[lab,right] at (5,1.2) {$Z_r$};
\draw[vec] (0.4,4.2)--(0.4,3.1);\node[lab,above] at (0.4,4.2) {$I=\Delta S/E_a$};
\end{kfig}

\exbox{Interval at a 300 cm trigger on the loam}{The loam S06 ($\alpha=0.036$ cm$^{-1}$, $n=1.56$, $\theta_r=0.078$, $\theta_s=0.43$) has a root zone of 0.6 m and a crop using 5 mm\,d$^{-1}$. Find the depletion between field capacity (100 cm) and a trigger of 300 cm, and the interval between irrigations.}\sol
\par\noindent $\theta(100)=0.078+0.352\,S_e(100)=<<T1>>$ and $\theta(300)=<<T3>>$.
\par\noindent $\Delta S=1000\times0.6\times(<<T1>>-<<T3>>)=<<DS>>$ mm; $t_i=<<DS>>/5=<<TI>>$ days.\finans
''', HS='%.0f' % hs, HL='{:,.0f}'.format(round(hl, -2)).replace(',', '\\,'), AX=ax, SAND=sand, LOAM=loam, X1='%.3f' % X1, X2='%.3f' % X2, Y='%.3f' % Y,
       XS='%.3f' % xs1, XL='%.3f' % xl1, T1='%.3f' % t1, T3='%.3f' % t3, DS='%.1f' % (600 * (t1 - t3)), TI='%.1f' % (600 * (t1 - t3) / 5))
# ------------------------------------------------------------------ 04 auditing
P['04'] = r'''\banner{Further analysis: reading the agreement of a model with a reference}
\section{The 1:1 plot and its three kinds of error}\label{sec:au11}
A model is compared with a reference (measurements, or a more complete model) on a plot of predicted against observed values. Three kinds of disagreement can be seen on it: a \kw{bias}, when the points lie on a line parallel to the 1:1 line; a \kw{scale error}, when they lie on a line of another slope; and \kw{scatter}, when they spread about their own line. The mean squared error separates exactly into these parts,
\begin{equation}\label{eq:aumse}\boxed{\overline{(P-O)^2}=(\overline P-\overline O)^2+(s_P-r\,s_O)^2+(1-r^2)\,s_O^2}\end{equation}
where $s_P$ and $s_O$ are the standard deviations and $r$ the correlation. The first term is the bias, the second the error of scale and the third the scatter that no linear correction can remove.

\begin{kfig}{The 1:1 plot: a biased model (left), a model with a scale error (centre) and a scattered but unbiased model (right).}
\foreach \s/\lab in {0/bias,3.2/scale,6.4/scatter}{\begin{scope}[xshift=\s cm]\draw[axis] (0,0)--(2.6,0);\draw[axis] (0,0)--(0,2.6);\draw[gd] (0,0)--(2.4,2.4);\node[lab,below] at (1.2,-0.05) {observed};\node[lab,above] at (1.2,2.6) {\lab};\end{scope}}
\foreach \x in {0.3,0.7,1.1,1.5,1.9}{\fill[khmag] (\x,\x+0.4) circle (0.06);\fill[khmag] (3.2+\x,{0.25+0.55*\x}) circle (0.06);}
\foreach \x/\d in {0.3/0.25,0.6/-0.3,0.9/0.35,1.2/-0.25,1.5/0.3,1.8/-0.35,2.1/0.15}{\fill[khmag] (6.4+\x,\x+\d) circle (0.06);}
\end{kfig}

\exbox{Splitting an error}{Twenty years of drainage give $\overline O=172$ mm, $s_O=48$ mm from Daisy, and $\overline P=181$ mm, $s_P=44$ mm from a simpler model, with $r=0.95$. Find the three parts of the mean squared error and the RMSE.}\sol
\par\noindent Bias: $(181-172)^2=81$; scale: $(44-0.95\times48)^2=(44-45.6)^2=2.6$; scatter: $(1-0.9025)\times48^2=224.6$ mm$^2$.
\par\noindent $MSE=81+2.6+224.6=308$ mm$^2$ and $RMSE=17.6$ mm.\finans
\par\noindent Most of the error is scatter (73 per cent): the simple model has the right level and range but misses year-to-year detail.
'''
# ------------------------------------------------------------------ 05 ET
P['05'] = r'''\banner{Further analysis: the crop coefficient curve and the stress coefficient}
\section{Building the crop coefficient curve}\label{sec:etkc}
The single crop coefficient of FAO-56 is drawn as four straight segments over the four stages of the season: initial ($K_{c,ini}$, constant), development (rising linearly), mid-season ($K_{c,mid}$, constant) and late season (falling linearly to $K_{c,end}$). On a day $i$ of the development stage,
\begin{equation}\label{eq:etkc}\boxed{K_c=K_{c,ini}+\frac{i-L_{ini}}{L_{dev}}\bigl(K_{c,mid}-K_{c,ini}\bigr)}\end{equation}
where $L_{ini}$ and $L_{dev}$ are the lengths of the initial and the development stages (days).

\begin{kfig}{The crop coefficient curve of FAO-56: four stages, with $K_{c,ini}$, $K_{c,mid}$ and $K_{c,end}$ joined by straight lines.}
\draw[axis] (0,0)--(7.4,0);\draw[axis] (0,0)--(0,3.2);
\node[lab,below] at (3.6,-0.45) {days after sowing};\node[lab,rotate=90] at (-0.5,1.5) {$K_c$};
\draw[crv] (0,0.75)--(1.2,0.75)--(3.0,2.6)--(5.4,2.6)--(6.9,0.9);
\foreach \x/\t in {0.6/ini,2.1/dev,4.2/mid,6.15/late}{\node[lab] at (\x,3.05) {\t};}
\foreach \x in {1.2,3.0,5.4}{\draw[gd] (\x,0)--(\x,2.9);}
\node[lab,left] at (0,0.75) {$K_{c,ini}$};\node[lab,left] at (0,2.6) {$K_{c,mid}$};\node[lab,right] at (6.9,0.9) {$K_{c,end}$};
\end{kfig}

\exbox{Crop water use in the development stage}{A crop has $K_{c,ini}=0.30$, $K_{c,mid}=1.15$, $L_{ini}=20$ d and $L_{dev}=30$ d. Find $K_c$ and $ET_c$ on day 35 when $ET_0=5.0$ mm\,d$^{-1}$.}\sol
\[K_c=0.30+\frac{35-20}{30}(1.15-0.30)=0.725,\qquad ET_c=0.725\times5.0=3.6\ \text{mm\,d}^{-1}\quad\text{\finans}\]

\section{The water stress coefficient}\label{sec:etks}
When the depletion of the root zone $D_r$ exceeds the readily available water, the crop transpires less. FAO-56 writes $ET_{c,adj}=K_sK_cET_0$ with
\begin{equation}\label{eq:etks}\boxed{K_s=\frac{\TAW-D_r}{(1-p)\,\TAW}\quad\text{for }D_r>p\,\TAW,\qquad K_s=1\ \text{otherwise}}\end{equation}

\begin{kfig}{The water stress coefficient against the depletion of the root zone: no stress until the readily available water $p\,\TAW$ is used, then a linear fall to zero at $\TAW$.}
\draw[axis] (0,0)--(6.4,0);\draw[axis] (0,0)--(0,2.8);
\node[lab,below] at (3.0,-0.45) {depletion $D_r$};\node[lab,rotate=90] at (-0.4,1.2) {$K_s$};
\draw[crv] (0,2.2)--(2.8,2.2)--(5.8,0);\draw[gd] (2.8,0)--(2.8,2.2);
\node[lab,below] at (2.8,0) {$p\,\TAW$};\node[lab,below] at (5.8,0) {$\TAW$};\node[lab,left] at (0,2.2) {1};
\end{kfig}

\exbox{Stressed water use}{A root zone has $\TAW=120$ mm and $p=0.5$. Find $K_s$ when the depletion is 84 mm, and the actual water use if $K_c=1.15$ and $ET_0=6$ mm\,d$^{-1}$.}\sol
\par\noindent $D_r=84>60$ mm, so $K_s=(120-84)/(0.5\times120)=0.60$; $ET_{c,adj}=0.60\times1.15\times6=4.1$ mm\,d$^{-1}$.\finans
'''
# ------------------------------------------------------------------ 06 design math
P['06'] = r'''\banner{Further analysis: the energy line of a pipe and the intake curve}
\section{The energy grade line of a pipe}\label{sec:dmegl}
The total head of water in a pipe is the sum of the elevation $z$, the pressure head $p/(\rho_wg)$ and the velocity head $v^2/(2g)$. Along the pipe it falls by the friction loss $h_f$ and by local losses at fittings. Drawing the \kw{energy grade line} and the \kw{hydraulic grade line} (energy line less the velocity head) shows at once where the pressure is lowest, which is where an emitter or a sprinkler will deliver least.
\begin{equation}\label{eq:dmbern}\boxed{z_1+\frac{p_1}{\rho_wg}+\frac{v_1^2}{2g}=z_2+\frac{p_2}{\rho_wg}+\frac{v_2^2}{2g}+h_f}\end{equation}

\begin{kfig}{Energy grade line (EGL) and hydraulic grade line (HGL) of a pipe: the energy falls along the pipe by the friction loss $h_f$; the pressure head is the height of the HGL above the pipe.}
\draw[ln,line width=1.2pt] (0,0.3)--(7,-0.4);\node[lab,below] at (3.5,-0.15) {pipe};
\draw[crv] (0,3.4)--(7,2.0);\draw[gd] (0,3.0)--(7,1.6);
\node[lab,right] at (7,2.0) {EGL};\node[lab,right] at (7,1.6) {HGL};
\draw[<->,ln] (1.5,0.15)--(1.5,2.7);\node[lab,right] at (1.5,1.5) {$p/\rho_wg$};
\draw[<->,ln] (2.5,2.5)--(2.5,2.9);\node[lab,right] at (2.55,2.75) {$v^2/2g$};
\draw[ln] (0,3.4)--(7,3.4);\draw[<->,ln] (6.5,3.4)--(6.5,2.1);\node[lab,left] at (6.45,2.8) {$h_f$};
\draw[ln] (-0.3,-0.6)--(7.3,-0.6);\node[lab,below] at (0.3,-0.6) {datum};
\end{kfig}

\section{The intake curve of Kostiakov}\label{sec:dmkost}
The cumulative infiltration of a soil after an opportunity time $\tau$ is often fitted by $Z=k\tau^{a}$ ($0<a<1$). It answers the question that every surface design asks: how long must water stand on the soil to infiltrate the required depth?
\begin{equation}\label{eq:dmkost}\boxed{Z=k\,\tau^{a}\quad\Longrightarrow\quad\tau_{\mathrm{req}}=\Bigl(\frac{Z_{\mathrm{req}}}{k}\Bigr)^{1/a}}\end{equation}

\begin{kfig}{The Kostiakov intake curve $Z=k\tau^a$: the infiltration rate is high at first and falls with time; the time to infiltrate the required depth is read from the curve.}
\draw[axis] (0,0)--(6.6,0);\draw[axis] (0,0)--(0,3.4);
\node[lab,below] at (3.2,-0.1) {opportunity time $\tau$};\node[lab,rotate=90] at (-0.4,1.6) {cumulative intake $Z$};
\draw[crv,smooth,domain=0:6.2] plot (\x,{1.25*\x^0.55});
\draw[gd] (0,2.6)--(3.78,2.6)--(3.78,0);\node[lab,left] at (0,2.6) {$Z_{\mathrm{req}}$};\node[lab,below] at (3.78,0) {$\tau_{\mathrm{req}}$};
\end{kfig}

\exbox{Time to infiltrate the required depth}{A soil has $k=0.012$ m\,min$^{-a}$ and $a=0.45$. How long must water stand on it to infiltrate 80 mm?}\sol
\[\tau_{\mathrm{req}}=\Bigl(\frac{0.080}{0.012}\Bigr)^{1/0.45}=6.667^{2.222}=67.7\ \text{min}\quad\text{\finans}\]
'''
# ------------------------------------------------------------------ 07 tour
P['07'] = r'''\banner{Further analysis: how the layers share their data}
\section{The data flow between the layers}\label{sec:tourflow}
The layers of SWAFL are not independent screens. They share one project: a soil, a crop, a weather record, a field and a set of management choices. Each layer reads the project and writes its results back to the Dashboard, so that a change made in one layer (a mulch, a trigger, a crop) is seen by every other layer after the next run. Fig.~\ref{fig:tourflow} draws the flow. Reading a result therefore always begins by asking which inputs of the project it depends on.

\begin{kfig}{The data flow of a SWAFL project: the shared inputs feed the engines; the engines feed the layers of the field, the control and the design; every layer reports to the Dashboard.\label{fig:tourflow}}
\tikzset{bx/.style={draw=khcyan,fill=khfeat,line width=0.6pt,minimum width=2.1cm,minimum height=0.75cm,font=\sffamily\scriptsize,align=center}}
\node[bx] (in) at (0,2.2) {Project inputs\\ soil, crop, weather,\\ field, management};
\node[bx] (e) at (3.4,2.2) {Engines\\ 1 (ensemble)\\ 2 (Richards)};
\node[bx] (f) at (6.8,3.4) {Field balance,\\ soil structure, mulch};
\node[bx] (c) at (6.8,2.2) {Control: sensor,\\ trigger, schedule};
\node[bx] (d) at (6.8,1.0) {Design: surface,\\ drip, sprinkler, drains};
\node[bx] (db) at (3.4,0) {Dashboard: results,\\ charts, messages};
\draw[vec] (in)--(e);\draw[vec] (e.east)--(f.west);\draw[vec] (e)--(c);\draw[vec] (e.east)--(d.west);
\draw[vec] (f.south east)--++(0.5,-0.3)|-(db.east);\draw[vec] (d.south)|-(db.east);\draw[vec] (db.west)-|(in.south);
\node[lab] at (1.2,-0.25) {next run};
\end{kfig}

\section{The Daisy workbench beside the layers}\label{sec:tourdaisy}
The Daisy workbench is the second half of the program. The layers answer questions from the archived ensemble and the fast engines in seconds; the workbench prepares and runs new Daisy simulations, which take minutes to hours, and hands their results back to the layers. The choice between them follows from the question: a decision on a known soil and crop is answered by the layers; a new soil, crop or management that the ensemble does not contain needs a new Daisy experiment.

\begin{kfig}{Two routes to an answer: the layers answer from the ensemble and the engines in seconds; the workbench runs Daisy in minutes to hours and hands the result back.}
\tikzset{bx/.style={draw=khcyan,fill=khfeat,line width=0.6pt,minimum width=2.4cm,minimum height=0.8cm,font=\sffamily\scriptsize,align=center}}
\node[bx] (q) at (0,1) {Question};\node[bx] (l) at (3.6,2) {Layers\\ seconds};\node[bx] (w) at (3.6,0) {Daisy workbench\\ minutes to hours};\node[bx] (a) at (7.2,1) {Decision};
\draw[vec] (q)--(l);\draw[vec] (q)--(w);\draw[vec] (l)--(a);\draw[vec] (w)--(a);\draw[vec,dashed] (w)--node[right,lab]{hand-over}(l);
\end{kfig}
'''
# ------------------------------------------------------------------ 08 engines
P['08'] = r'''\banner{Further analysis: composing a result by ratios}
\section{Composition by ratios in Engine 1}\label{sec:engratio}
Engine 1 does not run a model. It composes a result from the archived Daisy experiments: it starts from the baseline of the chosen soil and multiplies it by the ratio that each chosen factor produced in its own experiment. For a yield,
\begin{equation}\label{eq:engratio}\boxed{Y=Y_0\prod_{j}\frac{Y_j}{Y_{0,j}}}\end{equation}
where $Y_0$ is the baseline yield and $Y_j/Y_{0,j}$ the ratio found for factor $j$ in its experiment. Additive quantities (drainage, evaporation) are composed by differences instead of ratios. The composition is exact for each factor alone and approximate when factors interact; the held-out test of this chapter measures that approximation.

\begin{kfig}{Engine 1 composes a result: the baseline of the soil is multiplied by the ratio of each chosen factor, read from its own Daisy experiment.}
\tikzset{bx/.style={draw=khcyan,fill=khfeat,line width=0.6pt,minimum width=1.9cm,minimum height=0.75cm,font=\sffamily\scriptsize,align=center}}
\node[bx] (b) at (0,0) {baseline\\ $Y_0$};\node[bx] (r1) at (2.6,1.1) {trigger ratio};\node[bx] (r2) at (2.6,0) {mulch ratio};\node[bx] (r3) at (2.6,-1.1) {climate ratio};
\node[draw=khmag,circle,font=\large] (x) at (4.8,0) {$\times$};\node[bx] (y) at (6.9,0) {result $Y$};
\draw[vec] (b)--(x);\foreach \r in {r1,r2,r3}{\draw[vec] (\r.east)--(x);}\draw[vec] (x)--(y);
\end{kfig}

\exbox{A composed yield}{The rainfed baseline yield of a soil is 5.0 Mg\,ha$^{-1}$. In its experiments a 300 cm trigger raised the yield by the ratio 1.12 and a mulch by 1.05. Find the composed yield of the irrigated, mulched field.}\sol
\[Y=5.0\times1.12\times1.05=5.88\ \text{Mg\,ha}^{-1}\quad\text{\finans}\]
If the true combined effect were 5.70 Mg\,ha$^{-1}$, the composition error would be 3 per cent: the interaction of irrigation and mulch is mildly negative, because each saves part of the same water.
'''
# ------------------------------------------------------------------ 09 structure, mulch
P['09'] = r'''\banner{Further analysis: consolidation after tillage and the vapour barrier of a mulch}
\section{Consolidation of a tilled layer}\label{sec:stconsol}
Tillage loosens the plough layer; rain and wetting--drying cycles then consolidate it back towards its natural porosity. The change is close to an exponential decay with a consolidation time $\tau_c$:
\begin{equation}\label{eq:stconsol}\boxed{\phi(t)=\phi_c+(\phi_0-\phi_c)\,e^{-t/\tau_c}}\end{equation}
where $\phi_0$ is the porosity just after tillage and $\phi_c$ the consolidated porosity. The large pores made by tillage are lost first, so the conductivity and the retention near saturation change faster than the total porosity.

\begin{kfig}{Porosity of a tilled layer after tillage: an exponential return towards the consolidated porosity $\phi_c$ with time constant $\tau_c$.}
\draw[axis] (0,0)--(6.6,0);\draw[axis] (0,0)--(0,3.2);
\node[lab,below] at (3.2,-0.1) {days after tillage};\node[lab,rotate=90] at (-0.4,1.5) {porosity $\phi$};
\draw[crv,smooth,domain=0:6.3] plot (\x,{1.0+1.9*exp(-\x/1.6)});
\draw[gd] (0,1.0)--(6.3,1.0);\node[lab,left] at (0,1.0) {$\phi_c$};\node[lab,left] at (0,2.9) {$\phi_0$};
\draw[gd] (1.6,0)--(1.6,1.70);\node[lab,below] at (1.6,0) {$\tau_c$};
\end{kfig}

\exbox{Porosity a month after tillage}{A plough layer has $\phi_0=0.55$ after tillage and $\phi_c=0.45$ when consolidated, with $\tau_c=60$ days. Find the porosity after 30 days.}\sol
\[\phi(30)=0.45+0.10\,e^{-0.5}=0.511\quad\text{\finans}\]

\section{The vapour barrier of a mulch}\label{sec:stmulch}
A mulch of thickness $b$ adds a diffusion resistance $r_m=b\,\tau_m/D_v$ in series with the resistance of the air above, where $\tau_m$ is the tortuosity of the mulch and $D_v$ the diffusivity of vapour ($2.5\times10^{-5}$ m$^2$\,s$^{-1}$). The evaporation from a wet soil under the mulch is reduced in the ratio of the resistances, $E/E_0=r_a/(r_a+r_m)$, so a thin mulch on a still day, when $r_a$ is large, saves less than the same mulch on a windy day.

\begin{kfig}{Evaporation through a mulch: vapour from the wet soil diffuses through the mulch (resistance $r_m$) and then into the air (resistance $r_a$); the two resistances act in series.}
\draw[soil] (0,0) rectangle (6,1.2);\fill[khgold!40] (0,1.2) rectangle (6,1.9);
\foreach \x in {0.3,0.8,...,5.8}{\draw[draw=khgold!80!black,line width=0.6pt] (\x,1.3)--(\x+0.35,1.8);}
\draw[vec] (1.5,1.0)--(1.5,3.2);\draw[vec] (4.5,1.0)--(4.5,3.2);
\draw[<->,ln] (6.3,1.2)--(6.3,1.9);\node[lab,right] at (6.35,1.55) {mulch, $r_m$};\node[lab,right] at (6.35,2.6) {air, $r_a$};\node[lab,right] at (6.35,0.6) {wet soil};
\end{kfig}

\exbox{Saving by a straw mulch}{A straw mulch 5 cm thick has a tortuosity of 1.5. The aerodynamic resistance of the air is 100 s\,m$^{-1}$. Find the resistance of the mulch and the fraction of the evaporation that remains.}\sol
\par\noindent $r_m=0.05\times1.5/2.5\times10^{-5}=3000$ s\,m$^{-1}$; $E/E_0=100/3100=0.032$.\finans
\par\noindent The mulch cuts the evaporation of a wet surface to about 3 per cent; in practice the saving is smaller, because the soil under the mulch also dries and water reaches the surface between the straws.
'''
P['10'] = r'''\banner{Further analysis: the geometry of a scan and the volume of a plant}
\section{The ring of views around the plant}\label{sec:phring}
A three-dimensional scan of a plant is built from views taken all around it. With $N$ cameras (or positions) on a ring of radius $R$ at height $z_c$, two neighbouring views overlap when their angular separation $360^\circ/N$ is smaller than the field of view of the camera, and every point of the plant is seen from at least two directions when the overlap is large enough. Points seen in two views are matched and their position is found by triangulation; the clouds of all views are then joined (registered) into one.

\begin{kfig}{A ring of $N$ views around the plant: each camera sees the plant from an angle $360^\circ/N$ apart; overlapping views allow triangulation of points of the leaves.}
\draw[gd] (0,0) circle (2.4);\draw[draw=green!45!black,line width=1pt] (0,-0.9)--(0,0.9) (0,0.2)--(-0.6,0.7) (0,0.4)--(0.6,0.9) (0,-0.2)--(0.55,0.2) (0,-0.4)--(-0.5,-0.05);
\foreach \a in {0,60,...,300}{\begin{scope}[rotate=\a]\draw[ln,fill=khfeat] (2.4,-0.18) rectangle (2.75,0.18);\draw[thin ln] (2.4,0)--(0.4,0.9);\draw[thin ln] (2.4,0)--(0.4,-0.9);\end{scope}}
\node[lab] at (0,-2.9) {$N=6$ views, $60^\circ$ apart, ring radius $R$};
\end{kfig}

\section{The volume of a crown}\label{sec:phvol}
The simplest summary of a scanned plant is the volume of its crown. An ellipsoid fitted to the cloud of points gives $V=\tfrac43\pi abc$ with semi-axes $a$, $b$ (horizontal) and $c$ (vertical); the convex hull of the points gives an upper bound and the voxel count of the points a lower bound. Under drought the leaves roll and the crown shrinks, which is the signal that the volumetric phenotyping layer reads.

\begin{kfig}{Three measures of the volume of a crown: the convex hull (outer polygon), a fitted ellipsoid (dashed) and the voxels occupied by points (squares).}
\foreach \x/\y in {-1.2/0.2,-0.9/0.9,-0.3/1.4,0.4/1.3,1.0/0.8,1.3/0.1,0.9/-0.6,0.2/-0.9,-0.6/-0.7,-0.2/0.3,0.5/0.4,-0.6/0.4,0.2/-0.2}{\fill[khcyan!60] (\x-0.12,\y-0.12) rectangle (\x+0.12,\y+0.12);}
\draw[crv] (-1.35,0.2)--(-0.95,1.05)--(-0.3,1.55)--(0.45,1.45)--(1.15,0.85)--(1.45,0.1)--(1.0,-0.75)--(0.2,-1.05)--(-0.7,-0.85)--cycle;
\draw[gd] (0,0.25) ellipse (1.3 and 1.15);
\end{kfig}

\exbox{Volume of a crown}{A scanned maize plant has a crown 0.8 m high and 0.6 m wide in both horizontal directions. Find the volume of the fitted ellipsoid. Under drought the leaves roll and the width falls to 0.45 m; find the relative fall of the volume.}\sol
\par\noindent $V=\tfrac43\pi\times0.3\times0.3\times0.4=0.151$ m$^3$.\finans
\par\noindent After rolling: $V=\tfrac43\pi\times0.225\times0.225\times0.4=0.0848$ m$^3$, a fall of $1-(0.45/0.6)^2=44$ per cent.\finans
'''
P['11'] = r'''\banner{Further analysis: the furrow and the opportunity time}
\section{The cross-section of a furrow}\label{sec:sifurrow}
A furrow is a small trapezoidal channel. Its flow area $A$, wetted perimeter $P_w$ and hydraulic radius $R=A/P_w$ set the velocity by Manning's equation, $v=R^{2/3}S_0^{1/2}/n$, and the wetted perimeter also sets the area through which water infiltrates.

\begin{kfig}{Cross-section of a furrow: bottom width $b$, side slope $z$ (horizontal per unit vertical) and flow depth $y$; area $A=by+zy^2$ and wetted perimeter $P_w=b+2y\sqrt{1+z^2}$.}
\draw[soil] (-3,-1.6) rectangle (3,0.6);\fill[white] (-2.4,0.6)--(-0.5,-1.2)--(0.5,-1.2)--(2.4,0.6)--cycle;
\fill[wtr] (-1.55,-0.2)--(-0.5,-1.2)--(0.5,-1.2)--(1.55,-0.2)--cycle;\draw[ln] (-2.4,0.6)--(-0.5,-1.2)--(0.5,-1.2)--(2.4,0.6);
\draw[<->,ln] (-0.5,-1.45)--(0.5,-1.45);\node[lab,below] at (0,-1.45) {$b$};
\draw[<->,ln] (2.7,-1.2)--(2.7,-0.2);\node[lab,right] at (2.75,-0.7) {$y$};
\draw[ln] (1.55,-0.2)--(2.1,-0.2)--(2.1,0.3);\node[lab] at (2.35,0.0) {1};\node[lab] at (1.8,-0.42) {$z$};
\end{kfig}

\section{Advance, recession and the opportunity time}\label{sec:siopp}
Water advances down the field and later recedes after the inflow is cut off. At each distance $x$ the \kw{opportunity time} is the time between the arrival of the advance front and the passage of the recession: $\tau(x)=t_r(x)-t_a(x)$. The infiltrated depth follows from $\tau$ by the intake curve (Equation~\ref{eq:dmkost}). A uniform application needs the two curves to be nearly parallel.

\begin{kfig}{Advance and recession curves of a surface irrigation: the vertical distance between them is the opportunity time $\tau(x)$, which sets the infiltrated depth.}
\draw[axis] (0,0)--(6.8,0);\draw[axis] (0,0)--(0,4.2);
\node[lab,below] at (3.2,-0.1) {distance along the field $x$};\node[lab,rotate=90] at (-0.4,2) {time $t$};
\draw[crv,smooth] plot coordinates {(0,0) (1.5,0.45) (3,1.05) (4.5,1.75) (6.2,2.6)};\node[lab] at (5.2,1.75) {advance};
\draw[ln,smooth] plot coordinates {(0,3.2) (2,3.4) (4,3.6) (6.2,3.8)};\node[lab,above] at (3,3.5) {recession};
\draw[<->,ln] (3,1.05)--(3,3.5);\node[lab,right] at (3,2.3) {$\tau(x)$};\draw[gd] (0,3.0)--(0.6,3.0);\node[lab,left] at (0,3.0) {cut-off};
\end{kfig}

\exbox{Depth at the head and at the tail}{The advance reaches the end of a furrow in 120 min; the inflow is cut off at 300 min and the recession takes 20 min, uniformly. With $Z=0.0045\,\tau^{0.5}$ (m, min), find the depths infiltrated at the head and at the tail.}\sol
\par\noindent Head: $\tau=300+20=320$ min, $Z=0.0045\sqrt{320}=0.0805$ m $=80$ mm.
\par\noindent Tail: $\tau=320-120=200$ min, $Z=0.0045\sqrt{200}=0.0636$ m $=64$ mm.\finans
\par\noindent The tail receives 79 per cent of the head depth; to reach a required 64 mm at the tail, the head is over-irrigated by 16 mm.
'''
P['12'] = r'''\banner{Further analysis: the wetted bulb and the pressure along a lateral}
\section{The shape of the wetted bulb}\label{sec:dribulb}
Below a dripper, water spreads sideways by capillarity and downwards by gravity. In a fine soil the capillary pull is strong and the bulb is wide and shallow; in a coarse soil gravity dominates and the bulb is narrow and deep. The ratio of width to depth is the \kw{aspect ratio} of the bulb; it decides the spacing of the emitters that gives a continuous wetted strip.

\begin{kfig}{Wetted bulbs under a dripper: wide and shallow in a fine soil (left), narrow and deep in a coarse soil (right).}
\draw[soil] (-6.2,-3.4) rectangle (6.2,0);\draw[ln] (-6.2,0)--(6.2,0);
\fill[wtr,opacity=0.6] (-3.1,0) ellipse (2.2 and 1.4);\fill[wtr,opacity=0.6] (3.1,0) ellipse (1.1 and 2.8);
\fill[khmag] (-3.1,0.12) circle (0.1);\fill[khmag] (3.1,0.12) circle (0.1);
\node[lab,above] at (-3.1,0.25) {fine soil};\node[lab,above] at (3.1,0.25) {coarse soil};
\end{kfig}

\section{Pressure along a lateral on a slope}\label{sec:drislope}
The pressure along a lateral is the inlet head less the friction loss accumulated so far plus the drop in elevation. Downhill, the gain of elevation can balance the friction, so that the pressure is nearly uniform; uphill, the two add and the last emitters receive least. The emission uniformity $EU=100\,(1-1.27\,C_v/\sqrt{n_e})\,q_{\min}/q_{\mathrm{avg}}$ summarises the result, where $C_v$ is the manufacturing coefficient of variation and $n_e$ the number of emitters per plant.

\begin{kfig}{Pressure head along a lateral: on level ground it falls by friction (solid); downhill the elevation gain balances part of the loss (dashed).}
\draw[axis] (0,0)--(6.6,0);\draw[axis] (0,0)--(0,3.4);
\node[lab,below] at (3.2,-0.1) {distance along the lateral};\node[lab,rotate=90] at (-0.4,1.6) {pressure head};
\draw[crv,smooth,domain=0:6.2] plot (\x,{3.0-1.4*(1-(1-\x/6.2)^2.852)});\draw[gd,smooth,domain=0:6.2] plot (\x,{3.0-1.4*(1-(1-\x/6.2)^2.852)+0.2*\x});
\node[lab] at (5.4,1.4) {level};\node[lab] at (5.4,2.75) {downhill};
\end{kfig}

\exbox{Emission uniformity of a drip block}{Emitters with $C_v=0.05$, one per plant, deliver a minimum of 92 per cent of the mean discharge in a block. Find the emission uniformity.}\sol
\[EU=100\Bigl(1-\frac{1.27\times0.05}{\sqrt1}\Bigr)\times0.92=86\ \text{per cent}\quad\text{\finans}\]
'''
P['13'] = r'''\banner{Further analysis: overlap of the patterns and the path of the jet}
\section{Overlap of the patterns}\label{sec:sprov}
A single sprinkler wets a circle with a depth that falls from the centre outwards. A uniform application comes from the overlap of neighbouring patterns: at a spacing of about half the wetted diameter the falling edges of two patterns add to a nearly constant depth. The uniformity is measured with catch cans on a grid and summarised by the coefficient of Christiansen,
\begin{equation}\label{eq:sprcu}\boxed{CU=100\Bigl(1-\frac{\sum|x_i-\overline x|}{n\,\overline x}\Bigr)}\end{equation}

\begin{kfig}{Overlap of two triangular patterns of application depth: at a spacing $S$ near the wetted radius the sum (thick) is nearly uniform.}
\draw[axis] (0,0)--(7.2,0);\draw[axis] (0,0)--(0,3.2);
\node[lab,below] at (3.5,-0.45) {distance};\node[lab,rotate=90] at (-0.4,1.4) {depth};
\draw[ln] (0,2.0)--(4.0,0);\draw[ln] (2.8,0)--(6.8,2.0);
\draw[crv,line width=1.2pt] (0,2.0)--(2.8,0.6)--(4.0,0.6)--(6.8,2.0);
\fill[khmag] (0,0) circle (0.08);\fill[khmag] (6.8,0) circle (0.08);\node[lab,below] at (0,0) {sprinkler};\node[lab,below] at (6.8,0) {sprinkler};
\end{kfig}

\section{The path of the jet}\label{sec:sprjet}
Without air resistance a jet leaving the nozzle with speed $v_0$ at angle $\vartheta$ above the horizontal travels a distance $x=v_0^2\sin2\vartheta/g$ on level ground, largest at $45^\circ$. Air drag and the break-up of the jet into drops shorten the path considerably, and sprinklers use angles of 21 to 28$^\circ$ to keep the jet low in the wind.

\begin{kfig}{The path of a sprinkler jet: ideal parabola without drag (dashed) and the shorter path with drag and break-up into drops (solid).}
\draw[ln] (0,0)--(7,0);\draw[ln,fill=khfeat] (-0.1,0) rectangle (0.1,0.4);
\draw[gd,smooth,domain=0:6.6] plot (\x,{0.4+0.47*\x-0.071*\x^2});\draw[crv,smooth] plot coordinates {(0,0.4) (1,0.78) (2,1.0) (3,1.02) (3.8,0.8) (4.4,0.35) (4.7,0)};
\foreach \x/\y in {4.6/0.2,4.4/0.5,4.8/0.1}{\fill[khcyan] (\x,\y) circle (0.05);}
\node[lab] at (5.6,1.2) {no drag};\node[lab] at (2.6,1.3) {real jet};
\end{kfig}

\exbox{Uniformity from catch cans}{Eight catch cans collect 12, 14, 11, 13, 15, 10, 14 and 11 mm. Find Christiansen's coefficient of uniformity.}\sol
\par\noindent $\overline x=100/8=12.5$ mm; $\sum|x_i-\overline x|=0.5+1.5+1.5+0.5+2.5+2.5+1.5+1.5=12$ mm.
\[CU=100\Bigl(1-\frac{12}{8\times12.5}\Bigr)=88\ \text{per cent}\quad\text{\finans}\]
'''
P['14'] = r'''\banner{Further analysis: the geometry of drainage and the falling water table}
\section{The geometry of the Hooghoudt equation}\label{sec:drgeom}
Parallel drains at spacing $L$ lie at a depth $d$ above an impermeable layer; between them the water table rises to a height $h$ above the drain level. The flow is horizontal above the drains and converges radially near them; Hooghoudt replaced the true depth by an \kw{equivalent depth} $d_e<d$ that accounts for the convergence.

\begin{kfig}{Parallel drains: spacing $L$, drain depth $d$ above an impermeable layer and the water table rising to $h$ midway between the drains under a recharge $q$.}
\draw[soil] (-0.4,-0.6) rectangle (8.4,3.6);\fill[pattern=north east lines,pattern color=khink] (-0.4,-0.6) rectangle (8.4,-0.25);\draw[ln] (-0.4,-0.25)--(8.4,-0.25);\node[lab,above right] at (5.6,-0.22) {impermeable layer};
\draw[ln] (-0.4,3.6)--(8.4,3.6);\foreach \x in {0.6,2.4,4.2,6.0,7.8}{\draw[vec] (\x,4.3)--(\x,3.7);}\node[lab,above] at (4.2,4.3) {recharge $q$};
\fill[khcyan!25] (0,1.3) circle (0.18);\fill[khcyan!25] (8,1.3) circle (0.18);\draw[ln] (0,1.3) circle (0.18);\draw[ln] (8,1.3) circle (0.18);
\draw[khcyan,line width=1pt,smooth,domain=0:8] plot (\x,{1.3+1.3*sqrt(1-((\x-4)/4)^2)});
\draw[<->,ln] (0,0.6)--(8,0.6);\node[lab,below] at (4,0.6) {$L$};
\draw[<->,ln] (4,1.3)--(4,2.6);\node[lab,right] at (4,1.95) {$h$};\draw[gd] (0,1.3)--(8,1.3);
\draw[<->,ln] (8.2,-0.25)--(8.2,1.3);\node[lab,right] at (8.2,0.5) {$d$};
\end{kfig}

\section{The falling water table after a heavy rain}\label{sec:drglover}
After a heavy rain the water table falls between drains. Glover and Dumm described the fall of the midway head $h_t$ from its initial value $h_0$ by
\begin{equation}\label{eq:drglover}\boxed{\frac{h_t}{h_0}=1.16\,e^{-\alpha t},\qquad \alpha=\frac{\pi^2KD}{\mu L^2}}\end{equation}
where $D=d_e+h/2$ is the mean thickness of the flow region and $\mu$ the drainable porosity. The design asks that the water table falls from near the surface to a safe depth within one or two days.

\begin{kfig}{The falling water table between drains after a heavy rain (Glover--Dumm): the midway head decays exponentially with the reaction factor $\alpha$.}
\draw[axis] (0,0)--(6.4,0);\draw[axis] (0,0)--(0,3.2);
\node[lab,below] at (3.1,-0.1) {time $t$};\node[lab,rotate=90] at (-0.4,1.4) {$h_t/h_0$};
\draw[crv,smooth,domain=0.35:6.1] plot (\x,{2.8*1.16*exp(-0.5*\x)});\draw[gd] (0,1.4)--(1.68,1.4)--(1.68,0);
\node[lab,left] at (0,1.4) {0.5};\node[lab,left] at (0,2.8) {1};\node[lab,below] at (1.68,0) {$t_{1/2}$};
\end{kfig}

\exbox{Time for the water table to fall}{Drains are spaced 37.3 m in a soil with $K=0.8$ m\,d$^{-1}$, $\mu=0.05$ and $D=1.5$ m. How long does the midway water table take to fall to half its initial height?}\sol
\par\noindent $\alpha=\pi^2\times0.8\times1.5/(0.05\times37.3^2)=0.170$ d$^{-1}$.
\par\noindent $0.5=1.16\,e^{-0.170t}$, so $t=\ln(2.32)/0.170=4.9$ days.\finans
\par\noindent This is too slow for most crops; a design for a two-day fall needs a smaller spacing, since $\alpha\propto1/L^2$: $L=37.3\sqrt{2/4.9}=24$ m.
'''
for k, v in P.items(): write('plus' + k, v)
print('written', sorted(P))
