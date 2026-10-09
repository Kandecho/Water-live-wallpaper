"""Reproduce the selected background upscale. Requires Python and Pillow.

python upscale-background.py --source pond.jpg --tool-dir path/to/ncnn --output result
The tool directory must include realesrgan-ncnn-vulkan.exe and models/realesrnet-x4plus.*.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--tool-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--gpu', default='0')
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    engine = args.tool_dir.resolve() / 'realesrgan-ncnn-vulkan.exe'
    models = engine.parent / 'models'
    source = Image.open(args.source).convert('RGB')
    if source.size != (1024, 1024):
        raise ValueError('Expected the original 1024x1024 pond.jpg atlas.')
    source.crop((0, 224, 958, 1024)).save(output/'source-crop.png')
    previous = output/'source-crop.png'
    stages = [('pond-2k.png',(1916,1600)), ('pond-4k.png',(3832,3200))]
    for index,(filename,size) in enumerate(stages,1):
        raw = output/f'stage-{index}-native.png'
        with (output/f'stage-{index}.log').open('w',encoding='utf8') as log:
            subprocess.run([str(engine),'-i',str(previous),'-o',str(raw),
                '-n','realesrnet-x4plus','-s','4','-m',str(models),
                '-t','256','-j','1:1:1','-g',args.gpu],check=True,stdout=log,stderr=log)
        with Image.open(raw) as result:
            expected = tuple(v*4 for v in Image.open(previous).size)
            if result.size != expected:
                raise ValueError(f'Unexpected model output size: {result.size}')
            result.convert('RGB').resize(size,Image.Resampling.LANCZOS).save(output/filename)
        previous = output/filename
        scale = index*2
        with Image.open(previous) as visible:
            atlas = Image.new('RGB',(1024*scale,1024*scale))
            top = 224*scale
            atlas.paste(visible,(0,top))
            atlas.paste(visible.crop((0,0,visible.width,1)).resize((visible.width,top)),(0,0))
            atlas.paste(atlas.crop((visible.width-1,0,visible.width,atlas.height)).resize(
                (atlas.width-visible.width,atlas.height)),(visible.width,0))
            atlas.save(output/f'pond-atlas-{scale}x.png')
        print(filename, size)
    manifest = {'source_sha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),
        'model':'realesrnet-x4plus','pipeline':'4x inference then Lanczos /2, twice',
        'source_crop':[0,224,958,1024], 'engine_sha256':hashlib.sha256(engine.read_bytes()).hexdigest(),
        'model_sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in models.glob('realesrnet-x4plus.*')}}
    (output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')

if __name__ == '__main__':
    main()
