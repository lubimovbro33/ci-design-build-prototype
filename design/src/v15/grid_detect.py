import cv2, numpy as np
def runs(mask,minlen):
    r=[];s=None
    for i,v in enumerate(mask):
        if v and s is None: s=i
        if not v and s is not None: r.append((s,i)); s=None
    if s is not None: r.append((s,len(mask)))
    return [x for x in r if x[1]-x[0]>=minlen]
def detect(path, lo=28, hi=75):
    im=cv2.imread(path); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(float); H,W=g.shape
    # stone rows: rows where the median over the full width is stone-like
    rowp=np.median(g,1); srows=runs((rowp>lo)&(rowp<hi),12)
    wrows=[]; prev=0
    for a,b in srows:
        if a-prev>40: wrows.append((prev,a))
        prev=b
    if H-prev>40: wrows.append((prev,H))
    # piers: within the middle window row
    mid=min(wrows,key=lambda r:abs((r[0]+r[1])/2-H/2))
    colp=np.median(g[mid[0]+10:mid[1]-10],0); piers=runs((colp>lo)&(colp<hi),15)
    wcols=[]; prev=0
    for a,b in piers:
        if a-prev>30: wcols.append((prev,a))
        prev=b
    if W-prev>30: wcols.append((prev,W))
    return wrows,wcols
if __name__=='__main__':
    import sys
    for p in sys.argv[1:]: print(p, detect(p))
