from PIL import Image
import os,glob
src='/tmp/atlas/img2'
dst=os.path.expanduser(glob.glob('/home/claude/coupled*/Software/SWAFL_Desktop/docs/manual/images')[0]+'/atlas')
for f in glob.glob(dst+'/*'): os.remove(f)
os.makedirs(dst,exist_ok=True)
for f in sorted(os.listdir(src)):
    im=Image.open(f'{src}/{f}').convert('RGB')
    if f=='u06_properties_page.jpg':
        h=im.height; step=h//3
        for i in range(3): im.crop((0,i*step,im.width,h if i==2 else (i+1)*step)).save(f'{dst}/u06_properties_{i+1}.jpg',quality=82,optimize=True)
        continue
    if f in ('u04_toolbox_raw.jpg',): continue
    if f.endswith('_full.jpg') or f in ('u00_welcome.jpg','u01_workbench.jpg','u03_palette.jpg'):
        im=im.resize((1800,int(im.height*1800/im.width)),Image.LANCZOS); q=78
    else: q=82
    im.save(f'{dst}/{f}',quality=q,optimize=True)
print(os.popen(f'du -sh {dst}; ls {dst} | wc -l').read())
