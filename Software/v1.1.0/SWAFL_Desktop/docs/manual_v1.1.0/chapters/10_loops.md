# Feedback loops

## What it shows

One large picture of a field, from sky to groundwater, on which red arrows join the parts that act on each other: temperature and the crop; rain and soil water; mulch and evaporation; the sensor trigger and irrigation; drainage and nitrogen leaching; nitrogen and the roots; tillage structure and drainage. Each arrow is numbered 1 to 7, and its **width grows with the size of the effect of one step** of the control behind it. Under the picture a panel lists "*What one step of each control does*"; click a row or an arrow to highlight it.

![Feedback loops. The numbered arrows are explained in the screenshot atlas (Chapter 25), under the same screen.](images/atlas11/v5_s0_p1.jpg){width=80%}

The picture is also a set of controls: clicking the clouds cycles the rainfall, the sun the temperature, the mulch layer the material, the sensor the trigger (three grid steps drier each click, wrapping), the soil the tillage, the crop the crop category, the emitter or sprinkler the irrigation method, and the nitrogen band the nitrogen rate.

## How the seven effects are computed

For each control the engine moves **one step** on its list (in the direction that stays inside the list: if the control is at its maximum it steps down) and re-evaluates Engine 1 (Eqs. 5.4 to 5.12). The change relative to the present result is printed. With $m$ the present result and $m^{(\pm)}$ the result after one step, and $f_{\mathrm{crop}}$ the crop factor:

| # | Control step | Printed effect | Arrow-width input $\mu$ |
|:-:|:--|:--|:--|
| 1 | Temperature $\pm0.5$ °C | $\Delta Y f_{\mathrm{crop}}$, $\Delta I$ | $8\,|\Delta Y|$ |
| 2 | Rain $\pm0.1$ (scale) | $\Delta D$, $\Delta I$ | $|\Delta D|/12$ |
| 3 | Stronger mulch (one step lower $\varphi$) | $\Delta E$, $\Delta I$ | $|\Delta E|/14$ |
| 4 | Trigger one step drier or wetter | $\Delta I$, $\Delta Y f_{\mathrm{crop}}$ | $|\Delta I|/8$ |
| 5 | One more mm of drainage | $\Delta N_L/\Delta D$ kg N per mm (from the rain step), or "no change" if $|\Delta D|\le0.5$ | $|\Delta D|/10$ |
| 6 | Nitrogen $\pm15$ % | $\Delta N_L$, $\Delta Y f_{\mathrm{crop}}$ | $|\Delta N_L|/8$ |
| 7 | Consolidation one step | $\Delta D$ (or "unchanged in this soil" if $|\Delta D|<0.05$) | $|\Delta D|/2$ |

and the arrow line width in pixels is

$$
w_k = 5 + \mathrm{clip}(\mu_k;\,0,\,4).
\tag{10.1}
$$

*Provenance (Eq. 10.1):* **[Engineered]**: drawing rule.

The sensitivity printed in row 5, the **nitrate cost of drainage**, is the ratio

$$
\kappa_{N} = \frac{N_L^{(\mathrm{rain\ step})} - N_L}{D^{(\mathrm{rain\ step})} - D} \quad [\mathrm{kg\ N\ ha^{-1}\ mm^{-1}}],
\tag{10.2}
$$

*Provenance (Eq. 10.2):* **[Data-driven]**: one-step differences of Daisy results.

which the study reports as roughly 1.06 kg N ha$^{-1}$ per mm of drainage (README). The numbers are **[Data-driven]** one-step differences, not partial derivatives, so a step at the end of a list can be smaller than the step in the middle.

## The sentence under the picture

A status pill reports the day: *"Irrigating now: 28 mm (soil reached the trigger)"*, *"Rain day: 12 mm, no irrigation needed"* or *"Irrigation stopped: soil wet enough"*. The text for the trigger says whether *"the sensor has reached the trigger (depletion $f$)"*, to what depth *"the water wets the soil"* (the wetting front of the day's irrigation, Section 5.2) and, when that is shallower than the sensor, *"the sensor may stay beyond the trigger"*. If no irrigation is due, it states how many days are free in the next 14 and that rain is needed to keep it that way.

## Steps

1. Open *Feedback loops*. The crop shown is the field at mid-season.
2. Click an arrow (number 4, for example). The matching row is highlighted: a line of the form *"Trigger one step drier: irrigation −X mm, yield −Y Mg/ha"* (the numbers depend on your settings).
3. Click the picture parts to change controls and watch the arrow widths change.
4. Use **Pin baseline** first to compare the 20-year averages for the whole combination.
