import cv2, numpy as np, json, sys
from deglow import tr, band_mask, H, W
G=json.load(open('F_geom.json')); M=np.float64(G['M'])
RX,RY,RW,RH=500.,700.,1300.,746.2686567164179
PR=np.float32([[RX,RY],[RX+RW,RY],[RX+RW,RY+RH],[RX,RY+RH]])
HW=40.; FE=8.                         # plate px: core band half-width, feather
O_TOP=356.; O_BOT=-442.; O_LF=179.; O_LS=-96.; O_RF=-890.; O_RS=90.; O_ST=-60.; HW_S=18.
XCORN_R=1830.                         # right facade corner in plate x
STUB_T=np.float32([[500,760],[290,940]]); STUB_B=np.float32([[500,1446],[393.5,1386.5]])
def seg_dist(px,py,a,b):
    ab=b-a; L=float(np.hypot(*ab)); u=ab/L
    t=np.clip((px-a[0])*u[0]+(py-a[1])*u[1],0,L)
    qx=a[0]+t*u[0]; qy=a[1]+t*u[1]
    return np.hypot(px-qx,py-qy)
def glow_sub(im,cn,ex,DMAX=64,stubs=None,sth=36):
    REF=(DMAX-10,DMAX)
    core=((im.min(axis=2)>195).astype(np.uint8))*255
    guide=band_mask(cn,ex,44)
    if stubs is not None:
        core2=((im.min(axis=2)>150).astype(np.uint8))*255; sg=np.zeros_like(guide)
        for st in stubs: cv2.polylines(sg,[st.astype(np.int32)],False,255,sth)
        guide=cv2.bitwise_or(guide,sg); core=cv2.bitwise_or(core,cv2.bitwise_and(core2,sg))
    corel=cv2.bitwise_and(core,guide)
    if corel.sum()==0: return None
    lit=cv2.bitwise_and(cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*DMAX+1,2*DMAX+1))), band_mask(cn,ex,2*DMAX+2))
    dist=cv2.distanceTransform(255-corel, cv2.DIST_L2, 5)
    f=im.astype(np.float32); sel=(lit>0)&(dist<=DMAX)
    d=dist[sel].astype(int); vals=f[sel]
    med=np.zeros((DMAX+1,3),np.float32)
    for k in range(DMAX+1):
        s=vals[d==k]
        med[k]=np.median(s,axis=0) if len(s)>30 else (med[k-1] if k>0 else 0)
    ref=med[REF[0]:REF[1]].mean(axis=0)
    glow=np.clip(med-ref,0,None); glow=cv2.GaussianBlur(glow.reshape(-1,1,3),(0,0),1.2).reshape(-1,3); glow[REF[0]:]=0
    for k in range(REF[0]-10,REF[0]): glow[k]*=(REF[0]-k)/10.
    dd=np.clip(dist,0,DMAX).astype(int); g=glow[dd]
    lum=f.mean(axis=2); fac=np.clip((lum-25.)/110.,0.25,1.)[...,None]
    out=f.copy(); out[lit>0]-=(g*fac)[lit>0]
    return np.clip(out,0,255), corel, dist
def clean_frame(n):
    im=cv2.imread(f'f60/f_{n:04d}.png')
    if n<28 or n not in tr: return im
    cn,ex=tr[n]
    s=np.hypot(*(cn[1]-cn[0]))/RW                  # frame px per plate px
    Hp=cv2.getPerspectiveTransform(PR,cn)          # plate -> frame
    Hi=np.linalg.inv(Hp)
    stubs=[cv2.perspectiveTransform(st.reshape(-1,1,2),Hp).reshape(-1,2) for st in (STUB_T,STUB_B)]
    r=glow_sub(im,cn,ex,DMAX=max(40,int(150*s)),stubs=stubs,sth=max(16,int(90*s)))
    if r is None: return im
    f,corel,dist=r
    # lit region in frame: around the lit core, within band
    hwf=int(round((HW+FE)*s))+2
    lit=cv2.bitwise_and(cv2.dilate(corel,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*hwf+1,2*hwf+1))), band_mask(cn,ex,2*hwf+2))
    ys,xs=np.where(lit>0)
    if len(ys)==0: return im
    fx=xs.astype(np.float64); fy=ys.astype(np.float64)
    den=Hi[2,0]*fx+Hi[2,1]*fy+Hi[2,2]
    px=(Hi[0,0]*fx+Hi[0,1]*fy+Hi[0,2])/den; py=(Hi[1,0]*fx+Hi[1,1]*fy+Hi[1,2])/den
    HWF=HW+FE
    dT=np.where((px>=RX-HWF)&(px<=RX+RW+HWF), np.abs(py-RY), 1e9)
    dB=np.where((px>=RX-HWF)&(px<=RX+RW+HWF), np.abs(py-RY-RH), 1e9)
    dL=np.where((py>=RY-HWF)&(py<=RY+RH+900), np.abs(px-RX), 1e9)          # includes tail
    dR=np.where((py>=RY-HWF)&(py<=RY+RH+HWF), np.abs(px-RX-RW), 1e9)
    dS=np.minimum(seg_dist(px,py,STUB_T[0],STUB_T[1]), seg_dist(px,py,STUB_B[0],STUB_B[1]))
    d=np.minimum.reduce([dT,dB,dL,dR])
    ox=np.zeros_like(px); oy=np.zeros_like(py)
    nt=dT<=HWF; nb=dB<=HWF; nl=dL<=HWF; nr=dR<=HWF; 
    oy[nt]=O_TOP; oy[nb]=O_BOT
    ox[nl&(px>=RX)]=O_LF; ox[nl&(px<RX)]=O_LS
    ox[nr&(px<=XCORN_R)]=O_RF; ox[nr&(px>XCORN_R)]=O_RS
    sx=px+ox; sy=py+oy
    den2=Hp[2,0]*sx+Hp[2,1]*sy+Hp[2,2]
    mx=((Hp[0,0]*sx+Hp[0,1]*sy+Hp[0,2])/den2).astype(np.float32); my=((Hp[1,0]*sx+Hp[1,1]*sy+Hp[1,2])/den2).astype(np.float32)
    N=len(mx); cols=4096; rows=(N+cols-1)//cols
    MX=np.zeros((rows,cols),np.float32); MY=np.zeros((rows,cols),np.float32); MX.flat[:N]=mx; MY.flat[:N]=my
    src=cv2.remap(f,MX,MY,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT).reshape(-1,3)[:N]
    w=np.clip((HWF-d)/FE,0,1); w=w*w*(3-2*w)
    out=f.copy(); out[ys,xs]=f[ys,xs]*(1-w)[:,None]+src*w[:,None]
    out=np.clip(out,0,255).astype(np.uint8); f8=np.clip(f,0,255).astype(np.uint8)
    bm=np.zeros((H,W),np.uint8); bm[ys[w>0.02],xs[w>0.02]]=255
    bm=cv2.morphologyEx(bm,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    x0,y0,bw,bh=cv2.boundingRect(bm)
    if bw<4 or bh<4: return out
    x0=max(x0-2,0); y0=max(y0-2,0); x1=min(x0+bw+4,W); y1=min(y0+bh+4,H)
    try:
        res=cv2.seamlessClone(out[y0:y1,x0:x1], f8[y0:y1,x0:x1], bm[y0:y1,x0:x1], ((x1-x0)//2,(y1-y0)//2), cv2.NORMAL_CLONE)
        out2=f8.copy(); out2[y0:y1,x0:x1]=res
    except Exception as e:
        print('clone fail',e); out2=out
    # stubs (reflections on the side wall): thin inpaint of remaining bright core outside the copy band
    wm=np.zeros((H,W),np.float32); wm[ys,xs]=w
    rest=cv2.bitwise_and(corel,((wm<0.3)*255).astype(np.uint8))
    sg=np.zeros((H,W),np.uint8)
    for st in stubs: cv2.polylines(sg,[st.astype(np.int32)],False,255,max(16,int(90*s)))
    rest=cv2.bitwise_and(rest,sg)
    if rest.sum()>0:
        k=2*max(3,int(7*s))+1
        rest=cv2.dilate(rest,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(k,k)))
        out2=cv2.inpaint(out2,rest,5,cv2.INPAINT_TELEA)
    return out2
if __name__=='__main__':
    a=int(sys.argv[1]); b=int(sys.argv[2]); od=sys.argv[3] if len(sys.argv)>3 else 'clean5'
    import os; os.makedirs(od,exist_ok=True)
    for n in range(a,b+1): cv2.imwrite(f'{od}/f_{n:04d}.png', clean_frame(n))
    print('done',a,b)
