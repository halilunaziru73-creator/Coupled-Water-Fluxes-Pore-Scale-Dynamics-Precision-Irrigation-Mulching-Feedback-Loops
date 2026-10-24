# Weather data: your own file, or the weather of a place

Without weather data of your own, SWAFL runs on the twenty recorded years of its study site. Version 1.1 lets every layer run on **your weather**: a daily weather file, or the measured daily weather of any place on Earth with its 16-day forecast. The change is seen at once in every layer, the dashboard, the schedules and the crop water requirement.

## Where to start

* **File ▸ Import weather data (CSV, Excel, DWF, DLF, DAI)…**, Tools ▸ *Import weather data…*, or the **Import weather…** button in Properties ▸ Scenario.
* **File ▸ Online weather for a location…**, Tools ▸ *Online weather for a location…*, or the **Online weather…** button.
* Properties ▸ Scenario ▸ **Weather source** switches between *Built-in weather record*, *Imported weather file* and *Online weather of a location*. The last two can be chosen only after a file has been imported or the weather of a place fetched.

## Importing a file

![The weather import dialog.](images/ui/dlg_weather_import.jpg){width=100%}

**Accepted files.**

| Format | Reading |
|:--|:--|
| CSV or TXT | comma, semicolon, tab or space separated; the separator is found from the first lines |
| Excel (XLSX, XLS, ODS) | the first sheet |
| DWF (Daisy weather file) | header lines, a line of dashes, the column names, a units line, then the data; hourly values are summed to days |
| DLF (Daisy daily log) | as DWF |
| DAI (Daisy setup file) | holds no weather; the program reads the name of the weather file it uses and asks you to import that file |

**Columns.** The columns are found by their names, in any order and with or without units:

| Quantity | Names recognised |
|:--|:--|
| Date | `date`, `datetime`, `time`; or `year`, `month`, `day`; or `year` and `doy` (day of year) |
| Rainfall (mm) | `precip…`, `rain…`, `prcp`, `ppt`, `P`; values in inches when the header says `in` or `inch` |
| Reference evapotranspiration (mm) | `ET0`, `ETo`, `ref…evap…`, `PET`, `potential evap…` |
| Temperature (°C) | `Tmax`, `Tmin`, `Tmean`, `air temp…`, `Tavg` |
| Global radiation | `rad`, `srad`, `globrad`, `solar` (MJ m$^{-2}$ d$^{-1}$, or W m$^{-2}$ when the values exceed 60) |

**Reference evapotranspiration.** When the file has no ET0 column, it is computed. With daily maximum and minimum temperature, by Hargreaves:

$$
ET_0 = 0.0023\,(T_{\mathrm{mean}}+17.8)\,\sqrt{T_{\max}-T_{\min}}\;R_a\;0.408\quad[\mathrm{mm\,d^{-1}}],
\tag{19.1}
$$

*Provenance (Eq. 19.1):* **[Literature]**: Hargreaves and Samani (1985), FAO-56 Eq. 52; $R_a$ the extraterrestrial radiation (MJ m$^{-2}$ d$^{-1}$) at the latitude typed in the dialog (FAO-56 Eq. 21).

With daily mean temperature and global radiation $R_s$, by Makkink:

$$
ET_0 = 0.61\,\frac{\Delta}{\Delta+\gamma}\,\frac{R_s}{2.45} - 0.12,\qquad \Delta=\frac{4098\cdot0.6108\,e^{17.27T/(T+237.3)}}{(T+237.3)^2},\quad \gamma=0.066\ \mathrm{kPa\,K^{-1}},
\tag{19.2}
$$

*Provenance (Eq. 19.2):* **[Literature]**: Makkink (1957), as used in the Netherlands and Denmark.

Without either, the seasonal pattern and the annual demand of the built-in climate are used, and the dialog says so.

## Putting the weather on the twenty-year grid

The program works on twenty years of 365 days. The weather is put on that grid as follows:

1. The **last twenty complete years** of the file are used (a year is complete with at least 300 days). With fewer years, the available years are repeated in turn, and the dialog says how many.
2. Leap days are dropped. A missing day of rain is filled from the same day of another year of the file; a missing day of ET0 from the mean of that day of the year.
3. The mean annual rainfall $\bar P$ and reference evapotranspiration $\overline{ET_0}$ are computed.

The daily model (Engine 2) then uses the daily rain $P_k$ of your weather, scaled to the rainfall scale of Properties, and the daily evaporative demand in proportion to your daily ET0:

$$
P^{\mathrm{model}}_k = P_k\,\frac{\rho}{\rho_{\mathrm{ref}}},\qquad e_k = \frac{ET_{0,k}}{\overline{ET_{0}}/365}\quad(\text{the shape of the demand through the year}),
\tag{19.3}
$$

*Provenance (Eq. 19.3):* **[Engineered]**: the daily sequence of your weather replaces the generated rainfall (Eqs. 5.15–5.16) and the seasonal demand weight.

with $\rho$ the rainfall scale of Properties and $\rho_{\mathrm{ref}}$ the step chosen for your weather by Eq. (19.4). The annual model (Engine 1) works on the simulated steps of rainfall and warming; it is set to the steps nearest your weather,

$$
\rho_{\mathrm{ref}} = \operatorname*{nearest}_{\rho\in\{0.5,\dots,1.4\}}\ \frac{\bar P}{P_{\mathrm{rec}}},
\tag{19.4}
$$

*Provenance (Eq. 19.4):* **[Engineered]**: nearest simulated step; $P_{\mathrm{rec}}$ the mean annual rain of the built-in record (464 mm).

$$
\Delta T_{\mathrm{ref}} = \operatorname*{nearest}_{\Delta T\in\{-1,\dots,3.5\}}\ \frac{\overline{ET_0}/E_{\mathrm{rec}}-1}{0.035},
\tag{19.5}
$$

*Provenance (Eq. 19.5):* **[Engineered]**: the evaporative demand expressed as the warming that gives it (3.5 % per °C, Eq. 5.26); $E_{\mathrm{rec}}$ the mean annual reference ET of the built-in record (about 870 mm).

When your weather lies outside the simulated range (for example 1,500 mm of rain, more than 1.4 times the record), the annual results use the nearest step and the dialog says so; the daily layers use your weather as it is.

The crop water requirement (Chapter 21) uses your daily rain and ET0 directly.

**The years.** With your weather, the twenty years of the grid are the calendar years of your record, so a working date inside them shows that very day of your weather (Eq. 4.2).

**After the import** a report lists the years used, the days in the file, the mean annual rain and ET0, how ET0 was obtained, the rainfall and temperature steps of the annual model, the columns read, and any notes (repeated years, filled gaps, values outside the simulated range).

## The weather of a place

![The online weather dialog.](images/ui/dlg_weather_online.jpg){width=100%}

Type the name of a town, village or district and press **Find**, then choose the place from the list; or type its latitude and longitude. **Get the weather** fetches:

* the measured daily rain, reference evapotranspiration (FAO Penman–Monteith) and maximum and minimum temperature of the place from 1 January twenty years ago to two days ago;
* the forecast for the next 16 days;
* for the rest of the current year after the forecast, the same days of the most typical year of the record (median rain).

The weather is then put on the grid as above. On the dashboard, the *Next 14 days* block says *from the weather forecast* while the days fall in the forecast.

The online weather needs the internet; everything else does not. If the place search or the weather service cannot be reached, the dialog says so and **the current weather stays in use**; nothing else changes. The service is a free public weather archive that needs no key.

## Switching back

Choose *Built-in weather record* in Properties ▸ Scenario ▸ *Weather source*. The rainfall scale and temperature shift you had before the import come back. The imported file and the online weather stay available in the list until the program is closed.
