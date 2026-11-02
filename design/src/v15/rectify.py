import cv2, numpy as np, sys, json
f=sys.argv[1]; out=sys.argv[2]
im=cv2.imread(f); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(float)
g=cv2.GaussianBlur(g,(5,5),0)
def edge_x(y0,y1,xa,xb,dir):
    """for rows y0..y1 find x in [xa,xb] where luminance crosses dark threshold; dir=+1 stone->frame scanning right (first x with lum<T), -1 frame->stone (last x with lum<T)"""
    pts=[]
    for y in range(y0,y1,15):
        row=g[y,xa:xb]; T=16
        idx=np.where(row<T)[0]
        if len(idx)==0: continue
        x= xa+idx[0] if dir>0 else xa+idx[-1]
        pts.append((x,y))
    return np.array(pts,float)
def edge_y(x0,x1,ya,yb,dir):
    pts=[]
    for x in range(x0,x1,15):
        col=g[ya:yb,x]; T=16
        idx=np.where(col<T)[0]
        if len(idx)==0: continue
        y= ya+idx[0] if dir>0 else ya+idx[-1]
        pts.append((x,y))
    return np.array(pts,float)
def fit(pts,vertical):
    # robust line fit; returns (a,b): x=a*y+b if vertical else y=a*x+b
    if vertical: X=pts[:,1]; Y=pts[:,0]
    else: X=pts[:,0]; Y=pts[:,1]
    for _ in range(3):
        a,b=np.polyfit(X,Y,1); r=np.abs(Y-(a*X+b)); keep=r<np.percentile(r,70)+2
        X,Y=X[keep],Y[keep]
    return np.polyfit(X,Y,1)
cfg=json.loads(sys.argv[3]) if len(sys.argv)>3 else {}
L=cfg.get('L',[100,230,880,1020]); R=cfg.get('R',[1150,1280,2020,2159]); T=cfg.get('T',[1040,1150]); B=cfg.get('B',[2030,2160])
res={}
for name,(xa1,xb1,xa2,xb2) in {'L':L,'R':R}.items():
    yl=(T[1]+60, B[0]-60)
    left=fit(edge_x(yl[0],yl[1],xa1,xb1,+1),True)
    right=fit(edge_x(yl[0],yl[1],xa2,xb2,-1),True)
    xm=(xa1+xb2)//2
    top=fit(edge_y(xa1+80,xb2-80,T[0],T[1],+1),False)
    bot=fit(edge_y(xa1+80,xb2-80,B[0],B[1],-1),False)
    def inter(v,h):
        # x=a*y+b ; y=c*x+d
        a,b=v; c,d=h
        y=(c*b+d)/(1-a*c); x=a*y+b; return [x,y]
    res[name]=dict(tl=inter(left,top),tr=inter(right,top),bl=inter(left,bot),br=inter(right,bot))
print(json.dumps(res,indent=1))
# ideal
wl=np.hypot(*(np.array(res['L']['tr'])-np.array(res['L']['tl']))); wr=np.hypot(*(np.array(res['R']['tr'])-np.array(res['R']['tl'])))
hl=np.hypot(*(np.array(res['L']['bl'])-np.array(res['L']['tl']))); hr=np.hypot(*(np.array(res['R']['bl'])-np.array(res['R']['tl'])))
pier=np.array(res['R']['tl'])[0]-np.array(res['L']['tr'])[0]
W=(wl+wr)/2; H=(hl+hr)/2; P=pier
print('wl,wr,hl,hr,pier',wl,wr,hl,hr,pier,'-> W,H,P',W,H,P, 'P/W',P/W,'W/H',W/H)
