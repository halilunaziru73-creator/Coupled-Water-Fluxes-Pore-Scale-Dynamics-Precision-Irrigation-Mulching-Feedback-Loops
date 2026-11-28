r"""Replaces the solutions of the worked examples of the expansion (extra/plus00, 15, 16, 17) by solutions written
step by step in the layout of the classic engineering textbooks: Given ; We know that ... ; the formula, then the
substitution and the result ; local equations numbered ...(i), (ii) ; a magenta sub-heading for each part ;
the answer marked Ans. on the line of the result ; justifications on the right as ...(since ...)."""
import re, os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
END = re.compile(r'\\exbox|\\section|\\subsection|\\banner|\\backhead|\\dykband|\\begin\{kfig\}|\\fig\{|\\begin\{figure\}|\\begin\{table\}')
S = {}
# ------------------------------------------------------------------------------------------------ pore chapter
S['A pore of a sandy loam has a body'] = r"""
\givenline{$r_b=25\ \mu\text{m}=25\times10^{-6}$ m ; $r_t=5\ \mu\text{m}=5\times10^{-6}$ m ; $\gamma=0.0728$ N\,m$^{-1}$ ; $\beta=0$ ; $\rho_w=1000$ kg\,m$^{-3}$ ; $g=9.81$ m\,s$^{-2}$}
\sh{Suction at which the pore empties}
\wkt\ during drying the air must enter through the throat, so the suction at which the pore empties is given by Equation~\ref{eq:pg-hd}, with $\cos\beta=1$:
\[h_d=\frac{2\gamma\cos\beta}{\rho_w\,g\,r_t}\ti{i}\]
Substituting the given values in equation \rfi{i},
\[h_d=\frac{2\times0.0728\times1}{1000\times9.81\times5\times10^{-6}}=\frac{0.1456}{0.04905}=2.968\ \text{m}\]
\[\therefore\quad h_d=297\ \text{cm}\Ans\]
\sh{Suction at which the pore fills}
During wetting the meniscus of largest radius lies in the body. Therefore from Equation~\ref{eq:pg-hw},
\[h_w=\frac{2\gamma\cos\beta}{\rho_w\,g\,r_b}=\frac{0.1456}{1000\times9.81\times25\times10^{-6}}=\frac{0.1456}{0.24525}=0.594\ \text{m}=59\ \text{cm}\Ans\]
\sh{Width of the hysteresis loop}
Dividing equation \rfi{i} by the corresponding expression for $h_w$,
\[\frac{h_d}{h_w}=\frac{r_b}{r_t}=\frac{25}{5}=5\Ans\]
Thus between 59 cm and 297 cm the pore may be either full or empty, according to its history. A tensiometer reading of 150 cm in this soil therefore corresponds to two different water contents, the wetter one lying on the drying branch.
"""
S['Find the thickness of the adsorbed water film'] = r"""
\givenline{$A_H=6\times10^{-20}$ J ; $\rho_w=1000$ kg\,m$^{-3}$ ; $g=9.81$ m\,s$^{-2}$ ; $h=1$, $10$ and $150$ m}
\wkt\ the equilibrium thickness of the film (Equation~\ref{eq:pg-film}) is
\[\delta=\Bigl(\frac{A_H}{6\pi\,\rho_w\,g\,h}\Bigr)^{1/3}\ti{i}\]
The constant part of the denominator is $6\pi\rho_wg=6\times3.1416\times1000\times9.81=1.849\times10^{5}$ N\,m$^{-3}$.
\sh{1. Thickness at a suction of 1 m}
Substituting $h=1$ m in equation \rfi{i},
\[\delta=\Bigl(\frac{6\times10^{-20}}{1.849\times10^{5}\times1}\Bigr)^{1/3}=(3.245\times10^{-25})^{1/3}=6.87\times10^{-9}\ \text{m}=6.9\ \text{nm}\Ans\]
\sh{2. Thickness at a suction of 10 m}
\[\delta=\Bigl(\frac{6\times10^{-20}}{1.849\times10^{6}}\Bigr)^{1/3}=(3.245\times10^{-26})^{1/3}=3.19\times10^{-9}\ \text{m}=3.2\ \text{nm}\Ans\]
\sh{3. Thickness at the wilting point (150 m)}
\[\delta=\Bigl(\frac{6\times10^{-20}}{2.774\times10^{7}}\Bigr)^{1/3}=(2.163\times10^{-27})^{1/3}=1.29\times10^{-9}\ \text{m}=1.3\ \text{nm}\Ans\]
\sh{4. Radius of the pore just full at 150 m}
From the Young--Laplace law,
\[r=\frac{2\gamma}{\rho_w\,g\,h}=\frac{2\times0.0728}{1000\times9.81\times150}=9.9\times10^{-8}\ \text{m}=0.099\ \mu\text{m}\Ans\]
\[\therefore\quad\frac{r}{\delta}=\frac{99\ \text{nm}}{1.3\ \text{nm}}\approx76\]
The film at the wilting point is only four or five molecules of water thick (one molecule is about 0.28 nm), yet it remains connected over the whole surface of the soil and carries the slow flow of the dry range.
"""
S['In a network on a simple cubic lattice'] = r"""
\givenline{$p_c=0.249$ ; $t=2$ ; $p_1=0.50$ (at 100 cm) ; $p_2=0.35$ (at 300 cm)}
\wkt\ near the percolation threshold the conductance of the network is given by Equation~\ref{eq:pg-perc}:
\[K=C\,(p-p_c)^{t}\ti{i}\]
where $C$ is a constant of the network. Writing equation \rfi{i} for the two states and dividing, the constant cancels:
\[\frac{K_2}{K_1}=\Bigl(\frac{p_2-p_c}{p_1-p_c}\Bigr)^{t}\ti{ii}\]
Substituting the given values in equation \rfi{ii},
\[\frac{K_2}{K_1}=\Bigl(\frac{0.35-0.249}{0.50-0.249}\Bigr)^{2}=\Bigl(\frac{0.101}{0.251}\Bigr)^{2}=(0.4024)^2=0.162\Ans\]
\[\therefore\quad\frac{K_1}{K_2}=\frac1{0.162}=6.2\]
\sh{Fraction that keeps the water phase connected}
A spanning path of water exists only while $p>p_c$, i.e. while more than
\[p_c=0.249\quad\text{(about one throat in four)}\Ans\]
of the throats remain filled. The conductance has fallen by a factor of 6.2 although the filled fraction fell only from 0.50 to 0.35, which is why the conductivity of a drying soil collapses rather than falls smoothly.
"""
S['In a sandy loam the connection to the surface'] = r"""
\givenline{$r_s=20\ \mu\text{m}=2\times10^{-5}$ m ; $r_l=200\ \mu\text{m}=2\times10^{-4}$ m ; $e_0=5$ mm\,d$^{-1}$ ; $K_{\mathrm{eff}}=20$ mm\,d$^{-1}$ ; drainable porosity of the large pores $=0.15$}
\sh{Length limited by gravity}
\wkt\ the characteristic length limited by gravity alone is (Equation~\ref{eq:pg-lg})
\[L_G=\frac{2\gamma}{\rho_w\,g}\Bigl(\frac1{r_s}-\frac1{r_l}\Bigr)\ti{i}\]
The capillary length of water is
\[\frac{2\gamma}{\rho_w\,g}=\frac{2\times0.0728}{1000\times9.81}=1.484\times10^{-5}\ \text{m}^2\]
and the difference of the curvatures is
\[\frac1{r_s}-\frac1{r_l}=\frac1{2\times10^{-5}}-\frac1{2\times10^{-4}}=50\,000-5000=45\,000\ \text{m}^{-1}\]
Substituting in equation \rfi{i},
\[L_G=1.484\times10^{-5}\times45\,000=0.668\ \text{m}\Ans\]
\sh{Characteristic length with the viscous loss}
\[L_C=\frac{L_G}{1+e_0/K_{\mathrm{eff}}}=\frac{0.668}{1+5/20}=\frac{0.668}{1.25}=0.534\ \text{m}\Ans\]
\sh{Water that can evaporate in stage 1}
The large pores above the front release their water, so
\[\text{Water}=0.15\times L_C=0.15\times534\ \text{mm}=80\ \text{mm}\Ans\]
\[\therefore\quad\text{Duration of stage 1}=\frac{80}{5}=16\ \text{days}\]
A medium-textured soil can therefore lose a large part of a rain to evaporation before its surface dries, and a mulch, which cuts $e_0$, saves most in such soils.
"""
S['A loam has porosity $\\phi=0.45$. Find the rel'] = r"""
\givenline{$\phi=0.45$ ; $D_0=0.205$ cm$^2$\,s$^{-1}$ ; $\varepsilon=0.20$ and $0.10$}
\wkt\ the relative diffusivity by Millington and Quirk (Equation~\ref{eq:pg-fick}) is
\[\frac{D_s}{D_0}=\frac{\varepsilon^{10/3}}{\phi^{2}}\ti{i}\]
and by Penman
\[\frac{D_s}{D_0}=0.66\,\varepsilon\ti{ii}\]
\sh{1. Air-filled porosity of 0.20}
From equation \rfi{i}, with $\phi^2=0.45^2=0.2025$,
\[\frac{D_s}{D_0}=\frac{0.20^{10/3}}{0.2025}=\frac{0.004678}{0.2025}=0.0231\Ans\]
\[\therefore\quad D_s=0.0231\times0.205=4.74\times10^{-3}\ \text{cm}^2\,\text{s}^{-1}\Ans\]
From equation \rfi{ii},
\[\frac{D_s}{D_0}=0.66\times0.20=0.132\Ans\]
which is $0.132/0.0231=5.7$ times the value of Millington and Quirk.
\sh{2. Air-filled porosity of 0.10 (after rain)}
\[\frac{D_s}{D_0}=\frac{0.10^{10/3}}{0.2025}=\frac{4.642\times10^{-4}}{0.2025}=2.29\times10^{-3}\Ans\]
\[\therefore\quad\frac{D_s(0.20)}{D_s(0.10)}=\frac{0.0231}{0.00229}=10.1\]
Halving the air-filled porosity cuts the diffusion of oxygen tenfold. This steep fall is why a waterlogged root zone becomes anaerobic within a day or two, and why denitrification (Chapter~\ref{chap:17}) is concentrated in the wettest periods.
"""
# ------------------------------------------------------------------------------------------------ chapter 15
S['Find the net radiation over a grass reference'] = r"""
\givenline{$J=196$ ; $\varphi=50^\circ=0.873$ rad ; $z=100$ m ; $n=9.25$ h ; $T_{\max}=25.1$ $^\circ$C ; $T_{\min}=19.1$ $^\circ$C ; $e_a=2.10$ kPa}
\sh{1. Extraterrestrial radiation}
The inverse relative distance and the declination are
\[d_r=1+0.033\cos\frac{2\pi\times196}{365}=1+0.033\times(-0.974)=0.968\]
\[\delta=0.409\sin\Bigl(\frac{2\pi\times196}{365}-1.39\Bigr)=0.409\sin(1.984)=0.375\ \text{rad}\]
and the sunset hour angle is
\[\omega_s=\arccos(-\tan\varphi\tan\delta)=\arccos(-1.192\times0.393)=\arccos(-0.469)=2.058\ \text{rad}\]
Substituting in Equation~\ref{eq:dm-ra},
\[R_a=\frac{24\times60}{\pi}\times0.0820\times0.968\bigl[2.058\sin0.873\sin0.375+\cos0.873\cos0.375\sin2.058\bigr]=40.21\ \text{MJ\,m}^{-2}\,\text{d}^{-1}\]
\[N=\frac{24}{\pi}\,\omega_s=\frac{24}{\pi}\times2.058=15.7\ \text{h}\]
\sh{2. Solar and clear-sky radiation}
\[R_s=\Bigl(0.25+0.50\,\frac nN\Bigr)R_a=\Bigl(0.25+0.50\times\frac{9.25}{15.7}\Bigr)\times40.21=21.88\ \text{MJ\,m}^{-2}\,\text{d}^{-1}\]
\[R_{so}=(0.75+2\times10^{-5}z)R_a=0.752\times40.21=30.24\ \text{MJ\,m}^{-2}\,\text{d}^{-1}\]
\sh{3. Net short-wave radiation}
\[R_{ns}=(1-0.23)R_s=0.77\times21.88=16.85\ \text{MJ\,m}^{-2}\,\text{d}^{-1}\]
\sh{4. Net long-wave radiation}
\wkt\ (Equation~\ref{eq:dm-rnl})
\[R_{nl}=\sigma\,\frac{T_{x,K}^4+T_{n,K}^4}{2}\bigl(0.34-0.14\sqrt{e_a}\bigr)\Bigl(1.35\frac{R_s}{R_{so}}-0.35\Bigr)\ti{i}\]
The three factors of equation \rfi{i} are
\[\sigma\,\frac{T_{x,K}^4+T_{n,K}^4}{2}=4.903\times10^{-9}\times\frac{298.26^4+292.26^4}{2}=37.3\]
\[0.34-0.14\sqrt{2.10}=0.34-0.203=0.137\]
\[1.35\times\frac{21.88}{30.24}-0.35=0.977-0.35=0.627\]
\[\therefore\quad R_{nl}=37.3\times0.137\times0.627=3.20\ \text{MJ\,m}^{-2}\,\text{d}^{-1}\]
\sh{5. Net radiation}
\[R_n=R_{ns}-R_{nl}=16.85-3.20=13.64\ \text{MJ\,m}^{-2}\,\text{d}^{-1}\Ans\]
Expressed as an equivalent evaporation,
\[0.408\times13.64=5.6\ \text{mm\,d}^{-1}\]
that is, the depth that would evaporate if all of this energy went to latent heat.
"""
S['For the day of the previous example, with $u_'] = r"""
\givenline{$R_a=40.21$, $R_s=21.88$, $R_n=13.64$ MJ\,m$^{-2}$\,d$^{-1}$ ; $G=0$ ; $T=22.1$ $^\circ$C ; $T_{\max}-T_{\min}=6.0$ $^\circ$C ; $u_2=2.0$ m\,s$^{-1}$ ; $e_s=2.70$, $e_a=2.10$ kPa ; $\Delta=0.162$, $\gamma=0.0666$ kPa\,$^\circ$C$^{-1}$}
\sh{1. Penman--Monteith}
The energy term of the numerator is
\[0.408\,\Delta\,(R_n-G)=0.408\times0.162\times13.64=0.902\]
and the aerodynamic term is
\[\gamma\,\frac{900}{T+273}\,u_2\,(e_s-e_a)=0.0666\times\frac{900}{295.1}\times2.0\times0.60=0.244\]
The denominator is
\[\Delta+\gamma(1+0.34u_2)=0.162+0.0666\times1.68=0.274\]
\[\therefore\quad ET_0^{\mathrm{PM}}=\frac{0.902+0.244}{0.274}=4.18\ \text{mm\,d}^{-1}\Ans\]
\sh{2. Hargreaves}
From Equation~\ref{eq:dm-hg}, with $0.408R_a=16.41$ mm\,d$^{-1}$,
\[ET_0^{\mathrm{HG}}=0.0023\times16.41\times(22.1+17.8)\times\sqrt{6.0}=0.0023\times16.41\times39.9\times2.449=3.69\ \text{mm\,d}^{-1}\Ans\]
\sh{3. Priestley--Taylor}
The weighting factor is $\Delta/(\Delta+\gamma)=0.162/0.2286=0.709$. From Equation~\ref{eq:dm-pt},
\[ET_0^{\mathrm{PT}}=1.26\times0.709\times0.408\times13.64=4.97\ \text{mm\,d}^{-1}\Ans\]
\sh{4. Makkink}
From Equation~\ref{eq:dm-mk},
\[ET_0^{\mathrm{MK}}=0.61\times0.709\times\frac{21.88}{2.45}-0.12=3.86-0.12=3.74\ \text{mm\,d}^{-1}\Ans\]
\sh{Comparison}
\[\text{Spread}=4.97-3.69=1.28\ \text{mm\,d}^{-1},\qquad\text{mean}=\frac{4.18+3.69+4.97+3.74}{4}=4.15\ \text{mm\,d}^{-1}\]
The spread is 31 per cent of the mean. Priestley--Taylor is high because its factor 1.26 assumes more energy-limited conditions than the vapour-pressure deficit of this day allows; Hargreaves is low because the small daily range of temperature (6 $^\circ$C) is read as a cloudy day.
"""
S['A moist loam has $D_h=5\\times10^{-7}$'] = r"""
\givenline{$D_h=5\times10^{-7}$ m$^2$\,s$^{-1}$ ; $A_0=10$ $^\circ$C ; $z=0.20$ m}
\wkt\ the damping depth of a wave of period $P$ is (Equation~\ref{eq:dm-wave})
\[d=\sqrt{\frac{2D_h}{\omega}},\qquad\omega=\frac{2\pi}{P}\ti{i}\]
\sh{1. Daily wave}
\[\omega=\frac{2\pi}{86\,400}=7.27\times10^{-5}\ \text{s}^{-1}\]
Substituting in equation \rfi{i},
\[d=\sqrt{\frac{2\times5\times10^{-7}}{7.27\times10^{-5}}}=\sqrt{0.01375}=0.117\ \text{m}\Ans\]
\sh{2. Annual wave}
\[\omega=\frac{2\pi}{365\times86\,400}=1.99\times10^{-7}\ \text{s}^{-1}\]
\[d=\sqrt{\frac{2\times5\times10^{-7}}{1.99\times10^{-7}}}=\sqrt{5.02}=2.24\ \text{m}\Ans\]
\sh{3. Amplitude and lag at 20 cm}
The amplitude at depth $z$ is
\[A(z)=A_0\,e^{-z/d}=10\,e^{-0.20/0.117}=10\,e^{-1.71}=1.8\ ^\circ\text{C}\Ans\]
and the phase lag is $z/d=1.71$ rad, which in time is
\[\Delta t=\frac{z/d}{\omega}=\frac{1.71}{2\pi}\times24=6.5\ \text{h}\Ans\]
The maximum at 20 cm therefore comes in the evening, and a temperature-dependent process at that depth, such as nitrification (Chapter~\ref{chap:17}), sees a daily swing five times smaller than the surface.
"""
S['A snowpack holds 80 mm of water equivalent'] = r"""
\givenline{$W=80$ mm ; $C_m=3$ mm\,$^\circ$C$^{-1}$\,d$^{-1}$ ; $T_b=0$ $^\circ$C ; $T_a=4$ $^\circ$C ; $\theta_0=0.25$ ; $\theta_{fc}=0.33$}
\sh{Daily melt and duration}
\wkt\ by the degree-day method (Equation~\ref{eq:dm-ddf})
\[M=C_m\,(T_a-T_b)=3\times(4-0)=12\ \text{mm\,d}^{-1}\]
\[\therefore\quad\text{Duration}=\frac{W}{M}=\frac{80}{12}=6.7\ \text{days}\Ans\]
\sh{Depth of soil raised to field capacity}
Each metre of soil can take $1000(\theta_{fc}-\theta_0)$ mm before it reaches field capacity. Thus
\[Z=\frac{W}{1000(\theta_{fc}-\theta_0)}=\frac{80}{1000\times(0.33-0.25)}=\frac{80}{80}=1.0\ \text{m}\Ans\]
"""
S['A sandy loam has $K_s=50$ cm'] = r"""
\givenline{$K_s=50$ cm\,d$^{-1}$ ; $a=0.04$ cm$^{-1}$ ; $L=100$ and $150$ cm ; demand $=5$ mm\,d$^{-1}$}
\wkt\ the largest steady capillary flux is (Equation~\ref{eq:dm-rise})
\[q_{\max}=\frac{K_s\,e^{-aL}}{1-e^{-aL}}\ti{i}\]
\sh{1. Water table at 1.0 m}
\[aL=0.04\times100=4,\qquad e^{-4}=0.0183\]
Substituting in equation \rfi{i},
\[q_{\max}=\frac{50\times0.0183}{1-0.0183}=0.933\ \text{cm\,d}^{-1}=9.3\ \text{mm\,d}^{-1}\Ans\]
This is more than the demand of 5 mm\,d$^{-1}$.
\sh{2. Water table at 1.5 m}
\[aL=0.04\times150=6,\qquad e^{-6}=0.00248\]
\[q_{\max}=\frac{50\times0.00248}{1-0.00248}=0.124\ \text{cm\,d}^{-1}=1.2\ \text{mm\,d}^{-1}\Ans\]
which is only a quarter of the demand.
\[\therefore\quad\frac{q_{\max}(100)}{q_{\max}(150)}=\frac{9.3}{1.24}=7.5\]
Half a metre of extra depth reduces the supply by a factor of 7.5. This is why drainage (Chapter~\ref{chap:14}) that lowers a water table can increase the need for irrigation.
"""
# ------------------------------------------------------------------------------------------------ chapter 16
S['The daily mean temperatures of a spring week'] = r"""
\givenline{$T_d=12,14,17,9,-1,6,11$ $^\circ$C ; $T_b=4$ $^\circ$C ; $TS_{\mathrm{req}}=700$ $^\circ$C\,d}
\wkt\ each day contributes $\max(T_d-T_b,\,0)$ to the thermal time (Equation~\ref{eq:dm-ds}). The contributions are
\[(12-4)+(14-4)+(17-4)+(9-4)+0+(6-4)+(11-4)=8+10+13+5+0+2+7\]
\[\therefore\quad TS=45\ ^\circ\text{C\,d per week}\Ans\]
Note that the day at $-1$ $^\circ$C contributes nothing, not a negative amount.
\sh{Number of such weeks for the vegetative phase}
\[\text{Weeks}=\frac{TS_{\mathrm{req}}}{TS}=\frac{700}{45}=15.6\Ans\]
\sh{Wheat at a steady 15 $^\circ$C}
With $T_b=0$ $^\circ$C each day contributes 15 $^\circ$C\,d, so flowering (1100 $^\circ$C\,d) comes after
\[\frac{1100}{15}=73\ \text{days}\Ans\]
"""
S['A wheat canopy has $k=0.6$ and $L=3$'] = r"""
\givenline{$k=0.6$ ; $L=3$ ; RUE $=3.0$ g\,MJ$^{-1}$ ; PAR $=10$ MJ\,m$^{-2}$\,d$^{-1}$}
\sh{1. Fraction intercepted}
\wkt\ the fraction of light intercepted by a canopy is
\[f=1-e^{-kL}\ti{i}\]
\[\therefore\quad f=1-e^{-0.6\times3}=1-e^{-1.8}=1-0.165=0.835\Ans\]
\sh{2. Leaf area for 95 per cent interception}
Putting $f=0.95$ in equation \rfi{i},
\[e^{-0.6L}=1-0.95=0.05\qquad\text{or}\qquad L=\frac{\ln(1/0.05)}{0.6}=\frac{\ln20}{0.6}=\frac{2.996}{0.6}=5.0\Ans\]
Raising the interception from 83.5 to 95 per cent therefore needs two more units of leaf area: the last leaves add little light.
\sh{3. Daily growth}
From Equation~\ref{eq:dm-rueq},
\[\frac{\mathrm dW}{\mathrm dt}=\text{RUE}\times f\times\text{PAR}=3.0\times0.835\times10=25.0\ \text{g\,m}^{-2}\,\text{d}^{-1}\Ans\]
\[=25.0\times10=250\ \text{kg DM\,ha}^{-1}\,\text{d}^{-1}\tb{$\because$ 1 g\,m$^{-2}$ = 10 kg\,ha$^{-1}$}\]
"""
S['A leaf has $A_{\\max}=40$ kg CO'] = r"""
\givenline{$A_{\max}=40$ kg CO$_2$\,ha$^{-1}$\,h$^{-1}$ ; $\varepsilon=0.45$ kg CO$_2$\,ha$^{-1}$\,h$^{-1}$ per W\,m$^{-2}$ ; $I=200$ and $50$ W\,m$^{-2}$}
\wkt\ the light-response curve of a leaf (Equation~\ref{eq:dm-light}) is
\[A=A_{\max}\bigl(1-e^{-\varepsilon I/A_{\max}}\bigr)\ti{i}\]
\sh{1. Sunlit leaf}
\[\frac{\varepsilon I}{A_{\max}}=\frac{0.45\times200}{40}=2.25\]
Substituting in equation \rfi{i},
\[A=40\,(1-e^{-2.25})=40\times(1-0.1054)=35.8\ \text{kg CO}_2\,\text{ha}^{-1}\,\text{h}^{-1}\Ans\]
\sh{2. Shaded leaf}
\[\frac{\varepsilon I}{A_{\max}}=\frac{0.45\times50}{40}=0.5625\]
\[A=40\,(1-e^{-0.5625})=40\times(1-0.5698)=17.2\ \text{kg CO}_2\,\text{ha}^{-1}\,\text{h}^{-1}\Ans\]
\sh{3. Efficiency of the use of light}
\[\frac AI\Bigr|_{\text{sunlit}}=\frac{35.8}{200}=0.179,\qquad\frac AI\Bigr|_{\text{shaded}}=\frac{17.2}{50}=0.344\]
\[\therefore\quad\frac{0.344}{0.179}=1.9\]
The shaded leaf uses its light nearly twice as efficiently, because it works on the linear part of the curve while the sunlit leaf works near saturation.
"""
S['A crop of 800 g\\,m$^{-2}$ dry mass assimilate'] = r"""
\givenline{$W=800$ g\,m$^{-2}$ ; $A=25$ g\,m$^{-2}$\,d$^{-1}$ ; $c_m=0.015$ g\,g$^{-1}$\,d$^{-1}$ at $T_{\mathrm{ref}}=25$ $^\circ$C ; $Q_{10}=2$ ; $E_g=0.72$}
\wkt\ (Equation~\ref{eq:dm-rm})
\[R_m=c_m\,W\,Q_{10}^{(T-T_{\mathrm{ref}})/10}\ti{i}\]
\[\Delta W=E_g\,(A-R_m)\ti{ii}\]
\sh{1. At 15 $^\circ$C}
From equation \rfi{i},
\[R_m=0.015\times800\times2^{(15-25)/10}=12.0\times2^{-1}=6.0\ \text{g\,m}^{-2}\,\text{d}^{-1}\Ans\]
and from equation \rfi{ii},
\[\Delta W=0.72\times(25-6.0)=0.72\times19.0=13.7\ \text{g\,m}^{-2}\,\text{d}^{-1}\Ans\]
\sh{2. At 25 $^\circ$C}
\[R_m=0.015\times800\times2^{0}=12.0\ \text{g\,m}^{-2}\,\text{d}^{-1}\Ans\]
\[\Delta W=0.72\times(25-12.0)=9.4\ \text{g\,m}^{-2}\,\text{d}^{-1}\Ans\]
\[\therefore\quad\text{Fall of growth}=\frac{13.7-9.4}{13.7}=0.31\]
A warm period reduces the growth by about a third through respiration alone, if the assimilation is unchanged; this is one reason why warming lowers the yield of temperate cereals.
"""
S['A wheat crop ($K_y=1.15$) with a potential yi'] = r"""
\givenline{$K_y=1.15$ ; $Y_m=7.0$ Mg\,ha$^{-1}$ ; $ET_a/ET_m=0.80$}
\wkt\ (Equation~\ref{eq:dm-ky})
\[1-\frac{Y_a}{Y_m}=K_y\Bigl(1-\frac{ET_a}{ET_m}\Bigr)\ti{i}\]
Substituting in equation \rfi{i},
\[1-\frac{Y_a}{Y_m}=1.15\times(1-0.80)=1.15\times0.20=0.23\]
\[\therefore\quad\frac{Y_a}{Y_m}=0.77\qquad\text{and}\qquad Y_a=0.77\times7.0=5.39\ \text{Mg\,ha}^{-1}\Ans\]
A 20 per cent deficit of water costs 23 per cent of the yield, because $K_y>1$.
"""
S['A crop has a root zone 100 cm deep with $\\lam'] = r"""
\givenline{$Z_r=100$ cm ; $\lambda=20$ cm ; $z_1=30$ cm}
\wkt\ the share of the roots above $z_1$ is (Equation~\ref{eq:dm-rootfrac})
\[F(z_1)=\frac{1-e^{-z_1/\lambda}}{1-e^{-Z_r/\lambda}}\ti{i}\]
Here $z_1/\lambda=30/20=1.5$ and $Z_r/\lambda=100/20=5$. Substituting in equation \rfi{i},
\[F(30)=\frac{1-e^{-1.5}}{1-e^{-5}}=\frac{1-0.2231}{1-0.0067}=\frac{0.7769}{0.9933}=0.782\Ans\]
Nearly four-fifths of the roots lie in the top 30 cm; a sensor at 20 cm therefore watches the part of the profile that delivers most of the water.
"""
# ------------------------------------------------------------------------------------------------ chapter 17
S['A decomposition rate is known at 20'] = r"""
\givenline{$T_1=20$ $^\circ$C $=293.15$ K ; $T_2=10$ $^\circ$C $=283.15$ K ; $Q_{10}=2$ ; $E_a=55$ kJ\,mol$^{-1}$ ; $R=8.314$ J\,mol$^{-1}$\,K$^{-1}$}
\sh{1. With $Q_{10}$}
\wkt\ (Equation~\ref{eq:dm-arr})
\[f_T=Q_{10}^{(T-T_{\mathrm{ref}})/10}=2^{(10-20)/10}=2^{-1}=0.50\Ans\]
\sh{2. With the law of Arrhenius}
The ratio of the rates at the two temperatures is
\[\frac{k_{20}}{k_{10}}=\exp\Bigl[\frac{E_a}{R}\Bigl(\frac1{T_2}-\frac1{T_1}\Bigr)\Bigr]\ti{i}\]
\[\frac1{283.15}-\frac1{293.15}=0.0035317-0.0034112=1.205\times10^{-4}\ \text{K}^{-1}\]
Substituting in equation \rfi{i},
\[\frac{k_{20}}{k_{10}}=\exp\Bigl(\frac{55\,000}{8.314}\times1.205\times10^{-4}\Bigr)=\exp(0.797)=2.22\]
\[\therefore\quad f_T=\frac1{2.22}=0.45\Ans\]
The two corrections differ by only 10 per cent near the reference temperature.
"""
S['Fresh residue decomposes with $k=0.02$'] = r"""
\givenline{$k=0.02$ d$^{-1}$ ; $t=90$ d}
\wkt\ (Equation~\ref{eq:dm-dec})
\[C(t)=C_0\,e^{-kt}\qquad\text{and}\qquad t_{1/2}=\frac{\ln2}{k}\ti{i}\]
\sh{Half-life}
\[t_{1/2}=\frac{0.693}{0.02}=34.7\ \text{d}\Ans\]
\sh{Fraction left after 90 days}
\[\frac{C}{C_0}=e^{-0.02\times90}=e^{-1.8}=0.165\Ans\]
Thus 83.5 per cent of the residue carbon has left the pool after one season; 90 days is $90/34.7=2.6$ half-lives, and $0.5^{2.6}=0.165$ gives the same answer.
"""
S['Five tonnes of straw dry matter per hectare'] = r"""
\givenline{$W=5000$ kg DM\,ha$^{-1}$ ; carbon content $=0.45$ ; $CN_s=80$ ; $e=0.4$ ; $CN_m=8$}
\par\indent The decomposed carbon is
\[C_d=5000\times0.45=2250\ \text{kg C\,ha}^{-1}\]
\wkt\ the net release of mineral nitrogen is (Equation~\ref{eq:dm-nmin})
\[N_{\mathrm{net}}=C_d\Bigl(\frac1{CN_s}-\frac{e}{CN_m}\Bigr)\ti{i}\]
\sh{Nitrogen supplied and nitrogen needed}
\[\text{Supplied by the straw}=\frac{C_d}{CN_s}=\frac{2250}{80}=28.1\ \text{kg N\,ha}^{-1}\]
\[\text{Needed by the microbes}=\frac{e\,C_d}{CN_m}=\frac{0.4\times2250}{8}=112.5\ \text{kg N\,ha}^{-1}\]
Substituting in equation \rfi{i},
\[N_{\mathrm{net}}=28.1-112.5=-84.4\ \text{kg N\,ha}^{-1}\Ans\]
The negative sign means \emph{immobilisation}: about 84 kg of mineral nitrogen per hectare are taken from the soil by the microbes, because $CN_s=80$ is far above the critical ratio
\[CN_{\mathrm{crit}}=\frac{CN_m}{e}=\frac8{0.4}=20\]
"""
S['A soil has $\\theta=0.30$, $\\rho_b=1.5$'] = r"""
\givenline{$\theta=0.30$ ; $\rho_b=1.5$ kg\,L$^{-1}$ ; $q=300$ mm\,yr$^{-1}=0.30$ m\,yr$^{-1}$ ; $z=1$ m ; $t_{1/2}=30$ d ; $K_d=0.5$ and $0.05$ L\,kg$^{-1}$}
\wkt\ the pore-water velocity and the retardation factor are (Equation~\ref{eq:dm-cde})
\[v=\frac q\theta,\qquad R=1+\frac{\rho_bK_d}{\theta}\ti{i}\]
and the solute moves at $v/R$, so its travel time to the depth $z$ is
\[t=\frac{z\,R}{v}\ti{ii}\]
Here $v=0.30/0.30=1.0$ m\,yr$^{-1}$.
\sh{1. Strongly sorbed pesticide ($K_d=0.5$ L\,kg$^{-1}$)}
\[R=1+\frac{1.5\times0.5}{0.30}=1+2.5=3.5\]
\[t=\frac{1\times3.5}{1.0}=3.5\ \text{yr}=1278\ \text{d}\Ans\]
\[AF=\exp\Bigl(-0.693\,\frac{t}{t_{1/2}}\Bigr)=\exp\Bigl(-0.693\times\frac{1278}{30}\Bigr)=\exp(-29.5)=1.5\times10^{-13}\Ans\]
\sh{2. Weakly sorbed pesticide ($K_d=0.05$ L\,kg$^{-1}$)}
\[R=1+\frac{1.5\times0.05}{0.30}=1.25,\qquad t=1.25\ \text{yr}=456\ \text{d}\Ans\]
\[AF=\exp\Bigl(-0.693\times\frac{456}{30}\Bigr)=\exp(-10.5)=2.6\times10^{-5}\Ans\]
\[\therefore\quad\frac{AF(0.05)}{AF(0.5)}=\frac{2.6\times10^{-5}}{1.5\times10^{-13}}\approx2\times10^{8}\]
A tenfold weaker sorption raises the fraction that leaches by eight orders of magnitude: leaching is governed by the ratio of the travel time to the half-life.
"""
S['Nitrate ($R=1$) moves with a pore velocity'] = r"""
\givenline{$R=1$ ; $v=100$ cm\,yr$^{-1}$ ; $\lambda_d=5$ cm ; $z=100$ cm}
\par\indent The time for the centre of the pulse to reach 1 m is
\[t=\frac{zR}{v}=\frac{100\times1}{100}=1\ \text{yr}\]
\wkt\ the dispersion coefficient is $D=\lambda_dv$ and the spread of the pulse is $\sigma=\sqrt{2Dt/R}$. Thus
\[D=5\times100=500\ \text{cm}^2\,\text{yr}^{-1}\]
\[\sigma=\sqrt{2\times500\times1}=\sqrt{1000}=31.6\ \text{cm}\Ans\]
The pulse is about $2\sigma=63$ cm wide at 1 m, so a single sampling depth sees the nitrate of one fertilisation over several months.
"""
S['(a) A field drains 250 mm in a winter'] = r"""
\givenline{$D=250$ mm ; $C_{\mathrm{NO_3}}=50$ mg\,L$^{-1}$ ; denitrified N $=20$ kg\,ha$^{-1}$ ; N$_2$O fraction $=0.1$ ; GWP of N$_2$O $=273$}
\sh{(a) Nitrogen leached}
The concentration as nitrogen is
\[C_N=C_{\mathrm{NO_3}}\times\frac{14}{62}=50\times0.2258=11.3\ \text{mg N\,L}^{-1}\]
\wkt\ $N_L=D\,C_N/100$ with $D$ in mm and $C_N$ in mg\,L$^{-1}$, so
\[N_L=\frac{250\times11.3}{100}=28.2\ \text{kg N\,ha}^{-1}\Ans\]
\sh{(b) Carbon-dioxide equivalent of the nitrous oxide}
\[\text{N}_2\text{O-N}=0.1\times20=2.0\ \text{kg\,ha}^{-1}\]
\[\text{N}_2\text{O}=2.0\times\frac{44}{28}=3.14\ \text{kg\,ha}^{-1}\tb{$\because$ 28 g N in 44 g N$_2$O}\]
\[\text{CO}_2\text{-eq}=3.14\times273=858\ \text{kg\,ha}^{-1}\Ans\]
"""

def run():
    n = 0
    for f in ['plus00', 'plus15', 'plus16', 'plus17']:
        p = os.path.join(D, 'extra', f + '.tex'); t = open(p).read()
        for key, body in S.items():
            i = t.find(key)
            if i < 0: continue
            j = t.index('\\sol', i); e = END.search(t, j + 4); k = e.start() if e else len(t)
            t = t[:j + 4] + body.rstrip() + '\n\n' + t[k:]; n += 1
        open(p, 'w').write(t)
    print('solutions rewritten:', n, 'of', len(S))
run()
