import cv2, numpy as np
from PIL import Image
base=cv2.imread('frame1_v1.png')  # 3840x2160
S=3840/5250
PX,PY=1050,1542; W,H=815,1045; WX0,WY0=117,248
cy0=(3*PY-5250*2160/3840)/2
wx=(2*PX+WX0)*S; wy=(PY+WY0-cy0)*S; ww=W*S; wh=H*S
print('central window rect @4K', round(wx),round(wy),round(ww),round(wh), 'centre', round(wx+ww/2),round(wy+wh/2))
# ---- Frame 2: logo mark (square + C + I, no wordmark) centred on the central window
logo=Image.open('/home/claude/ci-design-build-prototype/design/assets/brand/logo-white.png').convert('RGBA')
mark=logo.crop((37,50,569,570))  # square part incl. C and I
side=int(ww*0.78); mark=mark.resize((side,int(side*mark.height/mark.width)),Image.LANCZOS)
lx=int(wx+ww/2-mark.width/2); ly=int(wy+wh/2-mark.height/2)
f2=Image.fromarray(cv2.cvtColor(base,cv2.COLOR_BGR2RGB)).convert('RGBA')
layer=Image.new('RGBA',f2.size,(0,0,0,0)); layer.paste(mark,(lx,ly),mark)
# slight glow behind the outline
a=np.array(layer)[...,3].astype(np.float32)/255
glow=cv2.GaussianBlur(a,(0,0),9)*0.55
glow_img=(np.dstack([np.full_like(glow,255)]*3+[np.clip(glow,0,1)*255])).astype(np.uint8)
f2.alpha_composite(Image.fromarray(glow_img)); 
la=np.array(layer); la[...,3]=(la[...,3]*0.92).astype(np.uint8); f2.alpha_composite(Image.fromarray(la))
f2=cv2.cvtColor(np.array(f2.convert('RGB')),cv2.COLOR_RGB2BGR)
cv2.imwrite('frame2_v1.png',f2)
# ---- Frame 3: central window lit with room34 inside, real frame/mullions on top, warm spill
room=cv2.imread('/home/claude/ci-design-build-prototype/design/gen/room34.jpg')
# glass area: inset by frame bar thickness
bar=int(26*S)
gx0,gy0,gx1,gy1=int(wx+bar),int(wy+bar),int(wx+ww-bar),int(wy+wh-bar)
gw,gh=gx1-gx0,gy1-gy0
sc=max(gw/room.shape[1], gh/room.shape[0])*1.0
r=cv2.resize(room,(int(room.shape[1]*sc)+1,int(room.shape[0]*sc)+1),interpolation=cv2.INTER_AREA)
rx=(r.shape[1]-gw)//2; ry=(r.shape[0]-gh)//2
r=r[ry:ry+gh, rx:rx+gw].astype(np.float32)
# warm up slightly and lift like a lit window seen from outside at night
r=r*np.array([0.90,0.98,1.06],np.float32)[None,None,:]  # BGR: a bit warmer
r=np.clip(r*1.05,0,255)
f3=base.astype(np.float32).copy()
f3[gy0:gy1,gx0:gx1]=r
# mullions from the real lit tile (bar169): dark bars inside the window rect
t=cv2.imread('tiles/bar169.png'); tw=t[WY0:WY0+H, WX0:WX0+W]
tw=cv2.resize(tw,(int(round(ww)),int(round(wh))),interpolation=cv2.INTER_AREA)
lum=cv2.cvtColor(tw,cv2.COLOR_BGR2GRAY).astype(np.float32)
dark=(lum<30).astype(np.uint8)
kv=cv2.getStructuringElement(cv2.MORPH_RECT,(1,int(wh*0.45))); kh=cv2.getStructuringElement(cv2.MORPH_RECT,(int(ww*0.45),1))
bars=cv2.morphologyEx(dark,cv2.MORPH_OPEN,kv)|cv2.morphologyEx(dark,cv2.MORPH_OPEN,kh)
mull=cv2.GaussianBlur(bars.astype(np.float32),(0,0),0.9)
X0,Y0=int(round(wx)),int(round(wy))
reg=f3[Y0:Y0+tw.shape[0], X0:X0+tw.shape[1]]
darkc=np.full_like(reg,12.0)
reg[:]=reg*(1-mull[...,None])+darkc*mull[...,None]
# glass reflection remnant: faint blend of the original dark glass (keeps it looking like glass)
orig=base[Y0:Y0+tw.shape[0], X0:X0+tw.shape[1]].astype(np.float32)
reg[:]=np.clip(reg*0.93+orig*0.35,0,255)
# warm light spill on the facade around the window
spill=np.zeros((2160,3840),np.float32); spill[Y0:Y0+tw.shape[0], X0:X0+tw.shape[1]]=1
spill=cv2.GaussianBlur(spill,(0,0),70)
tint=np.array([30,70,110],np.float32)  # BGR warm
f3=np.clip(f3+spill[...,None]*tint[None,None,:]*0.55,0,255)
cv2.imwrite('frame3_v1.png',f3.astype(np.uint8))
for n in ['frame2_v1','frame3_v1']:
    im=cv2.imread(n+'.png'); cv2.imwrite(f'/mnt/user-data/outputs/grid/{n.replace("_v1","_A")}.jpg',cv2.resize(im,(1920,1080),interpolation=cv2.INTER_AREA),[cv2.IMWRITE_JPEG_QUALITY,92])
