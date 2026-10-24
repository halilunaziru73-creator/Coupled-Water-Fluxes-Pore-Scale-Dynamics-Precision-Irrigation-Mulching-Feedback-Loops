# Surface irrigation design (S2)

The surface-irrigation layer designs a **border strip, furrow or basin** for *your* soil: it derives the soil's intake from texture, solves the advance of the water front, chooses a cut-off time, computes where the water goes, and then searches for a better layout. Everything on this page is a closed-form hydraulic model; no Daisy table is read, except the crop need and the trigger, which come from the DSS (Chapter 5).

The layer is a long scrolling drawing. The sub-section bar above it (*Whole design, Layout design, Simulation, Hydrograph, Advance and opportunity, Results, Design table*) jumps to a section, as do the sub-items of the layer in the Layers panel. The twelve sections are, in order:

| # | Section (sub-item) | Purpose |
|:-:|:--|:--|
| 1 | Inputs and *Whole design* header | Choose the starting point, the system, intake, cut-off, and the sliders |
| 2 | Layout in plan: the advance front, shaded by the depth already infiltrated | Plan view of the field with the front |
| 3 | Longitudinal section: water running over your soil and soaking in | Side view with Z$_0$, Z$_L$, Z$_n$ |
| 4 | Hydrograph: inflow, infiltration and runoff through time | Flow partition with time |
| 5 | Cross-section at the inlet: the wetted bulb in your soil, and the intake curve | Intake curve $Z(\tau)$ and the soil behind it |
| 6 | Advance and opportunity time | $t_x(x)$ and $\tau(x)$ |
| 7 | Infiltrated depth along the field against the required depth $Z_n$ | $Z(x)$ against $Z_n$ |
| 8 | Performance indices and the water balance of one irrigation | $E_a$, $E_s$, DP, RO, CU, volumes |
| 9 | Design table | Iterations towards $E_a\ge85\,\%$ |
| 10 | What the efficiency is most sensitive to | Tornado chart |
| 11 | What this means for the season and the farm | Season, sets, hours |
| 12 | Irrigation schedule and *Intervals, efficiency and the advice in short* | Dates, gaps, "When to irrigate" |

![Surface irrigation design: the inputs (top) and the layout in plan. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/00_sid_draw.jpg){width=70%}

## Inputs, step by step

1. Open *Irrigation design ▸ Surface irrigation design*. The header states the soil, crop, root-zone depth, trigger depletion and date (e.g. *"Coarse Loam · Cereal/Oilseed · root zone 94 cm · trigger at 38 % depleted · 18 Oct 2026"*). The green *DSS* badge lists what is taken from the simulation; the *DESIGN* badge what the design chooses.
2. **Start from** one of five rows:

| Chip | Meaning |
|:--|:--|
| **Your soil** | Intake, required depth, cut-off and best inflow are all derived from your soil (default). |
| **A7 border** | Lecture worked example: border, $L=200$ m, $S=0.20$ %, $q=2.5$ L s$^{-1}$ m$^{-1}$, $n=0.15$, $k=2$ mm min$^{-A}$, $A=0.8$, $Z_n=90$ mm, given advance $t_L=120$ min, cut-off 170 min. |
| **A9 furrow** | Furrow, $L=226$ m, $S=0.30$ %, $q=2.0$ L s$^{-1}$, $n=0.04$, $w=0.7$ m, $k=4$, $A=0.7$, $Z_n=80$ mm, $\sigma_z=0.83$. |
| **A11 border** | Border, $L=240$ m, $S=0.20$ %, $q=1.667$, $n=0.15$, $k=7$, $A=0.5$, $Z_n=80$ mm, advance from field data $t_x = x^{1.35}q^{-1.5}/300$ (a power law, Eq. 11.12), cut-off at 85 % of $L$. |
| **D1 design** | Furrow, $L=240$ m, $S=0.30$ %, $q=1.667$, $n=0.04$, $w=1$ m, $k=2$, $A=0.7$, $Z_n=80$ mm, approximate advance (Eq. 11.13), $\sigma_z=0.8154$. |

The four worked examples reproduce the course exercises so that the program can be checked against hand calculation; choosing one switches the intake to *Type k and A*.

3. **System**: *Border strip*, *Furrow* or *Basin*. This resets $L$, $S$, $q$, $n$ to the system defaults of Table 11.1.
4. **Intake**: *From my soil* (Green–Ampt from the soil's texture, fitted to Kostiakov, Section 11.2) or *Type k and A* (your own Kostiakov constants).
5. **Cutoff**: *Es = 1* (cut off when the tail has just received $Z_n$), *85 % of L* (cut off when the front reaches 85 % of the length plus the storage time), *Manual* (set the time), and the toggle *Exact curve* (draw the exact Kostiakov $Z(x)$ instead of the straight-line profile of the lecture notes).
6. Move the sliders (Table 11.1). Everything below redraws live.

Table 11.1. Surface-design sliders: ranges (min, max, step) and system defaults.

| Control | Border | Furrow | Basin | Notes |
|:--|:--|:--|:--|:--|
| Field length $L$ (m) | 50–400, 5 (default 150) | 60–400, 5 (180) | 20–200, 5 (80) | |
| Slope $S$ (%) | 0.02–1, 0.01 (0.20) | 0.05–1.5, 0.01 (0.30) | 0.02–0.2, 0.01 (0.05) | |
| Inflow $q$ (L s$^{-1}$) | 0.2–20 per m width, 0.05 (6) | 0.2–4 per furrow, 0.05 (1.2) | 5–60 per m width, 0.5 (25) | In *Your soil* mode $q$ is set automatically (Section 11.9) until you move it |
| Manning $n$ | 0.02–0.25, 0.005 (0.15) | (0.04) | (0.15) | |
| Furrow spacing $w$ (m) | — | 0.5–1.5, 0.05 (0.75 in *Your soil*) | — | $w=1$ m is used for border and basin (a strip 1 m wide is analysed) |
| Cutback after the front arrives | 0.2–1.0, 0.05 (1 = none) | same | same | Fraction of $q$ after $t_L$ |
| Required depth $Z_n$ (mm) | 20–150, 1 | same | same | Default *from the DSS* (Eq. 5.27); tap the label to reset |
| Farm supply $Q_s$ (L s$^{-1}$) | 5–120, 1 (30) | same | same | Farm-level flow |
| Field width $W_f$ (m) | 30–400, 5 (120) | same | same | |
| Organic matter (%) | 0.5–5, 0.1 (1.5) | same | same | Enters Saxton–Rawls |
| Kostiakov $k$ (mm min$^{-A}$) | 0.2–10, 0.05 | same | same | Visible in *Type k and A* mode |
| Kostiakov $A$ | 0.2–0.95, 0.01 | same | same | Visible in *Type k and A* mode |

## Intake from your soil (Saxton–Rawls $\to$ Green–Ampt $\to$ Kostiakov)

**Step 1: soil water properties (Saxton and Rawls, 2006).** With sand fraction $S$, clay fraction $C$ (both 0–1) and organic matter $\mathrm{OM}$ (%), the 1500-kPa and 33-kPa water contents are

$$
\begin{aligned}
\theta_{1500,t} &= -0.024\,S + 0.487\,C + 0.006\,\mathrm{OM} + 0.005\,S\,\mathrm{OM} - 0.013\,C\,\mathrm{OM} + 0.068\,S\,C + 0.031,\\
\theta_{1500} &= \theta_{1500,t} + \bigl(0.14\,\theta_{1500,t} - 0.02\bigr),\\
\theta_{33,t} &= -0.251\,S + 0.195\,C + 0.011\,\mathrm{OM} + 0.006\,S\,\mathrm{OM} - 0.027\,C\,\mathrm{OM} + 0.452\,S\,C + 0.299,\\
\theta_{33} &= \theta_{33,t} + \bigl(1.283\,\theta_{33,t}^{2} - 0.374\,\theta_{33,t} - 0.015\bigr),
\end{aligned}
\tag{11.1}
$$

*Provenance (Eq. 11.1):* **[Literature]**: Saxton and Rawls (2006), implemented as written.

and saturation and saturated conductivity (mm h$^{-1}$) follow from

$$
\begin{aligned}
\theta_{(S-33),t} &= 0.278\,S + 0.034\,C + 0.022\,\mathrm{OM} - 0.018\,S\,\mathrm{OM} - 0.027\,C\,\mathrm{OM} - 0.584\,S\,C + 0.078,\\
\theta_{(S-33)} &= \theta_{(S-33),t} + \bigl(0.636\,\theta_{(S-33),t} - 0.107\bigr),\qquad
\theta_{s} = \theta_{33} + \theta_{(S-33)} - 0.097\,S + 0.043,\\
B &= \frac{\ln 1500 - \ln 33}{\ln\theta_{33} - \ln\theta_{1500}},\qquad \lambda = \frac1B,\qquad
K_s = 1930\,(\theta_s - \theta_{33})^{\,3-\lambda}.
\end{aligned}
\tag{11.2}
$$

*Provenance (Eq. 11.2):* **[Literature]**: Saxton and Rawls (2006), implemented as written.

These are the published pedotransfer equations of Saxton and Rawls (2006), implemented as written (field capacity $\theta_{fc}=\theta_{33}$, wilting point $\theta_{wp}=\theta_{1500}$). They are regressions on a large US soil database and carry its scatter; the layer uses them for design, not for prediction at a particular site.

**Step 2: wetting-front suction.** The effective suction at the wetting front (mm) is taken from the van Genuchten pair $(\alpha, n)$ of Table 5.3, $m=1-1/n$,

$$
\psi_f = \frac{10}{\alpha}\,\frac{0.046\,m + 2.07\,m^{2} + 19.5\,m^{3}}{1 + 4.7\,m + 16\,m^{2}}.
\tag{11.3}
$$

*Provenance (Eq. 11.3):* **[Engineered]**: rational-polynomial approximation of a Rawls-type suction.

This is a rational-polynomial fit of the Rawls-type wetting-front suction as a function of $m$; it is an **[Engineered]** approximation (the code comment calls it the "Lisle/Rawls form") and should be read as giving the right order of magnitude (tens of mm for loams, e.g. 16 mm for the Coarse Loam), not a measured $\psi_f$.

**Step 3: available storage in the wetting zone.** The soil starts at the trigger depletion $f_T$ and is wetted to 95 % of saturation,

$$
\theta_0 = \theta_{fc} - f_T\,(\theta_{fc} - \theta_{wp}),\qquad
\Delta\theta = \max\{0.05,\ 0.95\,\theta_s - \theta_0\}.
\tag{11.4}
$$

*Provenance (Eq. 11.4):* **[Engineered]**: initial and wetted water contents chosen for the workbench.

**Step 4: Green–Ampt infiltration** (Green and Ampt, 1911). Cumulative infiltration $F(t)$ (mm) solves

$$
F - \psi_f\,\Delta\theta\,\ln\!\Bigl(1 + \frac{F}{\psi_f\,\Delta\theta}\Bigr) = K_s\,\frac{t}{60}\quad(t\ \text{in min}),
\tag{11.5}
$$

*Provenance (Eq. 11.5):* **[Literature]**: Green and Ampt (1911).

by Newton iteration from the start value $\max\{K_s t/60,\ \sqrt{2\psi_f\Delta\theta K_s t/60}\}$.

**Step 5: Kostiakov fit** (Kostiakov, 1932). The design uses the two-parameter empirical intake law

$$
Z(\tau) = k\,\tau^{A}\qquad (Z\ \text{in m},\ \tau\ \text{in min}),
\tag{11.6}
$$

*Provenance (Eq. 11.6):* **[Literature]**: Kostiakov (1932).

and $k$, $A$ are found by least squares on the log–log plot of $F(\tau)/1000$ at 25 times spaced geometrically between 10 and 600 min:

$$
A = \frac{\sum (x_i - \bar x)(y_i - \bar y)}{\sum (x_i - \bar x)^2},\quad
\ln k = \bar y - A\,\bar x,\qquad x_i=\ln\tau_i,\ y_i=\ln\bigl(F(\tau_i)/1000\bigr),
\tag{11.7}
$$

*Provenance (Eq. 11.7):* **[Literature]**: ordinary least squares on the log--log plot.

with coefficient of determination $R^2=\bigl(\sum(x-\bar x)(y-\bar y)\bigr)^2\big/\bigl(\sum(x-\bar x)^2\sum(y-\bar y)^2\bigr)$, shown on the layer (e.g. *"Ks 13.1 mm/h · ψf 16 mm · Δθ 0.20 · fit R² 0.997"*). This conversion of a physically based law to a power law is what the lecture method requires; it is an approximation whose quality is reported by $R^2$.

**Step 6: required depth.** The net depth to refill the root zone is Eq. (5.27): $Z_n = \mathrm{clip}(f_T\,\mathrm{AWC}\,R_{\max};\,25,\,150)$ mm unless you move the slider.

## Inlet flow area (Manning)

The flow cross-section at the inlet, $A_0$ (m$^2$), is obtained from Manning's equation (Manning, 1891), in SI units,

$$
Q = \frac{1}{n}\,A\,R_h^{2/3}\,S^{1/2},\qquad R_h=\frac{A}{P}.
\tag{11.8}
$$

*Provenance (Eq. 11.8):* **[Literature]**: Manning (1891).

* **Furrow.** A V-shaped section with side slope $z=1$ (H:V), depth limit $D=0.25$ m: $A=z y^{2}$, $P=2y\sqrt{1+z^{2}}$. Eq. (11.8) is solved for the flow depth $y$ by 60 bisection steps for $Q=q$ (m$^3$ s$^{-1}$) and the slope $S$ (with $S\ge10^{-4}$); $A_0 = zy^2$. If $y>D$ the layer warns that the furrow overtops.
* **Border and basin.** A wide sheet: $A\approx y$ per unit width, $R_h \approx y$, so $y_0 = \bigl(q\,n/\sqrt S\bigr)^{0.6}$ with $q$ in m$^2$ s$^{-1}$, and $A_0 = y_0$ (m$^2$ per m width).
* **D1 preset.** $A_0=\bigl(q^2 n^2/792\bigr)^{0.37313}$ with $q$ in m$^3$ min$^{-1}$, the empirical furrow relation of the lecture's worked example. **[Engineered, course-specific]**

## Advance (volume balance)

**Definition.** For an inflow $Q$ (m$^3$ min$^{-1}$ per analysed width) the position $x(t)$ of the front is obtained from a volume balance of the water on the surface and in the soil (Walker and Skogerboe, 1987; Elliott and Walker, 1982):

$$
Q\,t = \sigma_y\,A_0\,x + \sigma_z\,k\,t^{A}\,w\,x
\ \Longrightarrow\ x(t) = \frac{Q\,t}{\sigma_y A_0 + \sigma_z\,k\,t^{A}\,w}.
\tag{11.9}
$$

*Provenance (Eq. 11.9):* **[Literature]**: volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3).

The code also accepts an optional steady-intake term, $Z=k\tau^{A}+f_0\tau$ (Kostiakov–Lewis), in which Eq. (11.9) gains the term $f_0\,t\,w/(1+r)$ in the denominator; the interface does not expose $f_0$ (it is zero), and it exists so that the FAO Irrigation Paper 45 examples, which use it, can be reproduced. Here $\sigma_y=0.8$ is the surface-storage shape factor, $w$ the width analysed (furrow spacing, or 1 m for borders and basins), and $\sigma_z$ the subsurface-storage shape factor

$$
\sigma_z = \frac{A + r\,(1 - A) + 1}{(1 + A)(1 + r)},
\tag{11.10}
$$

*Provenance (Eq. 11.10):* **[Literature]**: volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3).

where $r$ is the exponent of the power-law advance $x = p\,t^{r}$, found by iterating (10 times, starting from $\sigma_z=0.8$) from the times $t_L$ and $t_{L/2}$ at which the front reaches $L$ and $L/2$,

$$
r = \frac{\ln 2}{\ln (t_L / t_{L/2})},
\tag{11.11}
$$

*Provenance (Eq. 11.11):* **[Literature]**: volume balance of Walker and Skogerboe (1987) and Elliott and Walker (1982); tested against FAO-45 examples (Paper 3).

with each time found by bisection on Eq. (11.9). Eq. (11.10) is the standard shape factor of the volume-balance method for the Kostiakov intake law (Elliott and Walker, 1982). The advance time to position $x$ is then $t_x(x)=x^{-1}(t)$, solved on a 300-point grid.

**Alternatives** (set by the worked examples; the first two are Eq. 11.12):

* *Given advance:* $t_x(x)=t_L\,(x/L)^{1/r}$ with $r=0.55$ unless set (A7).
* *Field advance* (A11): $t_x(x) = c\,q^{-q_e}\,x^{x_e}$ with $c=1/300$, $q_e=1.5$, $x_e=1.35$.

$$
t_x(x)=t_L\Bigl(\frac{x}{L}\Bigr)^{1/r}\quad\text{(given advance)},\qquad t_x(x)=c\,q^{-q_e}\,x^{x_e}\quad\text{(field advance)}.
\tag{11.12}
$$

*Provenance (Eq. 11.12):* **[Engineered]**: alternative advance models set by worked examples and course notes.
* *Approximate* (D1, lecture formula):

$$
t_L = (1 + 0.15\,A)\,\frac{A_0 L}{Q} + \Bigl(\frac{\sigma_F\,k\,w\,L}{Q}\Bigr)^{\frac{1}{1-A}},\qquad
\sigma_F = \frac{\pi A (1 - A)}{\sin(\pi A)},\qquad t_x(x) = t_{V}(x)\,\frac{t_L}{t_{V}(L)},
\tag{11.13}
$$

*Provenance (Eq. 11.13):* **[Engineered]**: alternative advance models set by worked examples and course notes.

with $t_V$ the volume-balance solution of Eq. (11.9). **[Engineered]**: this is the closed-form approximation of the course notes, not a published general law.


## Cut-off, opportunity time and the infiltrated depth

The **time to infiltrate the required depth** follows from inverting Eq. (11.6),

$$
t_{st} = \Bigl(\frac{Z_n}{k}\Bigr)^{1/A}.
\tag{11.15}
$$

*Provenance (Eq. 11.15):* **[Literature]**: inversion of the Kostiakov law.

The **cut-off time** $t_{co}$ is

$$
t_{co} = \begin{cases}
t_L + t_{st} & \text{“}E_s=1\text{”: the tail receives exactly } Z_n\\
t_x(0.85\,L) + t_{st} & \text{“85 \% of L”}\\
t_{co}^{\,\mathrm{set}} & \text{“Manual”}
\end{cases}
\tag{11.16}
$$

*Provenance (Eq. 11.16):* **[Engineered]**: cut-off rules chosen as design options.

The **opportunity time** at distance $x$ is the time the water stays on the soil, $\tau(x) = t_{co} - t_x(x)$ for $t_{co}>t_x$, and the **infiltrated depth** is

$$
Z(x) = k\,\bigl[t_{co} - t_x(x)\bigr]^{A},\quad Z_0 = k\,t_{co}^{A}\ (\text{inlet}),\qquad Z_L = k\,(t_{co}-t_L)^{A}\ (\text{tail}).
\tag{11.17}
$$

*Provenance (Eq. 11.17):* **[Literature]**: standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997).

The *straight-line profile* of the lecture notes replaces $Z(x)$ by the line between $Z_0$ and $Z_L$ (and, for the 85 %-of-$L$ rule, a broken line through $(0.85L,\,Z_n)$); *Exact curve* draws Eq. (11.17). If $t_{co}<t_L$ the front never reaches the end of the field and the layer shows a warning (*the stream does not reach the end*).

## Volumes, efficiencies and uniformity

With $w$ the analysed width, $N=300$ grid intervals (90 while dragging) and the trapezoidal rule, for $Z_i = Z(x_i)$:

$$
\begin{aligned}
V_{\mathrm{app}} &= Q\,t_{co}\quad\bigl(\text{with cutback } c_b<1:\ Q\,t_L + c_b\,Q\,(t_{co}-t_L)\bigr), & V_{\mathrm{req}} &= Z_n\,L\,w,\\
V_{\mathrm{inf}} &= w\!\int_0^L Z\,dx, & V_{\mathrm{st}} &= w\!\int_0^L \min(Z, Z_n)\,dx,\\
V_{\mathrm{dp}} &= w\!\int_0^L \max(Z-Z_n,0)\,dx, & V_{\mathrm{df}} &= w\!\int_0^L \max(Z_n - Z,0)\,dx,\\
V_{\mathrm{ro}} &= \max(V_{\mathrm{app}} - V_{\mathrm{inf}},\ 0).
\end{aligned}
\tag{11.18}
$$

*Provenance (Eq. 11.18):* **[Literature]**: standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997).

The performance indices (Walker and Skogerboe, 1987; Burt et al., 1997) are

$$
E_a = \frac{V_{\mathrm{st}}}{V_{\mathrm{app}}},\quad
E_s = \frac{V_{\mathrm{st}}}{V_{\mathrm{req}}},\quad
\mathrm{DP} = \frac{V_{\mathrm{dp}}}{V_{\mathrm{app}}},\quad
\mathrm{RO} = \frac{V_{\mathrm{ro}}}{V_{\mathrm{app}}},\quad
\mathrm{CU} = 100\Bigl(1 - \frac{\tfrac{1}{N+1}\sum_{i=0}^{N}|Z_i-\bar Z|}{\bar Z}\Bigr)\ \%.
\tag{11.19}
$$

*Provenance (Eq. 11.19):* **[Literature]**: standard opportunity-time and performance-index definitions (Walker and Skogerboe, 1987; Burt et al., 1997).

$E_a$ is the **application efficiency**, $E_s$ the **storage (requirement) efficiency**, and CU the uniformity coefficient of Christiansen (1942) evaluated on the infiltrated depths. Because $V_{\mathrm{app}} = V_{\mathrm{inf}}+V_{\mathrm{ro}}$ and $V_{\mathrm{inf}}=V_{\mathrm{st}}+V_{\mathrm{dp}}$, the three fractions satisfy $E_a+\mathrm{DP}+\mathrm{RO}=1$, which the layer prints as the closed water balance of one irrigation. The deficit $V_{\mathrm{df}}$ is the missing part of $Z_n$. The distance at which $Z$ crosses $Z_n$, if it does, is $X = L\,(Z_0-Z_n)/(Z_0-Z_L)$.

![Surface design: longitudinal section with $Z_0$, $Z_L$, $Z_n$ and the water balance of one irrigation. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/02_sid_longitudinal_section_draw.jpg){width=70%}

## Hydrograph

The hydrograph (Section 4 of the layer) divides the inflow $q$ into infiltration $I(t)$, runoff $R(t)$ and surface storage. It is built from the same advance and intake:

$$
V_c(t) = w\sum_i k\,\bigl[\min(t,t_{co}) - \bar t_{x,i}\bigr]_{+}^{A}\,\Delta x\ \cdot s_c,\qquad
s_c = \frac{V_{\mathrm{inf}}}{V_c(t_{co})},\qquad I(t)=\frac{dV_c}{dt},
\tag{11.20}
$$

*Provenance (Eq. 11.20):* **[Engineered]**: hydrograph shapes chosen for drawing; volume conserving.

where $\bar t_{x,i}$ is the advance time at the mid-point of interval $i$ and the factor $s_c$ makes the cumulative infiltration at cut-off equal to $V_{\mathrm{inf}}$ of Eq. (11.18). While $t_L \le t\le t_{co}$ the runoff is $R(t)=\max\{0,\,q-I(t)\}$. After cut-off the surface water *recedes*: with $V_s=\max\{0,\ V_{\mathrm{app}}-V_{\mathrm{inf}}-\int R\,dt\}$ left on the surface, a triangular recession over $t_r=\max\{4,\ \min(0.3\,t_{co},\ 0.25\max(t_L,10))\}$ min drains it at the tail,

$$
R(t) = \frac{2V_s}{t_r}\Bigl(1 - \frac{t - t_{co}}{t_r}\Bigr),\quad t_{co}<t<t_{co}+t_r.
\tag{11.21}
$$

*Provenance (Eq. 11.21):* **[Engineered]**: hydrograph shapes chosen for drawing; volume conserving.

The recession shape is **[Engineered]** (the course does not specify it); it conserves the volume $V_s$. Surface storage at time $t$ is $V_{\mathrm{sto}}(t) = q\min(t,t_{co}) - V_c(t)-\int_0^t R\,dt'$.

## Cross-section and intake curve

The *Cross-section at the inlet* section draws, at the inlet, the wetted shape in a soil section generated from the soil's texture, and the intake curve $Z(\tau)$ of Eq. (11.6) beside the Green–Ampt curve $F(\tau)$ of Eq. (11.5), so that the fit can be inspected by eye.

## Best inflow ("Your soil" mode)

In *Your soil* mode, $q$ is chosen automatically from 25 equally spaced values between $q_{\min}$ and $q_{\max}$ of the system as the one that maximises $E_a\,E_s$. For furrows the upper limit is the non-erosive stream

$$
q_{\max} = \min\Bigl\{q_{\max}^{\mathrm{sys}},\ \frac{0.04}{S}\cdot\frac{1000}{60}\Bigr\}\ \mathrm{L\,s^{-1}}\quad(S\ \text{in \%}),
\tag{11.22}
$$

*Provenance (Eq. 11.22):* **[Engineered]**: search limit; the furrow stream limit follows Criddle et al. (1956).

about $0.67/S$ L s$^{-1}$, in line with the classical Criddle et al. (1956) limit $Q_{\max}\approx0.63/S$. The choice is stored in the slider, which becomes manual as soon as you move it.

## The design table

The *Design table* automates one step at a time towards a good design. The **target** is $E_a\ge85\,\%$ with $E_s\ge80\,\%$ (the root zone stays at least 80 % refilled). The score of a design is

$$
\mathrm{score} = \min(E_a,1) - 3\max(0,\,0.8 - E_s) - 3\,[c_b<1]\,\max(0,\,0.05 - \mathrm{RO}) - 5\max(0,\,E_a-1).
\tag{11.23}
$$

*Provenance (Eq. 11.23):* **[Engineered]**: optimisation score and seasonal bookkeeping chosen for the workbench.

The search tries, in this order, ten single-variable moves — **cut-off, inflow, cutback, length, cut-off, cutback, inflow, length, cut-off, cutback** — and, for each move, evaluates a candidate list and keeps the best candidate **only if the score improves by more than 0.003**:

| Move | Candidates |
|:--|:--|
| Cut-off | $t_{co}\times\{0.5,0.58,0.66,0.74,0.8,0.85,0.9,0.95,1,1.05,1.1,1.2\}$ |
| Inflow | 12 values spaced geometrically from $q_{\min}$ to $q_{\max}$ |
| Cutback | $c_b\in\{1,0.85,0.7,0.6,0.5,0.4,0.3,0.25,0.2\}$ |
| Length | 11 values spaced geometrically from $\max(L_{\min},30)$ to $\min(L_{\max},1.5L)$, rounded to 5 m |

For every candidate other than a pure cut-off move, six cut-off times are also tried ($0.62$ to $1.02$ times the "$E_s=1$" cut-off). The search stops when the target is met or after the ten moves. Each accepted row lists $q$, $L$, cutback, cut-off, $E_a$, $E_s$, DP and RO; **tap a row (green when it meets the target) to apply it** to the sliders. If the target cannot be reached the layer says so and suggests a shorter field, tailwater reuse, or drip or sprinklers. The same search is run by the toolbox item *Optimise surface layout (best design)*.

![Surface design table: iterations toward $E_a \ge 85\,\%$, then the tornado chart. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/08_sid_design_table_draw.jpg){width=70%}

## Sensitivity (tornado chart)

Each of seven inputs is moved up and down while the others are held, and the change in $E_a$ is drawn as a bar (green raises $E_a$, red lowers it):

| Input | Intake $k$ | Intake $A$ | Inflow $q$ | Length $L$ | Required depth $Z_n$ | Roughness $n$ | Slope $S$ |
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Perturbation | $\pm20$ % | $\pm10$ % | $\pm20$ % | $\pm20$ % | $\pm20$ % | $\pm30$ % | $\pm30$ % |

The bars are sorted by the larger absolute change, and the printed value is $\max(|\Delta E_a^{-}|,|\Delta E_a^{+}|)$ in percentage points (*pts*). The test is local: it is the change around the *present* layout, not a global importance.

## Season and farm

Using the irrigation record of Engine 2 for the year of the working date, with $\sum I$ the net irrigation of that year (mm):

$$
\begin{aligned}
n_{\mathrm{ev}} &= \sum I\,/\,Z_n, & Z_g &= \frac{V_{\mathrm{app}}}{L\,w}\times1000\ \ (\mathrm{mm}), & Z_{\mathrm{season}} &= n_{\mathrm{ev}}\,Z_g,\\
N_{0M} &= \frac{Q_s}{q}, & N_{\mathrm{units}} &= \frac{W_f}{w},\quad N_{\mathrm{sets}}=\max\Bigl(1,\frac{N_{\mathrm{units}}}{N_{0M}}\Bigr), & T_{\mathrm{tot}} &= \frac{N_{\mathrm{sets}}\,t_{co}}{60}\ \ (\mathrm h),
\end{aligned}
\tag{11.24}
$$

*Provenance (Eq. 11.24):* **[Engineered]**: optimisation score and seasonal bookkeeping chosen for the workbench.

and the seasonal pumping time is $n_{\mathrm{ev}}T_{\mathrm{tot}}$ hours. A depth of $Z_{\mathrm{season}}$ mm equals $10\,Z_{\mathrm{season}}$ m$^3$ per hectare. $N_{0M}$ is the number of furrows or strips that can run at once from the farm supply $Q_s$.

## Irrigation schedule and "When to irrigate"

The last two sections are common to all three design layers, so they are described once, here.

**Schedule table.** The next eight irrigation dates after the working date are listed from the DSS (Engine 2, Section 5.2): the sensor in layer $j_s$ reaching the trigger depletion $f_T$. For each date the table gives

| Column | Definition |
|:--|:--|
| # | order, soonest first |
| Date | calendar date of the analogue year (Chapter 4) |
| In | *today*, *tomorrow*, or *n days* |
| Net mm | the DSS irrigation depth that day, $I_k$ |
| Pumped mm | gross depth $I_k/E_a$ with the design's application efficiency (min. $E_a=0.05$) |
| Run time | time of one set or one round of the design |
| Gap to next | days to the following irrigation |

**Intervals.** Over the year of the working date, with irrigation days $d_1<d_2<\dots$ (irrigations above 0.5 mm), the gaps $g_j=d_{j+1}-d_j$ give the mean, the shortest and the longest interval.

**Advice message.** The message *When to irrigate* is generated from these numbers: the *next irrigation date* and its net and pumped depth; *"Then irrigate about every $\bar g$ days (between $g_{\min}$ and $g_{\max}$ days, shorter in hot weather and longer after rain)"*; the efficiencies of the design ($E_a$, $E_s$) and the time of one round; and the rule *"If a rain above 10 mm is forecast, delay the irrigation by a day or two"*. If no irrigation is triggered, it says to *keep the sensor at $z_s$ cm and irrigate when it reaches depletion $f_T$*.

![The irrigation schedule and the "When to irrigate" message at the end of the surface design. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/11_sid_irrigation_schedule_draw.jpg){width=70%}

**Reading it.** The first row is today's decision. If the *Gap to next* is short (2–4 days) the trigger is wet or the soil store is small; if it is long (10+ days) the soil store is large or the weather cool. Move the **Date** to see how the schedule changes with the season, and move the **Trigger** or **Sensor depth** to see the dates shift.
