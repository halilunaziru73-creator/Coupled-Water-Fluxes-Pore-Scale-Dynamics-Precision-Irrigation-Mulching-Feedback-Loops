from PIL import Image
import numpy as np,sys,os
os.makedirs('figs',exist_ok=True)
def cutscene(s,cuts,names):
    im=Image.open(s+'_full.png').convert('RGB').crop((8,0,1624,13520));a=np.array(im).astype(int)
    nb=(np.abs(a-255).sum(2)>30).sum(1)>2
    def snap(y,r=70):
        best=None
        for d in range(0,r):
            for yy in (y-d,y+d):
                if 0<=yy<len(nb)-3 and not nb[yy:yy+3].any(): return yy+1
        return y
    ys=[snap(y) for y in cuts]
    for i,nm in enumerate(names):
        c=im.crop((0,ys[i],im.width,ys[i+1]))
        # trim blank margins top/bottom
        arr=np.array(c).astype(int);m=(np.abs(arr-255).sum(2)>30).sum(1)>2
        idx=np.where(m)[0];c=c.crop((0,max(0,idx.min()-6),c.width,idx.max()+8))
        c.save('figs/%s_%s.jpg'%(s,nm),quality=86);print(s,nm,c.size)
if __name__=='__main__':
    cutscene('sid',[0,1060,1665,2990,3730,4370,5070,5815,6430,6915,7525,8010,9290],['inputs','plan','section','hydro','cross','advance','profile','perf','dtable','sens','meaning','film'])
