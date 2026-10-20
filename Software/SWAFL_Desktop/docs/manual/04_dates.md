# Dates, years and the clock

## Why the date matters

SWAFL does not use a weather forecast. It uses **twenty simulated weather years** (the 1980–1999 record at the study site, Chapter 5), arranged on a 365-day calendar without leap days, and it maps *any calendar date* you choose onto one of those years. The working date therefore decides (i) which day is drawn, (ii) which simulated year acts as the *analogue* for that date, and (iii) the first line of every irrigation schedule.

## The date control

The **Date** box on the toolbar (and the *Date in the season* control in Scenario) accepts any date. **Today** sets the computer's date. When you change the date:

1. If the year is **1980–1999**, that exact recorded year is the analogue, and the weather-year selector follows it.
2. Otherwise (2000–2100 or earlier than 1980) the analogue is chosen by the **Weather year** control: the *typical* year (the median of the twenty by growing-season effective rain), the *driest*, or the *wettest*.
3. The engine sets the field clock to day-of-year $d_{\mathrm{oy}}$ of the analogue year, so that a date such as 22 Oct 2029 shows the crop state, soil water and irrigation events the analogue year had on 22 October.

Formally, with $Y_0$ the calendar year of the chosen date, $a$ the analogue year index $(0,\dots,19)$ and $k$ the model day number $(0,\dots,7299)$ of the twenty-year run,

$$
k_{\mathrm{start}} = 365\,a + d_{\mathrm{oy}}, \qquad
\text{date}(k) = \text{1 Jan of year } \bigl(Y_0 + \lfloor k/365\rfloor - a\bigr) + \bigl(k - 365\lfloor k/365\rfloor\bigr)\ \text{days},
\tag{4.1}
$$

*Provenance (Eq. 4.1):* **[Engineered]**: calendar bookkeeping and choice of analogue year; no physical law.

and the calendar label of the first plotted year is $\mathrm{CAL}_0 = Y_0 - a$. The choice of analogue year is

$$
a = \begin{cases}
\mathrm{argsort}_y\,(P_{\mathrm{thr},y})_{[10]} & \text{typical (median, 11th smallest of 20)}\\
\arg\min_y P_{\mathrm{thr},y} & \text{dry}\\
\arg\max_y P_{\mathrm{thr},y} & \text{wet}\\
Y_0 - 1980 & 1980\le Y_0\le 1999
\end{cases}
\tag{4.2}
$$

*Provenance (Eq. 4.2):* **[Engineered]**: calendar bookkeeping and choice of analogue year; no physical law.

where $P_{\mathrm{thr},y}$ is the sum of throughfall (rain reaching the soil) in simulated year $y$ (Section 5.2).

**What this means for you.** A date in 2029 is *not* a forecast for 2029. It shows how this soil, crop, trigger and method would behave on that day of the year in a typical (or dry, or wet) year. Chapter 17 repeats this as a validity limit.

## The year strip and the Play bar

Under the drawing, the **year strip** lists the 20 plotted calendar years. Click a year to jump to the same day of that analogue. The **Play** button (F5) animates the field clock: each real second advances 15 model days times the speed setting, and the clock *dwells* for about $3.2/\sqrt{\text{speed}}$ s on every day on which an irrigation, a wetting front of at least 20 cm, or drainage occurs, so you can watch each event. The clock wraps at the end of the twenty years. **Restart** (Shift+F5) returns to day 1 of the working year.

## The 14-day look-ahead

The "Next 14 days" block on the Results tab sums the same simulated daily fluxes from the working date forward. It is labelled *simulated, not a forecast* because the rain on those days is the analogue year's rain.

## Detail year and sensor record

Layers V1 and V2 can show either all twenty years (*All 20 years*) or one year in detail (*1994 detail*). The detail year is the Weather-year control. The suction traces shown there are the study's **daily suction at 20 cm for 1980–1999**, stored for the Coarse Loam and the Coarse Sand; every other soil uses the nearer of the two, and the drawing says so (*nearest simulated soil to …*). The growing season of these records is the 183 days starting 1 April.
