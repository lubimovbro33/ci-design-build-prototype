import cv2, numpy as np, sys
def runs(mask, minlen):
    r=[];s=None
    for i,v in enumerate(mask):
        if v and s is None: s=i
        if not v and s is not None: r.append((s,i)); s=None
    if s is not None: r.append((s,len(mask)))
    m=[]
    for x in r:
        if m and x[0]-m[-1][1] < 14: m[-1]=(m[-1][0],x[1])
        else: m.append(x)
    return [x for x in m if x[1]-x[0]>=minlen]
def measure(path):
    im=cv2.imread(path); H,W=im.shape[:2]
    g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(float)
    prof=np.median(g[int(H*0.38):int(H*0.58)],0); thr=(np.percentile(prof,90)+np.percentile(prof,10))/2
    xr=runs(prof<thr, W//30)
    mid=min(xr,key=lambda r:abs((r[0]+r[1])/2-W/2)); x0,x1=mid
    col=np.median(g[:, x0+(x1-x0)//4:x1-(x1-x0)//4],1); thr2=(np.percentile(col,90)+np.percentile(col,10))/2
    yr=runs(col<thr2, H//20)
    y0,y1=min(yr,key=lambda r:abs((r[0]+r[1])/2-H/2))
    return dict(W=W,H=H,xr=xr,yr=yr,win=(x0,y0,x1,y1),c=((x0+x1)/2,(y0+y1)/2))
if __name__=='__main__':
    for p in sys.argv[1:]: print(p, measure(p))
