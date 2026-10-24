from PIL import Image,ImageDraw,ImageFont
import math
RED=(217,4,41);WHITE=(255,255,255)
FONT=None
def font(sz):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf']:
        try: return ImageFont.truetype(p,sz)
        except: pass
    return ImageFont.load_default()
CAND=[(-95,-80),(95,-80),(-95,80),(95,80),(0,-110),(0,110),(-150,0),(150,0),(-60,-130),(60,-130),(-60,130),(60,130)]
def annotate(im,marks,S=3,R=22,letters=False):
    """marks: list of (x,y,pref|None) in image px; returns annotated RGB image. numbering in order."""
    W,H=im.size
    big=im.convert('RGB').resize((W*S//1,H*S//1),Image.LANCZOS) if S!=1 else im.convert('RGB')
    ov=Image.new('RGBA',big.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
    placed=[]; f=font(int(R*1.15*S))
    for i,m in enumerate(marks):
        tx,ty=m[0],m[1]; pref=m[2] if len(m)>2 else None
        cands=[pref] if pref else CAND
        pos=None
        for dx,dy in cands:
            bx,by=tx+dx,ty+dy
            if bx<R+6 or bx>W-R-6 or by<R+6 or by>H-R-6: continue
            if any(math.hypot(px-bx,py-by)<2.6*R for px,py in placed): continue
            pos=(bx,by);break
        if pos is None:
            pos=(min(max(tx-110,R+6),W-R-6),min(max(ty-90,R+6),H-R-6))
        placed.append(pos); bx,by=pos
        dd=math.hypot(tx-bx,ty-by) or 1; ux,uy=(tx-bx)/dd,(ty-by)/dd
        x1,y1=bx+ux*R,by+uy*R; x2,y2=tx-ux*(R*0.95),ty-uy*(R*0.95)
        P=lambda v:v*S
        # white halo line then red line
        d.line([(P(x1),P(y1)),(P(x2),P(y2))],fill=WHITE+(255,),width=int(7*S*R/11*0.5+1))
        d.line([(P(x1),P(y1)),(P(x2),P(y2))],fill=RED+(255,),width=int(2.6*S*R/11*0.5+1))
        # arrow head
        hl=R*0.95;hw=R*0.55
        ax,ay=tx-ux*(R*0.95)*1.0,ty-uy*(R*0.95)*1.0
        bxh,byh=ax-ux*hl,ay-uy*hl
        poly=[(P(ax),P(ay)),(P(bxh-uy*hw),P(byh+ux*hw)),(P(bxh+uy*hw),P(byh-ux*hw))]
        d.polygon(poly,fill=WHITE+(255,)); 
        sh=[(P(ax-ux*2),P(ay-uy*2)),(P(bxh-uy*hw*0.8),P(byh+ux*hw*0.8)),(P(bxh+uy*hw*0.8),P(byh-ux*hw*0.8))]
        d.polygon([(P(ax-ux*1),P(ay-uy*1)),(P(bxh+ux*hl*0.15-uy*hw*0.75),P(byh+uy*hl*0.15+ux*hw*0.75)),(P(bxh+ux*hl*0.15+uy*hw*0.75),P(byh+uy*hl*0.15-ux*hw*0.75))],fill=RED+(255,))
        # ring at target
        rr=R*0.55
        d.ellipse([P(tx-rr),P(ty-rr),P(tx+rr),P(ty+rr)],outline=WHITE+(255,),width=int(4.5*S*R/22*2))
        d.ellipse([P(tx-rr),P(ty-rr),P(tx+rr),P(ty+rr)],outline=RED+(255,),width=int(2.0*S*R/22*2))
        # badge
        d.ellipse([P(bx-R-2),P(by-R-2),P(bx+R+2),P(by+R+2)],fill=WHITE+(255,))
        d.ellipse([P(bx-R+1),P(by-R+1),P(bx+R-1),P(by+R-1)],fill=RED+(255,))
        t=chr(65+i) if letters else str(i+1); tw=d.textlength(t,font=f)
        d.text((P(bx)-tw/2,P(by)),t,font=f,fill=WHITE+(255,),anchor='lm')
    out=Image.alpha_composite(big.convert('RGBA'),ov).convert('RGB')
    return out.resize((W,H),Image.LANCZOS)
