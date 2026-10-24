# Seasonal data: twenty seasons, year by year

The group *Seasonal data* of the Layers panel holds three layers built on the **year-by-year results of the simulations**: the twenty growing seasons of each run, not only their mean. They show how reliable a setting is from one year to the next. In version 1.0 the group was called *Year by year (Daisy data)*; the name of the simulation model has gone from the program and is given here.

## Where the yearly values come from

For each soil the simulations hold the twenty yearly values of rain, irrigation, evaporation, transpiration, drainage, storage change, yield and nitrogen of the reference runs (irrigated and rainfed). A layer reads the run nearest your settings and moves each year by the response of the annual model to your settings,

$$
P_y'=\rho\,P_y,\qquad X_y' = X_y\ \mathrm{clip}\Bigl(\frac{X^{\mathrm{model}}(\text{your settings})}{X^{\mathrm{model}}(\text{reference})};\ 0,\ 6\Bigr)\ \ (X\in\{I,T,E,E_{\mathrm{other}},N_L,Y\}),
$$
$$
D_y'=\begin{cases}D_y\,\dfrac{D^{\mathrm{model}}}{D^{\mathrm{model}}_{\mathrm{ref}}} & \bar D>5,\ D^{\mathrm{model}}_{\mathrm{ref}}>5\\[4pt] D_y+\bigl(D^{\mathrm{model}}-D^{\mathrm{model}}_{\mathrm{ref}}\bigr) & \text{otherwise}\end{cases},\qquad ET_0'=ET_0\,(1+0.035\,\Delta T),
\tag{22.1}
$$

*Provenance (Eq. 22.1):* **[Data-driven]**: the yearly values of the simulations, moved by the ratio (or, for small drainage, the difference) of Engine 1 between your settings and the reference of the run (your mulch, rain ×1.0, no warming, nitrogen 100 %); for a library crop the yield is the relative yield of Eq. (21.5) year by year and the irrigation follows the ratio of the two crop balances of Section 21.4.

so that every year follows the crop, rain, temperature, nitrogen, mulch, trigger and method you set, while keeping the weather sequence of the record. A sentence under each layer names the run used and the adjustment made. The calendar years on the axes end in the working year.

## Reliability over 20 seasons

![Reliability over 20 seasons.](images/atlas11/L_yby_p1.jpg){width=100%}

*Reliability of this setting over the 20 seasons*: the irrigation, drainage, yield (or relative yield) and water stress of each season, with their mean and spread. *How often a given irrigation is exceeded*: the twenty seasonal irrigation amounts sorted into an exceedance curve, so that the amount needed in four years out of five can be read off. Click a year to set the working year to it.

## Full water balance

![Full water balance.](images/atlas11/L_wb2_p1.jpg){width=100%}

*Where the water comes from (up) and where it goes (down)*: the complete balance of each season, $P+I=E+T+E_{\mathrm{other}}+D+\Delta S$, stacked year by year, so that a dry season (high irrigation, little drainage) and a wet season can be told apart at a glance. *Evapotranspiration split into all its parts*: transpiration, soil evaporation, canopy, litter, ponded and snow evaporation (20-year mean). *The atmosphere*: reference demand, potential and actual evapotranspiration, year by year. *How the water enters and leaves the soil*: infiltration through the soil matrix and the macropores, runoff and drainage.

## Nitrogen budget

![Nitrogen budget.](images/atlas11/L_nb_p1.jpg){width=100%}

*Supply (up) against uptake and losses (down)*: fertiliser and mineralisation against crop uptake, leaching, denitrification and volatilisation, season by season; *Nitrogen use (20-year mean)*; and *Nitrate goes where the water goes*: the leaching of every season against its drainage, with the regression line. The slope of that line is printed under the chart: *each extra millimetre of drainage carries … kg N/ha of nitrate*.
