"""Extract the 1,000 E12 runs used for the Engine 1 held-out test (input of p3_js/e1_heldout.js)."""
import os, json, pandas as pd
root = os.environ.get('SWAFL_MS', '.')
d = pd.read_pickle(os.path.join(root, 'data.pkl'))
e = d[d.experiment.str.startswith('E12') & (d.valid == 1)]
cols = ['trig','z','P','ET_mm','irrigation_mm','drainage_1m_mm','yield_Mg_ha','transpiration_mm','soil_evap_mm','N_leached_kg_ha','treatment','soil']
rows = json.loads(e[cols].to_json(orient='records'))
json.dump(rows, open(os.path.join(root, 'out', 'e12.json'), 'w'))
print('e12.json:', len(rows))
