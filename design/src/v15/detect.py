import cv2, numpy as np, sys, json
def detect(f, band=(1150,2050), show=None):
    im=cv2.imread(f); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(float); g=cv2.GaussianBlur(g,(3,3),0)
    B=g[band[0]:band[1],:]
    m=B.mean(0); s=B.std(0)
    pier=(m>18)&(m<48)&(s<7)
    # runs of pier
    runs=[];st=None
    for x in range(len(pier)):
        if pier[x] and st is None: st=x
        if not pier[x] and st is not None: runs.append((st,x)); st=None
    if st is not None: runs.append((st,len(pier)))
    runs=[r for r in runs if r[1]-r[0]>60]
    wins=[]
    for a,b in zip(runs[:-1],runs[1:]):
        x0,x1=a[1],b[0]
        if x1-x0<500: continue
        # vertical: rows where the window x-range is stone (mean 20..48, std<8)
        col=g[:,x0+100:x1-100]; rm=col.mean(1); rs=col.std(1)
        stone=(rm>18)&(rm<48)&(rs<9)
        # window top: going up from band centre, first stone row; bottom: going down
        yc=(band[0]+band[1])//2
        yt=yc
        while yt>0 and not stone[yt]: yt-=1
        yb=yc
        while yb<g.shape[0]-1 and not stone[yb]: yb+=1
        wins.append(dict(x0=int(x0),x1=int(x1),y0=int(yt+1),y1=int(yb),w=int(x1-x0),h=int(yb-yt-1)))
    piers=[(int(a),int(b)) for a,b in runs]
    if show:
        v=im.copy()
        for w in wins: cv2.rectangle(v,(w['x0'],w['y0']),(w['x1'],w['y1']),(0,255,255),6)
        for a,b in piers: cv2.rectangle(v,(a,band[0]),(b,band[1]),(255,0,0),4)
        cv2.imwrite(show, cv2.resize(np.clip(v*1.8,0,255).astype(np.uint8),(540,960)))
    return piers,wins
if __name__=='__main__':
    for f in sys.argv[1:]:
        p,w=detect(f, show='/tmp/det_'+f.split('/')[-1][:-4]+'.jpg')
        print(f,'piers',p,'wins',w)
