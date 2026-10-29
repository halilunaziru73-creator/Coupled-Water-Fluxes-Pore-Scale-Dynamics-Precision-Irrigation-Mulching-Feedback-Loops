# Reports

## Choosing the layers

*File ▸ Save report as PDF (choose the layers)…* (Ctrl+Shift+P, or the *Report* button of the toolbar) opens a window with every layer of the Layers panel, in its groups. **Every layer is ticked to start with.** Untick a layer, or a whole group with its box, or everything with *All layers*; the count at the bottom tells how many layers are ticked. **Make the PDF** builds the report and asks where to save it.

![The report window: every layer ticked.](images/atlas11/ui_u11_report.jpg){width=100%}

## What the report holds

* **The first page**: your inputs (soil, tillage, crop, consolidation rate, mulch, rain, temperature, trigger, sensor depth, method, nitrogen), the results at these inputs (the 20-year averages), the water balance of the year, and the list of the layers included.
* **For each layer**: its name and purpose, the sentence that sums it up, the key numbers at your inputs, and **the whole drawing from top to bottom**. When the key numbers run past the end of the page they continue on the next page. When the drawing is longer than the page it continues on the next pages, cut at its section headings (or, where a layer has none, at a blank band between two parts), so no part of a picture or of its text is hidden or cut through.
* **The design layers** are drawn at the end of the irrigation, so every result is complete.
* **The field balance** appears three times: day by day, all twenty years, and the average year.

A report of every layer has about 60 to 70 pages and takes a few seconds to build.

## The page and its numbers

The pages are A4. The drawing of a layer is placed at the full text width (515 points) and cut into parts of at most

$$
h_{\max}=748\ \mathrm{pt}\times\frac{W}{515}\ \ [\text{px of the drawing}],
\tag{23.1}
$$

*Provenance (Eq. 23.1):* **[Engineered]**: page geometry; $W$ is the width of the drawing in pixels, so a wide drawing is cut into taller parts than a narrow one.

and the first part fills the room left under the key numbers when it is at least 220 points.

## Saving the outputs of a layer

The bar *Output* above the simulation window works for every layer in the same way as the figures of the Daisy workbench.

1. **Title and caption.** Write the title that the picture should carry (empty: the name of the layer) and a caption. Under the picture the program adds the settings it was made with (the soil, the tillage, the crop, the date) so that the picture can be understood alone.
2. **Save picture.** Screen resolution, 300 dpi, 600 dpi or the highest resolution the computer allows. The layer is drawn again at that size, so lines and letters stay sharp; tall layers are limited by the memory of the computer, and the size in pixels is reported when the file is saved. *Copy the picture* puts it on the clipboard.
3. **Numbers (CSV)** saves the settings and the live results of the layer. **Save widgets** keeps the position of every control in a small file, and **Load widgets** sets them again.
4. **Every layer (zip)** draws all the layers at 300 dpi and saves them with their numbers in one zip.
5. The triangle at the left of the bar collapses the picture and expands it again.

Every section of the dashboard (Results and Charts) has a *Save* menu at the right of its header: its picture at 300 or 600 dpi, a copy of the picture, and the numbers of its tables and charts as a CSV file. The tab **Figure** of the dashboard shows the map of the processes of Daisy with the processes the controls of the layer act on in orange and those its results come from in blue. Click a process and the outputs that depend on it are highlighted in the list under the map; click an output and its processes are shown and the layer scrolls to it. The map can be enlarged and saved as a 300 dpi picture or as an SVG.
