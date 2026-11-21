from PIL import Image,ImageDraw
import sys
s=sys.argv[1];end=int(sys.argv[2]);step=2800;sc=0.34
im=Image.open(s+'_full.png').convert('RGB').crop((8,0,1624,end))
n=(end+step-1)//step
W=int(im.width*sc)+40
sheet=Image.new('RGB',(W*n,int(step*sc)+10),'white')
for i in range(n):
    c=im.crop((0,i*step,im.width,min(end,(i+1)*step)));c=c.resize((int(c.width*sc),int(c.height*sc)))
    sheet.paste(c,(i*W+38,0));d=ImageDraw.Draw(sheet)
    for y in range(0,step,100):
        yy=int(y*sc);d.line((i*W+30,yy,i*W+38,yy),fill='red')
        if y%200==0: d.text((i*W+1,yy),str(i*step+y),fill='red')
    d.line((i*W+W-2,0,i*W+W-2,sheet.height),fill='blue')
sheet.save(s+'_strips.png');print(sheet.size)
