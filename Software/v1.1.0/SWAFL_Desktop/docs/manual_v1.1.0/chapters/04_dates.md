# Dates, years and the clock

## Why the date matters

SWAFL runs on **twenty years of daily weather** arranged on a 365-day calendar without leap days. With the built-in weather these are the twenty recorded years 1980 to 1999 of the study site (Chapter 5); with imported or online weather they are the last twenty complete years of your own record (Chapter 19). The program maps *any calendar date* you choose onto one of those twenty years. The working date therefore decides (i) which day is drawn, (ii) which of the twenty years acts as the *analogue* for that date, and (iii) the first line of every irrigation schedule.

## The date control

The **Date** box on the toolbar and the **Year** and **Date in the season** controls in Properties ▸ Scenario all set the same working date; the year list runs from 1980 to 2100. **Today** sets the computer's date. When you change the date:

1. With the built-in weather, a year from **1980 to 1999** is its own analogue: that recorded year is drawn.
2. With imported or online weather, a year inside the twenty years of your record is its own analogue in the same way.
3. Any other year (for example 2026 or 2075) takes the **typical** year of the record as its analogue: the median of the twenty years by growing-season rain reaching the soil.
4. The engine sets the field clock to day-of-year $d_{\mathrm{oy}}$ of the analogue year, so that 22 October 2029 shows the crop state, soil water and irrigation events of the analogue year on 22 October.

In version 1.0 a *Weather year* control let you choose the typical, the driest or the wettest year for dates outside the record. In version 1.1 the typical year is always used for those dates; to study a dry or a wet year, choose that year inside the record (the *Full water balance* layer of the Seasonal data group shows the rain of each of the twenty years), or import weather.

With $Y_0$ the calendar year of the chosen date, $a$ the analogue year index $(0,\dots,19)$ and $k$ the model day number $(0,\dots,7299)$ of the twenty-year run,

$$
k_{\mathrm{start}} = 365\,a + d_{\mathrm{oy}}, \qquad
\text{date}(k) = \text{1 Jan of year } \bigl(Y_0 + \lfloor k/365\rfloor - a\bigr) + \bigl(k - 365\lfloor k/365\rfloor\bigr)\ \text{days},
\tag{4.1}
$$

*Provenance (Eq. 4.1):* **[Engineered]**: calendar bookkeeping and choice of analogue year; no physical law.

and the calendar label of the first plotted year is $\mathrm{CAL}_0 = Y_0 - a$. The choice of analogue year is

$$
a = \begin{cases}
\mathrm{argsort}_y\,(P_{\mathrm{thr},y})_{[10]} & \text{typical (median, 11th smallest of 20): years outside the record}\\
Y_0 - Y_{\mathrm{rec}} & Y_{\mathrm{rec}}\le Y_0\le Y_{\mathrm{rec}}+19
\end{cases}
\tag{4.2}
$$

*Provenance (Eq. 4.2):* **[Engineered]**: calendar bookkeeping and choice of analogue year; no physical law.

where $P_{\mathrm{thr},y}$ is the sum of throughfall (rain reaching the soil) in year $y$ (Section 5.2) and $Y_{\mathrm{rec}}$ is the first year of the record (1980 for the built-in weather, the first of the twenty years of your weather otherwise).

**What this means for you.** A date in 2029 is *not* a forecast for 2029 unless the online weather is in use and the date falls in its 16-day forecast. Otherwise it shows how this soil, crop, trigger and method would behave on that day of the year in a typical year. Chapter 17 repeats this as a validity limit.

## The playback bar

Under the drawing, the **playback bar** carries the play button (F5) and, for the field layers, the *Day by day*, *All 20 years* and *Average year* views and the speed buttons. In the field layers the play button animates the field clock: each real second advances 15 model days times the speed setting, and the clock *dwells* for about $3.2/\sqrt{\text{speed}}$ s on every day on which an irrigation, a wetting front of at least 20 cm, or drainage occurs. The clock wraps at the end of the twenty years. **Restart** (Shift+F5) returns to day 1 of the working year. In the three design layers the same button is **Run simulation** (Chapter 18). The year strip that sat under the drawing in version 1.0 has gone: the year is set only in Properties and on the toolbar.

## The 14-day look-ahead

The "Next 14 days" block on the Results tab sums the same simulated daily fluxes from the working date forward. It is labelled *simulated from the weather record* because the rain on those days is the analogue year's rain. When the online weather is in use and the days fall in its 16-day forecast, the block says *from the weather forecast* instead (Chapter 19).

## Detail year and sensor record

The *Sensor and trigger* and *Profile evolution* layers can show either all twenty years or one year in detail. The suction traces shown there are the study's **daily suction at 20 cm for 1980 to 1999**, stored for the Coarse Loam and the Coarse Sand; for every other soil, and for every setting other than the standard one, the trace is moved by the difference between two runs of the daily model, the run at your settings and the run at the standard settings (Eq. 6.4a). The growing season of these records is the 183 days starting 1 April.
