# Sprinkler irrigation design (S4)

The sprinkler layer designs the **nozzle, pressure, spacing and layout** of a sprinkler system for the soil, crop, slope and wind of the case, and then checks the result against the standard course rules (spacing, application rate, uniformity, pipes and pump). It has two parts that are built on the same run: a *simulation* part (the overlapped spray pattern, the wind drift, the soil intake that causes runoff, and the efficiencies) and a *textbook* part (the ten design checks, the pipe and pump sizing, the kinds of sprinkler system).

The layer reads top to bottom: **A** site, **B** sprinkler and layout, **C** operation and **D** farm and pipes (the inputs); the layout in plan; the profile along the lateral; the intake against the application rate; result tiles and the water partition; the textbook checks and system plans; layout and infrastructure; the irrigation schedule; the design table with the sensitivity chart; the season and the advice.

![Sprinkler design: inputs A to D and the layout in plan with the overlapping spray patterns. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/24_spr_draw.jpg){width=70%}

## Inputs, step by step

**A. Your site.** Crop, mulch and irrigation method are the same controls as in the Properties panel. The soil row shows each soil with the largest application rate it accepts at the present slope (Table 13.3). Sliders: ground slope $S$ (0–16 %, step 0.5, default 1), wind speed $u$ (0–12 m s$^{-1}$, step 0.5, default 3), surface storage $S_d$ (0–20 mm, step 0.5; default from tillage, below) and a toggle *Compact layer below the soil* (which lowers the allowed rate, Table 13.3). A banner states the maximum allowable application rate for the soil and slope and whether the present sprinkler is within it.

**B. The sprinkler and its layout.** *System* (five chips, see *Kinds of sprinkler system* below), *Sprinkler* (four types, Table 13.1), *Layout* (square or triangular), then sliders for the nozzle diameter $d$, operating pressure $P$, trajectory angle $\alpha$ (8–45°, default 25°), spacing along the lateral $S_s$ and between laterals $S_l$. Choosing a type resets $d,P,S_s,S_l$ to its defaults and run time to automatic.

Table 13.1. Sprinkler types: ranges (min–max, step) and defaults; $c_R$ range coefficient, $m$ profile exponent, $F$ drift factor. The impact value $c_R=1.35$ is the Keller and Bliesner (1990) coefficient for impact sprinklers (changed from 1.15 in version 1; the earlier value under-predicted the wetted diameter of their worked example by 14 %). The values for the other three types are **[Engineered]** and have not been verified against published data.

| Type | $d$ (mm) | $P$ (kPa) | $S_s$ (m) | $S_l$ (m) | $c_R$ | Profile | $F$ |
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Impact | 2.4–8, 0.1 (4.4) | 200–500, 10 (300) | 6–30, 1 (12) | 6–36, 1 (18) | 1.35 | $1-x^{1.3}$ | 1.0 |
| Rotating spray | 1.5–5, 0.1 (3.2) | 70–250, 5 (170) | 3–15, 0.5 (6) | 3–15, 0.5 (6) | 0.80 | ring | 1.6 |
| Micro-sprinkler | 0.8–2.5, 0.05 (1.3) | 100–250, 5 (180) | 1.5–8, 0.25 (3) | 1.5–8, 0.25 (3) | 0.70 | ring-2 | 0.7 |
| Big gun | 10–25, 0.5 (16) | 350–700, 10 (500) | 20–80, 1 (30) | 20–90, 1 (36) | 0.95 | $1-x$ | 1.3 |

**C. How you run it.** *Run time* automatic or manual; depth per irrigation $Z_n$ (5–100 mm; default Eq. 5.27, tap to reset); run time $T$ (10–1200 min, step 5); operating hours per day (4–24, default 16).

**D. Farm, water supply and pipes.** Area $A_f$ (0.5–40 ha, step 0.5, default 5), farm supply $Q_s$ (5–200 L s$^{-1}$, default 40), lateral length $L_L$ (40–500 m, step 10, default 150), mainline length $L_m$ (20–600 m, default 120) and lift (0–60 m, default 12).

**Tillage and surface storage.** Unless set by hand, the depression storage $S_d$ follows the tillage of the Properties panel: 5 mm conventional, 3.5 mm reduced, 2 mm none. On a slope the effective storage is reduced,

$$
S_{d}^{\mathrm{eff}} = \frac{\max(0,S_d)}{1+0.25\,S}\qquad(S\ \text{in \%}).
\tag{13.1}
$$

*Provenance (Eq. 13.1):* **[Engineered]**: depression storage reduction with slope.

This is an **[Engineered]** relation: storage in depressions decreases as the slope rises (compare the slope dependence of depression storage in Hillel, 1998).

## Nozzle discharge and wetted radius

For a nozzle of diameter $d$ (mm) at operating pressure $P$ (kPa) the pressure head is $h=P/9.81$ m. The discharge follows the orifice equation (Torricelli) with a discharge coefficient of 0.95,

$$
q = 0.95\,A_n\sqrt{2g\,h}\times6\times10^{4}\ \ (\mathrm{L\,min^{-1}}),\qquad A_n=\pi\Bigl(\frac{d}{2000}\Bigr)^{2}\ \mathrm{m^2},
\tag{13.2}
$$

*Provenance (Eq. 13.2):* **[Literature]**: Torricelli orifice equation.

and the wetted radius is (an empirical range law of the form used in sprinkler manuals, Keller and Bliesner, 1990, with the coefficient $c_R$ of Table 13.1 chosen per type)

$$
R = c_R\sqrt{d\,h}\;f_\alpha(\alpha),\qquad
f_\alpha(\alpha)=\Bigl[\frac{\max\{0.05,\ \sin(3.1\,\alpha)\}}{0.9763}\Bigr]^{0.45},
\tag{13.3}
$$

*Provenance (Eq. 13.3):* **[Engineered]**: range law of the Keller and Bliesner (1990) form; the impact coefficient 1.35 is the published value and is verified against their worked example (Paper 3); the coefficients of the other types and the angle function are chosen.

with $d$ in mm, $h$ in m and $\alpha$ in degrees ($3.1\alpha$ as an angle in degrees). The angle function peaks near $\alpha=29^\circ$ and equals 1 at the default $25^\circ$ ($\sin 77.5^\circ=0.9763$). **[Engineered]**: the exponent 0.45 and the $3.1\alpha$ term are chosen to give a mild optimum, not fitted to a data set. The reach $R$ is printed in the plan as a percentage of the spacing along the lateral.

## The spray pattern and the overlap

**Radial profile.** A single sprinkler deposits water at radius $r$ with a shape $\hat p(x)$, $x=r/R_e$, taken from Table 13.1:

$$
\hat p(x)=\begin{cases}
1-x^{m}, & \text{impact } (m=1.3),\ \text{gun } (m=1),\\
(0.5+0.5x)(1-x^{6}), & \text{rotating spray (ring)},\\
(0.55+0.45x)(1-x^{5}), & \text{micro-sprinkler (ring-2)},
\end{cases}\qquad \hat p=0\ \text{for}\ x\ge1.
\tag{13.4}
$$

*Provenance (Eq. 13.4):* **[Engineered]**: pattern and wind shapes chosen to reproduce published qualitative patterns.

These are **[Engineered]** shapes that reproduce the qualitative patterns published for each class: a single sprinkler with a rapidly falling profile (impact, gun), and a pattern that peaks away from the centre (spray and micro types).

**Wind.** Wind elongates the pattern downwind and shifts it:

$$
R_e(\theta)=R\,\mathrm{clip}\{1+0.022\,u\cos\theta;\ 0.7,\ 1.4\},\qquad \text{shift}=0.03\,u\,R,
\tag{13.5}
$$

*Provenance (Eq. 13.5):* **[Engineered]**: pattern and wind shapes chosen to reproduce published qualitative patterns.

where $\theta$ is the angle from the wind direction and $u$ is the wind speed in m s$^{-1}$. The pattern is computed on a $45\times45$ grid over $\pm1.4R$ and normalised so that its volume equals the discharge, $\iint p\,dA=q$, with $p$ in mm min$^{-1}$ (1 mm over 1 m$^2$ is 1 L).

**Overlap.** The application rate at a point of the repeating cell is the sum over neighbouring sprinklers (square grid $S_s\times S_l$; triangular layout: every second lateral shifted by $S_s/2$, repeating cell $S_s\times2S_l$),

$$
a(x,y) = \sum_{i,j} p\bigl(x-x_{ij},\,y-y_{ij}\bigr)\quad(\mathrm{mm\,min^{-1}}),\qquad
\bar a=\frac1n\sum_k a_k,
\tag{13.6}
$$

*Provenance (Eq. 13.6):* **[Literature]**: overlap by superposition of single-sprinkler patterns.

evaluated on a $14\times14$ grid of the cell ($14\times24$ for the triangular layout). The mean *gross* application rate is $\mathrm{AR}=60\bar a$ mm h$^{-1}$ and the **Christiansen coefficient of uniformity** (Christiansen, 1942) is

$$
\mathrm{CU}=1-\frac{\sum_k |a_k-\bar a|}{n\,\bar a}.
\tag{13.7}
$$

*Provenance (Eq. 13.7):* **[Literature]**: Christiansen (1942).

A $\mathrm{CU}\ge85$ % is the usual requirement for a sprinkler system (Burt et al., 1997; Keller and Bliesner, 1990); the tile is green from 84 %. The *Layout in plan* shows the circles of reach, the wind arrow and the depth infiltrated so far (Play animates the time): green is the depth needed, red-brown is short, blue is more than needed, and brown hatching is water running off.

## Wind drift and evaporation loss

The fraction of the water lost between nozzle and soil is

$$
w_d=\frac{1}{100}\,\mathrm{clip}\Bigl\{\bigl(1.2+0.5u+0.04u^{2}\bigr)\,F\Bigl(\frac{P}{250}\Bigr)^{0.7}\bigl[1+0.025\,(T_a-20)\bigr]\Bigl[0.6+0.4\,\frac{\sin\alpha}{0.4226}\Bigr];\ 0.5,\ 45\Bigr\}.
\tag{13.8}
$$

*Provenance (Eq. 13.8):* **[Engineered]**: loss and ponding rules chosen for the workbench.

where $F$ is the type factor of Table 13.1, $P$ is in kPa, $u$ in m s$^{-1}$ and the air temperature $T_a=24\,^\circ\mathrm C+\Delta T$, with $\Delta T$ the warming of the Properties panel. The form follows the known trends — loss rises with wind, with pressure (finer droplets), with temperature, and falls with a flatter trajectory — in line with the ranges of 5–15 % usually quoted in textbooks (Keller and Bliesner, 1990); the numerical coefficients are **[Engineered]**. $w_d$ is clipped to 0.5–45 %.

## The soil intake, ponding and runoff

At each cell the water balance is computed with the Kostiakov intake of the soil (Eq. 11.6, from the texture; $K=k\times1000$ mm min$^{-A}$). The applied rate after drift is $a_k(1-w_d)$ and for a run of $T$ min the supply is $\mathrm{sup}=a\,T$. Ponding begins when the application rate exceeds the intake rate, which the layer takes as $a = K t^{A-1}$, i.e. at

$$
t_p=\Bigl(\frac aK\Bigr)^{1/(A-1)},\qquad
F=\begin{cases}\mathrm{sup}, & T\le t_p\\ K\,T^{A}, & T>t_p\end{cases}\qquad
R=\mathrm{sup}-F,\quad \mathrm{RO}=\max(0,R-S_d^{\mathrm{eff}}),\quad I=\mathrm{sup}-\mathrm{RO}.
\tag{13.9}
$$

*Provenance (Eq. 13.9):* **[Engineered]**: loss and ponding rules chosen for the workbench.

This is a **simplified point balance** (it uses the cumulative law $F=K\,T^{A}$ after ponding, and it ignores re-infiltration of water that has run to a lower cell, which makes the layer slightly pessimistic about runoff in a field with surface storage and slightly optimistic on a steep slope). A portion of the infiltrated depth is retained on the crop canopy and mulch and evaporates,

$$
I_c=\min\{I,\ I_{\mathrm{int}}\},\qquad I_{\mathrm{int}} = 0.6\,\mathrm{CAP}\,[\mathrm{VFF}<0.95] + 1.2\,\mathrm{LAI}_{\mathrm{live}},
\tag{13.10}
$$

*Provenance (Eq. 13.10):* **[Engineered]**: loss and ponding rules chosen for the workbench.

where CAP is the mulch storage capacity (mm, Table 3.1), the indicator is 1 when a mulch is present, and $\mathrm{LAI}_{\mathrm{live}}$ is the live leaf-area index of the simulated crop on the working date. The depth that reaches the soil at the cell is $Z_k=I-I_c$.

The intake figure shows the rate the soil accepts, $\dot I(t)=60\,K A\,t^{A-1}$ mm h$^{-1}$, the mean applied rate $\overline{AR}(1-w_d)$, the shaded area where the applied rate exceeds the intake (runoff), and the time at which ponding starts. (The plotted curve is the derivative of $Kt^{A}$; the point balance uses the ponding condition $a=Kt^{A-1}$, so the two differ by the constant factor $A$ in the intake rate, a documented simplification.)

![Sprinkler design: depth applied and infiltrated along the lateral, and the soil intake against the application rate. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/27_spr_soil_intake_against_the_application_rate_draw.jpg){width=70%}

## Efficiencies and run time

With $Z_k$ the infiltrated depth at cell $k$ and $\mathrm{gross}=\bar a\,T$ the mean depth discharged:

$$
\begin{aligned}
E_a &= \frac{\overline{\min(Z_k,Z_n)}}{\mathrm{gross}}, & E_s &= \frac{\overline{\min(Z_k,Z_n)}}{Z_n}, & \mathrm{DU}&=\frac{\overline{Z}_{25}}{\overline{Z}},\\
\mathrm{DP} &= \frac{\overline{\max(Z_k-Z_n,0)}}{\mathrm{gross}}, & \mathrm{RO}&=\frac{\overline{\mathrm{RO}_k}}{\mathrm{gross}}, & \mathrm{WD}&=w_d+\frac{\overline{I_c}}{\mathrm{gross}},
\end{aligned}
\tag{13.11}
$$

*Provenance (Eq. 13.11):* **[Literature]**: efficiency and distribution uniformity of Merriam and Keller (1978).

where $\overline{Z}_{25}$ is the mean of the lowest quarter of the $Z_k$ (the distribution uniformity of Merriam and Keller, 1978). The partition is closed, $E_a+\mathrm{DP}+\mathrm{RO}+\mathrm{WD}=1$. The tiles show $E_a$ (green from 85 %), $E_s$, CU, runoff, deep percolation and the combined drift, evaporation and interception loss, with a stacked bar of the partition.

**Automatic run time.** The time $T$ is the smallest value for which the driest quarter of the field receives the required depth,

$$
T=\min\{T:\ \overline{Z}_{25}(T)\ge Z_n\},\qquad T\in[1,\,2400]\ \mathrm{min},
\tag{13.12}
$$

*Provenance (Eq. 13.12):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

found by 18 bisection steps. If the soil cannot take the water as fast as it is applied, longer runs only raise runoff and the layer shows the run time and low $E_a$ together.

## Maximum allowable application rate

The allowable rate by soil and slope follows the standard table of sprinkler manuals (Keller and Bliesner, 1990, Table of maximum application rates; reproduced here for the textbook check).

Table 13.3. Maximum application rate (mm h$^{-1}$) by soil type and slope.

| Soil group | 0–5 % | 5–8 % | 8–12 % | 12–16 % |
|:--|:-:|:-:|:-:|:-:|
| Deep coarse sandy soils | 50 | 38 | 25 | 13 |
| Coarse sandy, compact layer below | 38 | 25 | 19 | 10 |
| Deep sandy loam | 25 | 20 | 15 | 10 |
| Sandy loam, compact layer below | 19 | 13 | 10 | 8 |
| Deep silt loam | 13 | 10 | 8 | 5 |
| Silt loam, compact layer below | 8 | 6 | 4 | 2.5 |
| Clay or clay loam, strong structure | 4 | 2.5 | 2 | 1.5 |

The ten soils of the program are assigned to rows: Coarse Sand, Sand, Loamy Sand $\to$ 1; Sandy Loam, Coarse Loam $\to$ 3; Loam, Silt Loam $\to$ 5; Sandy Clay Loam $\to$ 6; Clay Loam and Silty Clay Loam $\to$ 7. The toggle *Compact layer below the soil* moves an odd row to the next (compact) row. The slope selects the column.

## The ten textbook checks

The "Does your design pass?" panel runs the design through the course rules. Let $h_s=P/9.81$ (m), $q_h=0.06\,q$ (m$^3$ h$^{-1}$), $R_w=R$, the wind in km h$^{-1}$ $W=3.6\,u$, and the wind factor

$$
k=\begin{cases}1,&W\le5.5\\0.9,&5.5<W\le13\\0.8,&13<W\le22\\0.7,&W>22.\end{cases}
\tag{13.13}
$$

*Provenance (Eq. 13.13):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

The spacing limits, the field layout and the time budget are

$$
S_s\le k\,R_w,\qquad S_l\le1.5\,R_w,\qquad
L_y=\frac{10^{4}A_f}{L_x},\quad N=\lfloor L_x/S_s\rfloor,\quad N_m=\lfloor L_y/S_l\rfloor,
\tag{13.14}
$$

*Provenance (Eq. 13.14):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

$$
t_{\mathrm{set}}=\frac{Z_{\mathrm{gross}}}{\mathrm{AR}}\ \ (\mathrm h),\qquad
n_{\mathrm{sets/day}}=\Bigl\lfloor\frac{h_{\mathrm{op}}}{t_{\mathrm{set}}}\Bigr\rfloor,\qquad T_{\mathrm{int}}=\max\Bigl(1,\Bigl\lfloor\frac{Z_n}{\mathrm{ET}_{\mathrm{pk}}}\Bigr\rfloor\Bigr)\ \mathrm{days},
\tag{13.15}
$$

*Provenance (Eq. 13.15):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

where $L_x=L_L$ is the lateral length, $h_{\mathrm{op}}$ the operating hours per day and $Z_{\mathrm{gross}}$ the gross depth per irrigation. For $n=1\dots4$ laterals running at once, the days needed and the inflow are

$$
N_d(n)=\Bigl\lceil\frac{N_m}{n\,n_{\mathrm{sets/day}}}\Bigr\rceil,\qquad Q_{\mathrm{in}}(n)=n\,N\,q_h,
\tag{13.16}
$$

*Provenance (Eq. 13.16):* **[Engineered]**: run-time, wind-spacing and set rules; the wind factors follow the practice of Keller and Bliesner (1990) but are not independently verified.

and the program picks the smallest $n$ with $N_d\le T_{\mathrm{int}}$ and $Q_{\mathrm{in}}\le3.6\,Q_s$ (m$^3$ h$^{-1}$); if none satisfies both it picks the smallest $n$ meeting the time, else $n=4$.

**Pipes.** Friction losses use the Blasius form (Blasius, 1913) for smooth plastic pipe,

$$
J=\frac{0.472\,Q^{1.75}}{D^{4.75}}\ \ (\mathrm{m\,m^{-1}};\ Q\ \text{in L h}^{-1},\ D\ \text{in mm}),
\tag{13.17}
$$

*Provenance (Eq. 13.17):* **[Literature]**: Blasius friction law for smooth pipe.

with the Christiansen reduction factor $F=1/2.75+1/(2N)$ for $N$ equally spaced outlets and a 10 % allowance for local losses. The lateral pipe is the smallest of the standard internal diameters $\{46.4,\,58,\,63,\,65.8,\,75,\,84.9,\,100\}$ mm for which

$$
h_{f,\mathrm{lat}}=1.1\,F\,J(Q_L,D)\,\bigl(L_x-S_s/2\bigr)\le0.2\,h_s,\qquad Q_L=1000\,N\,q_h,
\tag{13.18}
$$

*Provenance (Eq. 13.18):* **[Literature]**: 20 % rule of Keller and Bliesner (1990).

the classical 20 %-of-operating-head rule that keeps discharge variation along the lateral under about 10 % (Keller and Bliesner, 1990). The mainline (flow $Q_m=n\,Q_L$, length $L_y-S_l/2$) is the smallest diameter not below the lateral's with $J<0.05$ m m$^{-1}$.

**Manometric head and pump.**

$$
H_{\mathrm{man}} = z_{\mathrm{lift}} + J\,L_{\mathrm{conv}} + J\,L_{\mathrm{main}} + h_s + 0.75\,h_{f,\mathrm{lat}},
\tag{13.19}
$$

*Provenance (Eq. 13.19):* **[Engineered]**: head and sets bookkeeping.

$$
P_{\mathrm{CV}} = \frac{1000\,(Q_m/3.6\times10^{6})\,H_{\mathrm{man}}}{75\,\eta},\quad \eta=0.75,\qquad P_{\mathrm{kW}}=0.7355\,P_{\mathrm{CV}},
\tag{13.20}
$$

*Provenance (Eq. 13.20):* **[Literature]**: hydraulic power definition.

with $L_{\mathrm{conv}}$ the conveyance length (the mainline length slider) and $0.75\,h_{f,\mathrm{lat}}$ the head at the lateral inlet above $h_s$ (the textbook inlet-head rule). The ten checks (spacing along the lateral, spacing between laterals, wind below 16 km h$^{-1}$, rate below the allowed value, rate below $K_s$, CU $\ge85$ %, lateral loss $\le20$ % of $h_s$, mainline gradient, the whole field within the interval, flow within the farm supply) are shown with a tick or an exclamation point and the numbers; "N of 10 checks pass" closes the panel. The textbook sequence in the layer also plots the class of sprinkler (low, medium or high pressure) from $h_s$: $<20$ m, 20–45 m, $>45$ m.

![Sprinkler design: the ten textbook checks and the kinds of sprinkler system. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/29_spr_does_your_design_pass_the_course_checks_draw.jpg){width=70%}

## Kinds of sprinkler system

Five systems are offered, each with its efficiency range (Keller and Bliesner, 1990; Burt et al., 1997 report the range of field values):

| System | Principle | Typical $E_a$ |
|:--|:--|:-:|
| Solid-set | Fixed buried laterals; valves open some at a time | 70–75 % |
| Hand-move | The lateral is moved by hand after every set (1–4 sets a day) | 70–75 % |
| Center pivot | A rotating lateral on towers about 30 m apart; the corners stay dry | 65–70 % |
| Linear-move | A lateral travelling in a straight line | 65–70 % |
| Traveling gun | One gun on a hose reel covers a 220° sector, strip by strip | 65–70 % |

The plan of the selected system is drawn to scale for the present field; Play moves it (the active lateral, the pivot arm, the travelling lateral or the gun strip). A bar shows where the design's $E_a$ lies against the range for the system.

## Layout and infrastructure

The *Layout and infrastructure* block of this layer uses the same hydraulic tools as the drip layer, with these differences. With $N_s=\lfloor L_L/S_s\rfloor$ sprinklers per lateral and $Q_{\mathrm{lat}}=N_s q/60$ (L s$^{-1}$), the number of laterals that can run together is $\lfloor Q_s/Q_{\mathrm{lat}}\rfloor$ and the sets

$$
N_L=\Bigl\lfloor\frac{10^4A_f/L_L}{S_l}\Bigr\rfloor,\quad
n_l=\min\Bigl(N_L,\ \Bigl\lfloor\frac{Q_s}{Q_{\mathrm{lat}}}\Bigr\rfloor\Bigr),\quad
n_{\mathrm{set}}=\Bigl\lceil\frac{N_L}{n_l}\Bigr\rceil,\quad Q_z=n_l Q_{\mathrm{lat}}.
\tag{13.21}
$$

*Provenance (Eq. 13.21):* **[Engineered]**: head and sets bookkeeping.

The lateral loss uses the Hazen–Williams equation (Eq. 12.3, $C=140$) with the Christiansen factor for $N_s$ outlets and the exponent $m=1.852$,

$$
F_m=\frac1{2.852}+\frac1{2N_s}+\frac{\sqrt{0.852}}{6N_s^{2}},\qquad h_{f,\mathrm{lat}}=F_m\,h_{HW}(Q_{\mathrm{lat}},D,L_L),
\tag{13.22}
$$

*Provenance (Eq. 13.22):* **[Literature]**: Christiansen reduction factor with Hazen--Williams exponent.

and the lateral pipe is the smallest of the series (12.21) with $h_{f,\mathrm{lat}}\le0.2\,h$ and $v\le2.0$ m s$^{-1}$. The lateral inlet head is $H_0=h+1.5+h_{f,\mathrm{lat}}$ m (1.5 m of riser). The submain, mainline and pump then follow Eqs. (12.22)–(12.23) exactly as for drip, with $H_0$ from this paragraph. The block's table gives the sets ($\times$ laterals), laterals and sprinklers, TDH, power, lateral loss ($\le20$ %) and pipe laid per hectare.

(Two parallel calculations therefore appear in this layer: the **simulation block** sizes the pipe by Hazen–Williams with $C=140$, while the **textbook block** uses the Blasius equation and the commercial plastic-pipe sizes of the course. They are separate presentations of the same design question; the numbers will differ by a few per cent, and the textbook block is the one to compare with hand calculations from the course.)

## The design table and sensitivity

The optimiser works like the drip one (Eq. 12.26): score $\min(E_a,1)-2.5\max(0,0.9-E_s)$, target $E_a\ge85$ % and $E_s\ge85$ %, accept a move only if the score rises by more than 0.002. The ten moves are **pressure, spacing along the lateral, run time, nozzle, spacing between laterals, run time, pressure, triangular layout, run time, spacing along the lateral**. For pressure, nozzle and the two spacings the candidates are nine equally spaced values over the range of Table 13.1 (rounded to the step); for the layout the two options; for the run time $T_0\times\{0.6,0.7,0.8,0.9,1,1.1,1.25\}$ with $T_0$ the automatic time. Tapping a row applies it. If the target is not met, the layer suggests a lower application rate (a smaller nozzle or wider spacing) or another sprinkler type.

The sensitivity chart moves eight inputs and shows the change of $E_a$: soil intake $k$ ($\pm20$ %), wind ($\pm50$ %), pressure ($\pm20$ %), nozzle ($\pm15$ %), the two spacings ($\pm20$ %), the depth per irrigation ($\pm25$ %) and the ground slope ($\pm50$ %).

## Season and farm

$$
n_{\mathrm{ev}}=\frac{y_I}{Z_n},\qquad n_{\mathrm{sp}}=\mathrm{round}\Bigl(\frac{10^{4}A_f}{S_sS_l}\Bigr),\qquad
Q_{\mathrm{tot}}=\frac{n_{\mathrm{sp}}\,q}{60},\qquad n_{\mathrm{set}}=\Bigl\lceil\frac{Q_{\mathrm{tot}}}{Q_s}\Bigr\rceil,\qquad t_{\mathrm{round}}=\frac{n_{\mathrm{set}}\,T}{60}\ \mathrm h.
\tag{13.23}
$$

*Provenance (Eq. 13.23):* **[Engineered]**: head and sets bookkeeping.

The gross water per irrigation is $\mathrm{gross}=\bar a\,T$ mm, per season $n_{\mathrm{ev}}\,\mathrm{gross}$ mm ($=10\,n_{\mathrm{ev}}\,\mathrm{gross}$ m$^3$ ha$^{-1}$). The table also gives one sprinkler's discharge and reach, the sprinklers for $A_f$, the sets with $Q_s$, and the pumping hours and energy of the season. The layer closes with the *Irrigation schedule* and the *When to irrigate* message (end of Chapter 11).

## How to use the layer

* **To pick a sprinkler for a soil.** Choose the soil, set the slope and the wind, then compare the types: the banner tells you the largest allowed rate, the intake plot shows where runoff starts, and the checks name the failing rule.
* **To reduce runoff.** Lower the application rate: a smaller nozzle or lower pressure reduces $q$; a wider spacing spreads it over a larger area; a triangular layout improves CU at the same rate.
* **To reduce drift.** Reduce the pressure, use a flatter angle, or use a micro-sprinkler ($F=0.7$); the wind arrow and the $w_d$ share of the partition show the effect.
* **To size the system for the farm.** Set the area, farm supply and operating hours; read the sets, the pipe diameters and the pump power from the layout block, and the textbook block for the hand-calculation version.
