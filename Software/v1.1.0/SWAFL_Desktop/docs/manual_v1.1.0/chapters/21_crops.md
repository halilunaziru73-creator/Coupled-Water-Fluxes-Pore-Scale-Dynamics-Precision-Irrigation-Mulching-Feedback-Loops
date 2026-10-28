# The crop library and the crop water requirement

## The crops

Version 1.1 carries **48 crops** besides the simulated cereal/oilseed rotation. They are chosen in Properties ▸ Soil and field ▸ **Crop**, in four groups: *Staple food crops*, *Cash and oil crops*, *Vegetables*, and *Trees, vines and palms*. For each crop the library holds the crop coefficients $K_{c,\mathrm{ini}}$, $K_{c,\mathrm{mid}}$ and $K_{c,\mathrm{end}}$, the lengths of the four growth stages (initial, development, mid-season, late season), the plant height, the maximum rooting depth, the depletion fraction $p$, the yield response factor $K_y$, the ground cover and, for trees and vines, the planting densities or training systems. Field crops take their coefficients and stages from a field study that computed the daily crop water requirement with the FAO Penman and Monteith reference evapotranspiration; trees, vines and berries from the updated FAO-56 coefficients of fruit trees and vines. Rooting depth, $p$ and $K_y$ are the FAO-56 and FAO-33 tabulated values; where a crop is not tabulated the group value is used and the table says *group default*.

The staple and cash crops asked for in this release carry these coefficients:

| Crop | $K_{c,\mathrm{ini}}$ | $K_{c,\mathrm{mid}}$ | $K_{c,\mathrm{end}}$ | Note |
|:--|:--:|:--:|:--:|:--|
| Cassava | 0.30 | 0.80 | 0.30 | |
| Yam | 0.50 | 1.10 | 0.85 | stages and rooting depth: group default |
| Rice | 1.05 | 1.20 | 0.90 | bunded: no runoff in the season |
| Maize | 0.30 | 1.20 | 0.60 | |
| Sorghum | 0.30 | 1.00 | 0.55 | |
| Millet | 0.30 | 1.00 | 0.30 | |
| Cowpeas | 0.40 | 1.05 | 0.50 | |
| Groundnut | 0.40 | 1.15 | 0.60 | |
| Soybean | 0.40 | 1.15 | 0.50 | |
| Oil palm | 0.90 | 0.95 | 0.95 | perennial |
| Cocoa | 1.00 | 1.05 | 1.05 | perennial, high canopy shade |

The complete library is listed in Table 21.2 at the end of this chapter.

## The Crop water requirement layer

![The Crop water requirement layer.](images/atlas11/L_crop_p1.jpg){width=100%}

The layer *Crops ▸ Crop water requirement* shows, for the chosen crop on the soil, weather, trigger and method of the project:

* the **crop coefficient through the year** and the daily water need $ET_c$ of the working year (the label reads *ETc of 2026*, following the year in Properties);
* the **root-zone water and the irrigation schedule** of the working year: the depletion below field capacity against the readily available water and the trigger, with every irrigation of the year;
* buttons to plant two weeks earlier or later (field crops) or to choose the planting density or training system (trees and vines);
* **every crop of the library on this soil**: the yearly crop water need, net irrigation, irrigations per year and relative yield, so that crops can be compared on the same field.

## The daily balance of a crop

The layer computes, for each of the twenty years of the weather in use, the FAO-56 daily balance of the root zone. The crop coefficient follows the four stages,

$$
K_c(t)=\begin{cases}K_{c,\mathrm{ini}} & t<L_1\\ K_{c,\mathrm{ini}}+(K_{c,\mathrm{mid}}-K_{c,\mathrm{ini}})\frac{t-L_1}{L_2} & L_1\le t<L_1+L_2\\ K_{c,\mathrm{mid}} & L_1+L_2\le t<L_1+L_2+L_3\\ K_{c,\mathrm{mid}}+(K_{c,\mathrm{end}}-K_{c,\mathrm{mid}})\min\bigl(1,\frac{t-L_1-L_2-L_3}{L_4}\bigr) & \text{after}\end{cases}
\tag{21.1}
$$

*Provenance (Eq. 21.1):* **[Literature]**: FAO-56 crop coefficient curve (Allen et al., 1998, Fig. 25); $t$ days after planting; evergreen crops repeat it every year.

and outside the season the bare soil has $K_c=0.25$. The daily crop water need is

$$
ET_{c,d}=K_c(d)\,ET_{0,d},
\tag{21.2}
$$

*Provenance (Eq. 21.2):* **[Literature]**: FAO-56 single crop coefficient approach.

with $ET_{0,d}$ the daily reference evapotranspiration of the weather in use (your own weather when imported; otherwise the annual reference ET of each recorded year shaped by the seasonal weight, adjusted by 3.5 % per °C of the temperature shift). The roots of an annual crop grow with the canopy, perennial roots are at full depth:

$$
z_r=\mathrm{clip}\Bigl(15+(R_{\max}-15)\min\Bigl(1,\frac{1.15\,K_c}{\max(0.3,K_{c,\mathrm{mid}})}\Bigr);\ 15,\ R_{\max}\Bigr)\ \ [\mathrm{cm}],\qquad R_{\max}\le100\ \mathrm{cm},
\tag{21.3}
$$

*Provenance (Eq. 21.3):* **[Engineered]**: root growth tied to the crop coefficient, limited to the 1 m of the model.

The total and readily available water and the depletion $D_r$ of the root zone follow FAO-56,

$$
\begin{aligned}
\mathrm{TAW}&=\mathrm{AWC}\,z_r,\qquad p_d=\mathrm{clip}\bigl(p+0.04\,(5-K_c\,ET_0);\,0.1,\,0.8\bigr),\qquad \mathrm{RAW}=p_d\,\mathrm{TAW},\\
K_s&=\begin{cases}1 & D_r\le\mathrm{RAW}\\ \dfrac{\mathrm{TAW}-D_r}{(1-p_d)\,\mathrm{TAW}} & D_r>\mathrm{RAW}\end{cases},\qquad ET_a=K_s\,ET_c,\\
D_{r,d}&=D_{r,d-1}-(P_d-RO_d)+ET_{a,d},\qquad RO_d=0.3\,\max(0,P_d-35),
\end{aligned}
\tag{21.4}
$$

*Provenance (Eq. 21.4):* **[Literature]**: FAO-56 Eqs. 82 to 85 (water stress coefficient, adjustment of $p$ with the demand) and the root-zone balance Eq. 85; the runoff of heavy rain is **[Engineered]**.

with any negative $D_r$ draining below the roots. Irrigation refills the root zone to field capacity on the day the depletion reaches the trigger of the project, $D_r\ge f_T\,\mathrm{TAW}$, with $f_T$ the depletion at the trigger suction (Eq. 5.3): the net depth is $I_n=D_r$ and the gross depth $I=I_n/E_{a,m}$, with the method efficiency $E_{a,m}$ = 0.60 (surface), 0.75 (overhead) or 0.90 (drip). The relative yield of a year is

$$
Y_{\mathrm{rel}} = \mathrm{clip}\Bigl(1-K_y\Bigl(1-\frac{\sum ET_a}{\sum ET_c}\Bigr);\ 0,\ 1\Bigr),
\tag{21.5}
$$

*Provenance (Eq. 21.5):* **[Literature]**: FAO-33 yield response (Doorenbos and Kassam, 1979); $K_y=1$ when not tabulated, as the table says.

## How a library crop changes every other layer

The annual model (Engine 1) is the result of the simulations of the cereal rotation. A library crop is transferred from it by the ratio of two runs of the balance above on the same soil, weather, trigger and method: one for the crop ($c$) and one for the cereal reference ($r$, FAO-56 small grains, $K_c$ 0.30/1.15/0.25). With $m$ the annual-model result of the cereal,

$$
I = \begin{cases} I_m\ \mathrm{clip}\bigl(I_c/I_r;\ 0,\ 4\bigr) & I_r>5\ \mathrm{mm}\\ I_c & \text{otherwise}\end{cases}
\tag{21.6}
$$

$$
\begin{aligned}
T &= \min\Bigl(0.9\,ET,\ \ T_m\,\mathrm{clip}\Bigl(\frac{ET_{a,c}}{ET_{c,c}}\cdot\frac{ET_{c,c}}{ET_{c,r}}\cdot\Bigl(\frac{f_{c,c}}{f_{c,r}}\Bigr)^{0.3};\ 0.2,\ 3\Bigr)\Bigr),\\
E^{\ast} &= E_m\ \mathrm{clip}\Bigl(\frac{1-0.7\,f_{c,c}}{1-0.7\,f_{c,r}};\ 0.6,\ 1.6\Bigr),
\end{aligned}
\tag{21.7}
$$

$$
D=\max\bigl(0.2\,D_m,\ D_m+0.5\,(DP_c-DP_r)\bigr),\qquad ET=\mathrm{clip}\bigl(P+I-D-\Delta S_m;\ 50,\ 5000\bigr),
\tag{21.8}
$$

$$
\bigl(E,\ E_{\mathrm{other}}\bigr)=\bigl(E^{\ast},\ E^{\ast}_{\mathrm{other}}\bigr)\,\frac{ET-T}{E^{\ast}+E^{\ast}_{\mathrm{other}}},\qquad N_L=N_{L,m}\,\frac{D+5}{D_m+5},\qquad Y=100\,Y_{\mathrm{rel},c}\ [\%],
\tag{21.9}
$$

*Provenance (Eqs. 21.6 to 21.9):* **[Engineered]**: transfer by the ratio of two FAO-56 balances; the clips keep the transfer within the range in which the cereal result is informative; the remainder of the balance is shared between soil evaporation and the other evaporation terms in proportion to their targets, so that the balance closes without inflating either.

with $f_c$ the ground cover, $E^{\ast}_{\mathrm{other}}=E_{\mathrm{other},m}\,ET/ET_m$ and $\Delta S_m$ the storage change of the cereal result. The yield of a library crop is therefore shown as the relative yield in per cent, and the differences of yield in the sensitivity and feedback layers are in *% points*.

## Table 21.2. The crop library

{{CROPTABLE}}
