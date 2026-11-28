import pandas as pd, numpy as np
d=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/data.pkl'); d=d[d.valid==1].copy()
d['s']=d.soil.str[:3]
d['Ent']=d.ET_mm-d.transpiration_mm
d['draw']=d.ET_mm+d.drainage_1m_mm-d.rain_mm-d.irrigation_mm   # storage release (mm); >0 = profile lost water
def e16():
    e=d[d.experiment=='E16_Edge_Cases'].copy()
    t=e.treatment.str.extract(r'^C(\d+)_P([\d.]+)_T(\d+)_h(\d+)_D([\d.]+)_N(\d+)_Ep([\d.]+)$'); t.columns=['c','fP','fT','fh','fD','fN','fEp']
    m=t.notna().all(axis=1); return e[m].join(t[m].astype(float))
def e9():
    e=d[d.experiment=='E9_Soil_Moisture_Rain'].copy(); e['h0']=e.treatment.str.extract(r'h(\d+)_')[0].astype(float); return e
SOIL_N=['S01','S02','S03','S04','S05','S06','S07','S08','S09','S10']
SOIL_L={'S01':'Coarse loam','S02':'Coarse sand','S03':'Sand','S04':'Loamy sand','S05':'Sandy loam','S06':'Loam','S07':'Silt loam','S08':'Sandy clay loam','S09':'Clay loam','S10':'Silty clay loam'}
VG={'S01':(0.0961,1.353),'S02':(0.0536,1.600),'S03':(0.145,2.68),'S04':(0.124,2.28),'S05':(0.075,1.89),'S06':(0.036,1.56),'S07':(0.020,1.41),'S08':(0.059,1.48),'S09':(0.019,1.31),'S10':(0.010,1.23)}
TAW={'S01':130,'S02':105,'S03':60,'S04':75,'S05':95,'S06':150,'S07':220,'S08':160,'S09':175,'S10':195}  # paper-0 Table 2 (approx.)
