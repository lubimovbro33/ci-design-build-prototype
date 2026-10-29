import cv2, numpy as np, json, sys
import deglow as D
from deglow2 import fill_core
from deglow import tr, band_mask
def clean_frame(n):
    im=cv2.imread(f'f60/f_{n:04d}.png')
    if n<28 or n not in tr: return im
    cn,ex=tr[n]
    core=((im.min(axis=2)>195).astype(np.uint8))*255; guide=band_mask(cn,ex,44); corel=cv2.bitwise_and(core,guide)
    if corel.sum()==0: return im
    r=D.deglow(im,cn,ex)
    if not isinstance(r,tuple): return im
    _,glow=r
    DMAX=64; lit=cv2.bitwise_and(cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*DMAX+1,2*DMAX+1))), band_mask(cn,ex,2*DMAX+2))
    dist=cv2.distanceTransform(255-corel, cv2.DIST_L2, 5); dd=np.clip(dist,0,DMAX).astype(int)
    f=im.astype(np.float32); g=glow[dd]; f[lit>0]-=g[lit>0]; f=np.clip(f,0,255).astype(np.uint8)
    out=fill_core(f,corel,cn,ex,8)
    band=cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(21,21)))
    bl=cv2.GaussianBlur(out,(0,0),1.6); w=cv2.GaussianBlur((band>0).astype(np.float32),(0,0),3)[...,None]*.7
    out=np.clip(out.astype(np.float32)*(1-w)+bl.astype(np.float32)*w,0,255).astype(np.uint8)
    return out
if __name__=='__main__':
    a=int(sys.argv[1]); b=int(sys.argv[2])
    for n in range(a,b+1): cv2.imwrite(f'clean/f_{n:04d}.png', clean_frame(n))
    print('done',a,b)
