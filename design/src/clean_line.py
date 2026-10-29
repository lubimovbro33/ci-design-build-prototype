import cv2, numpy as np, sys, json
REF=157; FIRST=1; LAST=157
def load(n): return cv2.imread(f'f60/f_{n:04d}.png')
def core_mask(im):
    g=im.min(axis=2); return (g>195).astype(np.uint8)
def line_component(im):
    m=core_mask(im); k,lab,st,_=cv2.connectedComponentsWithStats(m); i=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); return (lab==i).astype(np.uint8)
ref=load(REF); lc=line_component(ref)
cs,_=cv2.findContours(lc,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); c=max(cs,key=cv2.contourArea); hull=cv2.convexHull(c).reshape(-1,2).astype(np.float32)
s=hull.sum(1); d=hull[:,0]-hull[:,1]
corners=np.float32([hull[np.argmin(s)],hull[np.argmax(d)],hull[np.argmax(s)],hull[np.argmin(d)]])  # TL TR BR BL (outer edge of the line)
# move corners inward by ~5 px to the centreline
cx,cy=corners.mean(0); 
for i in range(4): v=corners[i]-np.array([cx,cy]); corners[i]-= v/np.linalg.norm(v)*6
print('ref corners', corners.round(1).tolist())
H,W=ref.shape[:2]
# tracking setup
gray_prev=cv2.cvtColor(ref,cv2.COLOR_BGR2GRAY)
Hchain=np.eye(3)  # frame157 -> frame n
lk=dict(winSize=(21,21),maxLevel=3,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,0.01))
report=[]
out_corners={REF:corners.copy()}
for n in range(REF-1, 27, -1):
    cur=load(n); gray=cv2.cvtColor(cur,cv2.COLOR_BGR2GRAY)
    # features on the previous frame, excluding bright line pixels and sky (use facade region: left 75% of width roughly where building is)
    fm=np.ones_like(gray_prev)*255; fm[core_mask(load(n+1))>0]=0
    fm=cv2.erode(fm,np.ones((15,15),np.uint8))
    pts=cv2.goodFeaturesToTrack(gray_prev, 1200, 0.01, 8, mask=fm, blockSize=7)
    nxt,stt,err=cv2.calcOpticalFlowPyrLK(gray_prev, gray, pts, None, **lk)
    back,stb,_=cv2.calcOpticalFlowPyrLK(gray, gray_prev, nxt, None, **lk)
    good=(stt.ravel()==1)&(stb.ravel()==1)&(np.linalg.norm((pts-back).reshape(-1,2),axis=1)<1.0)
    p0=pts[good].reshape(-1,2); p1=nxt[good].reshape(-1,2)
    Hn,inl=cv2.findHomography(p0,p1,cv2.RANSAC,2.0)
    Hchain=Hn@Hchain
    cn=cv2.perspectiveTransform(corners.reshape(-1,1,2),Hchain).reshape(-1,2)
    out_corners[n]=cn
    # QA: fraction of line-core pixels (bright thin) inside the band
    band=np.zeros((H,W),np.uint8); cv2.polylines(band,[cn.astype(np.int32)],True,255,36)
    cm=core_mask(cur); inside=(cm>0)&(band>0); 
    report.append((n, int(good.sum()), int(inl.sum()), int((cm>0).sum()), int(inside.sum())))
    gray_prev=gray
    if n%20==0: print(report[-1], cn.round(0).tolist())
json.dump({str(k):v.tolist() for k,v in out_corners.items()}, open('corners.json','w'))
print('done')
