# The Daisy workbench: overview {#daisy-overview}

The Daisy workbench is the part of SWAFL that runs the Daisy 7.1.14 model, draws its results and tests it. It opens from the button Daisy model of the toolbar. The tabs are in groups that follow what a person does: give the data, ask a question, look at the results, decide in the SWAFL project, and, apart from that path, build and test and learn. A bar above every tab on the path, with the buttons Back and Next, leads through the steps in this order (Chapter 31).

| Group | Tab | What it is for |
|:--|:--|:--|
| Input data | Input data | Set the weather (online stations, a file, the stations bundled with Daisy) and the soil of the site once; every simulation uses them. |
| Input data | Parameter library | Read the horizons, crops, fertilisers and other entries of the Daisy library. |
| Experiments | Experiments | Design your own set of runs from 53 factors, or start from 27 best combinations. |
| Experiments | Scenarios | Five ready questions about water, nitrogen, climate, a chemical and soil. |
| Results and analysis | Process map | A map of the model processes with the figures of each one. |
| Results and analysis | Log plots | Load logs (or take the output of your runs) and draw any column of them. |
| Results and analysis | Mass balance | Check that inputs, outputs and content agree. |
| Results and analysis | Run comparison | Compare two logs against the smallest meaningful level. |
| Decision support | To the SWAFL layers | Take the results to the layers of the SWAFL project that turn them into decisions. |
| Model development | Set-up editor | Edit and run a Daisy set-up file. |
| Model development | Soil column | Solve the Richards equation for a soil column. |
| Model development | Response curves | Draw any function of the Daisy library. |
| Model development | Calibration | Search parameters with three optimisers. |
| Documentation | Model and documentation | The model, the questions and where each is answered, the downloads. |

The chapters that follow take the groups in this order. Every screen is shown with numbered arrows; the list under it says what each arrow points to.

**How the weather is chosen.** The weather of a run is chosen once in the strip at the top of the Scenarios, Experiments and Process map tabs, and its source is set in Input data. The choices are the weather of the SWAFL project, the built-in Taastrup weather, one of the bundled stations, online weather of a place and a file of your own. All simulations then use that weather, so a figure and the project always agree.

**What runs where.** The scenarios, experiments, set-up editor and calibration against the Daisy program need the desktop app. Daisy 7.1.14 for Windows comes with SWAFL (the folder `daisy` next to the program) and starts by itself, so nothing has to be installed or downloaded. The soil column, the process curves and the denitrification calibration run in the web version too. The figures of results that are drawn here come from real Daisy runs of the built-in farm for the years 1990 to 1993.

\newpage

## Daisy: governing equations and guiding principles {#daisy-equations}

This chapter gathers the equations and the principles behind the tabs of the Daisy workbench, so that a figure can be read with the law that produced it. The forms below are the ones the workbench itself uses where it computes (Soil column, Process curves, Calibration) and the standard forms of the Daisy reference manual where Daisy computes (the runs of Scenarios and Experiments). Section numbers of the Daisy reference are given in the tab Model and documentation. Symbols: $z$ is the depth below the surface (cm, positive downward), $t$ is time, $\theta$ the volumetric water content ($\mathrm{cm^3\,cm^{-3}}$), $h$ the soil water pressure head (cm, negative when the soil is unsaturated) and $K$ the hydraulic conductivity.

**Guiding principles.** Daisy follows four principles that explain how its figures behave.

1. *Conservation.* Water, nitrogen, carbon and heat are tracked as balances: what enters, what leaves and what changes in storage must agree. The tab Mass balance tests this on any log.
2. *One dimension, many processes.* The soil is a vertical column. Water, heat and solutes move up and down; the processes of Fig. 1 (snow, canopy, litter, pond, biopores, drains, organic matter, crop) are coupled to that column.
3. *Rates with limiting factors.* Most biological rates are a potential rate multiplied by factors between 0 and 1 for temperature, water, oxygen or nutrients, so a figure changes shape when one factor becomes limiting.
4. *Demand and supply.* The atmosphere sets the demand for water and the soil sets the supply; the crop transpires the smaller of the two, and the shortage shows as stress.

### Soil water: the Richards equation

Water flow in the unsaturated column follows the Richards equation, with the Darcy flux $q=K(h)\left(1-\partial h/\partial z\right)$ downward:

$$
\frac{\partial \theta}{\partial t}=\frac{\partial}{\partial z}\!\left[K(h)\left(\frac{\partial h}{\partial z}-1\right)\right]-S(z,t).
$$

Here $S$ is the uptake of water by the roots (1/day). The tab Soil column solves this equation with an implicit finite volume scheme and Picard iteration with the mass conserving capacity term $C(h)=\mathrm{d}\theta/\mathrm{d}h$. Its boundaries are rain and evaporation at the top and a free drain, a closed bottom or a groundwater table at the bottom.

**Retention and conductivity (van Genuchten and Mualem).** With the effective saturation $S_e$ and $m=1-1/n$:

$$
S_e=\left[1+(\alpha\,|h|)^{n}\right]^{-m},\qquad \theta(h)=\theta_r+(\theta_s-\theta_r)\,S_e,
$$

$$
K(h)=K_s\,S_e^{\,l}\left[1-\left(1-S_e^{1/m}\right)^{m}\right]^{2}.
$$

The parameters $\theta_s,\theta_r,\alpha,n,K_s,l$ come from the horizons of the library. Field capacity is read at $h=-100$ cm and the wilting point at $h=-15{,}000$ cm, and the available water of a horizon is $\theta_{FC}-\theta_{WP}$. Daisy also offers the Brooks and Corey and Campbell forms; the tab Process curves draws all of them.

**Root uptake (Feddes).** The potential transpiration $E_{p}$ is spread over the roots in proportion to root density, and reduced by a stress factor $\alpha_s(h)$ that is 1 in the comfortable range of the pressure head and falls to 0 near saturation and towards the wilting point:

$$
S(z)=\alpha_s(h)\,S_p(z),\qquad \int S_p(z)\,\mathrm{d}z=E_p .
$$

### Water balance of the season

Every layer and every season obeys the balance that the tab Mass balance checks and the dashboards print:

$$
P+I=E_s+E_i+T+D+R+\Delta S,
$$

with rain $P$, irrigation $I$, soil evaporation $E_s$, evaporation of intercepted water $E_i$, transpiration $T$, drainage out of the column $D$, runoff $R$ and the change of storage $\Delta S$ (all in mm). The balance residual should be small compared with the largest term.

### Evaporative demand

The atmosphere sets the demand. The reference evapotranspiration follows the Penman and Monteith equation with the daily weather; the potential rate of a crop is the reference rate times a crop coefficient (or, in Daisy, a canopy resistance derived from the leaf area):

$$
ET_0=\frac{0.408\,\Delta\,(R_n-G)+\gamma\,\dfrac{900}{T+273}\,u_2\,(e_s-e_a)}{\Delta+\gamma\,(1+0.34\,u_2)},\qquad ET_c=K_c\,ET_0 .
$$

The canopy shares the demand between soil evaporation and transpiration with the light that reaches the soil, $\exp(-k\,\mathrm{LAI})$ (the Beer and Lambert law with the extinction coefficient $k$).

### Soil heat and ice

Heat moves by conduction and with the water flux:

$$
C_h\,\frac{\partial T}{\partial t}=\frac{\partial}{\partial z}\!\left(\lambda\,\frac{\partial T}{\partial z}\right)-C_w\,q\,\frac{\partial T}{\partial z}+L_f\,\frac{\partial \theta_i}{\partial t},
$$

where $C_h$ is the volumetric heat capacity, $\lambda$ the thermal conductivity, $C_w$ the heat capacity of water and $L_f$ the latent heat of freezing. The temperature sets the factors of the biological rates below and the freezing of the water.

### Solutes: nitrate, ammonium and chemicals

A solute is carried by the water and spread by dispersion, with sorption to the soil:

$$
\frac{\partial(\theta c + \rho_b s)}{\partial t}=\frac{\partial}{\partial z}\!\left(\theta D\,\frac{\partial c}{\partial z}\right)-\frac{\partial (q c)}{\partial z}-\mu\,(\theta c+\rho_b s)-U ,
$$

$$
s=K_d\,c\ \text{(linear sorption)},\qquad D=\lambda_d\,\frac{|q|}{\theta}+D_m\,\tau .
$$

Here $c$ is the concentration in the soil water, $s$ the sorbed amount, $\rho_b$ the bulk density, $\lambda_d$ the dispersivity, $D_m$ the molecular diffusion, $\tau$ the tortuosity, $\mu$ the first order decay and $U$ the uptake by the crop. A mobile tracer has $K_d=0$ and $\mu=0$; the three chemicals of the scenario Pesticide or tracer fate differ in exactly these parameters. For a pesticide, $K_d=K_{OC}\,f_{OC}$ with the organic carbon fraction $f_{OC}$.

### Organic matter, mineralisation and nitrification

The organic matter pools (AOM1, AOM2, SMB1, SMB2, SOM1, SOM2, SOM3 in Fig. 1) decay by first order kinetics, with a part of the decayed carbon built into other pools (the efficiency $E$) and the rest released as carbon dioxide:

$$
\frac{\mathrm{d}C_i}{\mathrm{d}t}=-k_i\,f_T(T)\,f_\theta(h)\,C_i+\sum_j E_{ji}\,k_j\,f_T\,f_\theta\,C_j+\text{inputs},
$$

and the nitrogen follows from the carbon to nitrogen ratio of the receiving pool, so that the soil either releases ammonium (mineralisation) or takes it up (immobilisation). Ammonium is oxidised to nitrate by nitrification, which saturates with the ammonium concentration:

$$
r_{nit}=f_T\,f_\theta\,\frac{V_{max}\,[\mathrm{NH_4^+}]}{K_m+[\mathrm{NH_4^+}]} .
$$

The temperature factor is a piecewise linear function of $T$ or a $Q_{10}$ form, $f_T=Q_{10}^{(T-T_{ref})/10}$.

### Denitrification and nitrous oxide

The tab Process curves and the denitrification screens use the function of the Daisy default model. A potential rate follows the carbon dioxide produced by the fast and the slow organic matter, $r_{pot}=f_T\left(\alpha_F\,\mathrm{CO_2^{fast}}+\alpha\,(\mathrm{CO_2}-\mathrm{CO_2^{fast}})\right)$. It is limited by the water filled pore space, $f_w(\mathrm{WFPS})$, a rising function from 0 at 40 % to 1 at 90 %, and by the nitrate present:

$$
r_{act}=\min\!\left(f_w\,r_{pot,\,slow},\,K_d\,[\mathrm{NO_3^-}]\right)+\min\!\left(f_w\,r_{pot,\,fast},\,K_d\,[\mathrm{NO_3^-}]\right).
$$

The gas formed is split between nitrous oxide and dinitrogen with the ratio $f_r=\mathrm{N_2}/\mathrm{N_2O}$ that falls with nitrate, rises with carbon dioxide and with the wetness:

$$
\mathrm{N_2O}=\frac{r_{act}}{1+f_r},\qquad \mathrm{N_2}=\frac{r_{act}}{1+1/f_r}.
$$

### The crop: light, assimilates and growth

The crop module follows the chain of the right half of Fig. 1.

1. *Light interception.* The absorbed light is $I_a=I_0\left(1-e^{-k\,\mathrm{LAI}}\right)$ with the leaf area index summed down the canopy.
2. *Photosynthesis.* The gross assimilation of a leaf layer rises with light and saturates, $A=A_{max}\left(1-e^{-\varepsilon I/A_{max}}\right)$ with the quantum efficiency $\varepsilon$, and is reduced by water stress (through the stomata), by temperature, by senescence and by the nitrogen content of the leaves (the boxes Stress factors and Senescence).
3. *Respiration.* The assimilate pool loses maintenance respiration, $R_m=\sum_o r_o\,f_T\,W_o$ over the organs $o$ (root, stem, leaf, storage organ) with a $Q_{10}$ temperature factor, and growth respiration as a fraction of what is built into the organs.
4. *Partitioning.* What remains is shared between the organs by fractions that depend on the development stage $DS$ (0 at emergence, 1 at flowering, 2 at maturity); the storage organ takes the largest share after flowering and gives the yield at harvest.
5. *Development.* The development stage advances with the temperature sum (and, for some crops, with day length): $\mathrm{d}DS/\mathrm{d}t=f(T,\text{photoperiod})$.

### How the equations reach the screens

| Tab | Law behind the figure | Where it is computed |
|:--|:--|:--|
| Scenarios and Experiments | All of the above, in Daisy 7.1.14 | Daisy in the desktop app |
| Process map | The processes of Fig. 1 and the factors that act on them | Map and tables of the workbench |
| Log plots, Run comparison | The columns of the logs, differences and the smallest meaningful level | The workbench |
| Mass balance | $\text{inputs}-\text{outputs}-\Delta\text{content}=\text{residual}$ per quantity | The workbench |
| Soil column | Richards equation, van Genuchten and Mualem, Feddes | The workbench (own solver) |
| Process curves | Retention, conductivity, $Q_{10}$, Michaelis and Menten, denitrification | The workbench |
| Calibration | Loss $\mathrm{MSE}=\frac1n\sum(y_i-\hat y_i)^2$ minimised by three optimisers | The workbench with Daisy runs |

\newpage

