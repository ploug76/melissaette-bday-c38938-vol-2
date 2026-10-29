import sys, os, json
sys.path.insert(0, '/workspace/taco-game/art/_tools')
from keylib import *
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
G='/workspace/bday-vol2/gen/'; O='/workspace/bday-vol2/game/art/'
MAN={}
def put(rel, im, q=82, **m):
    save(im, O+rel, q=q); MAN[rel.rsplit('.',1)[0]]=dict(w=im.size[0],h=im.size[1],**m)
def keyed(name, hard=85, soft=135):
    im=key(load(G+name+'.jpg'),hard,soft)
    s=np.asarray(load(G+name+'.jpg')).astype(int); r,g,b=s[...,0],s[...,1],s[...,2]
    kc='m' if ((r>180)&(g<80)&(b>100)).sum()>((g>180)&(r<80)&(b<80)).sum() else 'g'
    return despill_edge(im,kc,2),kc
def same_canvas(ims, s):
    ims=[fit(i,scale=s) for i in ims]
    W=max(i.size[0] for i in ims); H=max(i.size[1] for i in ims)
    out=[]
    for i in ims:
        c=Image.new('RGBA',(W,H)); c.paste(i,((W-i.size[0])//2,H-i.size[1])); out.append(c)
    return out
# ---- hero
hk,_=keyed('hero_sheet')
hp=splitN(hk,6)
s=236/hp[0].size[1]
names=['idle','run1','run2','jump','cast','hurt']
# give every frame its own canvas width but same scale; anchor bottom-center
for n,im in zip(names,hp):
    im=fit(im,scale=s); put(f'hero/{n}.webp',im,anchor='bc')
# ---- enemies (face LEFT)
ek,_=keyed('enemies'); ep=splitN(ek,6)
for n,im in zip(['grumblin','raincloud','buzzgrump','snapper','crystalbat','snowgrump'],ep):
    put(f'enemy/{n}.webp',fit(im,maxw=170,maxh=150),anchor='bc')
# ---- bosses
bk,_=keyed('bosses1'); bp=splitN(bk,3)
for n,im in zip(['smudge','buzzbelle','snapjaw'],bp): put(f'boss/{n}.webp',fit(im,maxw=460,maxh=420),anchor='bc')
bk,_=keyed('bosses2'); bp=splitN(bk,3)
for n,im in zip(['glimmerfang','frostbeard','humbug'],bp): put(f'boss/{n}.webp',fit(im,maxw=480,maxh=440),anchor='bc')
# ---- pals (face RIGHT)
pk,_=keyed('pals'); pp=splitN(pk,7)
for n,im in zip(['bunny','frog','owl','mouse','hedgehog','fox','badger'],pp): put(f'pal/{n}.webp',fit(im,maxh=150),anchor='bc')
# ---- items
ik,_=keyed('items'); ip=splitN(ik,8)
for n,im in zip(['candle','cupcake','gift','heart','star','balloon','spark','cage'],ip):
    put(f'item/{n}.webp',fit(im,maxw=150 if n=='cage' else 110,maxh=150 if n=='cage' else 110),anchor='c')
# ---- grounds: 2 rows of 3 -> top strip (alpha above) + fill texture
gk,_=keyed('grounds')
gp=items(gk,6,grid_rows=2)
for n,(im,bb) in zip(['village','fields','river','cave','peaks','castle'],gp):
    w,h=im.size; im=im.crop((int(w*.08),0,int(w*.92),h))
    a=np.asarray(im).copy(); H_,W_=a.shape[:2]
    # fill fully-opaque below each column's top
    tops=[]
    for x in range(W_):
        ok=np.where(a[:,x,3]>200)[0]; tops.append(ok[0] if len(ok) else H_)
    tops=np.array(tops); bot=int(np.percentile([np.where(a[:,x,3]>200)[0][-1] if (a[:,x,3]>200).any() else 0 for x in range(W_)],10))
    a=a[:bot]
    im=Image.fromarray(a,'RGBA')
    im=seamless(im,40)
    im=fit(im,scale=128/im.size[1]*1.0)
    put(f'ground/{n}.webp',im,q=85)
    # fill: bottom 45% of the block, opaque, seamless both ways
    arr=np.asarray(im.convert('RGBA')); hh=arr.shape[0]
    fl=Image.fromarray(arr[int(hh*.55):,:,:3]).convert('RGB')
    fl=seamless(fl,24); fl=fl.resize((fl.size[0],64))
    put(f'ground/{n}_fill.webp',fl,q=80)
# ---- far + mid layers
for th in ['village','fields','river','cave','peaks','castle']:
    far=load(G+f'far_{th}.jpg')
    far=seamless(far,200).resize((round(1080*1.0*(1080/720)),720),Image.LANCZOS) if False else seamless(far,200)
    far=far.resize((round(far.size[0]*540/720),540),Image.LANCZOS)
    put(f'bg/{th}_far.webp',far,q=78)
    mk,kc=keyed(f'mid_{th}')
    if kc=='g': mk=kill_hue(mk,lambda r,g,b:(g>1.6*np.maximum(r,b))&(g>120))
    else:
        _a=np.asarray(mk).copy(); _a[...,3]=ndi.minimum_filter(_a[...,3],size=3); mk=Image.fromarray(_a,'RGBA')
    a=np.asarray(mk)[...,3]; rows=(a>128).mean(1); occ=np.where(rows>0.02)[0]
    top,bot=int(occ.min()),int(occ.max())+1
    # drop bottom key line rows
    mk=mk.crop((0,top,mk.size[0],bot))
    mk=seamless_sparse(mk,60)
    mk=fit(mk,scale=min(1.0,300/mk.size[1]))
    put(f'bg/{th}_mid.webp',mk,q=80)
# ---- cinematics
for n in ['intro1','intro2','intro3','ending','title_wide']:
    im=load(G+n+'.jpg'); im.save(O+f'cine/{n}.jpg' if os.path.isdir(O+'cine') else (os.makedirs(O+'cine') or O+f'cine/{n}.jpg'),quality=84,optimize=True,progressive=True)
load(G+'title_tall.jpg').save(O+'cine/title_tall.jpg',quality=84,optimize=True,progressive=True)
json.dump(MAN,open(O+'manifest.json','w'),indent=0)
print(len(MAN))
