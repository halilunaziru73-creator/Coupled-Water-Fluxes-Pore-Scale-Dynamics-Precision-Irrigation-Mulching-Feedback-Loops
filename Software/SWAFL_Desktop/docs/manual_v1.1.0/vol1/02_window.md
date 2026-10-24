# The window: a guided tour

## Anatomy

The window has eight regions, named here as they are named in the program.

1. **Menu bar** — File, Edit, View, Tools, Refresh, Review, Run, Help.
2. **Toolbar** — icon buttons for New, Open, Save, Undo, Redo, Play/Pause, Restart, 20-year simulation, the three design layers, fit-to-window, search, the report, and the **Date** control with a **Today** button.
3. **Layers** panel (top left) — the project tree. Each layer is one drawing of the model; each design layer lists its sections and its *Virtual farm simulation*.
4. **Processing Toolbox** (bottom left) — a searchable list of ready-to-run actions.
5. **Document tabs and view bar** (above the drawing) — one tab per open layer; the view bar names the layer, gives the buttons of its sections and the **Virtual farm simulation** button.
6. **Drawing** (centre) — the active layer, with the playback bar and the legend under it.
7. **Dashboard** (right of the drawing) — four tabs: *Results, Design, Charts, Messages*. Every block can be folded and unfolded by clicking its header.
8. **Properties** (far right) — every model input, in collapsible groups.

The **status bar** shows, from left to right: the state (*Ready*), the active layer, the working date, the soil, tillage, mulch and irrigation method, *Paused* or *Running*, and the version (*SWAFL 1.1.0*).

![The window with the Field balance layer open.](images/ui/w_start.jpg){width=100%}

## Menu bar reference

![The File menu.](images/ui/menu_file.jpg){width=100%}

| Menu | Item | Shortcut | Action |
|:--|:--|:--|:--|
| File | Import weather data (CSV, Excel, DWF, DLF, DAI)… | | Reads a daily weather file; every layer, the dashboard and the crop water requirement then use it (Chapter 19). |
| | Online weather for a location… | | Gets twenty years of daily weather and a 16-day forecast for a place (Chapter 19). |
| | New project | Ctrl+N | Resets every control to the defaults (Appendix B). |
| | Open project… / Save project… | Ctrl+O / Ctrl+S | Loads or saves a `.swafl` file: JSON with the version, the open layer, every control, the year and the date. |
| | Export ▸ | Ctrl+E | Picture of the window (PNG); yearly results (CSV); design results (CSV). |
| | Save report as PDF (choose the layers)… | Ctrl+Shift+P | Asks which layers to include (all are ticked to start with) and writes the report (Chapter 23). |
| | Print / save this view as PDF… | Ctrl+P | Prints the open layer through the system print dialog. |
| | Exit | Ctrl+Q | Closes the program. |
| Edit | Undo / Redo | Ctrl+Z / Ctrl+Y | Steps through the history of control changes. |
| | Reset all settings; Copy settings as text | | Defaults for the controls only; a text list of every control value on the clipboard. |
| | Pin results as baseline / Clear baseline | Ctrl+B | Freezes the 20-year averages for comparison (Chapter 14). |
| | Find a tool… | Ctrl+F | Moves the cursor to the Toolbox search box. |
| View | Design layouts ▸ | | Jumps to the layout drawing of the surface, drip or sprinkler design. |
| | Field sketch to design…; Virtual farm simulation | | The field sketch (Chapter 18); the virtual farm of the design you are in (Chapter 20). |
| | Layers and Processing Toolbox / Properties / Dashboard | | Show or hide each dock. |
| | Fit drawing to window / Drawing at full width (scroll) / Focus view (hide panels) | F9 | Three ways of showing the drawing. |
| | Expand all layers / Collapse all layers; Full screen | F11 | Tree display; full screen. |
| Tools | Field sketch to design…; Compare the irrigation systems on this field; Find the most efficient design inputs | | Chapter 18. |
| | Import weather data…; Online weather for a location… | | Chapter 19. |
| | Ready-made cases ▸; Irrigation design ▸; Irrigation method ▸; Mulch material ▸ | | Set the control directly. |
| | Run 20-year season simulation; Find a tool… | | Chapter 5. |
| Refresh | Refresh display (F6); Reload simulation engine; Clear message log | | |
| Review | Results dashboard; Design results; Yearly charts; Messages; Pin / Clear baseline; Go to top of the drawing | | Switches the dashboard tab. |
| Run | Run / pause the season (F5); Restart from day 1 (Shift+F5); 20-year season simulation; Optimise surface layout; Ready-made cases ▸ | | |
| Help | Manual (PDF) (F1); How to use SWAFL; Troubleshooting (running the app); Keyboard shortcuts; SWAFL on GitHub; Full documentation on GitHub; Report a problem; About SWAFL | | |

The eight menus are pictured, opened, in Volume 2.

## The command palette (Ctrl+K)

Press **Ctrl+K** anywhere to open a search box over *every* layer, section, tool, setting and date. Type part of a name (for example `drip`, `trigger`, `mulch`, `2031`) and press **Enter** to run the first match, or use the arrow keys to choose.

## Layers panel

The tree has the project root *SWAFL project* and eight groups, in the order in which a field is usually designed and studied. Click a group to expand it, click a layer to open it as a tab, and click the small triangle beside a layer to list its sections; a section jumps the drawing to that part.

| Group | Layers |
|:--|:--|
| **Irrigation design** | Surface irrigation design; Drip irrigation design; Sprinkler design and pipes — each with its sections and its *Virtual farm simulation* |
| **Irrigation control** | Sensor and trigger; Trigger law |
| **Mulch and evaporation** | Mulch against bare soil; Mulch control; Evaporation physics; Fate of saved water; Regime map |
| **Soil structure and tillage** | Tillage and structure; Soil hydraulic drivers; Root structure |
| **Field water balance** | Field balance; Soil, plant and air; Profile evolution |
| **Seasonal data** | Reliability over 20 seasons; Full water balance; Nitrogen budget |
| **Crops** | Crop water requirement |
| **Feedback loops** | Feedback loops |

In version 1.0 every layer carried a short code (S2, V1, N4 …). The codes have gone from the program; this manual uses the layer names. Open layers stay as tabs above the drawing; closing a tab does not lose any setting, because the controls belong to the project, not to the layer.

![The Layers panel with every group expanded.](images/ui/w_tree.jpg){width=100%}

## The view bar and the Virtual farm button

Above the drawing, the view bar names the open layer. For the design layers it carries one button per section (*Whole design, Layout design, Simulation, …*). Every layer carries the **Virtual farm simulation** button, which opens the farm of the design that belongs to the irrigation method in force; from a design layer it opens the farm of that design (Chapter 20).

## Processing Toolbox

Double-click (or select and press Enter) to run an action. Typing in the search box filters all tools by name and by hidden keywords.

| Group | Tools |
|:--|:--|
| Simulation | Play/pause the season; Restart from day 1; Run 20-year season simulation; Reset all settings |
| Ready-made cases | The seven cases of Section 3.8 |
| Irrigation design | Open the surface, drip or sprinkler design; Optimise surface layout; set the irrigation method |
| Compare and review | Pin and clear the baseline; show the Results, Design or Charts tab |
| Export | PNG of the window; yearly results CSV; design results CSV; save project; print / PDF |

## Resizing and remembering the layout

Drag the thin splitters between the docks to resize them. The program remembers the panel widths between sessions. The *Wider* button above the dashboard widens it; **View ▸ Drawing at full width** lets the drawing keep its design width and scroll; **Focus view** (F9) hides the panels.

## Reading the drawings

* **Hot spots.** Many drawings are clickable. Hovering shows a tooltip; clicking applies a setting (for example, clicking a year bar jumps to that year, clicking a soil on a chart selects that soil).
* **Value boxes.** Every input of the three design layers is a value box. Click it: a small window opens in which you type the exact value, choose its unit (for example m, km or ft; L/s, m³/h or L/min; ha, m² or acre; kPa, bar, m of water or psi) or pick a value from the list of the allowed range. A value outside the range is brought back to its nearest limit.
* **Nothing runs while you type.** The design layers compute only when you press **Run simulation** (Chapter 18); the other layers follow every control at once.
* **Colours.** Water blues, soil browns, crop greens; text is dark on a white sheet; labels sit in white boxes drawn after the pictures, so no arrow covers a label.
