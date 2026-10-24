# The Dashboard: how every number is produced

The Dashboard is the panel to the right of the drawing. It has four tabs (*Results*, *Design*, *Charts*, *Messages*) and the buttons **Wider** (enlarges or shrinks the panel), **Pin** (stores the present 20-year averages as a baseline; Ctrl+B) and **Clear** (removes the baseline). It is laid out like the Properties panel: a white sheet with grey group bars. **Every block can be folded and unfolded on its own** by clicking its bar; the folding is remembered while the program runs, also when the numbers refresh. The dashboard re-reads the engine each time the state, the date or the weather changes, so it always agrees with the drawing.

![The Dashboard, Results tab, with the Field balance layer open.](images/atlas11/ui_u05_dash_results.jpg){width=100%}

## Results

The first block of the Results tab carries the name of the open layer and its **key numbers** (the same lines as in the report). For example, on *Soil hydraulic drivers* it shows the change in drainage due to tillage and to the consolidation rate on your soil, and the leading driver. A design layer shows its key numbers after its run.

On *Trigger law* this block shows only the soil you are working on. It lists the trigger (cm) and its depletion, the critical $f^*$, the sensor reading and its depletion now, the days from field capacity to the trigger, the drying speed, the water held in the root zone, the yield, the irrigation and drainage, the share of the best trigger's yield, and the advice $f = 0.50$ or $f = 0.45$ with its reasons. Click another soil in the drawing to see its numbers. Under the table, the chart of the season shows the depletion at the sensor day by day, the trigger (dashed) and the irrigation days (blue), with both axes named; then the advice, and the two lists *Choose f = 0.50 if* and *Choose f = 0.45 if*, each condition ticked or not with the value that decides it.

![The Trigger law block of the Dashboard: the soil, its numbers, the season chart and the advice.](images/ui/dash_n1.jpg){width=45%}


On *Soil hydraulic drivers* this block shows your soil: its texture; your tillage, consolidation rate and topsoil pore space; its drainage below 1 m, nitrate leaching, yield and irrigation at these settings; the effect of tillage (conventional against no-till) and of the consolidation rate (fastest against slowest); the leading driver and the rank of the soil among the ten. A chart gives the drainage against the consolidation rate for the three tillage systems with your rate marked, a table the drainage for every setting, the advice says which tillage gives the least drainage and leaching, and bars compare the two effects in the ten soils.

![The Soil hydraulic drivers block of the Dashboard.](images/ui/dash_v7.jpg){width=45%}

The tab has four blocks.

**Block 1: On the working date** (mm per day unless stated). Crop, root depth (cm), *Sensor / trigger* (the simulated relative depletion $f$ of the sensor layer and the trigger $f_T$; irrigation fires when $f\ge f_T$, Eq. 6.1), rain, irrigation, soil evaporation, transpiration and drainage on that day. They are the Engine 2 daily series of Chapter 5, read at the day index $k$ of the working date:

$$
\mathrm{Rain}=P_k,\quad \mathrm{Irr}=I_k,\quad \mathrm{Evap}=E_k,\quad \mathrm{Transp}=T_k,\quad \mathrm{Drain}=D_k\ \ (\mathrm{mm\,d^{-1}}).
\tag{14.1}
$$

*Provenance (Eq. 14.1):* **[Engineered]**: bookkeeping of Engine 2 series.

**Block 2: Next 14 days.** Sums of the same series over the following $N=14$ days,

$$
\Sigma X=\sum_{j=1}^{N}X_{k+j},\qquad X\in\{P,I,E,T,D\}.
\tag{14.2}
$$

*Provenance (Eq. 14.2):* **[Engineered]**: bookkeeping of Engine 2 series.

The bar of the block says *simulated from the weather record* when the days come from the analogue year, and *from the weather forecast* when the online weather is in use and the days fall in its 16-day forecast (Chapter 19).

**Block 3: Whole year.** For the calendar year of the working date: rain, irrigation, other evaporation (interception, litter, ponded water and snow), soil evaporation, transpiration, drainage, the change in storage and the deepest roots (cm). The water balance of the year closes as

$$
\Delta S=P+I-E_{\mathrm{other}}-E-T-D,
\tag{14.3}
$$

*Provenance (Eq. 14.3):* **[Literature]**: water-balance identity.

and the tile *Storage change* is $\Delta S$.

**Block 4: 20-year averages at these settings.** The annual-model outputs of Engine 1 (Chapter 5): soil evaporation, transpiration, evapotranspiration $\mathrm{ET}=E+T$, drainage, irrigation, yield (Mg/ha for the simulated cereal, per cent of the potential for a library crop), irrigation efficiency, nitrogen leaching, rainfall, and *Irrigation without mulch* (the same case with no mulch, for the saving).

### The pinned baseline

Press **Pin** (or Ctrl+B): the tiles of Block 4 are stored. After any change the tiles show the difference from the pinned values,

$$
\Delta_i=x_i-x_i^{\mathrm{pin}},
\tag{14.4}
$$

*Provenance (Eq. 14.4):* **[Engineered]**: bookkeeping.

with ▲ (increase) or ▼ (decrease), green when the change is in the better direction and red when it is worse, and "= no change" when $|\Delta_i|<10^{-9}$. Lower is better for soil evaporation, drainage, irrigation and nitrogen leaching; higher is better for yield and irrigation efficiency; transpiration, evapotranspiration, rainfall and *Irrigation without mulch* are neutral.

## Design

With a design layer open, the tab shows the results of its **last run**. Before the first run, or after an input changed, it says that the design waits for a run and carries the two buttons **Run simulation** and **Find the most efficient inputs** (Chapter 18). After a run it shows, in folding blocks:

| Block | Contents |
|:--|:--|
| Key results | Surface: $E_a$, $E_s$, deep percolation, runoff, CU, cut-off, fill and advance times, the volumes. Drip: $E_a$, $E_s$, $E_u$, deep percolation, wetted fraction $P_w$, gross application, irrigation time, volumes per emitter. Sprinkler: $E_a$, $E_s$, DU, CU, deep percolation, runoff, gross and net application, set time, discharge, application rate. |
| Warning | For a surface design whose stream does not reach the end of the field in a practical time. |
| Most efficient inputs | The best combination found by the search of Section 18.4, with its $E_a$, $E_s$, deep percolation and runoff, and **Apply these inputs and run**; or *Already the most efficient* when no combination tried beats your inputs. |

The definitions are Eqs. (11.18)–(11.19), (12.19) and (13.11). The Design tab and the *Design results (CSV)* export read the same object, so the numbers agree digit for digit.

![The Dashboard, Design tab, after a run of the surface design.](images/atlas11/ui_u05_dash_design.jpg){width=100%}

## Charts

On the seasonal layers the Charts tab has one chart for each part of the layer, over the twenty seasons, with the year on the clock marked and the rainfed seasons dashed. Under each chart a line tells how the quantity varies: its mean, the 10 to 90 % range, the lowest and the highest season, and the variation from year to year.

* *Reliability over 20 seasons:* irrigation, drainage below 1 m, grain yield, nitrate leaching, evapotranspiration, days of crop water stress.
* *Full water balance:* rain and irrigation, transpiration and soil evaporation, other evaporation, drainage and drainage through biopores, runoff.
* *Nitrogen budget:* nitrogen supplied, taken up and lost.

With a design layer open and run, the tab draws the charts of the run:

| Design | Charts |
|:--|:--|
| Surface | Hydrograph: inflow, infiltration and runoff against time, with the advance time $t_L$ and the cut-off $t_{co}$ marked; advance, cut-off and recession along the field; infiltrated depth along the field against the required depth; the times of the irrigation ($t_L$, $t_s$ to fill the root zone, $t_{co}$, the recession time $t_r$ and the total); where the water goes. |
| Drip | Hydrograph at the pump (the zones run one after the other at the zone flow); the times of the irrigation (run time of a zone, the whole field, the interval); pressure head along the lateral; emitter flow along the lateral; where the water goes. |
| Sprinkler | Hydrograph at the pump (the sets run one after the other); the times of the irrigation; soil intake rate against the application rate; depth caught at each point, sorted (uniformity); where the water goes. |

With any other layer open, three charts of the twenty years around the working date (calendar years on the horizontal axis, mm per year): *Rainfall and irrigation*, *Drainage below the root zone* and *Evaporation and transpiration*. They are the annual sums of the Engine 2 daily series,

$$
Y^{(y)}=\sum_{d\in y}X_d,\qquad X\in\{P,I,D,E,T\}.
\tag{14.5}
$$

*Provenance (Eq. 14.5):* **[Engineered]**: bookkeeping of Engine 2 series.

Every chart sits in its own folding block; a chart that is unfolded is drawn again at once. The pump hydrograph of drip and sprinklers is the step series

$$
Q_{\mathrm{pump}}(t)=Q_z\quad\text{for}\ t\in[\,0,\ n_z\,t_{\mathrm{run}}\,),\qquad 0\ \text{afterwards},
\tag{14.6}
$$

*Provenance (Eq. 14.6):* **[Engineered]**: zones of the layout (Eqs. 12.20–12.23 and the sprinkler analogue) run in turn.

with $Q_z$ the flow of one zone or set, $n_z$ the number of zones or sets and $t_{\mathrm{run}}$ the run time of one zone (drip) or the set time (sprinklers).

![The Dashboard, Charts tab, after a run of the drip design.](images/atlas11/ui_u05_dash_charts.jpg){width=100%}

## Messages

A time-stamped log of what the program did (weather imported, design run, report saved, baseline pinned), newest first, in two folding blocks: *Warnings* (only when there are any) and *All messages*. Use it to find the path of a saved file.
