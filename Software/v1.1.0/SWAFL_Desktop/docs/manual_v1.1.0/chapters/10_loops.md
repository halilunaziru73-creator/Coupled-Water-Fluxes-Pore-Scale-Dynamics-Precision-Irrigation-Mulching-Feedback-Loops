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

## Hidden questions of the vadose zone

Below the seven effects the layer answers eight further questions. Every panel has the same three parts: pore-scale sections of the soil, a curve, and a sentence with the numbers.

**The sections.** Each section is the modelled thin section of the soil used in the Soil, plant and air layer and in the Evaporation layer: grains in their natural colours, the fine matrix dark, air-filled pores empty and water in blue. It is built from the texture of the selected soil, the tillage system and the settling of the project, then filled with water at the suction named under the section (a pore of radius r in micrometres empties at a suction of about 1490 divided by r in centimetres of water, and a film of water remains on the grains). It is not a scan of a real sample. Every section responds to the pointer: hover over it to read what is under the cursor (the mineral and grain size, or the radius of a pore, whether it holds water or air, and the suction at which it empties). Click a section to enlarge it. The enlarged section shows a scale bar, a bar chart of pore sizes split into water-filled and air-filled pores, the pore share of the area, the radius below which pores are full of water, the water content and the hydraulic conductivity of the soil, and a suction slider with presets (saturated, field capacity, your trigger, wilting point, air dry). Dragging the slider drains or fills the soil and every number follows. The small graph of each panel is clickable too: click it to read the graph large, move the pointer over it to read the values (for the suction axes both pF and the suction in centimetres), and see the sections and the answer beside it. The percentage under a section is the share of the pores in the picture that are full of water.

**The curves.** The curves are the van Genuchten and Mualem functions of the selected soil. The compaction panel is made of runs of the model at each of the five settling steps.

**Connected to the controls.** Every panel follows the soil, tillage, settling, mulch, trigger suction, sensor depth, rain, temperature, crop and nitrogen set in Properties. For example, a drier trigger changes the suction of panels 1, 2 and 7, stronger mulch changes the demand and the stage lengths of panel 8, a different tillage or settling changes the pores of every section, and rain and irrigation change the salt balance of panel 6.

| Panel | Question | Sections | Curve | What it connects to |
|---|---|---|---|---|
| 1 | Does a sensor read the same after wetting as after drying? | At the trigger suction after drying, and after wetting (the wetting curve has twice the alpha of the drying curve) | Drying and wetting curves | Trigger suction, sensor depth, soil |
| 2 | Where does water still move when the soil is air dry? | At the trigger, at pF 4.2 and at pF 5.5 | log K against suction: capillary flow, an illustrative film term proportional to the suction to the power −1.5 anchored at 10⁻⁷ cm per day at pF 4.2, and their sum | Trigger suction, soil |
| 3 | Does compaction starve the crop or protect the groundwater? | Settling steps 0, 2 and 4 at field capacity | Drainage at each of the five steps, from runs of the model, with yield in the text | Tillage, settling, mulch, rain, crop, nitrogen |
| 4 | How far does the water table reach into the root zone? | 5, 25, 60 and 150 cm above the water table | Water content against height, and the height where saturation falls below 90 % | Soil, tillage, settling |
| 5 | How much of the water carries nearly all of the nitrate? | All pores wet, and the wide pores (those that empty at less than 31.6 cm) drained | The share of pore volume and the share of conductivity carried by wide, medium and fine pores | Soil, tillage, settling, nitrogen leaching of the model |
| 6 | How salty can the irrigation water be before the leaching it needs pollutes? | Water coloured amber with its salt: irrigation water at 2 dS/m and the drainage water | Relative yield of wheat against the salinity of the irrigation water for your drainage and for twice the drainage | Irrigation and drainage of the model (rain, mulch, trigger, soil) |
| 7 | Where on the suction scale does the trigger cost yield? | At 500 cm, at the trigger and at 8,000 cm | Reduction of root uptake with suction | Trigger suction, soil |
| 8 | How long does the soil keep up with the sun, and what does mulch change? | Just wetted, at the end of stage 1 and in stage 2 | Water the topsoil can deliver against suction, the demand reduced by mulch, and where stage 2 begins | Mulch, soil |

The film term, the salt balance (steady state, root-zone salinity taken as a quarter of the sum of the salinity of the irrigation and drainage water, wheat threshold 6 dS/m, slope 7.1 % per dS/m) and the uptake curve (breakpoints at 10, 25, 500 and 8,000 cm) are simple, stated forms for teaching and comparison. They are not calibrated to a field.

### References for the hidden questions

The figures do not carry references; they are listed here.

1. van Genuchten, M. Th. (1980). A closed-form equation for predicting the hydraulic conductivity of unsaturated soils. Soil Science Society of America Journal 44: 892 to 898.
2. Mualem, Y. (1976). A new model for predicting the hydraulic conductivity of unsaturated porous media. Water Resources Research 12: 513 to 522.
3. Kool, J. B., and Parker, J. C. (1987). Development and evaluation of closed-form expressions for hysteretic soil hydraulic properties. Water Resources Research 23: 105 to 114.
4. Zhuang, L., Bezerra Coelho, C. R., Hassanizadeh, S. M., and van Genuchten, M. Th. (2017). Analysis of the hysteretic hydraulic properties of unsaturated soil. Vadose Zone Journal 16(5): 1 to 9.
5. Tokunaga, T. K. (2009). Hydraulic properties of adsorbed water films in unsaturated porous media. Water Resources Research 45: W06415.
6. Peters, A. (2013). Simple consistent models for water retention and hydraulic conductivity in the complete moisture range. Water Resources Research 49: 6765 to 6780.
7. Rudiyanto, Sakai, M., van Genuchten, M. Th., Alazba, A. A., Setiawan, B. I., and Minasny, B. (2015). A complete soil hydraulic model accounting for capillary and adsorptive water retention, capillary and film conductivity, and hysteresis. Water Resources Research 51(11): 8757 to 8772.
8. Ngo-Cong, D., Antille, D. L., van Genuchten, M. Th., Nguyen, H. Q., Tekeste, M. Z., and Baillie, C. P. (2021). A modeling framework to quantify the effects of compaction on soil water retention and infiltration. Soil Science Society of America Journal 85(6): 1931 to 1945.
9. Saffari, R., Nikooee, E., Habibagahi, G., and van Genuchten, M. Th. (2019). Effects of biological stabilization on the water retention properties of unsaturated soils. Journal of Geotechnical and Geoenvironmental Engineering 145(7): 04019028.
10. Gonçalves, R. D., Teramoto, E. H., Engelbrecht, B. Z., Alfaro Soto, M. A., Chang, H. K., and van Genuchten, M. Th. (2020). Quasi-saturated layer: implications for estimating recharge and groundwater modeling. Groundwater 58(3): 432 to 440.
11. de Vries, E. T., Raoof, A., and van Genuchten, M. Th. (2017). Multiscale modelling of dual-porosity porous media; a computational pore-scale study for flow and solute transport. Advances in Water Resources 105: 82 to 95.
12. Maas, E. V., and Hoffman, G. J. (1977). Crop salt tolerance, current assessment. Journal of the Irrigation and Drainage Division, ASCE 103: 115 to 134.
13. Feghhenabi, F., Hadi, H., Khodaverdiloo, H., and van Genuchten, M. Th. (2020). Seed priming alleviated salinity stress during germination and emergence of wheat. Agricultural Water Management 231: 106022.
14. Feddes, R. A., Kowalik, P. J., and Zaradny, H. (1978). Simulation of field water use and crop yield. Pudoc, Wageningen.
15. Lazarovitch, N., Vanderborght, J., Jin, Y., and van Genuchten, M. Th. (2018). The root zone: soil physics and beyond. Vadose Zone Journal 17(1): 1 to 6.
16. Bezerra-Coelho, C. R., Zhuang, L., Barbosa, M. C., Alfaro Soto, M. A., and van Genuchten, M. Th. (2018). Further tests of the HYPROP evaporation method for estimating the unsaturated soil hydraulic properties. Journal of Hydrology and Hydromechanics 66(2): 161 to 169.

## The sentence under the picture

A status pill reports the day: *"Irrigating now: 28 mm (soil reached the trigger)"*, *"Rain day: 12 mm, no irrigation needed"* or *"Irrigation stopped: soil wet enough"*. The text for the trigger says whether *"the sensor has reached the trigger (depletion $f$)"*, to what depth *"the water wets the soil"* (the wetting front of the day's irrigation, Section 5.2) and, when that is shallower than the sensor, *"the sensor may stay beyond the trigger"*. If no irrigation is due, it states how many days are free in the next 14 and that rain is needed to keep it that way.

## Steps

1. Open *Feedback loops*. The crop shown is the field at mid-season.
2. Click an arrow (number 4, for example). The matching row is highlighted: a line of the form *"Trigger one step drier: irrigation −X mm, yield −Y Mg/ha"* (the numbers depend on your settings).
3. Click the picture parts to change controls and watch the arrow widths change.
4. Use **Pin baseline** first to compare the 20-year averages for the whole combination.
