# Your data {#daisy-data}

The first group holds everything that describes the site: weather, soil and the files of earlier runs.

### My data: the starting screen

My data is the first tab of the group Your data. It is where the weather and the soil of the site are set once; Scenarios, Experiments and Processes all read them from here. With nothing changed, the built-in weather of Taastrup and the built-in loam and sand are used.

![My data: the starting screen. Screen 1 of the Daisy workbench.](images/daisy11/dz_data_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Weather choice.** Where the weather comes from: the built-in weather, the weather of the SWAFL project, online weather of a place, or a file of your own.
2. **Weather in use.** A summary of the weather that will be used: its name, years, mean rain and mean temperature, and the checks that were made.
3. **My soil.** Tick to describe your own soil horizons instead of the two built-in soils.

\newpage

### My data: online weather of a place

With Online weather of my area the place is typed once; Find looks it up and fills the site boxes, and Get the weather reads the daily data of the chosen years from the internet. Only complete years up to last year are asked for.

![My data: online weather of a place. Screen 2 of the Daisy workbench.](images/daisy11/dz_data_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Online weather.** The choice that shows the place controls below.
2. **Place.** A town, a village or a farm name.
3. **Find.** Looks the place up and fills the latitude, longitude and elevation.
4. **First year.** First year of the weather record to read.
5. **Last year.** Last complete year of the record; the current year is not available yet.
6. **Get the weather.** Reads the daily rain, temperatures, radiation and reference evapotranspiration and checks them before use.
7. **Latitude.** Needed to work out radiation when it is not in the data; found automatically from the place name when possible.

\newpage

### My data: a weather file of your own

A weather file may be a Daisy weather file (.dwf) or a table (CSV, TXT) with a date column and the columns rain and temperature. The radiation unit is chosen or found out from the values.

![My data: a weather file of your own. Screen 3 of the Daisy workbench.](images/daisy11/dz_data_03.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **My weather file.** The choice that shows the file chooser.
2. **File chooser.** Choose a .dwf, .csv, .txt, .dat or .tsv file.
3. **Radiation unit.** MJ per square metre and day, kWh per square metre and day, or W per square metre; leave on find out when unsure.

\newpage

### My data: a Daisy weather station file read and checked

Here the Foulum station file of the bundled data was chosen as a file of your own. The line under the choice reports the years, the mean rain and temperature, the columns that were used and the notes of the checks.

![My data: a Daisy weather station file read and checked. Screen 4 of the Daisy workbench.](images/daisy11/dz_data_04.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **File read.** The file that was chosen.
2. **Result of the reading.** Name, first and last year, complete years, mean annual rain, mean temperature and the columns used.
3. **Site.** The latitude, longitude and elevation read from the header of the file.

\newpage

### My data: my own soil

My soil takes the horizons from the surface down to at least 100 cm: lower limit, sand, silt and clay in per cent, humus in per cent and dry bulk density. Water retention and conductivity are then taken from the HYPRES pedotransfer function in Daisy.

![My data: my own soil. Screen 5 of the Daisy workbench.](images/daisy11/dz_data_05.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **My soil.** Switches the table of horizons on; the soil choice of Scenarios and Experiments is then replaced by this soil.
2. **Horizons.** One row for each horizon: lower limit, sand, silt, clay, humus and bulk density.
3. **Add a horizon.** Adds a row at the bottom.
4. **Soil table import.** A CSV with the columns depth, sand, silt, clay and, if possible, humus and bulk density can be imported instead.

\newpage

### Files: collecting Daisy output and set-up files

Files collects everything Daisy writes or reads: output logs (.dlf), weather files (.dwf), tables (.csv) and set-up files (.dai). Whatever is loaded here is available to the plots, the mass balance, the comparison, the calibration and the soil column.

![Files: collecting Daisy output and set-up files. Screen 6 of the Daisy workbench.](images/daisy11/dz_files_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Add files.** Chooses one or several files.
2. **Add a folder.** Reads every Daisy file of a folder, for example a whole experiment folder.
3. **Load all bundled examples.** Loads every example log that comes with the program.
4. **Drop area.** Files and folders can also be dropped here.
5. **Bundled examples.** The example logs from the repositories of the Daisy model; load them one by one.
6. **Loaded logs.** The logs that are loaded now, with their columns.

\newpage

### Files: the bundled logs loaded

After Load all bundled examples every log appears in the list of loaded logs with its number of rows and columns.

![Files: the bundled logs loaded. Screen 7 of the Daisy workbench.](images/daisy11/dz_files_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Load all.** The button that was pressed.
2. **Loaded logs.** Each loaded log with its size; click a name to see its columns.
3. **Status.** A message that says what was read.

\newpage

### Library: soil horizons

The Library holds the soil horizons, crops, fertilisers, chemicals and management actions of the Daisy library files, read in full. A soil horizon can be opened to see its water retention and conductivity curves.

![Library: soil horizons. Screen 8 of the Daisy workbench.](images/daisy11/dz_library_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Kind of entry.** Soil horizons, crops, fertilisers, chemicals and management actions.
2. **Search.** Filters the list by name.
3. **Count.** The number of entries shown out of all.
4. **List.** The entries; click one to see its parameters.

\newpage

### Library: a soil horizon opened

Choosing a horizon shows its texture class and, below the list, the retention and conductivity curves drawn from its parameters.

![Library: a soil horizon opened. Screen 9 of the Daisy workbench.](images/daisy11/dz_library_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Selected horizon.** The horizon whose parameters are shown.
2. **Parameters and curves.** Parameters of the horizon and the curves of water content and conductivity against suction.

\newpage

### Library: the crops of the Daisy library

The same screen with the crops chosen in the first list.

![Library: the crops of the Daisy library. Screen 10 of the Daisy workbench.](images/daisy11/dz_library_03.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Kind of entry.** Now set to crops.
2. **Count.** Number of crops in the library.
3. **Crops.** Each crop with the model that describes it.

\newpage

### Weather stations: the bundled stations and the annual rain

Weather stations lists the stations that come with Daisy. Choosing one draws its annual rain; the station can be used as the SWAFL weather or added to the list of logs for the plots.

![Weather stations: the bundled stations and the annual rain. Screen 11 of the Daisy workbench.](images/daisy11/dz_weather_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Station.** The bundled stations, each with its years and number of days.
2. **Latitude.** Latitude of the station, used to work out reference evapotranspiration when it is not recorded.
3. **Use as SWAFL weather.** Sends the station to the main workbench as its weather.
4. **Add to the log list.** Puts the station among the logs that the plot tabs can draw.
5. **Annual rain.** Sum of the daily rain of each year of the record.

\newpage

### Weather stations: another station and the open data of the Danish Meteorological Institute

The lower part of the tab reads open weather data of the Danish Meteorological Institute (a free key of your own is needed) and a groundwater series for the lower boundary of the soil column.

![Weather stations: another station and the open data of the Danish Meteorological Institute. Screen 12 of the Daisy workbench.](images/daisy11/dz_weather_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Interface key.** The free interface key of the Danish open data service.
2. **Latitude.** Latitude of the place.
3. **From.** First day to read.
4. **Fetch and use.** Reads the daily series and makes it the weather in use.
5. **Groundwater file.** A table with a date column and a depth to water column in metres, or a NetCDF file, used as the lower boundary of the soil column.

\newpage

### Weather stations: online weather of any place, for the analysis and the runs

The section Online weather of a place, at the foot of Weather stations, finds a place by name, reads its daily weather of the years you choose from the internet (Open-Meteo, ERA5 reanalysis) and then offers three uses: the weather of the SWAFL project, the weather of every Daisy run, and a log in the list of the plots. The same record is therefore used in the analysis of the project, in the Daisy runs and in the figures.

![Weather stations: online weather of any place, for the analysis and the runs. Screen 13 of the Daisy workbench.](images/daisy11/dz_weather_03.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Place.** A town, a village or a farm name; the name is searched on the internet.
2. **Find.** Lists the places of that name; choose one and the latitude and longitude are filled.
3. **First year.** First year of the record to read.
4. **Last year.** Last complete year; the current year is not complete yet.
5. **Get the weather.** Reads the daily rain, temperature and radiation and checks them.
6. **Use as the SWAFL weather.** Sets the record as the weather of the SWAFL project, so every layer of the project uses it.
7. **Use in the Daisy runs.** Sets the record as the weather of every simulation of Scenarios, Experiments and Processes.
8. **Add to the list of logs.** Adds the record to the logs, so that it can be drawn in Plot.

\newpage

## The weather stations of Daisy

The stations that come with Daisy are listed here with the years that they cover. The first one is the built-in weather used when nothing else is chosen.

| Station | Label | First year | Last year |
|:--|:--|--:|--:|
| course | Taastrup, Denmark (built-in, 1965-2000) | 1965 | 2000 |
| dk-taastrup | Taastrup, Denmark (Daisy sample, 1963-2007) | 1963 | 2007 |
| dk-foulum | Foulum, Denmark (1990-2003) | 1990 | 2003 |
| dk-jyndevad | Jyndevad, Denmark (1997-2004) | 1997 | 2004 |
| it-bologna | Bologna, Italy (1994-2004) | 1994 | 2004 |
| cz-valecov | Valecov, Czechia (1991-2004) | 1991 | 2004 |
| pl-jadwisin | Jadwisin, Poland (1992-2005) | 1992 | 2005 |
| sk-bratislava | Bratislava, Slovakia (1990-2005) | 1990 | 2005 |

