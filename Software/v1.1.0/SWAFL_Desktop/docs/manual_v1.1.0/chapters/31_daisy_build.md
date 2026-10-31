# Build and test, and learn {#daisy-build}

The fourth group holds the tools that need no scenario, and the fifth explains the model.

### Calibrate: the form

Parameters are searched with sequential, CMA-ES or Bayesian optimisation; each trial is one run.

![Calibrate: the form. Screen 127 of the Daisy workbench.](images/daisy11/dz_calib_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Problem.** What is calibrated.
2. **Method.** The search method.
3. **Loss.** The error to minimise.
4. **Runs.** Number of trials.
5. **Start.** Starts the search.
6. **Stop.** Stops it.

\newpage

### Calibrate: a search followed live

The loss and the best parameter set are drawn trial by trial.

![Calibrate: a search followed live. Screen 128 of the Daisy workbench.](images/daisy11/dz_calib_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Loss against trial.** Falls as the search improves.
2. **Parameters.** Parameter values tried.
3. **Best values.** Table of the best set.
4. **Status.** Progress.

\newpage

### Process curves: the start

Process curves draws any function of the Daisy library, such as a retention curve, a response to temperature or a stress function.

![Process curves: the start. Screen 129 of the Daisy workbench.](images/daisy11/dz_curves_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Function list.** The functions that can be drawn.
2. **Drawing.** The chosen curve.
3. **Picture (PNG).** Saves the figure.
4. **Table (CSV).** Saves the numbers.

\newpage

### Set-up editor: the empty editor

The editor opens a Daisy set-up file (.dai), shows its outline and checks the brackets as you type.

![Set-up editor: the empty editor. Screen 130 of the Daisy workbench.](images/daisy11/dz_editor_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Bundled set-up.** Opens a set-up that comes with the program.
2. **Open file.** Opens a .dai file from your computer.
3. **Tidy layout.** Indents the file.
4. **Download.** Saves the file.
5. **Run Daisy.** Runs the set-up on the desktop app.
6. **Text.** The set-up text with colours.
7. **Outline.** The sections of the file.

\newpage

### Set-up editor: irrigation.dai open

With the irrigation set-up open the outline lists its sections and the definitions it uses.

![Set-up editor: irrigation.dai open. Screen 131 of the Daisy workbench.](images/daisy11/dz_editor_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Set-up chosen.** The file that is open.
2. **Text.** Keywords, values and comments in colours.
3. **Outline.** Click a section to jump to it.
4. **Status.** File name and number of lines.

\newpage

### Model builder: any Daisy model as a form

**Model builder** (Model development) writes the definition of any model of the Daisy reference manual without typing in the Daisy language. Choose the **Component** (a chapter of the reference manual, for example *47 horizon* or *29 crop*) and the **Model** (a section of that chapter, for example *47.1 BSI3*); the box *find a component or model* narrows the lists. Give the model a **Name**.

The form has one row for every attribute of the model, as the manual gives it: the name, a box for the value, the unit, the type with its default, and the meaning. The rows are grouped as in the book:

* **What you set for this model**: its parameters, components and submodels. A row marked with a red star must be given and is always ticked; an optional row, or a row with a default, is ticked as soon as a value is typed in it (or by hand). Yes or no values are chosen from a list, a component from the names of the models of its chapter, a piecewise linear function (PLF) as pairs *x y; x y*.
* **Shared by every model of the component**: the parameters that the manual describes in the chapter itself (for a horizon: the hydraulic model, tortuosity, C/N ratio and the others).
* **Start values of the state variables** (optional).
* **Log variables you want to follow**: tick them (or *tick all*); they are listed under the definition, ready to be logged with a column or log definition (chapter 52 of the manual).

The definition is written under the form as you type, with Daisy names (the manual prints the underscores of the names as spaces) and the unit of each number as a comment. It is checked at once (*Brackets and quotes are balanced*), and the rows still to fill are named. **Open in the set-up editor** opens it as a new file, **Add to the file in the set-up editor** adds it to the file already there, **Copy** and **Save as .dai** keep it, and **Read this model in the reference manual** opens its section. In the Reference manual tab, the button **Fill in a form for this model** under every model opens this builder on that model. All the 683 models of the 95 components that a set-up file can define have a form.

![Model builder: the horizon model BSI3 filled in, with the parameters shared by every horizon.](images/daisy11/dz_build_01.jpg){width=100% height=17cm}

\newpage

### Reference manual: the attributes in the groups of the book

The tab **Reference manual** holds the whole Daisy Program Reference Manual (P. Abrahamsen, 31 August 2026): 107 chapters, 1018 models and 3249 attributes, each with its type, unit, kind and meaning, and the 82 references. Under every model the attributes are grouped as in the book: **what you set** (parameters, components and submodels), **state variables**, and **log variables and log columns** (what the model can write to a log file, including the columns of the Field water, Soil water and Crop logs). Every attribute shows its kind; the variables listed after a *Log Variables* or *Table columns* heading of the book are log variables or log columns.

![Reference manual: the Field water log (52.8) with its log columns.](images/daisy11/dz_refgroups_01.jpg){width=100% height=15cm}

\newpage

### Soil column: the form

A soil column of up to three layers is solved with the Richards equation on the weather chosen below.

![Soil column: the form. Screen 132 of the Daisy workbench.](images/daisy11/dz_richards_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Layer 1.** Horizon of the first layer and its lower depth.
2. **Weather.** SWAFL season, Daisy station, own values or file.
3. **Days.** Length of the simulation.
4. **Start wetness.** Initial relative saturation.
5. **Lower boundary.** Free drainage, closed or groundwater table.
6. **Run the column.** Starts the calculation.

\newpage

### Soil column: results

The figures show water content through depth and time, the series at a chosen depth and the water balance.

![Soil column: results. Screen 133 of the Daisy workbench.](images/daisy11/dz_richards_02.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **Water content map.** Depth against time.
2. **Depth of the series.** Depth in cm of the lower figure.
3. **Series at a depth.** Water content and suction at that depth.
4. **Summary.** Water balance of the run.
5. **Keep as a log.** Puts the water contents in the list of loaded logs of the Log plots tab.

\newpage

### Model and documentation

The Learn group describes the Daisy model, where each question is answered, how to get Daisy and how a time step is calculated.

![Model and documentation. Screen 134 of the Daisy workbench.](images/daisy11/dz_docs_01.jpg){width=100% height=17cm}

**What the arrows point to.**

1. **The Daisy model.** What the model is and what it simulates.
2. **Which question is answered where.** Themes of the Daisy studies and the tab for each.
3. **Get Daisy.** Downloads and checksums.

\newpage

