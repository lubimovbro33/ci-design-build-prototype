import json,sys
from PIL import Image, ImageDraw
pg=sys.argv[1]; keys=json.load(open(f'out19/{pg}/manifest.json')); sel=sys.argv[2].split(',') if len(sys.argv)>2 else keys
keys=[k for k in keys if k in sel]
W=384; cols=5; ch=int(W*1080/1920); rows=(len(keys)+cols-1)//cols
sheet=Image.new('RGB',(W*cols,(ch+18)*rows),(60,0,0)); d=ImageDraw.Draw(sheet)
for i,k in enumerate(keys):
    im=Image.open(f'out19/{pg}/{k}_ref.jpg'); h=int(W*im.height/im.width); im=im.resize((W,h))
    x=(i%cols)*W; y=(i//cols)*(ch+18); sheet.paste(im.crop((0,0,W,min(h,ch))),(x,y+18)); d.text((x+4,y+3),k,fill=(255,255,0))
sheet.save(f'/tmp/{pg}_sheet.jpg',quality=70); print(sheet.size,len(keys))
