import cv2, numpy as np, sys, json
PX,PY=1050,1542; W,H,P,S=815,1045,235,497
WX0,WY0=117,248   # window outer rect top-left inside tile
STONE='bed169'
def load(name, flip=False, tile_dir='tiles'):
    t=cv2.imread(f'{tile_dir}/{name}.png')
    return t[:, ::-1].copy() if flip else t
def win_mask(pad=4, feather=10):
    m=np.zeros((PY,PX),np.float32)
    x0,y0,x1,y1=WX0-pad,WY0-pad,WX0+W+pad,WY0+H+pad
    m[y0:y1,x0:x1]=1
    m=cv2.GaussianBlur(m,(0,0),feather/2.5)
    return m[...,None]
def build(cols, rows, assign, stone=STONE, tile_dir='tiles'):
    CW,CH=cols*PX, rows*PY
    bg=load(stone, tile_dir=tile_dir)
    canvas=np.tile(bg,(rows,cols,1)).astype(np.float32)
    m=win_mask()
    for r in range(rows):
        for c in range(cols):
            name,flip=assign[(r,c)]
            t=cv2.imread(f'{tile_dir}/{name}.png'); 
            if flip: t=t[:, ::-1]
            t=t.astype(np.float32)
            y,x=r*PY,c*PX
            canvas[y:y+PY,x:x+PX]=canvas[y:y+PY,x:x+PX]*(1-m)+t*m
    return canvas
def frame(canvas, out_w, out_h, zoom=1.0):
    CH,CW=canvas.shape[:2]
    cx,cy=CW/2,CH/2
    cw=CW/zoom; ch=cw*out_h/out_w
    if ch>CH: ch=CH; cw=ch*out_w/out_h
    x0=int(round(cx-cw/2)); y0=int(round(cy-ch/2))
    crop=canvas[y0:y0+int(ch), x0:x0+int(cw)]
    return cv2.resize(np.clip(crop,0,255).astype(np.uint8),(out_w,out_h),interpolation=cv2.INTER_AREA)
ORDER_A=[('dark235',False),('bed235',False),('bar169',False),('dark250',False),('bed169',True),
         ('bed250',False),('dark250',True),('bar169',False),('bed235',True),('dark235',True),
         ('bar210',True),('dark235',False),('bed250',True),('bed169',False),('dark250',False)]
def assignA():
    return {(r,c):ORDER_A[r*5+c] for r in range(3) for c in range(5)}
if __name__=='__main__':
    canvas=build(5,3,assignA())
    img=frame(canvas,3840,2160)
    cv2.imwrite('gridA_lit.png',img)
    cv2.imwrite('/tmp/gridA_lit.jpg',cv2.resize(img,(1920,1080)),[cv2.IMWRITE_JPEG_QUALITY,88])
