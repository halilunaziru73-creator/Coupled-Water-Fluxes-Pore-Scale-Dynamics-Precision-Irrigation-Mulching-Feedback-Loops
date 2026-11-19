import numpy as np
soils={'S01':(0.0961,1.353),'S02':(0.0536,1.600),'S03':(0.1450,2.680),'S04':(0.1240,2.280),'S05':(0.0750,1.890),'S06':(0.0360,1.560),'S07':(0.0200,1.410),'S08':(0.0590,1.480),'S09':(0.0190,1.310),'S10':(0.0100,1.230)}
names={'S01':'Coarse loam','S02':'Coarse sand','S03':'Sand','S04':'Loamy sand','S05':'Sandy loam','S06':'Loam','S07':'Silt loam','S08':'Sandy clay loam','S09':'Clay loam','S10':'Silty clay loam'}
memory={'S01':.029,'S02':.265,'S03':.846,'S04':.741,'S05':.643,'S06':.289,'S07':.147,'S08':.285,'S09':.087,'S10':.022}
def Se(a,n,h): m=1-1/n; return (1+(a*h)**n)**(-m)
def Kr(a,n,h,l=.5):
    m=1-1/n;s=Se(a,n,h);return s**l*(1-(1-s**(1/m))**m)**2
def hc(a,n,k=3.5e-10,l=.5):
    m=1-1/n;E=2*n+l*(n-1);return (m*m/k)**(1/E)/a
