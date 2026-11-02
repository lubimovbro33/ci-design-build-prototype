import cv2, numpy as np, importlib.util
spec=importlib.util.spec_from_file_location('t','tiles.py'); t=importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
PX,PY=1050,1542; W,H=815,1045; WX0,WY0=117,248
import os; os.makedirs('ktiles',exist_ok=True)
for n in ['bed169','bed235','bed250','bar169','bar210','dark235','dark250']:
    k=cv2.imread(f'kontext/k_{n}.png')
    k=cv2.resize(k,(PX,PY),interpolation=cv2.INTER_LANCZOS4)
    g=cv2.GaussianBlur(cv2.cvtColor(k,cv2.COLOR_BGR2GRAY).astype(float),(5,5),0)
    try:
        c=t.refine(g,(WX0,WX0+W,WY0,WY0+H))
        src=np.float32([c['tl'],c['tr'],c['bl'],c['br']]); dst=np.float32([[WX0,WY0],[WX0+W,WY0],[WX0,WY0+H],[WX0+W,WY0+H]])
        err=np.abs(src-dst).max()
        if err<10:
            Hm=cv2.getPerspectiveTransform(src,dst)
            out=cv2.warpPerspective(k,Hm,(PX,PY),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT)
        else: out=k
        print(n,'max corner offset',round(float(err),1))
    except Exception as e:
        print(n,'refine failed',e); out=k
    cv2.imwrite(f'ktiles/{n}.png',out)
