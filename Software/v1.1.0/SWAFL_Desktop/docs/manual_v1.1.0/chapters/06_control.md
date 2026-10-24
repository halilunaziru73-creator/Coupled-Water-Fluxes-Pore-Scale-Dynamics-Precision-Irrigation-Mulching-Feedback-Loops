# Irrigation control layers

The two layers of this group answer one question: **when should irrigation start?** *Sensor and trigger* shows what a sensor sees through twenty years; *Trigger law* shows why the same suction means different things in different soils and how to express the trigger so that it works for every soil.

## Sensor and trigger

### What it shows

A simulated tensiometer at the **sensor depth** (default 20 cm) records soil-water suction $h$ (cm of water, plotted on a log axis from 1 to 100,000 cm) every day. Two traces are drawn: *irrigated* (blue) and *rainfed* (orange). The red dashed line is the **trigger** you set. Pale bands are growing seasons. Under the trace, red ticks mark irrigated sensor days beyond the trigger, and the bar chart counts, for each year, the growing-season days (of 183) on which the sensor was beyond the trigger, irrigated against rainfed.

### How to use it, step by step

1. Open *Irrigation control ▸ Sensor and trigger*.
2. Choose **All 20 years** to see the whole record, or **1994 detail** for the one year with full-profile output (the buttons are on the playback bar under the drawing).
3. Move **Trigger (sensor suction)** in Properties; the red line and every count update.
4. Move **Sensor depth**, the soil, the mulch, the method or any other control: both traces follow it (Eq. 6.4a), and the sentence under the drawing names the record and the settings it is drawn for.
5. Press the play button under the drawing to sweep a cursor through the record; the working year is set in Properties ▸ Scenario.
6. Read the text under the plot: *"Irrigated: 85 of 183 days beyond 300 cm, mean suction 255 cm. Rainfed: 168 of 183 days beyond, mean suction 1,945 cm. Irrigation removes 39 % of the days beyond this trigger."*

![Sensor and trigger. Top: 20 years of suction at the sensor, irrigated (blue) and rainfed (orange) with the trigger (red dashed). Bottom: growing-season days beyond the trigger per year. The numbered arrows are explained in the screenshot atlas (Chapter 25), under the same screen.](images/atlas11/v1_s0_p1.jpg){width=80%}

### How the numbers are generated

* The two suction traces start from the Daisy-simulated daily suction at 20 cm (irrigated with the study's trigger, and rainfed) for the 1980–1999 record, stored in the engine (`D20`) for the Coarse Loam and the Coarse Sand. At the standard settings of those two soils they are drawn as stored. For any other soil, sensor depth or setting the record is moved by the **delta method**: the daily model (Engine 2) is run twice, at your settings and at the standard settings of the same soil and weather, and the difference of the depletion of the sensor layer (smoothed over seven days) is added to the depletion of the stored record, which is then converted to suction in your soil:

$$
h^{\mathrm{x}}_d = h_{\mathrm{soil}}\!\Bigl(f_{\mathrm{ref}}\bigl(h^{\mathrm{rec}}_d\bigr) + \tfrac17\sum_{q=-3}^{3}\bigl[f^{\mathrm{set}}_{d+q}-f^{\mathrm{std}}_{d+q}\bigr]\Bigr),
\tag{6.4a}
$$

*Provenance (Eq. 6.4a):* **[Data-driven + Engineered]**: the stored simulated record carries the real weather sequence; the change made by your settings is the difference of two runs of the daily model, converted with the van Genuchten curve of your soil (the inverse of Eq. 5.3, tabulated).

  with $f_{\mathrm{ref}}$ the depletion of the reference soil whose record is used (the nearer of the two in texture), $f^{\mathrm{set}}$ and $f^{\mathrm{std}}$ the daily depletion of the sensor layer in the two runs (irrigated or rainfed as the trace), and $h_{\mathrm{soil}}(f)$ the suction of your soil at depletion $f$.
* The count of days beyond the trigger is, for year $y$,

$$
N_y(h_T) = \#\bigl\{\,d \in \text{growing season of year } y : h_d > h_T\,\bigr\}\quad(183\ \text{days from 1 April}),
\tag{6.1}
$$

*Provenance (Eq. 6.1):* **[Data-driven]**: counts over the simulated daily series.

and the "Irrigation removes $X$ %" statement is

$$
X = 100\Bigl(1 - \frac{\bar N_{\mathrm{irr}}}{\bar N_{\mathrm{rainfed}}}\Bigr),\qquad \bar N = \tfrac{1}{20}\sum_{y} N_y.
\tag{6.2}
$$

*Provenance (Eq. 6.2):* **[Data-driven]**: counts over the simulated daily series.

* The annual line at the foot ("irrigation 282 mm, yield 6.63 Mg ha$^{-1}$, drainage 28 mm") is Engine 1 (Eqs. 5.4–5.12) at the current settings.

### Reading it

If rainfed days beyond the trigger greatly exceed irrigated days, irrigation is doing its job; if the two bars are similar the trigger is so dry that irrigation rarely starts. A trigger of $-50$ cm (very wet) produces ticks on almost every day.

## Trigger law

### The idea

The same suction does not mean the same dryness in two soils. At $-300$ cm a sand has lost 84 % of its plant-available water while a silty clay loam has lost only 24 % (Table 5.3, last column). N1 re-expresses the trigger as the **depletion fraction** $f$ of Eq. (5.3), the share of plant-available water already used, and shows that irrigation and yield responses from all ten soils collapse onto a common curve when plotted against $f$.

**[Literature + study result].** The depletion form follows the management-allowed-depletion idea of FAO-56 (Allen et al., 1998, Eq. 83 and Table 22): irrigate when a fixed share $p$ of the total available water is used. The *soil-independent* critical value $f^\ast=0.45$ is the study's result (5 % yield loss), and the pooled $R^2$ rising from 0.48 to 0.75 (irrigation) and 0.23 to 0.70 (yield) is reported in the repository.

### How to use it, step by step

1. Open *Irrigation control ▸ Trigger law*.
2. The soil column on the left is the soil by depth on the clock's day; the blue gauge beside it shows depletion from FC (0) to WP (1). **Drag the purple trigger marker** on the gauge: the soil's own trigger suction changes, and the right-hand list of ten soils moves in step.
3. Each row on the right is one soil with its trigger suction and the net irrigation depth at that depletion ("143 cm trigger, 278 mm"); the green box gives the relative yield at the soil's trigger.
4. Click a soil name to select it (it becomes the working soil).
5. **Common and own mode.** By default one suction (the Trigger slider) applies to every soil (*common* mode). **Opening the Trigger law layer switches the program to *own* mode**: each soil then uses its own critical suction for the chosen depletion, and the Trigger slider in Properties shows the nearest value on its 20-value grid (simulated runs exist only on that grid). Own mode stays on until you choose *Reset all settings* or a ready-made case, which restore the common mode.
6. Read the verdict box at the bottom: it states the soil's critical suction, the yield at the current trigger relative to the best trigger, and how many root-zone layers are beyond the trigger on this day.

![Trigger law layer: ten soils on one depletion axis, with the critical $f^\ast = 0.45$ (red line) and the soil's own trigger. The numbered arrows are explained in the screenshot atlas (Chapter 25), under the same screen.](images/atlas11/n1_s0_p1.jpg){width=80%}

### Governing relations

The depletion of Eq. (5.3) is evaluated with each soil's effective van Genuchten pair $(\alpha,n)$ (Table 5.3). The suction at which a soil reaches a chosen depletion $f$ is the inverse,

$$
h(f) = \Bigl\{\,h : f(h) = f\,\Bigr\},
\tag{6.3}
$$

*Provenance (Eq. 6.3):* **[Literature]**: inverse of the van Genuchten curve, solved by bisection.

solved by bisection, giving for $f^\ast = 0.45$ the soil-specific sensor settings of Table 5.3 (143 cm for sand to 729 cm for silty clay loam). The net irrigation per event shown beside each soil is

$$
Z_n = f\cdot \mathrm{AWC}\cdot R_{\max}\quad[\mathrm{mm}]
\tag{6.4}
$$

*Provenance (Eq. 6.4):* **[Literature]**: same relation as Eq. (5.27) without the clip.

(the same relation as Eq. 5.27 without the clip). The *relative yield at the trigger* is

$$
Y_{\mathrm{rel}} = \frac{Y(h_T)}{\max_{h}\,Y(h)},
\tag{6.5}
$$

*Provenance (Eq. 6.5):* **[Data-driven]**: ratio of Daisy run-set E2 yields.

with $Y(h)$ the soil's yield at each simulated trigger (run set E2). **[Data-driven]**.

### How fast each soil dries

Each row of the soil list ends with the days from field capacity to the trigger, and the box under the drawing tells how fast the soil in focus dries. Every soil is compared on the same crop demand: the mean evapotranspiration of the peak of the season (days 150 to 220), from the daily model of a well-watered coarse loam at all your other settings. Only the water each soil holds differs:

$$
r_s=\frac{ET_c}{\mathrm{TAW}_s},\qquad \mathrm{TAW}_s=\mathrm{AWC}_s\,z_r,\qquad t_{\mathrm{trig},s}=\frac{f_{\mathrm{trig},s}}{r_s},
\tag{6.6}
$$

*Provenance (Eq. 6.6):* **[Literature]**: the FAO-56 root-zone depletion rate; $\mathrm{AWC}_s$ is the available water of the soil (mm per cm), $z_r$ the root depth of the reference run and $f_{\mathrm{trig},s}$ the depletion at the soil's own trigger.

A sand holds about 0.6 mm per cm, so the same demand empties it in about a third of the time of a loam: at the default settings, sand reaches its trigger in about 7 days and coarse loam in about 18. When you press **Play**, the gauge follows the daily model day by day, and its response is tied to the soil: it answers at once in a sand and slowly in a clay ($\text{rate} = 0.09 \times 1.5/\mathrm{AWC}_s$ per frame, between 0.04 and 0.35).

Choosing another soil, in the list or in Properties, starts the replay again from the start of the season (day 95), with the gauge set to the new soil.

### The core trade-off: f = 0.50 or f = 0.45

Under the explanation, a panel answers the question each grower asks: trigger at a depletion of 0.50 or of 0.45? It has two columns, and each condition is ticked when it applies to your settings.

**Choose f = 0.50 if:**

* you irrigate a standard field crop (maize, grains, alfalfa): a field crop of the library whose FAO-56 depletion fraction is $p \ge 0.5$;
* your soil is loam or clay (high water-holding capacity): less than 60 % sand and more than 0.9 mm of available water per cm;
* your system can irrigate the entire field quickly: a full round of the design of your irrigation method takes 2 days or less.

**Choose f = 0.45 if:**

* your irrigation system takes several days to finish a full round: more than 2 days. A round is the time per round of the design divided by the hours a day you irrigate (24 h for surface irrigation).
* your soil is sandy or coarse and dries out very fast: 60 % sand or more, or 0.9 mm of available water per cm or less;
* the crop is in a critical, water-sensitive growth stage such as flowering or pollination: on the date on the clock the crop is at 85 % or more of its full cover.

If any condition of the f = 0.45 column applies, the advice is f = 0.45; otherwise it is f = 0.50. A sentence gives the reasons. Each column has a button that sets the trigger of the soil in focus to that depletion; the button of the trigger in use is green. The time per round is known once the design of your method has been opened; until then the panel says so.

### Reading the sensor value

The dashboard tile *Sensor / trigger* reads two numbers: the **current depletion** $f$ at the sensor layer and the **trigger depletion** $f_T$. When the first reaches the second, irrigation is due. On 18 Oct 2026 the tile reads $0.02/0.38$ for the Coarse Loam: the soil is almost at field capacity (0.02), and the trigger is at depletion 0.38 ($= f$ at 300 cm).
