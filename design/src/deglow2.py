import cv2, numpy as np, json, sys
from deglow import tr, band_mask, H, W
def segs_of(cn,ex):
    S=[]
    for i in range(4): S.append((cn[i],cn[(i+1)%4]))
    S.append((ex[0],ex[1])); S.append((ex[0],ex[2]))
    return S
def fill_core(im, corel, cn, ex, hw=8):
    """replace the thin core band by interpolating across it along the local normal (keeps structures crossing the line)"""
    band=cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*hw+1,2*hw+1)))
    ys,xs=np.where(band>0)
    if len(ys)==0: return im
    P=np.stack([xs,ys],1).astype(np.float32)
    best=np.full(len(P),1e9,np.float32); bn=np.zeros((len(P),2),np.float32); bs=np.zeros(len(P),np.float32)
    for a,b in segs_of(cn,ex):
        a=np.float32(a); b=np.float32(b); ab=b-a; L=np.linalg.norm(ab)+1e-6; u=ab/L; n=np.array([-u[1],u[0]],np.float32)
        t=np.clip(((P-a)@u),0,L); proj=a+np.outer(t,u); dv=P-proj; sd=dv@n; d=np.abs(sd)
        m=d<best; best[m]=d[m]; bn[m]=n; bs[m]=sd[m]
    off=hw+2
    pa=P+bn*off; pb=P-bn*off          # the two sides across the line
    f=im.astype(np.float32)
    def samp(pts):
        N=len(pts); cols=4096; rows=(N+cols-1)//cols
        mx=np.zeros((rows,cols),np.float32); my=np.zeros((rows,cols),np.float32)
        mx.flat[:N]=pts[:,0]; my.flat[:N]=pts[:,1]
        return cv2.remap(f,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT).reshape(-1,3)[:N]
    va=samp(pa); vb=samp(pb)
    w=np.clip((bs+off)/(2*off),0,1).reshape(-1,1)      # position across the band
    out=f.copy(); out[ys,xs]=va*w+vb*(1-w)
    # feather at the band edge
    return np.clip(out,0,255).astype(np.uint8)
def clean_frame(n):
    im=cv2.imread(f'f60/f_{n:04d}.png')
    if n<28 or n not in tr: return im
    cn,ex=tr[n]
    from deglow import deglow
    r=deglow(im,cn,ex)
    if isinstance(r,tuple): out,_=r
    else: return im
    return out
if __name__=='__main__':
    n=int(sys.argv[1]); im=cv2.imread(f'f60/f_{n:04d}.png'); cn,ex=tr[n]
    import deglow as D
    # deglow without the TELEA step: re-run pieces
    core=((im.min(axis=2)>195).astype(np.uint8))*255; guide=band_mask(cn,ex,44); corel=cv2.bitwise_and(core,guide)
    out,glow=D.deglow(im,cn,ex)            # includes TELEA core; we instead rebuild: deglow then fill_core
    # redo: subtract glow only (copy of deglow internals) 
    DMAX=64; lit=cv2.bitwise_and(cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*DMAX+1,2*DMAX+1))), band_mask(cn,ex,2*DMAX+2))
    dist=cv2.distanceTransform(255-corel, cv2.DIST_L2, 5); dd=np.clip(dist,0,DMAX).astype(int)
    f=im.astype(np.float32); g=glow[dd]; f[lit>0]-=g[lit>0]; f=np.clip(f,0,255).astype(np.uint8)
    out2=fill_core(f,corel,cn,ex,8)
    cv2.imwrite(f'deglow2_{n}.png',out2)
    cv2.imwrite('band_cmp3.jpg', np.vstack([im[160:520,380:1300], out[160:520,380:1300], out2[160:520,380:1300]]), [cv2.IMWRITE_JPEG_QUALITY,85]); print('ok')
