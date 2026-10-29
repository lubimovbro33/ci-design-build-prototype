import cv2, numpy as np, json, sys
tr={int(k):(np.float32(v[0]),np.float32(v[1])) for k,v in json.load(open('track.json')).items()}
H,W=1078,1916
def band_mask(cn,ex,th):
    m=np.zeros((H,W),np.uint8); cv2.polylines(m,[cn.astype(np.int32)],True,255,th); cv2.polylines(m,[ex[:2].astype(np.int32)],False,255,th); cv2.polylines(m,[np.int32([ex[0],ex[2]])],False,255,th); return m
def deglow(im, cn, ex, DMAX=64, REF=(54,64)):
    core=((im.min(axis=2)>195).astype(np.uint8))*255
    guide=band_mask(cn,ex,44)                     # where the line should be
    corel=cv2.bitwise_and(core,guide)             # the lit part of the line
    if corel.sum()==0: return im
    # the centreline band only where the line is lit (dilate the lit core along the band)
    lit=cv2.bitwise_and(cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*DMAX+1,2*DMAX+1))), band_mask(cn,ex,2*DMAX+2))
    dist=cv2.distanceTransform(255-corel, cv2.DIST_L2, 5)
    f=im.astype(np.float32)
    sel=(lit>0)&(dist<=DMAX)
    d=dist[sel].astype(int); vals=f[sel]
    med=np.zeros((DMAX+1,3),np.float32); cnt=np.zeros(DMAX+1,int)
    for k in range(DMAX+1):
        s=vals[d==k]
        if len(s)>30: med[k]=np.median(s,axis=0); cnt[k]=len(s)
        else: med[k]=med[k-1] if k>0 else 0
    ref=med[REF[0]:REF[1]].mean(axis=0)
    glow=np.clip(med-ref,0,None); glow=cv2.GaussianBlur(glow.reshape(-1,1,3),(0,0),1.2).reshape(-1,3); glow[REF[0]:]=0
    # taper the last 10 px
    for k in range(REF[0]-10,REF[0]): glow[k]*= (REF[0]-k)/10.
    out=f.copy()
    dd=np.clip(dist,0,DMAX).astype(int)
    g=glow[dd]                                    # H,W,3
    out[lit>0]-=g[lit>0]
    out=np.clip(out,0,255).astype(np.uint8)
    narrow=cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
    out=cv2.inpaint(out,narrow,6,cv2.INPAINT_TELEA)
    return out, glow
if __name__=='__main__':
    n=int(sys.argv[1]); im=cv2.imread(f'f60/f_{n:04d}.png'); cn,ex=tr[n]
    out,glow=deglow(im,cn,ex); cv2.imwrite(f'deglow_{n}.png',out)
    print('glow profile (lum) first 30:', [int(g.mean()) for g in glow[:30]])
    cv2.imwrite('band_cmp2.jpg', np.vstack([im[160:520,380:1300], out[160:520,380:1300]]), [cv2.IMWRITE_JPEG_QUALITY,85])
