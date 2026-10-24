# The virtual farm simulation

The virtual farm shows **one irrigation system working in a field** — the source, the pump or the canal gate, the pipes or the head ditch, the laterals, furrows or sprinklers, the crop and the soil — on the days the daily model irrigates. In version 1.1 the farm **follows the run of an irrigation design**: it shows the system of that design, with its inputs and results, on the real soil of the project.

## Opening the farm

* In the Layers panel, under each design layer, click **Virtual farm simulation**.
* On the view bar of any layer, click **▶ Virtual farm simulation**. From a design layer this opens the farm of that design; from any other layer, the farm of the design that belongs to the irrigation method in force (surface method: the surface design; overhead: the sprinkler design; drip methods: the drip design).
* View ▸ *Virtual farm simulation*.

While the farm is open, the irrigation method of the project is set to the method of its design (for example *Surface* for the surface design), so that the daily model irrigates as that system does. **When you leave the farm, the working date and the irrigation method of the project return to what they were.**

## After the run of the design

If the design has not been run, or its inputs or a setting changed since its last run (Eq. 18.0), the farm does not draw a field. It says which design it follows and offers two buttons:

![The farm before its design has run.](images/atlas11/ui_u16_farm_before_run.jpg){width=100%}

* **Run the … design now** runs the design with its present inputs; the farm then appears.
* **Open the design inputs** opens the design layer, to check the inputs first.

## What the farm shows

![The virtual farm of the surface design.](images/ui/farm_sid.jpg){width=100%}

**The system button** at the top names the system and the design it comes from (for example *Border strip · from the surface irrigation design*); clicking it opens the design. **Farmer opens the valve** and **Automatic controller** choose who operates the gate or valve; **Record video (20 s)** saves a film of the farm.

**Each irrigation is simulated.** The daily model gives the dates: the gate or valve opens on the days on which the sensor reaches the trigger. The irrigation of that day is then simulated with the design that was run, so the farm accepts every input of the design and of Properties. On an irrigation day the clock stops and runs the event on the time of the design, from the opening of the gate or valve to the cut-off and, for the surface systems, to the end of the recession. The bar under the buttons follows the event:

* **Surface:** the time since the gate opened against the cut-off time; the inflow (L/s); the position of the water front along the run, from the advance of the design (Eqs. 11.9 and 11.10); the volume applied; the volume infiltrated along the run, from the intake function of the design (Eq. 11.6); and the water left on the surface or run off.
* **Drip:** the depth applied against the gross depth of the design; the depth stored in the root zone; and the width of the wetted bulb, which grows with the cube root of the time.
* **Sprinklers:** the depth applied against the gross depth; the depth stored; and the application rate.

On the other days the bar names the next irrigation and the depth and time of each event of the design. The board at the gate lists the next four irrigations with the net and gross depth and the time open.

**The farm in perspective.** The field is drawn in the colour of the soil of the project, with the crop of the project in rows. For the surface systems the canal, the gate and the head ditch feed the furrows, borders or basins; the water advances along the field with the advance exponent of the design and recedes after the cut-off; runoff collects in the tail ditch. For drip and sprinklers the well, pump, filters, fertiliser tank, mainline, valve, submain and laterals (or sprinklers) carry the water. The gate or valve opens on the days the daily model irrigates — the days on which the sensor reaches the trigger — and the board at the gate lists the next four irrigations with their depths and opening times.

**The section** through the field shows the water of each soil layer of the daily model before the event, and the wetting of the irrigation as it proceeds. For the surface systems the section runs along the field, inlet on the left: the infiltrated depth at each point comes from the opportunity time of the design, and a red dashed line marks the required depth $Z_n$. For sprinklers the wetting varies with the uniformity of the pattern; for drip the bulbs grow around the emitters. The section also shows the roots of the crop and the sensor with its depletion against the trigger.

**The predicted schedule** at the gate or valve for the next 30 days: rain, irrigation, the depletion of the sensor layer and the trigger.

**The irrigation in 3D.** A block of the real soil, one metre deep, cut on two faces, carries the crop on its surface and shows where the water of this (or the next) irrigation goes, with numbered markers matching the legend under it:

![The 3D block: infiltration, water stored in the root zone, deep percolation, runoff and evaporation.](images/ui/farm3d_sid.jpg){width=100%}

1. **Infiltration** — the water that enters the soil;
2. **Stored in the root zone** — from the surface to the depth of the roots of that day (green dashed line);
3. **Deep percolation** — the part that passes below the roots (dark blue on the cut faces);
4. **Runoff** — for surface systems, at the field end; for sprinklers, when the rate exceeds the intake;
5. **Evaporation** — and wind drift for sprinklers.

Each item gives its depth (mm) and its share of the gross depth applied. The shares are those of the last run of the design:

$$
\bigl(f_{\mathrm{st}},f_{\mathrm{dp}},f_{\mathrm{ro}},f_{\mathrm{ev}}\bigr)=\frac{\bigl(E_a,\ DP,\ RO,\ EV\bigr)}{E_a+DP+RO+EV},\qquad
d_x = f_x\,d_{\mathrm{gross}},
\tag{20.1}
$$

*Provenance (Eq. 20.1):* **[Engineered]**: the partition of the design run (Eqs. 11.18, 12.19, 13.11) applied to the gross depth of the event predicted by the daily model.

with $d_{\mathrm{gross}}$ the depth of the irrigation of that day in the daily model. The depth the infiltrated water wets is

$$
z_w = \mathrm{clip}\Bigl(\frac{d_{\mathrm{gross}}\,(f_{\mathrm{st}}+f_{\mathrm{dp}})}{\delta};\ 3,\ 100\Bigr)\ \ [\mathrm{cm}],\qquad \delta=\frac{d_{\mathrm{gross}}\,f_{\mathrm{st}}}{z_r},
\tag{20.2}
$$

*Provenance (Eq. 20.2):* **[Literature]**: the infiltrated water refills each centimetre in turn from the top (the "piston" refill of the FAO-56 root-zone balance). The root zone of depth $z_r$ takes the stored share of the design, so its deficit is $\delta$ mm per cm; the deep percolation wets the soil below at the same deficit. When nothing is stored, $\delta = f_T\,\mathrm{AWC}$, the depleted share $f_T$ of the available water $\mathrm{AWC}$.

For the surface systems the wetted depth varies along the run as the infiltrated depth of the design does (more at the inlet, less at the tail; Eq. 11.16), scaled to the same mean. For sprinklers it varies with the uniformity of the pattern, $z_w(u)=\bar z_w\,[1+1.4(1-\mathrm{CU})\sin 6\pi u]$. For drip the water forms bulbs around the emitters, at the depth of the placement. Below the drawing the soil is named with its sand and clay content and its available water, and the sentence states the depth wetted.

## The farm and the three designs

| Design | What the farm draws |
|:--|:--|
| Surface | The system of the design (border strips, furrows or basins), its inflow and run length, the advance and recession with the advance exponent of the run, runoff in the tail ditch. |
| Drip | Surface drip, or subsurface drip when the placement is 30 cm or deeper; emitters dripping and wetted bulbs at the placement depth. |
| Sprinkler | Sprinklers on risers, the spray, the drift plume, the overlap. |

![The virtual farm of the drip design.](images/ui/farm_drip.jpg){width=100%}

![The virtual farm of the sprinkler design.](images/ui/farm_spr.jpg){width=100%}
