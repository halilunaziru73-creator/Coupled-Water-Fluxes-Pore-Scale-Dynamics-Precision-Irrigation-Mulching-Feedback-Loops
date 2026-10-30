"""P5: independent re-reading (pandas) of the bundled Daisy logs and comparison with the numbers the JavaScript bridge produces."""
import pandas as pd, numpy as np, json, os, io
H=os.path.dirname(os.path.abspath(__file__)); DL='/home/claude/cwf/Software/v1.1.0/SWAFL_Desktop/app/data/daisy/dlf/'
J=json.load(open(H+'/out_p5_bridge_js.json'))
def read(f):
    L=open(DL+f).read().split('\n'); i=[k for k,l in enumerate(L) if l.startswith('year\t')][0]
    names=[x.strip() for x in L[i].split('\t')]
    df=pd.read_csv(io.StringIO('\n'.join(L[i+2:])),sep='\t',names=names,header=None)
    return df
rows=[]
for f,info in J['parse'].items():
    if info is None: rows.append((f,None,None,None)); continue
    df=read(f); num=df.select_dtypes('number')
    mx=0
    for j,n in enumerate(info['names']):
        if n in num.columns and n!='crop':
            a=float(num[n].sum()); b=info['sum'][j]; mx=max(mx,abs(a-b)/max(abs(a),1e-12))
    rows.append((f,len(df),info['nrows'],mx))
print('parser: file, python rows, JS rows, max relative difference of column sums')
for r in rows: print(r)
# nitrogen bridge
res={}
for f in ['annual-field-nitrogen-3b.dlf','annual-field-nitrogen-4b.dlf']:
    df=read(f).iloc[1:]
    s=J['nsum'][f]
    chk={}
    chk['Nfert']=np.abs(df[['Min-Surface-Fertilizer','Min-Soil-Fertilizer','Org-Fertilizer']].sum(axis=1).values-np.array(s['Nfert'])).max()
    chk['Nup']=np.abs(df['Crop-Uptake'].values-np.array(s['Nup'])).max()
    chk['NL']=np.abs((df['Matrix-Leaching']+df['Biopore-Leaching']).values-np.array(s['NL'])).max()
    chk['Nmin']=np.abs(df['Mineralization'].values-np.array(s['Nmin'])).max()
    den=df['Denitrification']+df['N2O-Nitrification']
    chk['Nden']=np.abs(den.values-np.array(s['Nden'])).max()
    # balance closure in the log itself: the Error column
    err=df['Error'].abs()
    thr=(df['Min-Surface-Fertilizer']+df['Min-Soil-Fertilizer']+df['Org-Fertilizer']+df['Deposition']+df['Crop-Uptake']).abs()
    chk['maxabs_Error_kgN']=float(err.max()); chk['seasons']=len(df)
    res[f]={k:float(v) for k,v in chk.items()}
    print(f,res[f])
json.dump({'parser':rows,'n':res},open(H+'/out_p5_bridge.json','w'),default=str)
# denitrification: JS vs stored Daisy targets
print(json.dumps(J['deni']))
