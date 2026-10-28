# Mulch and evaporation layers

This group follows the water that mulch keeps in the soil: how mulch lowers evaporation (V4, V6), the physics of drying (E1), where the saved water goes (N2) and when evaporation or drainage dominates (N3).

## Mulch against bare soil

**What it shows.** Three soil blocks side by side: bare soil, the soil under *your* mulch, and under the strongest mulch (plastic film, $\varphi=0.1$), with bars for evaporation, irrigation and drainage, the six materials as buttons (click one to apply it), and a verdict.

![Mulch against bare soil. The numbered arrows are explained in the screenshot atlas (Chapter 25), under the same screen.](images/atlas11/v4_s0_p1.jpg){width=80%}

**How the numbers are generated.** All three blocks are Engine 1 evaluated at $\varphi = 1.0$ (bare), at your $\varphi$ and capacity, and at $\varphi=0.1$, at the current rainfall. With $E_\varphi$, $I_\varphi$, $D_\varphi$ from Eqs. (5.4), (5.7), (5.9),

$$
\Delta E = E_{1.0} - E_{\varphi},\qquad
\Delta I = I_{1.0} - I_{\varphi},\qquad
\Delta D = D_{\varphi} - D_{1.0},
\tag{9.1}
$$

*Provenance (Eq. 9.1):* **[Data-driven]**: differences and ratios of Daisy run-set E14 and E11 results.

are the evaporation saved, the irrigation saved and the extra drainage, in mm yr$^{-1}$, printed under the blocks. The verdict compares $\Delta I$ with $\Delta D$ ("*Wet conditions: much of the water the mulch saves now leaves as drainage*" or "*Dry to normal conditions: most of the water the mulch saves becomes less irrigation*"). The block of text for plastic film states that *"plastic film stops vapour almost completely but holds no water, so rain runs to the planting holes"*, which is the capacity of 0.5 mm in Table 3.1.

**Steps.** (1) Open *Mulch and evaporation ▸ Mulch against bare soil*. (2) Click a material. (3) Raise the **Rainfall scale** to $\times$1.3 and watch $\Delta D$ overtake $\Delta I$. (4) Move the **Strength** slider to see the evaporation saving grow convexly.

## Mulch control

**What it shows.** Two matrices. The first is **soil evaporation against mulch factor (ten rows, 0.1 to 1.0) by interception capacity (four columns, 0.5 to 4 mm)**. The second is **drainage against tillage system (three) by consolidation rate (five)**. Colour darkens with the value; a red outline marks your current setting. The text states what fraction of bare-soil evaporation your mulch removes and whether the soil responds to tillage.

**Generation.** Each cell of the first matrix is $E(\varphi, c)$ and each cell of the second $D(\mathrm{till},\tau_c)$, both from Engine 1 at the current soil, rainfall and temperature (Eqs. 5.4 and 5.9). The sentence "*No response here: this soil does not react to tillage or consolidation*" appears when the spread $\max D - \min D$ of the second matrix is below 0.5 mm yr$^{-1}$. The percentage in the text is $100\,(1 - E_{\varphi,c}/E_{1.0})$.

**Steps.** Click a cell to apply that mulch factor and capacity or that tillage and rate; the red outline moves; the Dashboard changes at once.

## Evaporation physics

**What it shows.** A modelled thin section of the topsoil drying after a wetting, with liquid water in the pores (blue), vapour moving up (white), the **drying front** (orange) and, for comparison, the bare-soil curve (grey). To the right: the evaporation rate $e(t)$ and cumulative loss $Q(t)$ for 24 days, split into **stage 1** (the surface stays wet, loss at the atmospheric rate) and **stage 2** (a dry layer grows, loss is limited by the soil).

![Evaporation physics layer. The numbered arrows are explained in the screenshot atlas (Chapter 25), under the same screen.](images/atlas11/e1_s0_p1.jpg){width=80%}

**Governing relations.** The loss is described by the classical two-stage model of soil drying (Philip, 1957; Ritchie, 1972): stage 1 at the atmospheric rate $e_0$, then stage 2 with a rate falling roughly as $t^{-1/2}$ (cumulative loss $\propto \sqrt t$). The implementation in the workbench is

$$
t_1 = \frac{Q_1 - q_0}{e_0},\qquad
e(t) = \begin{cases} e_0, & t \le t_1\\[3pt] \dfrac{e_0}{\sqrt{1 + (t - t_1)/\tau}}, & t > t_1\end{cases}
\tag{9.2}
$$

*Provenance (Eq. 9.2):* **[Engineered]**: two-stage evaporation of the type described by Ritchie (1972) and Philip, with parameters chosen for the workbench.

$$
Q(t) = q_0 + \begin{cases} e_0\,t, & t \le t_1\\[3pt] (Q_1 - q_0) + 2\,e_0\,\tau\Bigl(\sqrt{1 + (t - t_1)/\tau} - 1\Bigr), & t > t_1\end{cases}
\tag{9.3}
$$

*Provenance (Eq. 9.3):* **[Engineered]**: two-stage evaporation of the type described by Ritchie (1972) and Philip, with parameters chosen for the workbench.

(the rate is the time derivative of the cumulative loss, so the two are consistent), with the following parameters:

| Symbol | Definition | Value or formula |
|:--|:--|:--|
| $e_{0,b}$ | bare-soil atmospheric demand | Eq. (5.26) (mm d$^{-1}$) |
| $e_0$ | demand under mulch and canopy | $e_0 = e_{0,b}\,\varphi\,(1 - 0.4\,c)$ with canopy cover $c$ on the date |
| $Q_1$ | stage-1 storage (mm), water held in the top 40 mm between the wet and the surface-dry state | $Q_1 = \max\{2,\ [\theta(h_i) - \theta(h_s)]\,L_1\,(0.6 + 0.4\rho)\}$, $L_1 = 40$ mm |
| $h_i$, $h_s$ | initial and surface-dry suctions (cm) | $h_i = \dfrac{0.25}{\alpha}(1.5 - 0.5\rho)$; $h_s = 4/\alpha$ |
| $\tau$ | stage-2 time scale (d) | $\tau = 0.006 + 0.03\,(\mathrm{clay}+\mathrm{silt})/100$ |
| $q_0$ | loss already experienced when the water was placed below the surface (drip) | $q_0 = (1 - w_f)\,0.95\,Q_1$, $w_f = \mathrm{clip}(1 - z_d/50;\,0.05,\,1)$, $z_d$ the drip depth in cm; 0 for surface methods |
| $\Delta\theta$ | water lost across the dry layer | $\Delta\theta = \mathrm{clip}\bigl(\theta(h_i) - \theta(10^{4});\,0.05,\,0.4\bigr)$ |

$\theta(h)$ is Eq. (8.3) and $\alpha$ the van Genuchten parameter of Table 5.3; $\rho$ is the rainfall scale. **[Engineered]**, every constant in the table (0.25, 1.5, 0.5, 4, 40 mm, 0.6, 0.4, 0.006, 0.03, 0.95, 50 cm, 0.05 to 1) is a presentation parameter chosen so that stage 1 lasts a few days in a loam and stage 2 gives the characteristic $\sqrt t$ fall; they are **not** calibrated to a laboratory evaporation experiment and the drawing says so ("*the daily rates are a two-stage drying model scaled by your mulch factor*"). The simulated annual evaporation of the workbench (Eq. 5.4) is *Daisy*, not this curve.

**The drying front.** The depth of the dry layer after stage 1 is

$$
\ell(t) = \min\Bigl\{60,\ \frac{Q(t) - Q_1}{\Delta\theta}\Bigr\}\ \mathrm{mm}\quad (Q > Q_1),
\tag{9.4}
$$

*Provenance (Eq. 9.4):* **[Engineered]**: drying-front geometry chosen for drawing.

and the suction profile with depth $z$ is an exponential approach of $\log_{10}h$ with length $\lambda = L_1/3$:

$$
\log_{10}h(z) = \log_{10}h_s + \bigl(\log_{10}h_i - \log_{10}h_s\bigr)\bigl(1 - e^{-(z-\ell)/\lambda}\bigr)\quad (z \ge \ell),\qquad h = 10^{5}\ \mathrm{cm\ for}\ z<\ell.
\tag{9.5}
$$

*Provenance (Eq. 9.5):* **[Engineered]**: drying-front geometry chosen for drawing.

**Pore picture.** Which pores are water-filled at each depth is given by the capillary rule of Eq. (8.4) with the local suction of Eq. (9.5); vapour particles are released from the drying front and rise through air-filled pores. The picture is an **illustration of the mechanism**, not a pore-network simulation.

**Steps.** (1) Open *Evaporation physics* and press **Play** (24 days). (2) Raise the mulch (lower $\varphi$): the grey bare-soil curve stays, your curve lengthens stage 1. (3) Change the soil: stage 1 lasts longest in the sands (largest $Q_1$, about 3 days for the Sand at the season-mean demand) and is shortest in the silty clay loam (about 1 day), because the window between $h_i$ and $h_s$ scales with $1/\alpha$; in stage 2 the fine soils lose water more slowly (larger $\tau$). (4) Set a drip method: $q_0>0$ shortens stage 1 because the surface has less water to lose. (5) Hover over a pore to read its radius and the suction at which it empties.

## Fate of saved water

**What it shows.** For the soil and mulch you set (a preview of $\varphi=0.5$ is used if you have not set mulch), four curves against rainfall scale $\times0.5$ to $\times1.4$: evaporation saved, irrigation saved, extra drainage, extra transpiration. A shaded band marks the rainfall above which drainage exceeds the irrigation saved ("*drainage takes over near $\times1.2$*"). Below, a bar divides each mm of evaporation saved among less irrigation, more drainage, more transpiration and "storage and other".

**Generation.** For each rainfall $\rho$ in the ten-value list, with $\varphi^\ast$ the mulch factor,

$$
\begin{aligned}
\Delta E(\rho) &= E_{1.0}(\rho) - E_{\varphi^\ast}(\rho), & \Delta I(\rho) &= I_{1.0}(\rho) - I_{\varphi^\ast}(\rho),\\
\Delta D(\rho) &= D_{\varphi^\ast}(\rho) - D_{1.0}(\rho), & \Delta T(\rho) &= T_{\varphi^\ast}(\rho) - T_{1.0}(\rho),
\end{aligned}
\tag{9.6}
$$

*Provenance (Eq. 9.6):* **[Data-driven]**: differences and ratios of Daisy run-set E14 and E11 results.

all from Engine 1 at the current soil, tillage and temperature, and the partition at the current rainfall is

$$
f_I = \frac{\max\{\Delta I,0\}}{\max\{\Delta E,0.1\}},\ f_D = \frac{\max\{\Delta D,0\}}{\max\{\Delta E,0.1\}},\ f_T = \frac{\max\{\Delta T,0\}}{\max\{\Delta E,0.1\}},\ f_{\mathrm{rest}} = \max\{0,\ 1 - f_I - f_D - f_T\}.
\tag{9.7}
$$

*Provenance (Eq. 9.7):* **[Data-driven]**: differences and ratios of Daisy run-set E14 and E11 results.

The crossover rainfall is the first $\rho$ with $\Delta D \ge \Delta I$ and $\Delta D>1$ mm. The study reports about 60 % of the saved water going to reduced irrigation in dry years and about 63 % to extra drainage in wet years, with the crossover near $\rho \approx 1.2$ (repository README).

**Steps.** Choose a material; slide the **Rainfall scale**; the red dashed cursor and the bar move; read the three sentences at the bottom.

## Regime map

**What it shows.** A map of **mulch factor (rows) against rainfall scale (columns)** coloured by which loss dominates, together with soil columns in which vapour rises (grey) or droplets fall (blue), and a verdict for your settings.

![Regime map. The numbered arrows are explained in the screenshot atlas (Chapter 25), under the same screen.](images/atlas11/n3_s0_p1.jpg){width=80%}

**Generation.** For each cell the engine takes annual soil evaporation $E$ and drainage $D$ from Engine 1, and forms the **regime index**

$$
\mathcal{I} = \frac{E - D}{\max\{1,\ E + D\}},\qquad
\text{regime} = \begin{cases}
\text{evaporation-dominated} & \mathcal I > +0.05\\
\text{drainage-dominated} & \mathcal I < -0.05\\
\text{on the boundary} & |\mathcal I|\le 0.05
\end{cases}
\tag{9.8}
$$

*Provenance (Eq. 9.8):* **[Engineered]**: index defined for the workbench.

so $\mathcal I=+1$ is all evaporation and $-1$ all drainage. The statement "*Climate and mulch act non-additively … reaching 15 % of irrigation at combined extremes*" is a result of the study (the interaction of mulch and climate on irrigation); it is not recomputed by the layer.

**Steps.** Click a cell to apply that mulch factor and rainfall; the verdict says *"the main loss is evaporation (…), so mulch will pay off here"* or *"the main loss is drainage …, so mulch saves less"*.
