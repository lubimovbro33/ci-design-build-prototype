import cv2, numpy as np, json, sys
W,H,P,S=815.0,1045.0,235.0,497.0
PX,PY=W+P,H+S
def refine(g, box):
    x0,x1,y0,y1=box
    # local stone level: median of a ring outside the box
    ring=np.concatenate([g[max(0,y0-220):max(0,y0-40), x0:x1].ravel(), g[y1+40:y1+220, x0:x1].ravel(), g[y0:y1, max(0,x0-220):max(0,x0-40)].ravel(), g[y0:y1, x1+40:x1+220].ravel()])
    st=np.median(ring[ring>5]) if (ring>5).any() else 30
    T=0.55*st; M=70; MINRUN=14
    def first_run(vals):
        # index of start of first run of >=MINRUN dark values
        d=vals<T; n=len(d); i=0
        while i<n:
            if d[i]:
                j=i
                while j<n and d[j]: j+=1
                if j-i>=MINRUN: return i
                i=j
            else: i+=1
        return None
    def scan_x(xe,dirn):
        pts=[]
        for y in range(int(y0+0.15*(y1-y0)), int(y1-0.15*(y1-y0)), 10):
            if dirn>0: vals=g[y,max(0,xe-M):xe+M]; r=first_run(vals); 
            else: vals=g[y,xe-M:min(g.shape[1],xe+M)][::-1]; r=first_run(vals)
            if r is None: continue
            x=(max(0,xe-M)+r) if dirn>0 else (min(g.shape[1],xe+M)-1-r)
            pts.append((x,y))
        return np.array(pts,float)
    def scan_y(ye,dirn):
        pts=[]
        for x in range(int(x0+0.12*(x1-x0)), int(x1-0.12*(x1-x0)), 10):
            if dirn>0: vals=g[max(0,ye-M):ye+M,x]; r=first_run(vals)
            else: vals=g[ye-M:min(g.shape[0],ye+M),x][::-1]; r=first_run(vals)
            if r is None: continue
            y=(max(0,ye-M)+r) if dirn>0 else (min(g.shape[0],ye+M)-1-r)
            pts.append((x,y))
        return np.array(pts,float)
    def fit(pts,vertical):
        assert len(pts)>=6, 'edge not found'
        X,Y=(pts[:,1],pts[:,0]) if vertical else (pts[:,0],pts[:,1])
        for _ in range(4):
            a,b=np.polyfit(X,Y,1); r=np.abs(Y-(a*X+b)); keep=r<=max(2.5,np.percentile(r,55))
            if keep.sum()<6: break
            X,Y=X[keep],Y[keep]
        return np.polyfit(X,Y,1)
    left=fit(scan_x(x0,+1),True); right=fit(scan_x(x1,-1),True)
    top=fit(scan_y(y0,+1),False); bot=fit(scan_y(y1,-1),False)
    def inter(v,h):
        a,b=v; c,d=h; y=(c*b+d)/(1-a*c); return [a*y+b,y]
    return dict(tl=inter(left,top),tr=inter(right,top),bl=inter(left,bot),br=inter(right,bot), stone=float(st))
def rectify(f, boxes, out_prefix):
    im=cv2.imread(f); g=cv2.GaussianBlur(cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(float),(5,5),0)
    cs=[refine(g,b) for b in boxes]
    src=[];dst=[]
    OX,OY=1600,1200
    for i,c in enumerate(cs):
        x=OX+i*PX
        src+= [c['tl'],c['tr'],c['bl'],c['br']]; dst+=[[x,OY],[x+W,OY],[x,OY+H],[x+W,OY+H]]
    src=np.float32(src); dst=np.float32(dst)
    Hm=cv2.getPerspectiveTransform(src[:4],dst[:4])
    # measured pier in source scale -> report
    CW=int(OX*2+len(boxes)*PX); CH=int(OY*2+H)
    rect=cv2.warpPerspective(im,Hm,(CW,CH),flags=cv2.INTER_LANCZOS4)
    valid=cv2.warpPerspective(np.full(im.shape[:2],255,np.uint8),Hm,(CW,CH))
    tiles=[]
    for i in range(len(boxes)):
        x=OX+i*PX
        # tile: window centred: x from x-P/2 to x+W+P/2 ; y from OY-S/2 to OY+H+S/2
        tx0=int(round(x-P/2)); ty0=int(round(OY-S/2))
        t=rect[ty0:ty0+int(round(PY)), tx0:tx0+int(round(PX))].copy()
        v=valid[ty0:ty0+int(round(PY)), tx0:tx0+int(round(PX))]
        cov=(v>0).mean()
        # mirror-fill invalid pixels (module is symmetric about its centre)
        inv=(v==0)
        if inv.any():
            tm=t[:, ::-1]; vm=v[:, ::-1]; fill=inv&(vm>0); t[fill]=tm[fill]; v=v.copy(); v[fill]=255; inv=(v==0)
        if inv.any():
            tm=t[::-1]; vm=v[::-1]; fill=inv&(vm>0); t[fill]=tm[fill]; v[fill]=255
        name=f'{out_prefix}_{i}'
        cv2.imwrite(f'tiles/{name}.png',t); cv2.imwrite(f'tiles/{name}_valid.png',v)
        tiles.append((name,cov))
    # corners report
    widths=[np.hypot(*(np.array(c['tr'])-np.array(c['tl']))) for c in cs]; heights=[np.hypot(*(np.array(c['bl'])-np.array(c['tl']))) for c in cs]
    print(f, 'widths',[round(w) for w in widths],'heights',[round(h) for h in heights], 'W/H',[round(w/h,3) for w,h in zip(widths,heights)], 'tiles',[(n,round(c,3)) for n,c in tiles])
    if len(cs)>1: print('  pier src', round(cs[1]['tl'][0]-cs[0]['tr'][0]), 'P/W', round((cs[1]['tl'][0]-cs[0]['tr'][0])/np.mean(widths),3))
    return cs
if __name__=='__main__':
    import os; os.makedirs('tiles',exist_ok=True)
    jobs={
     'src/nc_16.9.png#a':([(136,958,1087,2132)],'bed169'),
     'src/nc_16.9.png#b':([(1200,2110,1085,2130)],'bar169'),
     'src/nc_23.5.png':([(571,1358,2620,3623)],'dark235'),
     'src/nc_23.5.png#mid':([(571,1358,1093,2065)],'bed235'),
     'src/nc_25.0.png':([(1296,2114,2620,3623)],'dark250'),
     'src/nc_25.0.png#mid':([(1296,2114,1093,2065)],'bed250'),
     'src/nc_21.0.png':([(953,1775,1077,2122)],'bar210'),
    }
    for f,(boxes,pre) in jobs.items():
        try: rectify(f.split('#')[0],boxes,pre)
        except Exception as e: print('FAIL',f,e)
