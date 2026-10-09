"""Check preserved silhouettes/petioles and isolated HD alpha-derived shadows."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
original = Image.open(ROOT/'reference/original-assets/leaves.png').convert('RGBA')
hd_path = ROOT/'reference/derived/hd-leaves-4x.png'
hd = Image.open(hd_path).convert('RGBA')
shadow = Image.open(ROOT/'reference/derived/hd-shadow.png')
manifest = json.loads((ROOT/'reference/derived/leaf-upscale.json').read_text())
assert hd.size == (4096,512)
assert shadow.size == (2048,512)
assert hashlib.sha256(hd_path.read_bytes()).hexdigest() == manifest['output_sha256']
for i in range(8):
    source = original.getchannel('A').crop((i*128,0,(i+1)*128,128))
    mask = hd.getchannel('A').crop((i*512,0,(i+1)*512,512))
    reduced = mask.resize((128,128),Image.Resampling.BOX)
    a, b = list(source.getdata()), list(reduced.getdata())
    assert abs(sum(a)-sum(b))/sum(a) < .015, f'Leaf {i}: silhouette area drift'
    # Every substantial source pixel, including petioles, retains coverage.
    retained = sum(y>=48 for x,y in zip(a,b) if x>=64)
    assert retained/sum(x>=64 for x in a) > .995, f'Leaf {i}: lost thin structure'
    for row, blur in enumerate((3.2,7.2)):
        expected = ImageOps.expand(mask.resize((256,256),Image.Resampling.LANCZOS),24)
        expected = expected.filter(ImageFilter.GaussianBlur(blur)).crop((24,24,280,280))
        actual = shadow.getchannel('A').crop((i*256,row*256,(i+1)*256,(row+1)*256))
        assert ImageChops.difference(expected,actual).getbbox() is None, f'Leaf {i}: cross-cell shadow bleed'
print('PASS: all eight HD silhouettes, thin petioles, isolated shadows and asset provenance')
