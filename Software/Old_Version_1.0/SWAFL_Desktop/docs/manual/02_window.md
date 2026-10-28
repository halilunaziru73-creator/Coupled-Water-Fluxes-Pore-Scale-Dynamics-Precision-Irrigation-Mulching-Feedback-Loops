# The window: a guided tour

## Anatomy

The window has seven regions, named here as they are named in the program (Figure 2.1).

1. **Menu bar** — File, Edit, View, Tools, Refresh, Review, Run, Help.
2. **Toolbar** — icon buttons for New, Open, Save, Undo, Redo, Play/Pause, Restart, 20-year simulation, the three design layers, fit-to-window, search, and the **Date** control with a **Today** button.
3. **Layers** panel (top left) — the project tree. Each layer is one drawing of the model.
4. **Processing Toolbox** (bottom left) — searchable list of ready-to-run actions.
5. **Drawing** (centre) — the active layer, with its tab strip above and, for the design layers, a sub-section bar (*Whole design, Layout design, Simulation, …*). The **year strip** and the **Play** bar sit under the drawing.
6. **Dashboard** (right of the drawing) — four tabs: *Results, Design, Charts, Messages*.
7. **Properties** (far right) — every model input, in collapsible groups.

The **status bar** shows, from left to right: state (*Ready*), the active layer, the working date, the soil, tillage, crop, mulch and irrigation method, and *Paused* or *Running*.

![Figure 2.1. The window with the Sensor and trigger layer open. The numbered arrows point to 1 the layer in the Layers tree, 2 the drawing area, 3 the Play button of the playback bar, 4 the Results tab of the Dashboard and 5 the Scenario section of Properties.](images/wb/wb_v1.jpg){width=100%}

## Menu bar reference

| Menu | Item | Shortcut | Action |
|:--|:--|:--|:--|
| File | New project | Ctrl+N | Resets every control to the defaults (Appendix B). |
| | Open project… | Ctrl+O | Loads a `.swafl` file. |
| | Save project… | Ctrl+S | Saves a `.swafl` file: JSON holding the application name and version, the open layer, every control, the weather year and the date. |
| | Export ▸ | | Picture of the window (PNG, Ctrl+E); yearly results (CSV); design results (CSV). |
| | Print / save as PDF… | Ctrl+P | Prints the active layer through the system print dialog. |
| | Exit | Ctrl+Q | Closes the program. |
| Edit | Undo / Redo | Ctrl+Z / Ctrl+Y | Steps through the history of control changes. |
| | Reset all settings | | Same as *New project* for the controls only. |
| | Copy settings as text | | Puts a text list of all control values on the clipboard (for reports). |
| | Pin results as baseline | Ctrl+B | Freezes the current 20-year averages for comparison (Section 14.4). |
| | Clear baseline | | Removes the pinned baseline. |
| | Find a tool… | Ctrl+F | Moves the cursor to the Toolbox search box. |
| View | Layers and Processing Toolbox / Properties / Dashboard | | Show or hide each dock. |
| | Fit drawing to window / Drawing at full width (scroll) | | Two scaling modes for the drawing. |
| | Expand all layers / Collapse all layers | | Tree display. |
| | Full screen | F11 | |
| Tools | Ready-made cases ▸ | | The seven cases of Section 3.8. |
| | Irrigation design ▸ | | Opens the surface, drip or sprinkler layers. |
| | Irrigation method ▸ / Mulch material ▸ | | Sets the control directly. |
| | Run 20-year season simulation | | Section 5.2. |
| Refresh | Refresh display (F6); Reload simulation engine; Clear message log | | |
| Review | Results dashboard / Design results / Yearly charts / Messages | | Switches the Dashboard tab. |
| Run | Run / pause the season (F5); Restart from day 1 (Shift+F5); 20-year season; Optimise surface layout; Ready-made cases | | |
| Help | How to use SWAFL (F1); Troubleshooting; Keyboard shortcuts; SWAFL on GitHub; Full documentation; Report a problem; About | | |

## The command palette (Ctrl+K)

Press **Ctrl+K** anywhere to open a search box over *every* layer, tool and setting. Type part of a name (for example `drip`, `trigger`, `mulch`) and press **Enter** to run the first match, or use the arrow keys to choose. This is the fastest way to reach a layer without opening the tree.

## Layers panel

The tree has the project root *SWAFL project* and six groups. Click a group to expand it, click a layer to open it as a tab, and click the small triangle beside a design layer to list its sub-sections, which jump the drawing to that section.

| Group | Layers (ID) |
|:--|:--|
| **Irrigation design** | Surface irrigation design (`sid`, S2); Drip irrigation design (`drip`, S3); Sprinkler design and pipes (`spr`, S4) |
| **Field water balance** | Field balance (`field`); Soil, plant and air (`spac`, S1); Profile evolution (`v2`, V2) |
| **Irrigation control** | Sensor and trigger (`v1`, V1); Trigger law (`n1`, N1) |
| **Soil structure and tillage** | Tillage and structure (`v3`, V3); Soil hydraulic drivers (`v7`, V7); Root structure (`r1`, R1) |
| **Mulch and evaporation** | Mulch against bare soil (`v4`, V4); Mulch control (`v6`, V6); Evaporation physics (`e1`, E1); Fate of saved water (`n2`, N2); Regime map (`n3`, N3) |
| **Feedback loops** | Feedback loops (`v5`, V5) |

Right-click a layer for *Open layer*, *Go to top*, *Close tab*. Open layers stay as tabs above the drawing; closing a tab does not lose any setting, because the controls belong to the project, not to the layer. A layer can also be opened from a link of the form `index.html#open=<ID>`, for example `#open=drip`.

## Processing Toolbox

Double-click (or select and press Enter) to run an action. Typing in the search box filters all tools by name and by hidden keywords.

| Group | Tools |
|:--|:--|
| Simulation | Play/pause the season; Restart from day 1; Run 20-year season simulation; Reset all settings |
| Ready-made cases | The seven cases of Section 3.8 |
| Irrigation design | Open surface / drip / sprinkler design; **Optimise surface layout**; Use overhead sprinkler / surface / drip 20–30 cm method |
| Compare and review | Pin current results as baseline; Clear baseline; Show results dashboard / design results / yearly charts |
| Export | PNG of the window; yearly results CSV; design results CSV; save project (.swafl); print / PDF |

## Resizing and remembering the layout

Drag the thin splitters between the docks to resize them. The program remembers the panel widths between sessions. The *Wider* button above the dashboard widens it; **View ▸ Drawing at full width** lets the drawing keep its design width and scroll, which is useful for the long design layers.

## Reading the drawings

* **Hot spots.** Many drawings are clickable. Hovering shows a tooltip; clicking applies a setting (for example, clicking a year bar jumps to that year, clicking a soil on a chart selects that soil).
* **Sliders inside drawings.** In the design layers every slider is part of the picture and moves the same state as the Properties panel.
* **Colours.** Water-related blues, soil browns, crop greens. Black is not used; text is dark blue-grey on cream paper.
