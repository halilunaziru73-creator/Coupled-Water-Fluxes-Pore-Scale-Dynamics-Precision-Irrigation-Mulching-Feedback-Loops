# SWAFL Desktop 1.1.0 manual

`SWAFL_Manual_v1.1.0.pdf` (1024 pages) is the manual of version 1.1.0. It keeps the chapters and page style of the manual of version 1.0, with every screenshot taken again from version 1.1.0 and every numbered arrow placed on the item it names in the new interface. It adds the chapters of the new release:

- 18, running a design and finding the most efficient inputs;
- 19, weather data;
- 20, the real field: satellite indices, image analysis of the satellite photo, water sources and the irrigation system;
- 21, crops and the crop water requirement;
- 22, seasonal data;
- 23, reports;
- 24, changes from 1.0.

Chapter 25 is the screenshot atlas, which now includes the screens new in 1.1. **Help ▸ Manual (F1)** opens the PDF.

The manual of version 1.0 is in the folder of version 1.0: `Software/Old_Version_1.0/SWAFL_Desktop/docs/SWAFL_Manual.pdf`.

## Rebuilding

1. Serve version 1.1.0 with `npm run web` (port 5199), and the 1.0 program (commit ee6fa4e) on port 5180.
2. Record where the arrows of the 1.0 atlas sit: `python3 tools/old_anchors.py` writes `old_anchors.json`.
3. Capture the screens of 1.1.0: `python3 tools/new_capture.py parts`, then `states` and `ui`.
4. Cut the drawings, move every arrow onto the same item in 1.1.0 and write `chapters/25_atlas.md`: `python3 tools/atlas11.py <this folder>`.
5. Build the PDF: `sh build.sh` (pandoc and xelatex).

The tools may carry paths of the machine they were run on; adjust these before running them.
