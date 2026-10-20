import sys
from PIL import Image,ImageDraw
def ruler(src,y0,y1,out,scale=1.0):
    im=Image.open(src).convert('RGB'); y1=min(y1,im.height)
    c=im.crop((0,y0,im.width,y1)); d=ImageDraw.Draw(c)
    for x in range(0,im.width,100):
        d.line([(x,0),(x,12)],fill=(255,0,255),width=2); d.text((x+3,2),str(x),fill=(255,0,255))
    for y in range((y0//100+1)*100,y1,100):
        yy=y-y0
        d.line([(0,yy),(14,yy)],fill=(255,0,255),width=2); d.text((16,yy-5),str(y),fill=(255,0,255))
        d.line([(im.width-14,yy),(im.width,yy)],fill=(255,0,255),width=2); d.text((im.width-44,yy-5),str(y),fill=(255,0,255))
    if scale!=1: c=c.resize((int(c.width*scale),int(c.height*scale)))
    c.save(out)
if __name__=='__main__':
    ruler(sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4],float(sys.argv[5]) if len(sys.argv)>5 else 1.0)
