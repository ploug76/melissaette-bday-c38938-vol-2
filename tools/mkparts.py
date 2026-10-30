"""Leg-rig body cutouts: removes the painted legs below the skirt hem from run1/cast so js/draw.js can draw
animated legs (real alternating stride). Rerun after tools/build_art.py regenerates hero art."""
from PIL import Image,ImageFilter
import json,os
D=os.path.dirname(os.path.abspath(__file__))+'/../art/'
def cut(src,out,y0):
  i=Image.open(D+src).convert('RGBA');px=i.load();W,H=i.size
  m=Image.new('L',i.size,255);mp=m.load()
  for y in range(y0,H):
    for x in range(W):
      r,g,b,a=px[x,y]
      dress=b>128 and r>150 and (r-b)<95
      if not dress:mp[x,y]=0
  # drop isolated specks below the hem (anything not connected upward to the dress)
  for y in range(y0+1,H):
    for x in range(W):
      if mp[x,y] and not mp[x,y-1] and not (x>0 and mp[x-1,y-1]) and not (x<W-1 and mp[x+1,y-1]):mp[x,y]=0
  m=m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
  a=i.getchannel('A');from PIL import ImageChops
  i.putalpha(ImageChops.multiply(a,m.filter(ImageFilter.GaussianBlur(0.5))));i.save(D+out,quality=92,method=6)
  return i.size
man=json.load(open(D+'manifest.json'))
for src,out,y0 in [('hero/run1.webp','hero/run_t.webp',124),('hero/cast.webp','hero/cast_t.webp',124)]:
  w,h=cut(src,out,y0);k=out[:-5];man[k]=dict(man[src[:-5]]);man[k]['w'],man[k]['h']=w,h
json.dump(man,open(D+'manifest.json','w'))
print('ok')
