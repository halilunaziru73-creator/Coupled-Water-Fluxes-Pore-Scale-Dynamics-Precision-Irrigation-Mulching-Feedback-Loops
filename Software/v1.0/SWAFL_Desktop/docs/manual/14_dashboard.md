# The Dashboard: how every number is produced

The Dashboard is the panel under the drawing. It has four tabs (*Results*, *Design*, *Charts*, *Messages*) and three buttons at the right: **Wider** (enlarges or shrinks the panel), **Pin** (stores the present 20-year averages as a baseline; Ctrl+B) and **Clear** (removes the baseline). It re-reads the engine each time the state changes, so it always agrees with the drawing.

![The Dashboard, Results tab: the working day, the next days, the whole year and the 20-year averages. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/u05_dash_results.jpg){width=60%}

## Results

The tab has four blocks, each a grid of tiles.

**Block 1: On the working date** (mm per day unless stated). Crop, root depth (cm), *Sensor / trigger* (the simulated relative depletion $f$ of the sensor layer and the trigger $f_T$; irrigation fires when $f\ge f_T$, Eq. 6.1), rain, irrigation, soil evaporation, transpiration and drainage on that day. They are the Engine 2 daily series of Chapter 5, read at the day index $k$ of the working date:

$$
\mathrm{Rain}=P_k,\quad \mathrm{Irr}=I_k,\quad \mathrm{Evap}=E_k,\quad \mathrm{Transp}=T_k,\quad \mathrm{Drain}=D_k\ \ (\mathrm{mm\,d^{-1}}).
\tag{14.1}
$$

*Provenance (Eq. 14.1):* **[Engineered]**: bookkeeping of Engine 2 series.

**Block 2: Next $N$ days** ("simulated, not a forecast"). Sums of the same series over the following $N$ days (the look-ahead of Chapter 4, 14 days),

$$
\Sigma X=\sum_{j=1}^{N}X_{k+j},\qquad X\in\{P,I,E,T,D\}.
\tag{14.2}
$$

*Provenance (Eq. 14.2):* **[Engineered]**: bookkeeping of Engine 2 series.

Because the weather after today is the analogue year, not a forecast, these numbers describe what the *scenario* implies, not what will happen.

**Block 3: Whole year.** For the calendar year of the working date: rain, irrigation, interception, soil evaporation, transpiration, drainage, the change in storage and the deepest roots (cm). The water balance of the year closes as

$$
\Delta S=P+I-E_{\mathrm{int}}-E-T-D,
\tag{14.3}
$$

*Provenance (Eq. 14.3):* **[Literature]**: water-balance identity.

with $E_{\mathrm{int}}$ the interception loss (Section 5.2); the tile *Storage change* is $\Delta S$.

**Block 4: 20-year averages at these settings.** These are the annual-model outputs of Engine 1 (Chapter 5), one tile each: soil evaporation, transpiration, evapotranspiration $\mathrm{ET}=E+T$, drainage, irrigation, yield, irrigation efficiency, nitrogen leaching, rainfall, and *Irrigation without mulch* (the same case with no mulch, for the saving). Each tile shows the value as the engine reports it (with its unit).

### The pinned baseline

Press **Pin** (or Ctrl+B): the ten tiles of Block 4 are stored. After any change in Properties the tiles show the difference from the pinned values,

$$
\Delta_i=x_i-x_i^{\mathrm{pin}},
\tag{14.4}
$$

*Provenance (Eq. 14.4):* **[Engineered]**: bookkeeping of Engine 2 series.

with a coloured arrow: ▲ (increase) or ▼ (decrease), green when the change is in the *better* direction and red when it is worse, and "= no change" when $|\Delta_i|<10^{-9}$. The "better" direction is fixed per tile: lower is better for soil evaporation, drainage, irrigation and nitrogen leaching; higher is better for yield and irrigation efficiency; transpiration, evapotranspiration, rainfall and *Irrigation without mulch* are neutral (no colour). The values are compared numerically after reading the first number in each tile's text, so the comparison is meaningful only between runs of the same version and units.

**Typical use:** pin the *Present* case, change one control (for example Mulch $\to$ Straw), read the green or red arrows, change it back, and repeat for another control. This is how the effect matrix of Chapter 3 was built.

## Design

The tab lists the live results of the design layer that is open (it refreshes about every 1.2 s). With no design layer open it shows a note. The tiles are:

| Layer | Tiles (quantity, unit) |
|:--|:--|
| Surface (S2) | $E_a$, $E_s$ (%); deep percolation, runoff (%); CU (%); cut-off time, time to fill the root zone, advance time (min); applied, required, deep-percolation and runoff volumes |
| Drip (S3) | $E_a$, $E_s$, $E_u$ (%); deep percolation (%); wetted fraction $P_w$ (%); gross application (mm); irrigation time (h); applied and required volume per emitter (L) |
| Sprinkler (S4) | $E_a$, $E_s$, DU, CU, deep percolation (%); runoff; gross and net application (mm); set time (min); sprinkler discharge; application rate |

The definitions are Eqs. (11.18)–(11.19), (12.19) and (13.11). The Design tab and the *Design results (CSV)* export read the same object, so the numbers agree digit for digit.

![The Dashboard, Design tab, with the sprinkler layer open. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/u05_dash_design.jpg){width=60%}

## Charts

Three charts of the 20 years around the working date (calendar years on the horizontal axis, mm per year): *Rainfall and irrigation* (bars), *Drainage below the root zone* (bars) and *Evaporation and transpiration* (lines). They are the annual sums of the Engine 2 daily series,

$$
Y^{(y)}=\sum_{d\in y}X_d,\qquad X\in\{P,I,D,E,T\}.
\tag{14.5}
$$

*Provenance (Eq. 14.5):* **[Engineered]**: bookkeeping of Engine 2 series.

They show variability between weather years (dry years need more irrigation and drain less) and the trend of the scenario; they are the series saved by *Yearly results (CSV)*.

![The Dashboard, Charts tab. The numbered arrows are explained in the atlas of chapter 18, under the same screen.](images/atlas/u05_dash_charts.jpg){width=60%}

## Messages

A time-stamped log of what the program did (project saved, baseline pinned, file saved, engine messages) with warnings and errors coloured. Newest first. Use it to find the path of a saved file.
