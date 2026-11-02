import onnxruntime as ort, numpy as np, time, sys
from PIL import Image
H='/home/claude/ci-design-build-prototype/design/assets/hero/'
names=['h1_city','h2_kitchen','h3_fireplace','h4_skyline','h5_double']
s=ort.InferenceSession('/home/claude/models/depth_anything_v2_vitb.onnx', providers=['CPUExecutionProvider'])
mean=np.array([.485,.456,.406],np.float32); std=np.array([.229,.224,.225],np.float32)
def run(im):
    x=np.asarray(im.resize((518,518),Image.BICUBIC),np.float32)/255.
    x=((x-mean)/std).transpose(2,0,1)[None]
    return s.run(None,{'l_x_':x})[0][0]
for n in names:
    t=time.time(); im=Image.open(H+n+'_1600.jpg').convert('RGB')
    d=run(im)
    # flip-TTA for stability
    d2=run(im.transpose(Image.FLIP_LEFT_RIGHT))[:, ::-1]
    d=(d+d2)/2
    np.save(f'{n}_disp.npy', d)
    v=(d-d.min())/(d.max()-d.min())
    Image.fromarray((v*255).astype(np.uint8)).resize(im.size, Image.BICUBIC).save(f'{n}_disp.png')
    print(n, time.time()-t, d.min(), d.max())
