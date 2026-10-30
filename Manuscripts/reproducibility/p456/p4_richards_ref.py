"""Independent reference for the workbench Richards solver: method of lines (scipy BDF) on a 0.5 cm grid, h-based form.
Same problem: 100 cm column, h0=-300 cm, 200 mm of rain on day 1 (surface held at h=0 while ponded, flux-limited), then 5 dry days, free drainage."""
import numpy as np, json, os
from scipy.integrate import solve_ivp
from scipy.sparse import diags
H=os.path.dirname(os.path.abspath(__file__)); J=json.load(open(H+'/out_p4_richards_js.json'))
def vg(p):
    m=1-1/p['n']
    Se=lambda h: np.where(h>=0,1.0,(1+(p['alpha']*np.abs(h))**p['n'])**(-m))
    th=lambda h: p['Thr']+(p['Ths']-p['Thr'])*Se(h)
    def K(h):
        s=np.clip(Se(h),1e-12,1); a=1-(1-s**(1/m))**m; return p['Ks']*24*s**p['l']*a*a
    def Cap(h):
        s=np.clip(Se(h),1e-12,1); sm=s**(1/m); return np.maximum(1e-9,p['alpha']*m/(1-m)*(p['Ths']-p['Thr'])*sm*(1-sm)**m*(h<0)+1e-6*(h>=0))
    return th,K,Cap
def run(p,dz=0.5,days=6,rain_cm=20.0):
    th,K,Cap=vg(p); x=np.arange(0,100+1e-9,dz); N=len(x); SP=diags([1,1,1],[-1,0,1],shape=(N,N)).tocsr()
    h0=np.full(N,-300.0)
    V=np.full(N,dz); V[0]=V[-1]=dz/2
    def rhs(t,h,top):
        k=K(h); km=0.5*(k[1:]+k[:-1])
        q=km*(1-(h[1:]-h[:-1])/dz)      # downward flux between nodes, cm/d
        qt=top(h,q); qb=K(h[-1:])[0]
        f=np.zeros(N); f[0]=qt-q[0]; f[1:-1]=q[:-1]-q[1:]; f[-1]=q[-1]-qb
        return f/V/Cap(h)
    # day 1: ponded surface h=0 (Dirichlet) -> infiltration = net flux into node 0 side
    infil=[];drain=[];store=[]
    h=h0.copy(); cum_in=0; 
    def stor(h): return float(np.sum(th(h)*V)*10)
    S0=stor(h)
    # phase 1: surface node pinned at 0
    def r1(t,hh):
        hh=hh.copy(); hh[0]=0.0; d=rhs(t,hh,lambda h,q:q[0]); d[0]=0; return d
    flux=p['Ks']*24>rain_cm
    def r1f(t,hh): return rhs(t,hh,lambda h,q:rain_cm)
    s=solve_ivp(r1f if flux else r1,[0,1],h,method='BDF',rtol=1e-6,atol=1e-6,jac_sparsity=SP)
    hh=s.y[:,-1].copy()
    if not flux: hh[0]=0.0
    # day-1 infiltration by balance: storage gain + drainage (computed afterwards)
    def bottom_flux_int(sol):
        tt=sol.t; qb=[K(sol.y[-1:,i])[0] for i in range(len(tt))]; return np.trapezoid(qb,tt)
    d1=bottom_flux_int(s); st1=stor(hh); inf1=(st1-S0)/10+d1
    ph=[[st1,inf1*10,d1*10]]
    # days 2..6: no flux at the surface
    def r2(t,hh): return rhs(t,hh,lambda h,q:0.0)
    h=hh; tot_d=d1; 
    for day in range(1,days):
        s=solve_ivp(r2,[0,1],h,method='BDF',rtol=1e-6,atol=1e-6,jac_sparsity=SP); h=s.y[:,-1]; dd=bottom_flux_int(s); tot_d+=dd; ph.append([stor(h),0.0,dd*10])
    return dict(infil=inf1*10,drain=tot_d*10,storeEnd=stor(h),S0=S0)
res={}
for nm,p in [(k,v) for k,v in J['SOILS'].items() if k!='siltclayloam']:
    r=run(p); res[nm]=r
    o=J['out'][nm]['0.5' if '0.5' in J['out'][nm] else '1']
    print(nm,'ref infil %.2f drain %.2f end %.2f | JS dz=.5 infil %.2f drain %.2f end %.2f'%(r['infil'],r['drain'],r['storeEnd'],o['infil'],o['drain'],o['storeEnd']))
json.dump(res,open(H+'/out_p4_richards_ref.json','w'))
