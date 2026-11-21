from PIL import Image
import numpy as np,json,subprocess,os,re,sys
scenes=sys.argv[1].split(',')
res={}
for s in scenes:
    im=Image.open(s+'_full.png').convert('RGB').crop((8,0,1624,13520));a=np.array(im).astype(int)
    nb=(np.abs(a-255).sum(2)>30).sum(1)>2
    ys=np.where(nb)[0];end=min(len(nb),ys.max()+20)
    # blank gaps >= 26
    gaps=[];run=0
    for y in range(end):
        if not nb[y]: run+=1
        else:
            if run>=26: gaps.append(y-run//2)
            run=0
    # drop footer: content may end earlier than 'end'; ok
    chunks=[];st=0
    for g in gaps+[end]:
        if g-st>=1100 or g==end:
            if g-st<450 and chunks: chunks[-1]=(chunks[-1][0],g)
            else: chunks.append((st,g))
            st=g
    # merge chunks >1900 split not needed
    small=[]
    for y in range(end):
        pass
    # split over-tall chunks at blank gaps >= 10 nearest the middle
    allgaps=[];run=0
    for y in range(end):
        if not nb[y]: run+=1
        else:
            if run>=10: allgaps.append(y-run//2)
            run=0
    def split(y0,y1):
        if y1-y0<=2300: return [(y0,y1)]
        mid=(y0+y1)//2;c=[g for g in allgaps if y0+700<g<y1-700]
        if not c: return [(y0,y1)]
        g=min(c,key=lambda g:abs(g-mid));return split(y0,g)+split(g,y1)
    ch2=[]
    for (y0,y1) in chunks: ch2+=split(y0,y1)
    chunks=ch2
    out=[]
    for i,(y0,y1) in enumerate(chunks):
        c=im.crop((0,y0,im.width,y1));arr=np.array(c).astype(int);m=(np.abs(arr-255).sum(2)>30).sum(1)>2
        idx=np.where(m)[0]
        if len(idx)==0: continue
        c=c.crop((0,max(0,idx.min()-6),c.width,idx.max()+8))
        if c.height<230: continue
        fn='figs/%s_%d.jpg'%(s,i);c.save(fn,quality=86)
        c.crop((0,0,c.width,min(c.height,110))).save('/tmp/sh/hd.png')
        t=subprocess.run(['tesseract','/tmp/sh/hd.png','-','--psm','6'],capture_output=True,text=True).stdout.strip().split('\n')[0]
        out.append((fn,c.size,t))
        print(s,i,c.size,t[:90])
    res[s]=out
json.dump(res,open('auto.json','w'))
