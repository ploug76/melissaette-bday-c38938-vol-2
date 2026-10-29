from PIL import Image,ImageDraw,ImageFont,ImageFilter
import random,math
F='/usr/share/fonts/truetype/sand-box/google/'
import glob
def font(name,sz):return ImageFont.truetype(glob.glob(F+name+'/*.ttf')[0],sz)
src=Image.open('/workspace/bday-vol2/gen/title_wide.jpg').convert('RGB')
def grad_text(base,xy,text,fnt,cols,stroke=8,anchor='mm'):
  d=ImageDraw.Draw(base);bb=d.textbbox(xy,text,font=fnt,anchor=anchor,stroke_width=stroke)
  sh=Image.new('L',base.size,0);ImageDraw.Draw(sh).text((xy[0]+4,xy[1]+7),text,font=fnt,anchor=anchor,fill=255,stroke_width=stroke,stroke_fill=255)
  glow=sh.filter(ImageFilter.GaussianBlur(12))
  base.paste(Image.new('RGB',base.size,(255,90,190)),(0,0),glow.point(lambda v:int(v*0.8)))
  base.paste(Image.new('RGB',base.size,(60,8,80)),(0,0),sh)
  m=Image.new('L',base.size,0);ImageDraw.Draw(m).text(xy,text,font=fnt,anchor=anchor,fill=255,stroke_width=stroke,stroke_fill=255)
  base.paste(Image.new('RGB',base.size,(70,10,90)),(0,0),m)
  m2=Image.new('L',base.size,0);ImageDraw.Draw(m2).text(xy,text,font=fnt,anchor=anchor,fill=255)
  g=Image.new('RGB',base.size);gd=ImageDraw.Draw(g);y0,y1=bb[1],bb[3]
  for y in range(base.size[1]):
    t=min(1,max(0,(y-y0)/max(1,y1-y0)));n=len(cols)-1;i=min(n-1,int(t*n));f=t*n-i;a,b=cols[i],cols[i+1]
    gd.line([(0,y),(base.size[0],y)],fill=tuple(int(a[k]+(b[k]-a[k])*f) for k in range(3)))
  base.paste(g,(0,0),m2)
def frame(W,H,k,n,seed=1):
  z=1.05;sw,sh=src.size;cw=sw/z;ch=cw*H/W
  if ch>sh/z: ch=sh/z;cw=ch*W/H
  cx=sw/2;cy=sh*0.47
  im=src.crop((int(cx-cw/2),int(cy-ch/2),int(cx+cw/2),int(cy+ch/2))).resize((W,H),Image.LANCZOS)
  ov=Image.new('RGBA',(W,H),(0,0,0,0));od=ImageDraw.Draw(ov)
  for y in range(int(H*0.6),H):od.line([(0,y),(W,y)],fill=(25,4,45,int(215*max(0,(y-H*0.6)/(H*0.4))**1.3)))
  im=Image.alpha_composite(im.convert('RGBA'),ov)
  sp=Image.new('RGBA',(W,H),(0,0,0,0));sd=ImageDraw.Draw(sp);R=random.Random(seed)
  for i in range(46):
    x=R.uniform(0,W);y=R.uniform(0,H*0.75);ph=R.uniform(0,6.28);s=W/720*R.uniform(3,9)*(0.5+0.5*math.sin(ph+k/n*6.283*2))
    c=R.choice([(255,240,160),(255,170,220),(170,240,255),(255,255,255)])
    sd.polygon([(x,y-s*2),(x+s*.4,y-s*.4),(x+s*2,y),(x+s*.4,y+s*.4),(x,y+s*2),(x-s*.4,y+s*.4),(x-s*2,y),(x-s*.4,y-s*.4)],fill=c+(230,))
  im=Image.alpha_composite(im,sp.filter(ImageFilter.GaussianBlur(0.6))).convert('RGB')
  u=W/720
  grad_text(im,(W*0.5,H*0.80),'MELISSA TIME',font('Luckiest Guy',int(74*u)),[(255,250,200),(255,214,74),(255,120,184)],stroke=int(7*u))
  d=ImageDraw.Draw(im);f2=font('Lilita One',int(25*u))
  d.text((W*0.5,H*0.915),'The Great Birthday Rescue',font=f2,anchor='mm',fill=(255,255,255),stroke_width=int(4*u),stroke_fill=(60,8,80))
  # VOL 2 badge
  bx,by,bw,bh=W*0.83,H*0.11,int(150*u),int(54*u);pulse=1+0.06*math.sin(k/n*6.283*2)
  bw2,bh2=bw*pulse,bh*pulse
  bad=Image.new('RGBA',(W,H),(0,0,0,0));bd=ImageDraw.Draw(bad)
  bd.rounded_rectangle([bx-bw2/2-5*u,by-bh2/2-5*u,bx+bw2/2+5*u,by+bh2/2+5*u],radius=int(30*u),fill=(255,255,255,255))
  bd.rounded_rectangle([bx-bw2/2,by-bh2/2,bx+bw2/2,by+bh2/2],radius=int(26*u),fill=(255,95,162,255))
  im=Image.alpha_composite(im.convert('RGBA'),bad).convert('RGB');d=ImageDraw.Draw(im)
  d.text((bx,by+2*u),'VOL. 2',font=font('Luckiest Guy',int(36*u*pulse)),anchor='mm',fill=(255,240,120),stroke_width=int(3*u),stroke_fill=(90,10,70))
  d.text((W*0.03,H*0.05),'Happy 54th!',font=font('Lilita One',int(26*u)),anchor='lt',fill=(255,240,140),stroke_width=int(4*u),stroke_fill=(60,8,80))
  return im
O='/workspace/bday-vol2/cover/'
n=8;fr=[frame(720,378,k,n) for k in range(n)]
pal=fr[0].quantize(colors=160,method=Image.MEDIANCUT)
q=[f.quantize(palette=pal,dither=Image.NONE) for f in fr]
q[0].save(O+'cover.gif',save_all=True,append_images=q[1:],duration=110,loop=0,optimize=True)
fr[0].save(O+'cover_card.jpg',quality=88)
frame(1200,630,0,n).quantize(colors=256,method=Image.MEDIANCUT,dither=Image.FLOYDSTEINBERG).save(O+'cover.png',optimize=True)
t=src.crop((280,0,280+720,720)).resize((512,512),Image.LANCZOS);t.quantize(colors=256,dither=Image.FLOYDSTEINBERG).save(O+'icon-512.png',optimize=True);t.resize((192,192),Image.LANCZOS).save(O+'icon-192.png')
import os;[print(f,os.path.getsize(O+f)) for f in os.listdir(O)]
