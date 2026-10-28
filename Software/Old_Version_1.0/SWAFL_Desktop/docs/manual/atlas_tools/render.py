import sys,json,os
sys.path.insert(0,'/tmp/atlas')
from PIL import Image
import annot,spec_full as S
def pieces(sc,src,cut=None,margin=40):
    """yield (piece_index, annotated PIL image, [legend texts]) for each cut piece of full-canvas image src"""
    im=Image.open(src).convert('RGB')
    cuts=cut or S.CUT[sc]
    out=[]
    for i in range(len(cuts)-1):
        y0,y1=cuts[i],cuts[i+1]
        lo=y0 if i==0 else y0+margin; hi=y1 if i==len(cuts)-2 else y1-margin
        ms=[(x,y-y0,t) for x,y,t in S.F[sc] if lo<=y<hi]
        crop=im.crop((0,y0,im.width,min(y1,im.height)))
        o=annot.annotate(crop,[(x,y) for x,y,t in ms],letters=(sc in S.LET),R=26)
        out.append((i,o,[t for x,y,t in ms],y0))
    return out
