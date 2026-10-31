from PIL import Image, ImageDraw
from pathlib import Path
r=Path('three-kingdoms-city'); src=Image.open(r/'design/reference.png').convert('RGBA').crop((0,765,900,941));out=r/'assets/resources/art'
names=['city','hero','formation','bag','alliance'];bounds=[0,205,365,515,670,825];centers=[110,285,435,590,745];radii=[80,59,59,59,59];cy=[80,70,75,75,75]
for i,name in enumerate(names):
 x0,x1=bounds[i:i+2];piece=src.crop((x0,0,x1,157));mask=Image.new('L',piece.size);d=ImageDraw.Draw(mask);cx=centers[i]-x0;rad=radii[i];d.ellipse((cx-rad,cy[i]-rad,cx+rad,cy[i]+rad),fill=255);
 for yy in range(110,154):
  for xx in range(max(0,cx-68),min(x1-x0,cx+68)):
   rr,gg,bb,_=piece.getpixel((xx,yy))
   if max(rr,gg,bb)>100 and rr>bb*1.1: mask.putpixel((xx,yy),255)
 piece.putalpha(mask);piece.save(out/f'hud-nav-{name}.png')
# Original empty lower-strip texture is stretched under the independently retained original icons.
bg=src.crop((200,158,650,175)).resize((900,176));mask=Image.new('L',(900,176));d=ImageDraw.Draw(mask);d.polygon([(0,26),(785,26),(815,34),(832,60),(842,110),(864,139),(900,148),(900,176),(0,176)],fill=255);bg.putalpha(mask);d=ImageDraw.Draw(bg);d.line([(0,28),(785,28),(813,36),(830,60),(842,110),(864,139),(900,148)],fill=(159,116,54,255),width=3);d.line([(0,151),(830,151),(845,144),(868,151),(900,151)],fill=(129,92,45,255),width=3);bg.save(out/'hud-nav-background.png')
