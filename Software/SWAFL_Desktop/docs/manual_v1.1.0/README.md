# SWAFL Desktop 1.1.0 manual

The manual of version 1.1.0, in three volumes. The manual of version 1.0 stays in `../SWAFL_Manual.pdf`.

| File | Contents |
|:--|:--|
| `SWAFL_Manual_v1.1.0_Vol1_Guide.pdf` | User guide and technical reference: installing, the window and every control, the clock, the two engines, every layer and the three irrigation designs, the dashboard, weather data, the virtual farm, the crop library and crop water requirement, seasonal data, reports, workflows, limits, appendices and the reference of every numbered equation. Opened by **Help ▸ Manual (F1)**. |
| `SWAFL_Manual_v1.1.0_Vol2_Atlas.pdf` | Screenshot atlas at the default settings: the window, the menus, every dialog, the Properties panel, the dashboard tabs, and every layer from top to bottom with the equations it draws on. |
| `SWAFL_Manual_v1.1.0_Vol3_Atlas_by_soil_and_crop.pdf` | Every layer for each of the ten soils, the three designs and their virtual farms for each soil, and the crop water requirement of every crop. |

## Rebuilding

1. Serve the program: `npm run web` (port 5199).
2. Capture the screens: `node tools/capture.js <raw> ui`, then `default`, `crops` and `soils`.
3. Cut the drawings and write the volumes: `python3 tools/gen_v11.py <raw>`.
4. Build the PDFs: `sh build.sh` (pandoc and xelatex).

The chapters of volume 1 are in `chapters/`; `vol1/`, `vol2.md` and `vol3.md` are generated.
