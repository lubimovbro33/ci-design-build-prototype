import cv2, numpy as np, sys
A=cv2.imread('/home/claude/v15/gpt/gpt_facade_4.png'); H,W=A.shape[:2]
g=cv2.cvtColor(A,cv2.COLOR_BGR2GRAY).astype(np.float32)
colsA=[(0,177),(233,429),(483,680),(741,977),(1035,1238),(1301,1379),(1438,1641)]
rowsA=[(0,208),(319,569),(678,906)]
plate=cv2.imread(sys.argv[1] if len(sys.argv)>1 else 'refl_plate_1.png')
R=float(sys.argv[2]) if len(sys.argv)>2 else 0.42      # reflectance
ZOOM=float(sys.argv[3]) if len(sys.argv)>3 else 1.12
plate=cv2.flip(plate,1)                                 # mirror
ph,pw=plate.shape[:2]
s=max(W/pw,H/ph)*ZOOM
P=cv2.resize(plate,(int(pw*s)+2,int(ph*s)+2),interpolation=cv2.INTER_AREA)
oy=(P.shape[0]-H)//2; ox=(P.shape[1]-W)//2
rng=np.random.RandomState(11)
out=A.astype(np.float32).copy()
mask_all=np.zeros((H,W),np.float32)
for (x0,x1) in colsA:
    for (y0,y1) in rowsA:
        w=g[y0:y1,x0:x1]
        cp=np.percentile(w,85,axis=0); rp=np.percentile(w,85,axis=1)
        bc=cp<10; br=rp<10
        # frame bars: dilate by 1
        bc=np.convolve(bc.astype(float),[1,1,1],'same')>0; br=np.convolve(br.astype(float),[1,1,1],'same')>0
        # edges of partial windows touching the image border are not frames
        m=np.ones((y1-y0,x1-x0),np.float32); m[:,bc]=0; m[br,:]=0
        # panes = connected components of m
        n,lab=cv2.connectedComponents((m>0).astype(np.uint8))
        for k in range(1,n):
            pm=(lab==k)
            ys,xs=np.where(pm)
            if len(ys)<50: continue
            # per-pane micro offset / scale (real panes are not perfectly coplanar)
            dx,dy=rng.uniform(-4,4),rng.uniform(-3,3); sc=1+rng.uniform(-0.012,0.012)
            py0,py1,px0,px1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
            cy,cx=(y0+(py0+py1)/2),(x0+(px0+px1)/2)
            M=np.float32([[sc,0,(1-sc)*cx+dx+ox],[0,sc,(1-sc)*cy+dy+oy]])
            # sample plate for this pane region
            gx,gy=np.meshgrid(np.arange(x0+px0,x0+px1,dtype=np.float32),np.arange(y0+py0,y0+py1,dtype=np.float32))
            mx=((gx-cx)/sc+cx+dx+ox).astype(np.float32); my=((gy-cy)/sc+cy+dy+oy).astype(np.float32)
            ref=cv2.remap(P,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT).astype(np.float32)
            ref=cv2.GaussianBlur(ref,(0,0),1.1)
            ref=255.0*np.power(ref/255.0,1.3)
            # glass: dark base + tinted reflection + faint vertical sheen
            hh=py1-py0; tt=np.linspace(0,1,hh)[:,None,None]
            base=np.array([13,10,8],np.float32)*(1.0+0.35*(1-tt))     # BGR deep blue-black, a bit lighter at the top
            tint=np.array([1.04,1.0,0.86],np.float32)                    # slight cool/teal glass
            glass=base+ref*tint*R
            reg=out[y0+py0:y0+py1, x0+px0:x0+px1]
            pmm=pm[py0:py1,px0:px1].astype(np.float32)[...,None]
            reg[:]=reg*(1-pmm)+glass*pmm
            mask_all[y0+py0:y0+py1, x0+px0:x0+px1]=np.maximum(mask_all[y0+py0:y0+py1, x0+px0:x0+px1],pmm[...,0])
out=np.clip(out,0,255).astype(np.uint8)
cv2.imwrite('v4_refl.png',out); cv2.imwrite('glass_mask.png',(mask_all*255).astype(np.uint8))
