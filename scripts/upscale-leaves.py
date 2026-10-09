"""Offline leaf reconstruction with the background's two-stage RealESRNet route.

Requires Pillow and an external realesrgan-ncnn-vulkan installation/model.
RGB is reconstructed independently per sprite. Alpha retains the original
silhouette with bicubic resampling; no generated silhouette or new leaf art.
"""
import argparse
from collections import deque
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageFilter

CELL = 128
COUNT = 8
MODEL = 'realesrnet-x4plus'


def prepared_tile(tile):
    """Remove tiny detached alpha dust and extend valid edge colors outward.

    The source has unrelated RGB in transparent pixels. Feeding that RGB into
    a super-resolution model would contaminate the reconstructed edge.
    Keep faint connected petioles; discard only detached islands of <=3 pixels.
    """
    alpha = list(tile.getchannel('A').getdata())
    alpha = [a if a >= 4 else 0 for a in alpha]
    seen = set()
    for start, value in enumerate(alpha):
        if not value or start in seen:
            continue
        region = [start]
        seen.add(start)
        for i in region:
            x, y = i % CELL, i // CELL
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    xx, yy = x + dx, y + dy
                    j = yy * CELL + xx
                    if 0 <= xx < CELL and 0 <= yy < CELL and alpha[j] and j not in seen:
                        seen.add(j)
                        region.append(j)
        if len(region) <= 3:
            for i in region:
                alpha[i] = 0
    rgb = list(tile.convert('RGB').getdata())
    mask = Image.new('L', tile.size)
    mask.putdata(alpha)
    core = list(mask.point(lambda a: 255 if a >= 240 else 0).filter(ImageFilter.MinFilter(3)).getdata())
    interior = rgb.copy()
    distance = [0 if a else CELL*2 for a in core]
    queue = deque(i for i, a in enumerate(core) if a)
    # Replace the narrow matte-contaminated boundary with nearby interior color.
    # Do not erode alpha; thin petioles farther than two pixels from the interior
    # keep their own color rather than borrowing the broad leaf body's color.
    while queue:
        i = queue.popleft()
        if distance[i] == 2:
            continue
        x, y = i % CELL, i // CELL
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            xx, yy = x + dx, y + dy
            j = yy * CELL + xx
            if 0 <= xx < CELL and 0 <= yy < CELL and distance[j] > distance[i]+1:
                distance[j] = distance[i]+1
                interior[j] = interior[i]
                queue.append(j)
    rgb = [interior[i] if 0 < distance[i] <= 2 else c for i, c in enumerate(rgb)]
    # Semi-opaque stem pixels are valid seeds too, preserving their original hue.
    valid = [a >= 64 for a in alpha]
    queue = deque(i for i, value in enumerate(valid) if value)
    if not queue:
        raise ValueError('Leaf has no usable foreground')
    while queue:
        i = queue.popleft()
        x, y = i % CELL, i // CELL
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            xx, yy = x + dx, y + dy
            j = yy * CELL + xx
            if 0 <= xx < CELL and 0 <= yy < CELL and not valid[j]:
                rgb[j] = rgb[i]
                valid[j] = True
                queue.append(j)
    color = Image.new('RGB', tile.size)
    color.putdata(rgb)
    return color, mask


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--tool-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--gpu', default='0')
    args = parser.parse_args()
    source = Image.open(args.source).convert('RGBA')
    if source.size != (CELL * COUNT, CELL):
        raise ValueError('Expected the original eight-cell 1024x128 leaf atlas')
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    engine = args.tool_dir.resolve() / 'realesrgan-ncnn-vulkan.exe'
    models = engine.parent / 'models'
    colors, masks = zip(*(prepared_tile(source.crop((i*CELL, 0, (i+1)*CELL, CELL))) for i in range(COUNT)))
    for stage in (1, 2):
        inputs, raw = output / f'stage-{stage}-input', output / f'stage-{stage}-native'
        inputs.mkdir(exist_ok=True)
        raw.mkdir(exist_ok=True)
        # Edge-extended padding avoids dark boundary artifacts, per leaf.
        for i, color in enumerate(colors):
            padded = Image.new('RGB', (color.width+32, color.height+32))
            padded.paste(color, (16, 16))
            padded.paste(color.crop((0, 0, color.width, 1)).resize((color.width, 16)), (16, 0))
            padded.paste(color.crop((0, color.height-1, color.width, color.height)).resize((color.width, 16)), (16, color.height+16))
            padded.paste(padded.crop((16, 0, 17, padded.height)).resize((16, padded.height)), (0, 0))
            padded.paste(padded.crop((color.width+15, 0, color.width+16, padded.height)).resize((16, padded.height)), (color.width+16, 0))
            padded.save(inputs / f'{i}.png')
        with (output / f'stage-{stage}.log').open('w', encoding='utf8') as log:
            subprocess.run([str(engine), '-i', str(inputs), '-o', str(raw), '-n', MODEL,
                '-s', '4', '-m', str(models), '-t', '256', '-j', '1:1:1', '-g', args.gpu,
                '-f', 'png'], check=True, stdout=log, stderr=log)
        next_colors = []
        for i, color in enumerate(colors):
            result = Image.open(raw / f'{i}.png').convert('RGB')
            expected = ((color.width+32)*4, (color.height+32)*4)
            if result.size != expected:
                raise ValueError(f'Unexpected output size: {result.size}, expected {expected}')
            next_colors.append(result.crop((64, 64, expected[0]-64, expected[1]-64)).resize(
                (color.width*2, color.height*2), Image.Resampling.LANCZOS))
        colors = next_colors
        cell = CELL * (2**stage)
        atlas = Image.new('RGBA', (cell*COUNT, cell))
        for i, (color, mask) in enumerate(zip(colors, masks)):
            tile = color.convert('RGBA')
            tile.putalpha(mask.resize((cell, cell), Image.Resampling.BICUBIC))
            atlas.paste(tile, (i*cell, 0))
        atlas.save(output / f'leaves-{2**stage}x.png', optimize=True)
        print(f'Built {cell}px leaves, {atlas.size} atlas', flush=True)
    manifest = {
        'source_sha256': sha(args.source), 'model': MODEL,
        'pipeline': 'independent RGB sprites: 4x inference then Lanczos /2, twice',
        'alpha': 'original alpha; remove <4/255 and detached <=3px dust; bicubic 4x',
        'edge_color': '2px interior-color matte cleanup; alpha >=64/255 outward propagation; thin stems retained',
        'original_cell': CELL, 'output_cell': cell, 'cells': COUNT,
        'engine_sha256': sha(engine),
        'model_sha256': {p.name: sha(p) for p in models.glob(MODEL+'.*')},
        'output_sha256': sha(output / 'leaves-4x.png')}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf8')


if __name__ == '__main__':
    main()
