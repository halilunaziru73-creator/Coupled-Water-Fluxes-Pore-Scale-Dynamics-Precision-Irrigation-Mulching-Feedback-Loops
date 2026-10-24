# Drip irrigation design

The drip layer designs the **emitter, its placement, the lateral and the pipe network** for the soil, crop and trigger set in the rest of the program. It answers four questions in order: how big a wet bulb does one emitter make, how much of the water it delivers stays in the root zone, how uneven is the delivery along the lateral, and what pump and pipes does the farm need. Everything is a closed-form hydraulic or geometric model, recomputed at every slider move.

The layer's sections, in order: control bar and inputs; soil moisture around the driest, average and wettest emitter (Run simulation animates the wetting); where the water goes; uniformity along the lateral; growth of the wetted bulb with time; result tiles; layout and infrastructure; irrigation schedule; the design table; the sensitivity chart; season and farm; and the "When to irrigate" advice. The last two are shared with the other design layers and are described at the end of Chapter 11.

![Drip design: inputs and the soil moisture around the driest, average and wettest emitter. Volume 2 shows the whole layer, part by part, with its equations.](images/layers/d_drip_p1.jpg){width=80%}

## Inputs, step by step

1. Open *Irrigation design ▸ Drip irrigation design*. The crop, soil, root zone, trigger and date come from the DSS (the green badge); the choices below are the design (the amber badge).
2. **Emitter** (a row of four chips). Choosing one sets the nominal flow, spacing, lateral diameter and inlet head of Table 12.1.
3. **Placement**: *Surface* (design only), or a buried line at 15, 25, 45 or 55 cm. A buried choice also sets the explorer's irrigation method to the matching Daisy run (M04, M06, M09 or M10), so that the rest of the program shows the same depth.
4. **Run time**: *Automatic* (time to deliver the depth at the driest emitters, Eq. 12.17) or *Manual*.
5. Set the value boxes of Table 12.2, then press **Run simulation**. The crop, mulch and irrigation method rows at the top are the same controls as the Properties panel.

Table 12.1. Emitter types (defaults are set when the chip is chosen; $c_v$ manufacturer coefficient of variation, $x$ flow exponent, $n_e$ emitters per plant or point, $H_{\min}$ compensation threshold).

| Emitter | $q$ (L h$^{-1}$) | $S_e$ (m) | $D$ (mm) | $H_0$ (m) | $c_v$ | $x$ | $n_e$ | $H_{\min}$ (m) |
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Online emitter | 4 | 0.75 | 16 | 10 | 0.07 | 0.5 | 1 | — |
| Inline emitter | 2 | 0.50 | 16 | 10 | 0.04 | 0.5 | 1 | — |
| Drip tape | 1 | 0.20 | 16 | 10 | 0.08 | 0.6 | 2 | — |
| Pressure-compensating | 2 | 0.60 | 16 | 15 | 0.03 | 0.05 | 1 | 8 |

Table 12.2. Drip inputs (value boxes) (range, step, default).

| Control | Range, step | Default | Meaning |
|:--|:-:|:-:|:--|
| Emitter spacing $S_e$ (m) | 0.1–1.5, 0.05 | by emitter | Along the lateral |
| Lateral spacing $S_l$ (m) | 0.5–3, 0.05 | 1.5 (1.0 for cereal, legume; 1.5 for vegetable, reset when the crop changes) | Between laterals |
| Emitter flow $q$ (L h$^{-1}$) | 0.5–8, 0.1 | by emitter | Nominal flow at $H_0$ |
| Lateral length $L_L$ (m) | 20–300, 5 | 100 | |
| Inlet pressure head $H_0$ (m) | 4–30, 0.5 | 10 (15 for PC) | |
| Lateral inside diameter $D$ (mm) | 10–32, 1 | 16 | |
| Irrigate every (days) | 1–10, 1 | 2 | Sets the default depth |
| Run time (h) | 0.25–48, 0.25 | automatic | Greyed while *Automatic* |
| Depth per irrigation $Z_n$ (mm) | 3–80, 1 | from the DSS | Tap the label to reset |
| Area to irrigate $A_f$ (ha) | 0.2–10, 0.1 | 1 | |
| Farm supply $Q_s$ (L s$^{-1}$) | 2–120, 1 | 30 | |
| Mainline length $L_m$ (m) | 20–600, 10 | 120 | |
| Water lift, source to field (m) | 0–60, 1 | 12 | |

**Depth per irrigation.** By default the depth is the crop need over the interval, capped by what the root zone can hold at the trigger,

$$
Z_n = \min\bigl\{Z_{n}^{\mathrm{DSS}},\ \max(4,\ \mathrm{ET}_{\mathrm{pk}}\,\Delta t)\bigr\}\ \ \mathrm{mm},
\tag{12.1}
$$

*Provenance (Eq. 12.1):* **[Engineered]**: depth and demand rules chosen for the workbench.

where $\Delta t$ is the chosen interval, $Z_{n}^{\mathrm{DSS}}=\mathrm{clip}(f_T\,\mathrm{AWC}\,R_{\max};25,150)$ is Eq. (5.27), and $\mathrm{ET}_{\mathrm{pk}}$ is the peak five-day moving mean of simulated evaporation plus transpiration over the year, bounded to 2.5–9 mm d$^{-1}$,

$$
\mathrm{ET}_{\mathrm{pk}} = \mathrm{clip}\Bigl\{\max_d \tfrac15\sum_{j=0}^{4}\bigl(E_{d+j}+T_{d+j}\bigr);\ 2.5,\ 9\Bigr\}.
\tag{12.2}
$$

*Provenance (Eq. 12.2):* **[Engineered]**: depth and demand rules chosen for the workbench.

The mean evaporative demand used for surface drying, $E_0$, is the mean of the simulated daily evaporation on days 141–250 of the year (when positive), clipped to 1–5 mm d$^{-1}$.

## Lateral hydraulics: head loss and flow along the lateral

An emitter lateral of length $L_L$ carries $N=\mathrm{round}(L_L/S_e)$ intervals and $N+1$ emitters, indexed $j=0\dots N$ from the inlet. The friction head loss in the segment feeding emitter $j$ is the Hazen–Williams equation (Hazen and Williams, 1905), in SI form with a roughness coefficient $C=140$ for plastic pipe,

$$
h_{f,j} = \frac{10.67\,S_e\,Q_j^{1.852}}{C^{1.852}\,D^{4.871}},\qquad Q_j=\sum_{i\ge j+1} q_i\ \ (\mathrm{m^3\,s^{-1}}),\quad D\ \text{in m}.
\tag{12.3}
$$

*Provenance (Eq. 12.3):* **[Literature]**: Hazen and Williams (1905).

The head at emitter $j$ is $h_j=h_{j-1}-h_{f,j-1}$ with $h_0=H_0$ (floored at 0.5 m). Emitter discharge depends on the local head through the emitter equation (Keller and Karmeli, 1974),

$$
q_j = q\Bigl(\frac{h_j}{H_0}\Bigr)^{x}\quad(\text{non-compensating; } h_j/H_0\ge0.01),
\tag{12.4}
$$

*Provenance (Eq. 12.4):* **[Literature]**: Keller and Karmeli (1974) emitter law.

with $x=0.5$ for a fully turbulent orifice or long-path emitter and $x=0.6$ for the drip tape of Table 12.1. The pressure-compensating (PC) emitter is modelled as

$$
q_j = \begin{cases} q\bigl[1 + 0.04\,(h_j-H_0)/H_0\bigr], & h_j\ge H_{\min},\\[2pt] q\,\bigl(\max(h_j,0.1)/H_{\min}\bigr)^{0.5}, & h_j<H_{\min},\end{cases}
\tag{12.5}
$$

*Provenance (Eq. 12.5):* **[Engineered]**: pressure-compensating emitter model with chosen constants.

i.e. a nearly flat discharge above $H_{\min}=8$ m (a 4 % change in flow per 100 % change in head) and the orifice law below it. The flows depend on the heads and the heads on the flows, so the pair (12.3)–(12.4) is **iterated to convergence** from the uniform start $q_j=q$, $h_j=H_0$ (the first three passes are plain substitution, then the flows are averaged with the previous pass; the iteration stops when the largest relative change in any emitter flow is below $10^{-7}$, at most 500 passes). Version 1 used four passes, which is sufficient only when the head loss is small; the converged solver agrees with an independent solution to $3\times10^{-7}$ for head losses up to 60 % of the inlet head. When the friction loss exceeds 20 % of the inlet head, or the iteration fails to converge, the layer prints a red warning, because uniformity then falls and the design is outside the usual rule of thumb. The mean and minimum discharge are then

$$
\bar q = \frac{1}{N+1}\sum_{j=0}^{N} q_j,\qquad q_{\min}=\min_j q_j,\qquad
Q_{\mathrm{lat}} = \frac{N\,\bar q}{3600}\ \ (\mathrm{L\,s^{-1}}),
\tag{12.6}
$$

*Provenance (Eq. 12.6):* **[Literature]**: definitions of mean and minimum discharge.

and the loss along the whole lateral is $h_f=H_0-h_N$, with $H_{\mathrm{end}}=h_N$ the head at the far end (Section "Uniformity along the lateral").

**Emission uniformity.** The design emission uniformity follows Keller and Karmeli (1974),

$$
E_u = \mathrm{clip}\Bigl\{\Bigl(1 - \frac{1.27\,c_v}{\sqrt{n_e}}\Bigr)\frac{q_{\min}}{\bar q};\ 0.3,\ 1\Bigr\}.
\tag{12.7}
$$

*Provenance (Eq. 12.7):* **[Literature]**: Keller and Karmeli (1974).

The first factor is the manufacturing variation; the second is the hydraulic variation along the lateral (here $q_{\min}$ replaces the classical quarter-lowest mean, a conservative choice). The *combined* relative standard deviation of the delivery, which drives the spread of bulbs below, is

$$
\sigma_q = \sqrt{c_v^{2} + \sigma_P^{2}},\qquad
\sigma_P^{2} = \frac{1}{N+1}\sum_{j=0}^{N}\Bigl(\frac{q_j}{\bar q}-1\Bigr)^{2}.
\tag{12.8}
$$

*Provenance (Eq. 12.8):* **[Engineered]**: combined spread chosen to drive the bulb quantiles.

Reading the lateral plot: the solid line is $q_j/q$ in per cent against distance, the dashed line is the head as a percentage of $H_0$. A lateral that is too long or too narrow shows a steep fall of both. For a non-compensating emitter a 10 % loss of head costs about 5 % of flow ($x=0.5$); the PC emitter stays flat until the head drops below $H_{\min}$.

![Drip design: uniformity along the lateral and the growth of the wetted bulb with run time. Volume 2 shows the whole layer, part by part, with its equations.](images/sec/drip_uniformity.jpg){width=80%}

## The wetted bulb

Water from an emitter spreads into soil that is initially at the trigger water content and is refilled up to field capacity. The layer models the wetted volume around a *buried* point source as a **half-ellipsoid** below the emitter and a short one above it (an **[Engineered]** simplification of the wetted-volume shapes used in drip design; the aspect ratio is derived from the soil, not read from a table).

**Water to be stored per unit soil volume.**

$$
\Delta\theta = \max\{0.03,\ f_T\,(\theta_{fc}-\theta_{wp})\}.
\tag{12.9}
$$

*Provenance (Eq. 12.9):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Shape.** With emitter depth $z_d$ (mm), horizontal radius $r$ (mm) at the emitter level, lower semi-axis $a\,r$ and upper semi-axis $u\,r$ with $u=0.6$, the wetted radius at depth $z$ is

$$
\rho(z) = r\,\sqrt{1 - \zeta^{2}},\qquad
\zeta = \begin{cases} (z - z_d)/(a\,r), & z\ge z_d,\\ (z_d - z)/(u\,r), & z<z_d,\end{cases}\qquad \rho=0\ \text{for}\ |\zeta|\ge1.
\tag{12.10}
$$

*Provenance (Eq. 12.10):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Aspect ratio.** The shape factor $a$ (depth over radius) increases when gravity is strong relative to capillarity, i.e. for a coarse soil and a low flow. It is evaluated from the ratio of the saturated conductivity to the radial capillary spreading rate $q/(2\pi\lambda^{2})$ (the form is a scaling argument and the constants are **[Engineered]**),

$$
a = \mathrm{clip}\Bigl\{1 + 0.6\,\log_{10}\Bigl(1 + \frac{K_s}{q\cdot10^{6}/(2\pi\lambda^{2})}\Bigr);\ 1,\ 1.9\Bigr\},\qquad \lambda=\max(40,\psi_f),
\tag{12.11}
$$

*Provenance (Eq. 12.11):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

with $K_s$ in mm h$^{-1}$, $q$ in L h$^{-1}$ and $\psi_f$ the wetting-front suction of Eq. (11.3) in mm. The result is a bulb that is round ($a=1$) for a fine soil and elongated downwards (up to $a=1.9$) for a sand.

**Radius.** For an emitter that delivers $V$ litres, the wetted volume is $V_w = V\cdot10^{6}/\Delta\theta$ mm$^3$ ($1\ \mathrm{L}=10^{6}\ \mathrm{mm^3}$). The radius $r$ is found by bisection (38 steps between 5 and 3500 mm) so that the volume of revolution of Eq. (12.10), integrated in 56 layers,

$$
V_w = \int \pi\,\rho(z)^{2}\,dz,
\tag{12.12}
$$

*Provenance (Eq. 12.12):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

equals $V_w$. When the volume is *line-like*, the cross-section instead of the volume is conserved: for drip tape ($S_e<0.34$ m) or when neighbouring bulbs overlap ($2r>S_e$ with $S_e<1.2$ m), the water is spread along the line, $A_w = V\cdot10^{6}/(S_e\cdot1000)/\Delta\theta$ mm$^2$ per unit length of lateral and the profile area is $2\int\rho\,dz$. The panel is then labelled "line (bulbs merge)" rather than "point". The wetted share of the soil surface is

$$
P_w = \mathrm{clip}\Bigl\{\frac{2r}{1000\,S_l};\ 0,\ 1\Bigr\}.
\tag{12.13}
$$

*Provenance (Eq. 12.13):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

**Where the water goes.** Of the $V$ litres, the part that falls inside the bulb below the root-zone depth $R_{\max}$ is lost to deep percolation, a fraction $B_{\mathrm{below}}/V_w$ of $V$:

$$
V_{\mathrm{dp}}^{(1)} = V\,\frac{\int_{z>R_{\max}}\pi\rho^{2}\,dz}{V_w},
\tag{12.14}
$$

*Provenance (Eq. 12.14):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

and the part evaporated from the wet surface patch is limited to half the delivery,

$$
V_{\mathrm{ev}} = \min\bigl\{0.5\,V,\ \pi\rho(0)^{2}\cdot10^{-6}\cdot 2E_0\bigr\}\quad(\text{L},\ \text{area in m}^{2},\ E_0\ \text{in mm d}^{-1}),
\tag{12.15}
$$

*Provenance (Eq. 12.15):* **[Engineered]**: wetted-bulb geometry and loss partition; constants chosen for the workbench.

(for a line source the area is $2\rho(0)S_e\cdot10^{-6}$ m$^2$ per emitter). The factor 2 corresponds to about two days of evaporation from a wet surface patch of mean demand $E_0$; this is an **[Engineered]** simplification of the two-stage evaporation of Chapter 9. For a surface line ($z_d=0$) the bulb is half-spherical and the evaporating patch is largest, which is why surface drip stores less than buried drip in the table. The remainder is available to the roots, $V_{\mathrm{root}}=V-V_{\mathrm{dp}}^{(1)}-V_{\mathrm{ev}}$.

![Drip design: result tiles and the water partition of one irrigation. Volume 2 shows the whole layer, part by part, with its equations.](images/sec/drip_result.jpg){width=80%}

## Spread between emitters and the efficiencies

Emitters do not all deliver the same volume. The layer evaluates five representative emitters, at standard-normal quantiles $z\in\{-1.28,-0.52,0,0.52,1.28\}$ (the 10th, 30th, 50th, 70th and 90th percentiles, equal weights), each delivering

$$
V_i = \max\bigl\{0.02\,\bar V,\ \bar V\,(1+\sigma_q z_i)\bigr\},\qquad \bar V=\bar q\,t,
\tag{12.16}
$$

*Provenance (Eq. 12.16):* **[Engineered]**: five-quantile delivery and run-time rules chosen for the workbench.

where $t$ is the run time (h). For each, the bulb, deep percolation and evaporation are computed with Eqs. (12.10)–(12.15). The water that the root zone can accept is limited by the need,

$$
V_{\mathrm{req}} = Z_n\,S_e\,S_l\ \ (\mathrm L),\qquad
V_{\mathrm{st},i}=\min\{V_{\mathrm{root},i},\ V_{\mathrm{req}}\},\qquad V_{\mathrm{ex},i} = V_{\mathrm{root},i}-V_{\mathrm{st},i}.
\tag{12.17}
$$

*Provenance (Eq. 12.17):* **[Literature]**: definition of the requirement over the area served by one emitter.

Because $1\ \mathrm{mm}$ over $1\ \mathrm m^2$ is $1$ L, $V_{\mathrm{req}}$ is the depth needed over the area $S_eS_l$ served by one emitter. **Automatic run time** is the time at which the *driest* emitters deliver the need,

$$
t = \mathrm{clip}\Bigl\{\frac{V_{\mathrm{req}}}{\bar q\,E_u};\ 0.05,\ 96\Bigr\}\ \ \mathrm h.
\tag{12.18}
$$

*Provenance (Eq. 12.18):* **[Engineered]**: five-quantile delivery and run-time rules chosen for the workbench.

The efficiencies are means over the five quantiles ($\langle\cdot\rangle$):

$$
E_a = \frac{\langle V_{\mathrm{st}}\rangle}{\langle V\rangle},\quad
E_s = \frac{\langle V_{\mathrm{st}}\rangle}{V_{\mathrm{req}}},\quad
\mathrm{DP} = \frac{\langle V_{\mathrm{dp}}^{(1)}+V_{\mathrm{ex}}\rangle}{\langle V\rangle},\quad
\mathrm{EV} = \frac{\langle V_{\mathrm{ev}}\rangle}{\langle V\rangle},\quad
Z_{\mathrm{gross}}=\frac{\bar V}{S_eS_l},
\tag{12.19}
$$

*Provenance (Eq. 12.19):* **[Engineered]**: five-quantile delivery and run-time rules chosen for the workbench.

so that $E_a+\mathrm{DP}+\mathrm{EV}=1$. Reading them: $E_a$ is how much of the pumped water ends up stored in the root zone; $E_s$ is how well the root zone is refilled (a value below 85 % turns the "Root zone refilled" line red and says *short*); $E_u$ is the lateral uniformity; $Z_{\mathrm{gross}}$ is the depth to pump per irrigation. The layer colours $E_a\ge85$ % green, 65–85 % amber and below 65 % red; $E_u\ge90$ % is green and 80–90 % amber.

## Layout and infrastructure

The farm side of the design uses the area $A_f$ and the supply $Q_s$.

**Laterals and zones.**

$$
W_f=\frac{10^{4}A_f}{L_L},\quad N_L=\Bigl\lfloor \frac{W_f}{S_l}\Bigr\rfloor,\quad
n_{\mathrm{zone}}=\Bigl\lceil \frac{N_L\,Q_{\mathrm{lat}}}{Q_s}\Bigr\rceil,\quad
n_{l}=\Bigl\lceil\frac{N_L}{n_{\mathrm{zone}}}\Bigr\rceil,\quad Q_z=n_l\,Q_{\mathrm{lat}},
\tag{12.20}
$$

*Provenance (Eq. 12.20):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

where $W_f$ is the width of the field perpendicular to the laterals, $n_{\mathrm{zone}}$ the number of zones that must run in turn so that $Q_s$ is not exceeded, and $Q_z$ (L s$^{-1}$) the flow of one zone. The total number of emitters is $N_L(\mathrm{round}(L_L/S_e)+1)$.

**Pipe sizing.** Submain length $L_{sm}=n_l S_l$, mainline length $L_m$ (value box). The pipe diameter is the smallest of the commercial series

$$
D\in\{32,40,50,63,75,90,110,125,160,200,250,315\}\ \mathrm{mm}
\tag{12.21}
$$

*Provenance (Eq. 12.21):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

for which the mean velocity $v=4Q_z/(\pi D^{2})\le1.5$ m s$^{-1}$ (a common design limit that keeps friction and water-hammer moderate; see Keller and Bliesner, 1990, for pipe design practice). The submain loss is $0.4$ of the full-length Hazen–Williams loss, Eq. (12.3) with $Q_j=Q_z$ (the Christiansen (1942) reduction factor $F$ for a pipe with many equally spaced outlets is $F\to1/2.852=0.35$ for $m=1.852$, so $0.4$ is slightly conservative), and the mainline loss is the full value:

$$
h_{f,sm}=0.4\,\frac{10.67\,L_{sm}\,Q_z^{1.852}}{C^{1.852}D_{sm}^{4.871}},\qquad
h_{f,m}=\frac{10.67\,L_m\,Q_z^{1.852}}{C^{1.852}D_m^{4.871}}.
\tag{12.22}
$$

*Provenance (Eq. 12.22):* **[Engineered]**: Christiansen-type reduction with a chosen factor 0.4.

**Pump.** The total dynamic head and the shaft power are

$$
\mathrm{TDH} = z_{\mathrm{lift}} + H_0 + h_{f,sm} + h_{f,m} + 9\ \mathrm m,\qquad
P = \frac{\rho g\,Q_z\,\mathrm{TDH}}{\eta} = \frac{9.81\,(Q_z/1000)\,\mathrm{TDH}}{0.65}\ \ \mathrm{kW}.
\tag{12.23}
$$

*Provenance (Eq. 12.23):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

The constant 9 m covers the filter, valves and fittings, and $\eta=0.65$ is the overall pump-and-motor efficiency; both are **[Engineered]** design allowances, not measured values. The laterals' own loss is already inside $H_0$.

![Drip design: layout and infrastructure, to scale, with the zones running in turn. Volume 2 shows the whole layer, part by part, with its equations.](images/sec/drip_layout.jpg){width=80%}

The drawing shows the source, pump, filter, mainline, valves, submain and laterals to scale; during the run the zones run one after the other, and the head along the flow path is drawn underneath. The table beside it gives zones ($\times$ laterals per zone), laterals and emitters, TDH, pump power, lateral head loss and pipe laid per hectare, $(N_L L_L + L_{sm})/A_f$.

## Season and farm

With $y_I$ the net seasonal irrigation of the DSS for the year of the working date, $E_u$ and $E_a$ as above,

$$
n_{\mathrm{ev}}=\frac{y_I}{Z_n},\quad
Z_{\mathrm{season}} = n_{\mathrm{ev}}\,Z_{\mathrm{gross}},\quad
q_{ha}=\frac{q}{3600}\,\frac{10^{4}}{S_eS_l}\ \ (\mathrm{L\,s^{-1}\,ha^{-1}}),
\tag{12.24}
$$

*Provenance (Eq. 12.24):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

$$
n_{\mathrm{set}}=\Bigl\lceil \frac{q_{ha}A_f}{Q_s}\Bigr\rceil,\qquad
t_{\mathrm{round}}=n_{\mathrm{set}}\,t,\qquad
H_{\mathrm{pump}}=n_{\mathrm{ev}}\,t_{\mathrm{round}},\qquad
E_{\mathrm{kWh}}=H_{\mathrm{pump}}\,P.
\tag{12.25}
$$

*Provenance (Eq. 12.25):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

The layer prints these as a table (net irrigation need and number of events, gross water per irrigation and per season in mm and m$^3$ ha$^{-1}$, peak crop need, flow per hectare, sets for $A_f$ with $Q_s$, hours of pumping and energy). Then the *Irrigation schedule* and the *When to irrigate* advice, described at the end of Chapter 11, close the layer.

## The design table

The optimiser takes the current design and tries one change at a time, in this order: **placement depth, run time, emitter flow, emitter spacing, placement depth, run time, emitter kind, lateral spacing, emitter flow, run time**. For each move the candidates are:

| Move | Candidates |
|:--|:--|
| Placement depth | Surface, 15, 25, 45, 55 cm |
| Run time | $t_0\times\{0.55,0.65,0.75,0.85,0.95,1,1.1,1.25\}$, with $t_0$ the automatic run time of the current design |
| Emitter flow $q$ | 0.6, 1, 1.5, 2, 3, 4, 6, 8 L h$^{-1}$ (run time reset to automatic) |
| Emitter spacing $S_e$ | 0.2, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.25 m |
| Emitter kind | the four emitters of Table 12.1, each with its own default $q$, $S_e$ |
| Lateral spacing $S_l$ | 0.75, 1, 1.25, 1.5, 1.8, 2.2, 2.6 m |

The score is

$$
\mathrm{score} = \min(E_a,1) - 2.5\,\max(0,\ 0.9 - E_s),
\tag{12.26}
$$

*Provenance (Eq. 12.26):* **[Engineered]**: layout, sizing and scoring rules; the 1.5 m/s velocity limit is a common practice.

so a design is penalised when the root zone is not refilled to 90 %. A move is accepted when its best candidate improves the score by more than 0.002; the search stops when $E_a\ge85$ % **and** $E_s\ge85$ %, or after ten moves. One move is performed per screen update, and the search pauses while a slider is being dragged. Each accepted row shows the step, $q$, $S_e$, depth, run time, $E_a$, $E_s$ and DP; a green row meets the target, and **tapping any row applies that design** to the sliders (including the placement depth and the explorer's irrigation method). If the target is not met, the layer reports the best found and suggests a shorter interval or a different emitter.

![Drip design table and the sensitivity chart. Volume 2 shows the whole layer, part by part, with its equations.](images/sec/drip_design_table.jpg){width=80%}

## Sensitivity

As for the surface layer, each input is moved up and down and the change of $E_a$ is shown as a bar: emitter flow $q$ ($\pm25$ %), emitter spacing ($\pm25$ %), lateral spacing ($\pm25$ %), placement depth ($\pm30$ %, at least 10 cm), depth per irrigation ($\pm25$ %) and run time ($\pm20$ %). The result is a local sensitivity at the present design.

## How to use the layer

* **To choose an emitter for a soil.** Select the soil in the Properties panel, open the layer and compare the four chips with the same run time: the tile of $E_a$ and the line chart of the bulb show which emitter keeps the bulb inside the root zone.
* **To check a lateral length.** Increase $L_L$ until $E_u$ turns amber; the lateral plot shows where the head falls below the pressure at which the emitter holds its flow.
* **To size a pump.** Fix $A_f$, $Q_s$, $L_m$ and the lift; read TDH and kW from the layout table.
* **To see the effect of the trigger.** Move *Trigger* in the Properties panel: $f_T$ changes $\Delta\theta$ (Eq. 12.9) and $Z_n$ (Eq. 12.1), and the bulb and the run time adjust.
