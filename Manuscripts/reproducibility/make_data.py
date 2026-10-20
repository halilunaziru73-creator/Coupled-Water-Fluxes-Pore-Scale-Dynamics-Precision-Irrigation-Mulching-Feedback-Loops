"""Rebuild the working pickle from the archived CSV (exact round trip verified)."""
import os, pandas as pd
root = os.environ.get('SWAFL_MS', '.')
d = pd.read_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'daisy_ensemble.csv.gz'))
d.to_pickle(os.path.join(root, 'data.pkl'))
print('data.pkl:', d.shape, 'valid =', int((d.valid == 1).sum()))
