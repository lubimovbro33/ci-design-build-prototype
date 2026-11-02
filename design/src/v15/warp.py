import cv2, numpy as np, json, sys, subprocess
f=sys.argv[1]
res=json.loads(subprocess.check_output(['python3','-I','rectify.py',f,'x']).decode().split('\nwl,')[0])
L,R=res['L'],res['R']
wl=np.hypot(*(np.array(L['tr'])-np.array(L['tl']))); wr=np.hypot(*(np.array(R['tr'])-np.array(R['tl'])))
hl=np.hypot(*(np.array(L['bl'])-np.array(L['tl']))); hr=np.hypot(*(np.array(R['bl'])-np.array(R['tl'])))
P=R['tl'][0]-L['tr'][0]; W=(wl+wr)/2; H=(hl+hr)/2
OX,OY=400,1500   # offset so margins are visible
src=np.float32([L['tl'],L['tr'],L['bl'],L['br'],R['tl'],R['tr'],R['bl'],R['br']])
dst=np.float32([[0,0],[W,0],[0,H],[W,H],[W+P,0],[2*W+P,0],[W+P,H],[2*W+P,H]])+np.float32([OX,OY])
Hm,_=cv2.findHomography(src,dst,0)
im=cv2.imread(f)
out=cv2.warpPerspective(im,Hm,(int(2*W+P+2*OX),int(H+2*OY)),flags=cv2.INTER_LANCZOS4)
cv2.imwrite(sys.argv[2],out)
json.dump(dict(W=W,H=H,P=P,OX=OX,OY=OY),open(sys.argv[2]+'.json','w'))
print(out.shape, dict(W=W,H=H,P=P))
