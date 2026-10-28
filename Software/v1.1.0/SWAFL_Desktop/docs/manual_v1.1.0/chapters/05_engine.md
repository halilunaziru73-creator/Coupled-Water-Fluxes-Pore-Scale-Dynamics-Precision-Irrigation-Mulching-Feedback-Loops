# The two computing engines

Every number in SWAFL comes from one of two engines, which are tied together so that they agree on the twenty-year means.

* **Engine 1, the annual meta-model.** It reads 20-year-mean results of the 10,190 Daisy simulations and scales them for the controls. It produces the Dashboard "20-year averages" and every bar, line and arrow in the annual layers. **[Data-driven]**
* **Engine 2, the daily bucket model.** A 40-layer soil-water model run for twenty years of daily weather. It produces dates, depths, schedules, root growth, water flow arrows and the animated field. It is **calibrated** so that its mean irrigation equals Engine 1's, and its fluxes are **scaled** to Engine 1's annual means (Eq. 5.24). **[Engineered, with literature components]**

The design layers (Chapters 11 to 13) are a third, separate set of *closed-form hydraulic models*; they take their soil, crop, trigger and depth from Engines 1 and 2 (Section 5.3).

## Engine 1: the Daisy simulations and the meta-model

### The simulation campaign

The repository's study ran Daisy 7.1 (Abrahamsen and Hansen, 2000; University of Copenhagen), a one-dimensional soil, plant and atmosphere model that solves Richards' equation with van Genuchten and Mualem hydraulics, coupled to the WEPP dynamic structure model for the effect of tillage and consolidation on pore structure with time. Ten soils (USDA textures from sand to silty clay loam, Ap and Bt horizons) were simulated in **10,190 runs across 17 experiments (E0 to E16)**. The families that the workbench reads are:

| Experiment | Runs | Varied | Used for |
|:--|--:|:--|:--|
| E2 | 200 | Trigger suction | Trigger correction, Eq. (5.11) |
| E3 | 200 | Sensor depth | Sensor-depth correction, Eq. (5.11) |
| E4 | 100 | Method (overhead, surface, drip at three depths) | Method correction, Eq. (5.11) |
| E5 | 300 | Tillage $\times$ structural consolidation rate | Baseline $\mathbf b$, Eqs. (5.4) to (5.10) |
| E7 | 200 | Mulch vapour-flux factor $\times$ interception capacity | Soil evaporation $\bar E$, Eq. (5.4) |
| E11 | 1,000 | Temperature shift $\times$ evaporation factor $\times$ rain scale | Warming ratios, Eqs. (5.4) to (5.10) |
| E13 | 1,000 | Nitrogen rate $\times$ water strategy $\times$ soil | Nitrogen correction, Eq. (5.11) |
| E14 | 1,000 | Mulch factor $\times$ capacity $\times$ rain scale | Mulch ratios, Eqs. (5.4) to (5.10) |

(The other experiments are used by the repository figures and described in the repository README. The *Regime map* and *Fate of saved water* layers are computed from the E14 and E11 grids listed above.) 

$$
S_e(h) = \Bigl[\,1 + (\alpha |h|)^{n}\Bigr]^{-m},\quad m = 1 - \tfrac{1}{n}, \qquad
\theta(h) = \theta_r + (\theta_s - \theta_r)\,S_e(h)
\tag{5.1}
$$

*Provenance (Eq. 5.1):* **[Literature]**: van Genuchten (1980).

(van Genuchten, 1980), with relative hydraulic conductivity from the Mualem (1976) model,

$$
K_r(S_e) = S_e^{\,1/2}\Bigl[\,1 - \bigl(1 - S_e^{\,1/m}\bigr)^{m}\Bigr]^{2}.
\tag{5.2}
$$

*Provenance (Eq. 5.2):* **[Literature]**: Mualem (1976) with van Genuchten (1980).

Equation (5.2) is used in the Soil, plant and air layer (Section 7.2); Eq. (5.1) is used for all water-retention drawings. The parameters $(\alpha,n)$ used by the engine are *effective* values that pass through the four anchors of the project's trigger table; for the standard textures they match the Carsel and Parrish (1988) values (Table 5.3).

### Plant-available water and depletion

Depletion of plant-available water is defined between field capacity (suction 100 cm, pF 2.0) and wilting point (15,849 cm, pF 4.2):

$$
f(h) \;=\; \frac{S_e(100) - S_e(|h|)}{S_e(100) - S_e(15\,849)},
\qquad f_{\mathrm{used}} = \min\{1,\max\{0, f\}\}.
\tag{5.3}
$$

*Provenance (Eq. 5.3):* **[Literature]**: standard definition of plant-available water between field capacity and wilting point.

$f=0$ is field capacity and $f=1$ is wilting point; $f<0$ (wetter than field capacity) is kept as the *signed* value only in the Trigger law layer. The inverse $h(f)$ is found by bisection on $\log_{10}|h|\in[0, 4.6]$ (60 halvings).

Table 5.3. Effective van Genuchten parameters used by the engine, plant-available water, and the soil's critical suction at the soil-independent depletion $f^\ast = 0.45$.

| Soil | $\alpha$ (cm$^{-1}$) | $n$ | AWC (mm cm$^{-1}$) | $h^\ast$ at $f^\ast=0.45$ (cm) | $f$ at 300 cm |
|:--|--:|--:|--:|--:|--:|
| S01 Coarse Loam | 0.0961 | 1.353 | 1.5 | 387 | 0.380 |
| S02 Coarse Sand | 0.0536 | 1.600 | 0.5 | 262 | 0.496 |
| S03 Sand | 0.145 | 2.68 | 0.6 | 143 | 0.842 |
| S04 Loamy Sand | 0.124 | 2.28 | 0.9 | 160 | 0.756 |
| S05 Sandy Loam | 0.075 | 1.89 | 1.2 | 195 | 0.627 |
| S06 Loam | 0.036 | 1.56 | 1.7 | 284 | 0.468 |
| S07 Silt Loam | 0.020 | 1.41 | 2.0 | 401 | 0.367 |
| S08 Sandy Clay Loam | 0.059 | 1.48 | 1.4 | 311 | 0.439 |
| S09 Clay Loam | 0.019 | 1.31 | 1.6 | 503 | 0.314 |
| S10 Silty Clay Loam | 0.010 | 1.23 | 1.7 | 729 | 0.237 |

(AWC is "typical available water capacity by texture class" in mm of water per cm of soil; it is an engineered per-texture constant, not a measured value of the study soil.)

### The meta-model

Let $\mathbf b = (E_b, T_b, ET_b, I_b, Y_b, D_b, N_b)$ be the 20-year-mean Daisy results for the chosen soil, tillage and consolidation rate (run set E5), and $\mathbf b_{\mathrm{ref}}$ the same for conventional tillage at $\tau_c=0.005$ d$^{-1}$. Let $\varphi$ be the mulch strength, $c$ the mulch capacity, $\rho$ the rainfall scale and $\Delta T$ the warming. Define the mulch table lookups $M(\varphi,\rho)$ (E14 at capacity $c$) and warming table lookups $W(\Delta T,\rho)$ (E11); write

$$
\mathrm{now}=M(\varphi,\rho),\ \mathrm{ref}=M(\varphi,1),\ \mathrm{nm}=M(1,\rho),\ \mathrm{bare}=M(1,1),\quad
\mathrm{tN}=W(\Delta T,\rho),\ \mathrm{tB}=W(0,\rho),\ \mathrm{tR}=W(0,1).
$$

Then the engine computes (the ratio $[x/y]$ is 1 where $|y|<10^{-6}$):

$$
\begin{aligned}
E &= \bar E(\mathrm{soil},\varphi,c)\ \Bigl[\tfrac{\mathrm{now}.E}{\mathrm{ref}.E}\Bigr]\Bigl[\tfrac{\mathrm{tN}.E}{\mathrm{tB}.E}\Bigr]\Bigl[\tfrac{E_b}{E_{b,\mathrm{ref}}}\Bigr] &&(5.4)\\
T &= T_b\ \Bigl[\tfrac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.T}{\mathrm{tB}.T};\,0.3,\,2.5\Bigr) &&(5.5)\\
ET &= ET_b\ \Bigl[\tfrac{\mathrm{now}.ET}{\mathrm{bare}.ET}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.ET}{\mathrm{tB}.ET};\,0.5,\,2\Bigr) &&(5.6)\\
I &= I_b\ \Bigl[\tfrac{\mathrm{now}.I}{\mathrm{bare}.I}\Bigr]\ \mathrm{clip}\Bigl(\tfrac{\mathrm{tN}.I}{\mathrm{tB}.I};\,0.4,\,2.5\Bigr) &&(5.7)\\
Y &= Y_b\ \Bigl[\tfrac{\mathrm{tN}.Y}{\mathrm{tR}.Y}\Bigr]\Bigl[\tfrac{\mathrm{now}.Y}{\mathrm{nm}.Y}\Bigr] &&(5.8)\\
D &= D_b + (\mathrm{now}.D-\mathrm{bare}.D) + (\mathrm{tN}.D-\mathrm{tB}.D) &&(5.9)\\
N_L &= N_b + (\mathrm{now}.N-\mathrm{bare}.N) + (\mathrm{tN}.N-\mathrm{tB}.N) &&(5.10)
\end{aligned}
$$

*Provenance (Eq. 5.4--5.10):* **[Data-driven]**: ratios of Daisy ensemble results (run sets E2--E14); the clip bounds are engineered limits.

$\bar E(\mathrm{soil},\varphi,c)$ is the linear interpolation, in $\varphi$, of the soil's simulated soil evaporation (run set E7) at capacity $c$, closed at $\varphi=1$ by the bare-soil value. Fluxes are combined multiplicatively and drainage/leaching additively because ratios of small numbers (drainage near 0 mm) are unstable.

Four *set-specific corrections* then act in turn on the result. For each family $F\in\{$trigger (E2), sensor depth (E3), method (E4), nitrogen (E13, yield and $N_L$ only)$\}$ with current key $\kappa$ and baseline key $\kappa_0$ (trigger $-300$ cm; depth 20 cm; method Surface; nitrogen 100 %), with $r_\kappa$ the soil's row at $\kappa$ (nearest row if that exact run is absent):

$$
Q \leftarrow Q\ \mathrm{clip}\Bigl(\tfrac{r_\kappa.Q}{r_{\kappa_0}.Q};\,0.05,\,6\Bigr)\ \ (Q\in\{E,T,ET,I,Y\}),\qquad
D \leftarrow D + (r_\kappa.D - r_{\kappa_0}.D),\quad N_L \leftarrow N_L + (r_\kappa.N - r_{\kappa_0}.N).
\tag{5.11}
$$

*Provenance (Eq. 5.11):* **[Data-driven]**: set-specific corrections from the Daisy run sets; clip bounds engineered.

**Families whose reference run never irrigates (release 1.1).** In the sand and the loamy sand the sensor-triggered runs at the reference trigger ($-300$ cm at 20 cm, surface method) apply no irrigation at all: the coarse soil drains past the sensor before it dries to that suction. The ratio of Eq. (5.11) is then undefined, and version 1.0 returned 1, so that the trigger, the sensor depth and the method had no effect on the irrigation of these soils. Version 1.1 adds the simulated difference instead,

$$
I \leftarrow I + \sum_{F\in\{\mathrm{E2,E3,E4}\}} \max\bigl(0,\ r_\kappa.I - r_{\kappa_0}.I\bigr)\quad\text{when } r_{\kappa_0}.I < 1\ \mathrm{mm},\qquad \Delta S = P + I - ET - D,
\tag{5.12a}
$$

*Provenance (Eq. 5.12a):* **[Data-driven]**: differences of Daisy run sets E2--E4; the storage term closes the balance.

so that in the sand a trigger of $-50$ cm (122 mm more in the runs) gives 400 mm a year instead of 278 mm, $-75$ cm gives 317 mm and $-100$ cm 285 mm; drier triggers keep the reference amount, as in the runs.

Finally the model enforces non-negativity, a soil-dependent yield ceiling $Y\le Y_{\max}(\mathrm{soil})$ (the largest simulated yield), rain $P=P_{\mathrm{base}}\rho$, and **water-balance closure**:

$$
\begin{gathered}
ET \in [\,P + I - D - 30,\ P + I - D + 15\,]\ \text{(if not, } ET\ \text{is clipped and } E, T \text{ are scaled by the same factor)},\\
E_{\mathrm{other}} = \max(0,\ ET - T - E),\qquad \Delta S = P + I - ET - D,\qquad
\mathrm{IE} = \frac{100\,Y}{I}\ \ [\mathrm{kg\ m^{-3}}].
\end{gathered}
\tag{5.12}
$$

*Provenance (Eq. 5.12):* **[Engineered]**: closure constraint and bounds chosen for the workbench.

$E_{\mathrm{other}}$ is interception plus evaporation from the mulch layer, and $\Delta S$ collects the change in storage and small terms. IE converts Mg ha$^{-1}$ per mm of irrigation to kg of grain per m$^3$ of irrigation water ($1\ \mathrm{mm}=10\ \mathrm{m^3\,ha^{-1}}$).

**Crops.** The simulated crop is the cereal/oilseed rotation; its yield is shown in Mg ha$^{-1}$. The 48 crops of the library are transferred from it by the ratio of two FAO-56 daily soil-water balances, one for the library crop and one for the cereal reference, run on the same soil, weather and trigger (Section 21.4, Eqs. 21.5 to 21.9). Their yield is shown as the relative yield, in per cent of the potential.

### What "20-year average at these settings" means

Every Dashboard tile in the last block of the Results tab is the output of Eqs. (5.4) to (5.12) for the current controls. Every slider of Properties is an index into a list of simulated values, so no value ever lies between runs; but two controls changed together (for example, mulch and warming) use the product of ratios above, which assumes the effects are **independent**. The yield ceiling and the closure window (Eq. 5.12) stop independent effects from compounding beyond what the water and the crop allow.

## Engine 2: the daily bucket model

### Layout and state

The soil is $N=40$ layers of thickness $\Delta z = 2.5$ cm (100 cm total). Each layer holds water $w_i$ (mm) between 0 and the plant-available capacity $W_{\max}=\mathrm{AWC}\cdot\Delta z$. All layers start at $0.72\,W_{\max}$. Relative content $s_i = w_i/W_{\max}$ and depletion $f_i = 1-s_i$. The run is 20 years of 365 days (7,300 days). The sensor sits in layer $j_s=\mathrm{round}(z_s/\Delta z)$ for sensor depth $z_s$.

The trigger suction $|h_T|$ is converted to a depletion fraction $f_T = f_{\mathrm{used}}(|h_T|)$ by Eq. (5.3). The sensor condition "soil at suction $h_T$" therefore becomes the equivalent statement $f_{j_s} \ge f_T$.

### Crop calendar and canopy cover

The cereal crop follows the four-year rotation spring barley, winter barley, winter rape, winter wheat with sowing and harvest days (relative to 1 Jan of the year) $(100, 225)$, $(-90, 205)$, $(-125, 200)$, $(-80, 230)$; winter crops are sown in the previous autumn. Legume: sown day 110, harvested 215. Vegetable: sown day 100, harvested 185. Outside the window the field is *fallow*. Canopy cover $c(d)\in[0,1]$ is

$$
c_{\text{spring}}(d) = \frac{1}{1 + \exp\bigl(-(d - d_{\mathrm{mid}})/s\bigr)},\quad s = 13\ (\text{vegetable } 8),
\tag{5.13}
$$

*Provenance (Eq. 5.13):* **[Engineered]**: canopy curves, parameters chosen for the workbench; not a measured leaf-area record.

$$
c_{\text{winter}}(d) = \begin{cases}0.08 + 0.12\,\min\{1,(d-d_{\mathrm{sow}})/60\} & d < d_{\mathrm{pk}} - 90\\[2pt] 0.2 + \dfrac{0.8}{1 + \exp\bigl(-(d - d_{\mathrm{pk}} + 45)/12\bigr)} & \text{otherwise}\end{cases}
\tag{5.14}
$$

*Provenance (Eq. 5.14):* **[Engineered]**: canopy curves, parameters chosen for the workbench; not a measured leaf-area record.

and after the peak day $d_{\mathrm{pk}}$ cover declines linearly to zero at harvest: $c \leftarrow c\,\max\{0,\,1-(d-d_{\mathrm{pk}})/(d_{\mathrm{harv}}-d_{\mathrm{pk}})\}$. The mid day is $d_{\mathrm{sow}}+50$ (cereal), $d_{\mathrm{sow}}+40$ (legume), $d_{\mathrm{sow}}+28$ (vegetable); the peak is harvest $-50$ (cereal), sow $+65$ (legume), sow $+65$ (vegetable). These logistic curves are **[Engineered]**: they reproduce the shape of a canopy, not a measured leaf-area record.

### Rainfall generator

Rain falls on a day with probability 0.28. With $\mu_0=P/(0.28\cdot365)$ the mean wet-day depth of the scaled annual rain $P$, the depth on a wet day of simulated year $y$ is

$$
R = \min\bigl\{70,\ \mu_0\,\gamma_y\,(-\ln U)\bigr\},\qquad U\sim\mathrm{Uniform}(0,1),
\tag{5.15}
$$

*Provenance (Eq. 5.15):* **[Engineered]**: stochastic rain and interception generator; the exponential wet-day depth is a standard weather-generator form, the constants are chosen.

an exponential distribution capped at 70 mm, with the random sequence seeded by a hash of the soil name so every run is reproducible. The year factor $\gamma_y=\mathrm{clip}\bigl((m_{\mathrm{med}}/m_y)^{0.3};\,0.65,\,1.45\bigr)$ makes years wetter or drier according to the dryness $m_y$ of the study's 20-year rainfed suction record at 20 cm, where $m_y=10^{\overline{\log_{10}h}}$ is the geometric-mean suction over the 183-day growing season of year $y$, and $m_{\mathrm{med}}$ is the median over the 20 years. This is how the generated weather "follows the dryness of the real record".

The canopy and litter catch the first $I_c$ mm of every shower:

$$
I_c = \mu_0 \ln\!\frac{1}{r},\qquad r = \frac{\max\{40,\ P - P_{\mathrm{other}}\}}{P},
\qquad T_f = \max\{0,\,R - I_c\}.
\tag{5.16}
$$

*Provenance (Eq. 5.16):* **[Engineered]**: stochastic rain and interception generator; the exponential wet-day depth is a standard weather-generator form, the constants are chosen.

$P_{\mathrm{other}}$ is the interception-and-mulch loss from Eq. (5.12). Only throughfall $T_f>0.3$ mm enters the soil. The choice of $I_c$ makes the expected interception over the exponential rain distribution equal to the annual interception of Engine 1 (the expected value of $\min(R,I_c)$ for an exponential with mean $\mu_0$ is $\mu_0(1-e^{-I_c/\mu_0})$, and $e^{-I_c/\mu_0}=r$ gives $\mu_0(1-r)$ per wet day).

### Infiltration, redistribution and drainage

Water enters the top layer and cascades down: any layer exceeding $W_{\max}$ passes the excess to the layer below; the excess leaving layer 40 is **drainage** $D_d$. The depth of the deepest wetted layer is the **wetting front** (cm). Between layers a slow redistribution moves water toward the drier neighbour,

$$
q_{i} = 0.08\,(w_{i+1} - w_i),\qquad w_i \leftarrow w_i + q_i,\ \ w_{i+1}\leftarrow w_{i+1} - q_i,
\tag{5.17}
$$

*Provenance (Eq. 5.17):* **[Engineered]**: tipping-bucket redistribution with a chosen coefficient.

shown as *capillary rise* arrows when $q_i > 0.03\,W_{\max}$ upward. Drainage and the wetting front are therefore **tipping-bucket** results, not Richards solutions; that is why the engine scales them to Engine 1 (Eq. 5.24).

### Roots

The maximum rooting depth is

$$
R_{\max} = \mathrm{clip}\Bigl(R_{c}\,(0.85 + 0.3\,\mathrm{sand})\bigl[1 + 0.12\log_{10}(|h_T|/300)\bigr]\bigl[1 - 0.18\,\tfrac{N-100}{100}\bigr];\ 25,\ 100\Bigr)\ \mathrm{cm},
\tag{5.18}
$$

*Provenance (Eq. 5.18):* **[Engineered]**: rooting rules with constants chosen for the workbench.

with $R_c=95$ (cereal), $115$ (legume), $45$ (vegetable) cm, sand the sand fraction, and $N$ the nitrogen rate in percent. (Drier triggers push roots deeper; nitrogen-rich soils root slightly shallower.) While the canopy is growing, the rooting depth $R_d$ chases water:

$$
R_d \leftarrow \max\Bigl\{R_d,\ \min\bigl\{R_{\max}\,\mathrm{clip}\bigl(\tfrac{c-0.04}{0.96};0,1\bigr)^{0.8},\ R_{\max},\ R_d + 1.7\,(0.35 + \bar s_{\mathrm{wet}})\,\kappa\bigr\}\Bigr\},
\tag{5.19}
$$

*Provenance (Eq. 5.19):* **[Engineered]**: rooting rules with constants chosen for the workbench.

where $\bar s_{\mathrm{wet}}$ is the mean relative water content of the four layers beneath the root front, and $\kappa=1.3$ if the top six layers average below 0.35 (dry topsoil) and 1 otherwise. After harvest $R_d\leftarrow\max\{3,0.965R_d\}$; drought prunes the roots by 0.9 cm per day when the plant-available-water-weighted root fraction is below 0.12 and $R_d>8$ cm. Root density follows

$$
\rho_i \propto \exp\!\Bigl(-\frac{z_i}{\lambda R_d + 8}\Bigr)\bigl(0.45 + 0.9\,s_i\bigr)\Bigl[1 + 3\,e^{-((z_i - z_d)/12)^2}\Bigr]_{\text{drip only}},\quad z_i\le R_d,\qquad \sum_i \rho_i = 1,
\tag{5.20}
$$

*Provenance (Eq. 5.20):* **[Engineered]**: rooting rules with constants chosen for the workbench.

with $\lambda=0.32$ (cereal), $0.24$ (legume), $0.40$ (vegetable) and $z_d$ the drip emitter depth. The bracket is **[Engineered]**: it raises root density up to fourfold around a drip emitter. These root functions are the *modelled* roots drawn in the R1 layer, "not a scan of real ones".

### Transpiration, evaporation

Daily soil evaporation is the annual evaporation $E_{\mathrm{yr}}$ of Eq. (5.4) distributed over the year with a sinusoidal weight, reduced by canopy shade,

$$
E_d = E_{\mathrm{yr}}\,\frac{w(\mathrm{doy})}{\sum_{k=0}^{364} w(k)}\,(1 - 0.3\,c),\qquad w(\mathrm{doy}) = 0.35 + 0.65\cdot\tfrac12\Bigl[1 + \sin\tfrac{2\pi(\mathrm{doy} - 100)}{365}\Bigr],
\tag{5.21}
$$

*Provenance (Eq. 5.21):* **[Engineered]**: demand partitioning with chosen weights and a calibration factor.

and is taken from the top four layers with weights $(0.55, 0.25, 0.12, 0.08)$, never drawing a layer below $0.05\,W_{\max}$. Crop transpiration demand is the annual transpiration spread by cover, times a **calibration factor** $k_t$,

$$
T_d = k_t\,T_{\mathrm{yr}}\,\frac{c(d)}{\bar C},\qquad \bar C = \tfrac{1}{20}\sum_{\text{20 yr}} c,
\tag{5.22}
$$

*Provenance (Eq. 5.22):* **[Engineered]**: demand partitioning with chosen weights and a calibration factor.

and is divided among the layers by *availability-weighted* root density,

$$
q^{T}_i = T_d\,\frac{\rho_i\,a_i}{\sum_j \rho_j a_j},\qquad a_i = \mathrm{clip}\Bigl(\frac{s_i - 0.15}{0.6};\,0,\,1\Bigr),
\tag{5.23}
$$

*Provenance (Eq. 5.23):* **[Engineered]**: demand partitioning with chosen weights and a calibration factor.

limited so that no layer falls below $0.10\,W_{\max}$. The availability function $a_i$ is a linear stress function between 15 % and 75 % of plant-available water; it is **[Engineered]** in the spirit of the FAO-56 water-stress coefficient (Allen et al., 1998, Eq. 84), which is also linear in depletion.

### Irrigation rule and calibration

An irrigation of dose $d$ (mm) is applied on day $d$ if *all* of these hold: canopy cover $c>0.2$; $95\le \mathrm{doy}\le 250$; at least $m$ days since the last irrigation ($m=1$, or $m=\mathrm{clip}(\mathrm{round}(110\,d/\bar I);2,12)$ if $f_T<0.1$, to space irrigations when the trigger is almost at field capacity); the yearly total would stay within the budget $6\bar I$ (practically no cap); the sensor layer is dry enough, $1-s_{j_s}\ge f_T$; $f_T<0.995$; and, for drip, the layer at the emitter depth has depletion $\ge 0.12$. The dose is $d=\mathrm{clip}(\bar I/10;15,35)$ mm, and for drip $d_{\mathrm{eff}}=\max\{8,d/2\}$ delivered as small pulses *spread over $\pm 3$ layers around the emitter depth*; for other methods the dose enters at the surface. $\bar I$ is the annual irrigation of Eq. (5.7).

**Calibration of $k_t$.** The trigger decides *when* but the root-zone water use decides *how often*. To make the day-by-day model reproduce the annual irrigation of Engine 1, $k_t\in[0.6,8]$ is found by eight bisection steps on the first 8 years so that the mean irrigation per year $I_{\mathrm{sim}}$ matches $\bar I$ within 6 % (if the first guess $k_t=1$ is already within 6 %, it is kept); the result is then used for all 20 years.

### Scaling to the annual model

The daily results are multiplied by constants so that their 20-year means equal Engine 1:

$$
S_P = \frac{P}{\overline{P_{\mathrm{sim}}}},\quad
S_{\mathrm{thr}} = \frac{P - P_{\mathrm{other}}}{\overline{T_{f,\mathrm{sim}}}},\quad
S_E = \frac{E}{\overline{E_{\mathrm{sim}}}},\quad
S_T = \frac{T}{\overline{T_{\mathrm{sim}}}},\quad
S_D = \frac{D}{\overline{D_{\mathrm{sim}}}},
\tag{5.24}
$$

*Provenance (Eq. 5.24):* **[Data-driven]**: scaling of the daily series to the Engine 1 twenty-year means.

(each set to 1 if the simulated mean is below $10^{-6}$), and the daily fluxes displayed on the Dashboard are $R=P_d S_P$, $T_f=\min\{R,\,T_{f,d}S_{\mathrm{thr}}\}$, $E=E_dS_E$, $T=T_dS_T$, $D=D_dS_D$ and irrigation $I$ unscaled. The **storage change of the day** closes the balance:

$$
\Delta S_d = T_f + I - E - T - D.
\tag{5.25}
$$

*Provenance (Eq. 5.25):* **[Literature]**: water-balance identity.

### Evaporation under warming (used by the E1 layer)

For the Evaporation physics layer a separate atmosphere factor is used (Section 9.3):

$$
E_{0,\mathrm{bare}} = 4.2\,(1 + 0.07\,\Delta T)\,\frac{0.35 + 0.65\cdot\tfrac12[1 + \sin(2\pi(\mathrm{doy}-100)/365)]}{0.675}\,\mathrm{clip}\bigl(1 - 0.12(\rho-1);\,0.85,\,1.12\bigr)\sqrt{\gamma_y}\ \ \mathrm{mm\,d^{-1}},
\tag{5.26}
$$

*Provenance (Eq. 5.26):* **[Engineered]**: atmosphere factor with chosen constants.

where 4.2 mm d$^{-1}$ is the engine's season-mean bare-soil demand (the seasonal weight is divided by its mean, 0.675), the factor $1+0.07\Delta T$ is a 7 % per °C increase (close to the Clausius and Clapeyron rate of the saturation vapour pressure; **[Engineered]** parameter), the cloud factor reduces demand in wetter years, and $\sqrt{\gamma_y}$ links demand to the dryness of the year.

## The design layers and their link to the engines

The three design layers take from the engines:

| Quantity | Source | Used by |
|:--|:--|:--|
| Soil texture (sand, silt, clay %) | `DATA.texture` (measured for the 10 soils) | Saxton and Rawls intake (Section 11.2) |
| Trigger depletion $f_T$ | Eq. (5.3) at $h_T$ | Required depth $Z_n$ |
| Maximum rooting depth $R_{\max}$ | Eq. (5.18) | $Z_n$ |
| Plant-available water per cm AWC | Table 5.3 | $Z_n$ |
| Peak crop use $ET_{c}$ | engine's peak daily transpiration plus evaporation | Interval $T$ (drip, sprinkler) |
| Date and irrigation dates | Engine 2 | Irrigation schedule tables |
| Weather source, mulch, interception | Engine 1 and mulch capacity | sprinkler interception loss |

The default required depth is therefore

$$
Z_n = \mathrm{clip}\bigl(f_T\cdot \mathrm{AWC}\cdot R_{\max};\ 25,\ 150\bigr)\ \mathrm{mm}\qquad(\text{surface; drip and sprinkler use their own limits})
\tag{5.27}
$$

*Provenance (Eq. 5.27):* **[Literature]**: readily available water as in FAO-56 practice, with an engineered clip.

which is the net depth that refills the root zone from the trigger depletion back to field capacity ("*from the DSS*" on the screen). Typing a value overrides it (the label then reads *tap to reset*; click the label to return to the computed value).

## Reproducibility

All random numbers in the engine are generated by a deterministic generator seeded by the soil name (a 32-bit hash), so the same controls always give the same dates, depths and animations. There is no external data call; the engine file contains the simulation tables as JSON.
