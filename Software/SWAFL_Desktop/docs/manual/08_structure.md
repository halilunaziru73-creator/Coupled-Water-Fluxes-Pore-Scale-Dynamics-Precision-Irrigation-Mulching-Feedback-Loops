# Soil structure and tillage layers

## Tillage and structure (V3)

### What it shows

A modelled thin section ("microscope") of the topsoil for the chosen soil and tillage, at three magnifications (10 mm, 2.5 mm, 0.6 mm), with pores filled by water or air according to a suction slider; the same place under the three tillage systems; the relative pore space against time; and the change in drainage and yield caused by tillage at your settings.

### Pore index and consolidation

After tillage the loosened topsoil re-settles. The workbench uses a first-order relaxation of the **relative pore space** $p$ (1 = freshly loosened) to a consolidated value $p_c = 0.30$,

$$
p(t) = p_c + (p_0 - p_c)\,e^{-\tau_c t},\qquad p_0 = 1.00\ (\text{conventional}),\ 0.72\ (\text{reduced}),
\tag{8.1}
$$

*Provenance (Eq. 8.1):* **[Engineered]**: exponential relaxation with chosen constants.

with $t$ in days since tillage and $\tau_c$ the **Structural consolidation rate** control (Table 3, 0.001–0.02 d$^{-1}$). **No-till** keeps a constant $p=0.42$ (undisturbed pores). The half-life of loose pores is $\ln 2/\tau_c$: 693 d at 0.001 d$^{-1}$, 35 d at 0.02 d$^{-1}$. **[Engineered]**: the exponential form is the standard first-order consolidation relation also used in structure sub-models such as WEPP's, on which Daisy's tillage effect is based, but $p_0$, $p_c$ and the no-till value are *presentation* constants for the drawing; the *hydrological effect* of tillage shown in the bars is read from the Daisy runs (E5), not from Eq. (8.1).

### How the section is generated

The section is a random packing of mineral grains and matrix drawn on a raster, with these parameters, all **[Engineered]**:

* Grain-size classes follow the soil's measured sand, silt and clay percentages (`DATA.texture`).
* **Saturated water content** $\theta_s = \phi$ and **residual content** $\theta_r$ are

$$
\phi = \mathrm{clip}\bigl(0.36 + 0.0016\,\mathrm{clay} + 0.0009\,\mathrm{silt};\ 0.34,\ 0.50\bigr),\qquad
\theta_r = 0.01 + 0.0006\,\mathrm{clay},
\tag{8.2}
$$

*Provenance (Eq. 8.2):* **[Engineered]**: porosity relation with chosen coefficients.

with clay and silt in percent, and the retention curve is the van Genuchten function of Eq. (5.1),

$$
\theta(h) = \theta_r + (\phi - \theta_r)\,S_e(h).
\tag{8.3}
$$

*Provenance (Eq. 8.3):* **[Literature]**: van Genuchten (1980).

* **Cracks and aggregates.** The number of cracks is $n_b=\mathrm{round}(2 + 6(1 - f_{\mathrm{till}}))$ with $f_{\mathrm{till}} = 1,\,0.7,\,0.4$ for conventional, reduced, no-till; the crack width (mm) is $0.3\,\max\{0,\,p - 0.3\}^{1.3}$.
* **Which pores hold water.** A pore of radius $r$ fills with water at suction $h$ if $r\le r_c(h)$, where the capillary radius follows the Young–Laplace (Jurin) law,

$$
r_c = \frac{2\,\sigma\cos\gamma}{\rho_w\, g\, h} \;\approx\; \frac{0.149\ \mathrm{cm^2}}{h}\quad(\mathrm{or}\ r_c[\mathrm{mm}] \approx 1.49/h[\mathrm{cm}]),
\tag{8.4}
$$

*Provenance (Eq. 8.4):* **[Literature]**: Young--Laplace (Jurin) capillary law.

with surface tension $\sigma = 0.0728$ N m$^{-1}$, contact angle $\gamma\approx0$ and $g=9.81$ m s$^{-2}$ (Jurin, 1718; Hillel, 1998). In the drawing a pore is water-filled when its local half-width is at most $r_c$ **or** when it is within a film thickness $\min\{1.6,\,0.9\,r_c/s + 0.3\}$ pixels of a grain, which draws the water films that survive drying.

* The hover probe states, for a pore, its radius, the suction at which it empties ($h = 1.49/r$) and the present suction.

### Controls and steps

1. Open *Soil structure and tillage ▸ Tillage and structure*. Press **Play** to run a year of consolidation (the day appears under the picture).
2. Drag the **suction slider** (pF 0–4.2) on the microscope: at low suction the pores are water-filled; as suction rises the large pores empty first.
3. Switch the view: *Natural* (minerals), *Particle sizes* (sand/silt/clay classes), *Water and air*.
4. Change **Tillage** or the **Structural consolidation rate** and watch the curves of $p(t)$ (Eq. 8.1) and the section change.
5. Read the bars *Change in drainage at the current settings* (conventional, reduced and no-till against no-till) and the yields. These come from the Daisy runs for the selected soil: $\Delta D_{\mathrm{conv}} = D_{\mathrm{conv}} - D_{\mathrm{notill}}$, $\Delta D_{\mathrm{red}} = D_{\mathrm{red}} - D_{\mathrm{notill}}$, at the current $\tau_c$.
6. The sentence at the end states whether the consolidation rate changes anything: *"In this soil the consolidation rate changes nothing; tillage is the driver"* or *"Here the consolidation rate matters as well as tillage"*.

![Tillage and structure layer: thin section, tillage comparison and the drainage consequences. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/full/v3_s0_p1.jpg){width=72%}

## Soil hydraulic drivers (V7)

### What it shows

The question *"What drives change in soil hydraulic properties?"* answered for all ten soils together: for each soil sorted by clay content, a blue bar for the **tillage effect** (conventional minus no-till) and an orange bar for the **consolidation effect** (fastest minus slowest rate) on annual drainage, then scatter plots against clay content, and the 1-m soil profiles of the three tillage systems.

![Soil hydraulic drivers. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/full/v7_s0_p1.jpg){width=72%}

### Generation

For each soil $s$ the Daisy run set E5 gives annual drainage $D_s(\text{tillage},\tau_c)$. The two bars are

$$
\Delta_{\mathrm{till}}(s) = D_s(\mathrm{conv},\tau^\ast) - D_s(\mathrm{notill},\tau^\ast),\qquad
\Delta_{\mathrm{cons}}(s) = D_s(\mathrm{till}^\ast,\tau_{\mathrm{fast}}) - D_s(\mathrm{till}^\ast,\tau_{\mathrm{slow}}),
\tag{8.5}
$$

*Provenance (Eq. 8.5):* **[Data-driven]**: differences of Daisy run-set E5 results.

with the current settings as starred values; bar length is proportional up to 16 mm yr$^{-1}$. The lines in the scatter plots are ordinary least-squares fits of each effect on clay content $c$,

$$
\hat\Delta = a + b\,c,\qquad b = \frac{\sum_s (c_s - \bar c)(\Delta_s - \bar\Delta)}{\sum_s (c_s - \bar c)^2},\quad a = \bar\Delta - b\,\bar c .
\tag{8.6}
$$

*Provenance (Eq. 8.6):* **[Data-driven]**: ordinary least squares applied to Daisy results.

The headline "Leading driver: tillage" or "consolidation rate" compares $\Delta_{\mathrm{till}}$ with $\Delta_{\mathrm{cons}}$ for the selected soil, and the percentage after each bar is $100\,\Delta/D_{\mathrm{now}}$, the share of the present drainage. The last line adds, for conventional against no-till at the current mulch and rain, the changes in irrigation, evaporation, yield and N leaching, obtained by running the meta-model (Eqs. 5.4–5.12) twice (conventional at $\tau$ index 2 and no-till) and subtracting.

The lower part of the layer draws, for the three tillage systems, a 48 cm wide, 1 m deep face of the selected soil. The upper 24 cm (the tilled layer) is generated with the pore index $p$ of Eq. (8.1) at day 120 (adjustable), clod and crack density from $f_{\mathrm{till}}$, and the wetness factor $\mathrm{clip}\bigl((p-0.30)/0.14;\,0.3,\,1.4\bigr)\cdot\mathrm{clip}(0.75 + 0.012\,\mathrm{clay};\,0.8,\,1.4)$; below it the subsoil is untouched by tillage. The drainage figures printed under each column are Daisy results (E5).

### Steps

1. Open the layer. Click any soil bar or any scatter point to select that soil.
2. Click a point on the *Drainage against consolidation rate* graph to apply a rate and a tillage system at once.
3. Read the verdict, and compare with the profile drawings.

## Root structure (R1)

### What it shows

**Rooting depth in all ten soils** at the same day and weather: for each soil a column with the deepest roots (20-year mean, brown dashed), and ticks at the depth that holds 50 % and 90 % of the water taken up (green ticks). Below it, a time view of rooting depth through the 20 years and the daily uptake, and a set of heat maps from the repository's **E15** runs: 1,000 Daisy runs on the Coarse Loam, rooting depth 30–180 cm $\times$ ten application amounts $\times$ ten irrigation methods, mapped to yield, irrigation, drainage, transpiration, N leached and water-stress days.

### Generation

Roots and uptake come from Engine 2 (Eqs. 5.18–5.23). For each soil the engine is run in turn with that soil's parameters (and, in own mode, its own trigger). With per-layer uptake $u_i(d)$ on day $d$ the **depth holding a fraction $p$ of the uptake** is

$$
z_p = k_p\,\Delta z,\qquad k_p = \min\Bigl\{k :\ \frac{\sum_{i\le k} U_i}{\sum_{i} U_i} \ge p\Bigr\},\qquad U_i=\sum_{d\in\text{year}}u_i(d),\quad p = 0.5,\ 0.9,
\tag{8.7}
$$

*Provenance (Eq. 8.7):* **[Engineered]**: diagnostic defined for the workbench.

with the layer index counted from 1 ($z_p$ is the *bottom* of layer $k_p$). It is computed for each of the 20 years from that year's uptake, then averaged over the years; the share of uptake in the top 30 cm is $\sum_{z_i\le30}U_i\big/\sum_i U_i$. The model stops roots at 1 m, whereas the Daisy runs reach 120 cm, as the layer notes. The statement "*Across the soils the deepest roots differ by …*" is the range of the 20-year-mean $\max_d R_d$ across soils.

**What these roots are.** The drawing states it: *"These are modelled roots, not a scan of real ones"*; root density is *relative* (Eq. 5.20), not measured root length. The E15 heat maps are **[Data-driven]** and exist for the Coarse Loam only ("they do not change with the soil you picked").

### Steps

1. Open the layer. Click a column to make that soil the working soil.
2. Click or drag on the upper graph to move the day; the lower panel shows the uptake on that day.
3. In the E15 panel choose an output (yield, irrigation, …), click a rooting depth and an application amount in the heat map; the table shows the change against the present setting and tells you the best depth, for example *"Roots at 30 cm leave the crop stressed …"*.
