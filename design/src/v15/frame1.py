import cv2, numpy as np, importlib.util, sys
spec=importlib.util.spec_from_file_location('g','grid.py'); g=importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
PX,PY=1050,1542; W,H=815,1045; WX0,WY0=117,248
import os; os.makedirs('looks',exist_ok=True)
def glass_mean(t): return t[WY0+20:WY0+H-20, WX0+20:WX0+W-20].astype(float).mean()
real235=cv2.imread('tiles/dark235.png'); target=glass_mean(real235)*1.15
srcs={'dark235':('tiles/dark235.png',1.0),'dark250':('tiles/dark250.png',1.0),
      'kbed235':('ktiles/bed235.png',1.0),'kbar169':('ktiles/bar169.png',1.0),
      'kbed169':('ktiles/bed169.png',0.55),'kbed250':('ktiles/bed250.png',0.55),'kbar210':('ktiles/bar210.png',0.55)}
STONE_GAIN=float(sys.argv[1]) if len(sys.argv)>1 else 0.9
for n,(p,pre) in srcs.items():
    t=cv2.imread(p).astype(np.float32)
    t[WY0:WY0+H, WX0:WX0+W]*=pre
    m=glass_mean(t); gain=float(np.clip(target/max(m,1e-3),0.5,1.8))
    t[WY0:WY0+H, WX0:WX0+W]*=gain
    print(n,'glass mean',round(m,1),'gain',round(gain,2))
    cv2.imwrite(f'looks/{n}.png',np.clip(t,0,255).astype(np.uint8))
# stone background: bed169 tile with its window region irrelevant (overwritten); darken stone
bg=cv2.imread('tiles/bed169.png').astype(np.float32)*STONE_GAIN
cv2.imwrite('looks/stone.png',np.clip(bg,0,255).astype(np.uint8))
looks=[(n,f) for n in srcs for f in (False,True)]   # 14 looks
# 5x3 assignment, central = kbar169 (not flipped); avoid same source adjacent
order=['dark235','kbed169','kbar210','dark250','kbed235',
       'kbed250','dark250','kbar169','kbed169','dark235',
       'kbar210','kbed235','dark235','kbed250','dark250']
flips=[0,0,1,0,0, 1,1,0,1,1, 0,1,0,0,1]
assign={(r,c):(order[r*5+c],bool(flips[r*5+c])) for r in range(3) for c in range(5)}
canvas=g.build(5,3,assign,stone='stone',tile_dir='looks')
img=g.frame(canvas,3840,2160)
cv2.imwrite('frame1_v1.png',img)
cv2.imwrite('/tmp/frame1_v1.jpg',cv2.resize(img,(1920,1080),interpolation=cv2.INTER_AREA),[cv2.IMWRITE_JPEG_QUALITY,92])
