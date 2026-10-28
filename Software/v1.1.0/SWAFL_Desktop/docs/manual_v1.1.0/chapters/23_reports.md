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
