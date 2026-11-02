import cv2, numpy as np, sys
def square_center(p, out, x0,x1,rows, pad=28):
    im=cv2.imread(p).astype(np.float32); H,W=im.shape[:2]
    w=x1-x0
    ys=np.arange(H,dtype=np.float32)
    # build src-y for the central column: piecewise per row
    srcy=ys.copy()
    pitch=np.median(np.diff([ (a+b)/2 for a,b in rows])) if len(rows)>1 else 360
    for (a,b) in rows:
        h=b-a; cy=(a+b)/2; D=pitch/2
        if h<=w+2: continue
        # out window half = w/2 maps to src half h/2; then linear to identity at ±D
        for sign in (-1,1):
            # out offsets o in [0,w/2] -> src offsets o*h/w ; o in [w/2, D] -> lerp(h/2, D)
            m1=(ys-cy)*sign
            sel=(m1>=0)&(m1<=D)
            o=m1[sel]
            s=np.where(o<=w/2, o*h/w, h/2+(o-w/2)*(D-h/2)/(D-w/2))
            srcy[sel]=cy+sign*s
    # x weight
    xs=np.arange(W,dtype=np.float32)
    wx=np.ones_like(xs)   # uniform across the width: no bent joints
    mapy=ys[:,None]+(srcy[:,None]-ys[:,None])*wx[None,:]
    mapx=np.repeat(xs[None,:],H,0)
    res=cv2.remap(im,mapx,mapy.astype(np.float32),cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT)
    return np.clip(res,0,255).astype(np.uint8)
def recentre(im,cx,cy,s=1.045):
    H,W=im.shape[:2]; M=np.float32([[s,0,W/2-cx*s],[0,s,H/2-cy*s]])
    return cv2.warpAffine(im,M,(W,H),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT)
J={'3a':dict(x0=744,x1=932,rows=[(5,203),(350,558),(713,905)]),
   '3b':dict(x0=745,x1=926,rows=[(-64,158),(320,542),(720,911)])}
for k,d in J.items():
    sq=square_center(f'gpt_facade_{k}.png',None,d['x0'],d['x1'],d['rows'])
    a,b=d['rows'][1]; cx=(d['x0']+d['x1'])/2; cy=(a+b)/2
    rc=recentre(sq,cx,cy)
    cv2.imwrite(f'gpt{k}_sq.png',rc)
    cv2.imwrite(f'/mnt/user-data/outputs/grid/gpt{k}_square_centred.jpg',cv2.resize(rc,(1920,1080),interpolation=cv2.INTER_CUBIC),[cv2.IMWRITE_JPEG_QUALITY,92])
