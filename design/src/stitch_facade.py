import cv2, numpy as np, glob
fs=sorted(glob.glob('/home/claude/hero/night/p_0*.jpg'))[15:]   # p_016..p_030 = 30.5..37.5 s (rightward pass)
ims=[cv2.resize(cv2.imread(f),(1080,1920),interpolation=cv2.INTER_AREA) for f in fs]
H,W=ims[0].shape[:2]
sift=cv2.SIFT_create(nfeatures=8000); bf=cv2.BFMatcher()
feats=[]
for im in ims:
    g=cv2.createCLAHE(3.0,(8,8)).apply(cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)); feats.append(sift.detectAndCompute(g,None))
Ms=[np.eye(3)]
for i in range(len(ims)-1):
    k1,d1=feats[i]; k2,d2=feats[i+1]
    m=bf.knnMatch(d1,d2,k=2); good=[a for a,b in m if a.distance<0.75*b.distance]
    p1=np.float32([k1[a.queryIdx].pt for a in good]); p2=np.float32([k2[a.trainIdx].pt for a in good])
    A,inl=cv2.estimateAffinePartial2D(p2,p1,method=cv2.RANSAC,ransacReprojThreshold=2.5)   # frame i+1 → frame i
    s=np.hypot(A[0,0],A[0,1]); print(fs[i+1].split('/')[-1],'good',len(good),'inl',int(inl.sum()),'tx=%.1f ty=%.1f s=%.4f'%(A[0,2],A[1,2],s))
    Ms.append(Ms[-1]@np.vstack([A,[0,0,1]]))
ref=len(ims)//2; R=np.linalg.inv(Ms[ref]); Ms=[R@m for m in Ms]
corners=np.float32([[0,0],[W,0],[W,H],[0,H]]).reshape(-1,1,2)
pts=np.concatenate([cv2.perspectiveTransform(corners,m) for m in Ms])
minx,miny=np.floor(pts.min(axis=0).ravel()).astype(int); maxx,maxy=np.ceil(pts.max(axis=0).ravel()).astype(int)
T=np.array([[1,0,-minx],[0,1,-miny],[0,0,1]],np.float64); CW,CH=maxx-minx,maxy-miny; print('canvas',CW,CH)
# order frames by canvas x of their centre
cx=[ (T@m@np.array([W/2,H/2,1]))[0] for m in Ms ]
order=np.argsort(cx)
canvas=None; cmask=None
for idx in order:
    M=T@Ms[idx]
    wi=cv2.warpPerspective(ims[idx],M,(CW,CH),flags=cv2.INTER_LINEAR)
    wm=cv2.warpPerspective(np.full((H,W),255,np.uint8),M,(CW,CH),flags=cv2.INTER_NEAREST)>0
    if canvas is None: canvas=wi; cmask=wm; continue
    ov=cmask&wm
    cols=np.where(ov.any(axis=0))[0]
    if len(cols)<40: canvas[wm&~cmask]=wi[wm&~cmask]; cmask|=wm; continue
    # exposure gain on the overlap
    a=canvas[ov].astype(np.float32); b=wi[ov].astype(np.float32); g=(a.mean()+1)/(b.mean()+1); wi=np.clip(wi.astype(np.float32)*g,0,255).astype(np.uint8)
    # seam: column in the middle 70% of the overlap with the smallest mean abs diff
    c0,c1=cols.min(),cols.max(); lo=int(c0+(c1-c0)*.15); hi=int(c0+(c1-c0)*.85)
    diff=np.abs(canvas.astype(np.int16)-wi.astype(np.int16)).sum(axis=2).astype(np.float32)
    colscore=[]
    for c in range(lo,hi):
        m=ov[:,c]; colscore.append(diff[m,c].mean() if m.sum()>100 else 1e9)
    seam=lo+int(np.argmin(colscore)); F=28
    x=np.arange(CW); w=np.clip((x-(seam-F))/(2*F),0,1).astype(np.float32)   # 0 left of seam → 1 right of seam (new frame is to the right)
    wmap=np.broadcast_to(w[None,:],(CH,CW)).copy(); wmap[~wm]=0; wmap[~cmask]=1
    canvas=(canvas.astype(np.float32)*(1-wmap[:,:,None])+wi.astype(np.float32)*wmap[:,:,None]).astype(np.uint8)
    cmask|=wm
    print('frame',fs[idx].split('/')[-1],'seam',seam,'score %.1f'%min(colscore))
# crop to the valid rows/cols
ys=np.where(cmask.all(axis=1))[0]
cols=np.where(cmask.mean(axis=0)>.5)[0]; sub=cmask[:,cols.min():cols.max()]; rows=np.where(sub.mean(axis=1)>.995)[0]
out=canvas[rows.min():rows.max(),cols.min():cols.max()]
print('out',out.shape)
cv2.imwrite('/home/claude/hero/night/pano3.jpg',out,[cv2.IMWRITE_JPEG_QUALITY,93])
cv2.imwrite('/home/claude/hero/night/pano3_small.jpg',cv2.resize(out,(out.shape[1]//2,out.shape[0]//2)),[cv2.IMWRITE_JPEG_QUALITY,85])
