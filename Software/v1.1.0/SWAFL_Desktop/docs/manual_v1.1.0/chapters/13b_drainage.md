# Drainage design

The drainage layer designs the **drains that keep the water table below the roots** for the soil, the crop and the irrigation design of the case. It sits under *Irrigation design* (S5) because the water an irrigation design loses to deep percolation is the water the drains must remove. Everything in it is computed, not drawn: change the soil, the crop, the rain, the mulch or the irrigation design anywhere in the program and the spacing, the pipes and the water table change with them.

The layer reads top to bottom: the controls; the recharge; the spacing; the cross-section between two drains; the water table through the season; the layout and the pipes; the same drains in every soil; the result and what it means for the farm.

## The controls

**Crop and mulch** are the same controls as in the other design layers. The crop sets the root zone, and with it the depth the water table must stay below ($z_c = 0.3 + 0.4\,R_{max}$ in metres, between 0.4 and 0.9 m, $R_{max}$ the rooting depth; tap the label to return to this value after a manual change).

**Drain type.** *Pipe drain* is a perforated corrugated pipe in a trench with an envelope. *Pipe with control gate* adds a gate in the control chamber, raised above the pipe, that holds the water table up (controlled drainage). *Open ditch* is an open field drain with a trapezoidal section (side slope 1.5, water depth 0.3 m, bottom width set by the slider); it needs a wider trench and takes land, and its wetted perimeter replaces the one of the pipe in the equivalent depth.

**Design basis.** *Steady flow* uses the Hooghoudt equation (below). *Falling water table* uses the Glover and Dumm equation: after a wet spell the water table must fall to the allowed depth within the drainage time. *Both* takes the closer spacing.

**Spacing** and **Design flow** are automatic (from the design and from the DSS recharge) or manual. A manual choice is taken as given; the water table then shows whether it works.

**Sliders.** Drain depth (0.6 to 2.4 m), barrier depth $D$ below the drain level (0.3 to 12 m), subsoil conductivity as a multiple of the topsoil (0.1 to 3), time to lower the water table (1 to 10 days), field length (50 to 1000 m, also the lateral length), field width (50 to 800 m), pipe slope (0.02 to 1 %), the depth the water table must stay below (0.3 to 1.2 m), the spacing and the discharge when manual, the gate height (0 to 0.9 m, with the largest height that still keeps the water table below the crop), the width of the ditch bottom and the salt tolerance of the crop (ECe, 1 to 10 dS m$^{-1}$).

## Recharge

The recharge is the **deep percolation of the DSS day by day**: the water that leaves the root zone of the daily balance (rain not stored, and the irrigation not stored), plus the part of the irrigation applied that the irrigation design in use loses to deep percolation (the design result *deep percolation* times the gross water, the gross water being the net irrigation divided by the application efficiency). A surface design with a low efficiency therefore needs more drainage than a drip design on the same field. The design discharge is the 95th percentile of the three-day mean recharge of the season, between 2 and 25 mm per day, unless you type it.

## Spacing

For steady flow to drains, with the recharge $q$ (m d$^{-1}$), the water table held at the height $h$ (m) above the drain level midway between the drains, the conductivity $K_1$ above and $K_2$ below the drain level, the **Hooghoudt equation** gives the spacing $L$:

$$
q\,L^{2} = 8\,K_{2}\,d\,h + 4\,K_{1}\,h^{2}
$$

The equivalent depth $d$ replaces the real depth $D$ of the barrier, because the flow converges on the drain (radial flow). The layer does not read $d$ from a table: it solves the exact series of Moody and van Beers,

$$
d = \frac{\pi L / 8}{\ln\!\left(L/u\right) + F(x)},\qquad F(x)=\sum_{n=1,3,5,\dots}\frac{4\,e^{-2 n x}}{n\,\left(1-e^{-2 n x}\right)},\qquad x=\frac{2\pi D}{L}
$$

with $u$ the wetted perimeter of the drain ($u=\pi r_0$ for a pipe running half full) and $d\le D$. Because $d$ depends on $L$, the equation is solved by iteration (it converges in a few steps). The head allowed is $h = z_d - z_c$: the drain depth less the depth the water table must stay below.

For a **falling water table**, the equation of Glover and Dumm gives the spacing from the time $t$ in which the water table must fall from $h_0$ to $h_t$ above the drain level:

$$
L^{2} = \frac{\pi^{2}\,K\,d\,t}{\mu\,\ln\!\left(1.16\,h_{0}/h_{t}\right)}
$$

where $\mu$ is the drainable porosity (the saturated water content less the water content at field capacity of the soil in use, between 0.03 and 0.25) and $K$ the conductivity weighted by the thickness above and below the drain. The curves of the layer show the spacing against the design discharge for the drains at the chosen depth and 0.3 m shallower and deeper: a deeper drain always allows a wider spacing.

## The cross-section

Two drains and the soil between them, to scale in metres: topsoil above the drain level, subsoil below it, the barrier hatched, the roots of the crop and the red dashed line of the depth the crop needs. The curve is the water table; its height midway is the Hooghoudt head at the design discharge,

$$
h = \frac{-8 K_{2} d + \sqrt{64 K_{2}^{2} d^{2} + 16 K_{1}\,q\,L^{2}}}{8 K_{1}}
$$

and the curve between the drains follows the shape of the flow (a parabola-like arc). With the gate raised by $g$, the outflow depends on $h-g$, so the water table midway stands $g$ higher; the right panel shows it, with the control chamber and the gate. *Run simulation* raises the water table from the drain level to its design level.

## The water table through the season

The daily balance of the water table: $\mu\,dh/dt = R - q_{out}(h-g)$, with $R$ the recharge of the day and $q_{out}(h) = (8 K_2 d h + 4 K_1 h^2)/L^2$, the outflow of the drains at the height $h$ of the water table (steady-state outflow function, six sub-steps a day). When the water table reaches the surface the excess runs off. The results are the **days with the water table shallower than the crop needs**, the **SEW30** of Sieben (the sum over the days of $30 - z$ in cm, when the water table is shallower than 30 cm; a measure of the excess water in the root zone), the water drained, the largest outflow, the surface runoff, the water held in the soil by the gate ($\mu\,g$) and the **leaching requirement** of Rhoades, $LR = EC_w/(5\,EC_e - EC_w)$, from the water of the irrigation (Properties, *salt of the irrigation water*) and the salt tolerance of the crop.

Not subtracted: evapotranspiration from the water table and lateral seepage. The water table shown is therefore on the safe side (too shallow rather than too deep) and the saving of controlled drainage is a minimum.

## Layout and pipes

The field to scale with the laterals (spaced $L$, running the field length), the collector along the outlet side, the control chamber and the receiving ditch. The pipes are sized with the Manning equation for a full pipe,

$$
Q = \frac{1}{n}\,\frac{\pi D^{2}}{4}\left(\frac{D}{4}\right)^{2/3} s^{1/2}
$$

with $n = 0.016$ (corrugated polyethylene), the slope $s$ of the slider, and the pipe from the standard sizes (80 to 500 mm) that carries the design flow at no more than 80 % of its capacity. The lateral flow is $q\,L\,L_{lat}$, the collector flow is $q\,A$. The table gives the longest lateral the pipe can serve, the speed of the full pipe (below 0.3 m s$^{-1}$ silt settles), the pipe laid and the volume of the trench.

## The same drains in every soil

The spacing at your design discharge and depth with the conductivity of each soil of the program (Saxton and Rawls). Tap a row to use that soil in the whole program: the sandy soils allow a spacing of 100 m and more, the clays 20 m or less, and the pipe per hectare follows.

## References used

Jha, M. K. and Yellareddy, K., *Drainage Engineering* (Hooghoudt, Ernst, Glover and Dumm, pipes); FAO, *Drainage of irrigated lands*, Irrigation Water Management Training Manual 9 (drainage need, crop sensitivity, leaching); Skaggs, R. W. and van Schilfgaarde, J. (eds.), *Agricultural Drainage* (water table management, SEW30); Vlotman, W. F. *et al.*, *Modern Land Drainage* (design of pipe and ditch systems, controlled drainage).
