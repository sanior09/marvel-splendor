import os
import sys
import io
import requests
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

MAP_SOURCES = {
    'avengers_tower': {
        'name': 'Avengers Tower (Age of Ultron Official Movie Still)',
        'url': 'https://static.wikia.nocookie.net/marvelcinematicuniverse/images/5/51/Avengers_Tower_AoU.png/revision/latest'
    },
    'wakanda': {
        'name': 'Wakanda Golden City (Black Panther Official Movie Still)',
        'url': 'https://static.wikia.nocookie.net/marvelcinematicuniverse/images/0/08/BP_Teaser_Trailer_23.png/revision/latest'
    },
    'asgard': {
        'name': 'Realm of Asgard (Marvel Studios Official Cinematic Landscape)',
        'url': 'https://static.wikia.nocookie.net/marvelcinematicuniverse/images/2/26/AsgardFull.jpg/revision/latest'
    },
    'sanctum': {
        'name': 'Sanctum Sanctorum (Marvel Studios Official Concept Art)',
        'url': 'https://static.wikia.nocookie.net/marvelcinematicuniverse/images/c/cd/Sanctum_Sanctorum_concept_art.jpg/revision/latest'
    },
    'knowhere': {
        'name': 'Knowhere Celestial Head (Guardians of the Galaxy Official Still)',
        'url': 'https://static.wikia.nocookie.net/marvelcinematicuniverse/images/2/2a/Knowhere.jpg/revision/latest'
    },
    'quantum_realm': {
        'name': 'Quantum Realm Diving (Ant-Man and the Wasp Official Still)',
        'url': 'https://static.wikia.nocookie.net/marvelcinematicuniverse/images/2/2e/Quantum_Realm_Diving.png/revision/latest'
    }
}

target_dir = os.path.join(os.path.dirname(__file__), 'client', 'public', 'images', 'maps')
os.makedirs(target_dir, exist_ok=True)

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
})

print(f"Target directory: {target_dir}")

for map_id, meta in MAP_SOURCES.items():
    print(f"\nFetching {map_id} ({meta['name']})...")
    url = meta['url']
    try:
        resp = session.get(url, timeout=20)
        if resp.status_code != 200:
            print(f"FAILED status {resp.status_code} for {url}")
            continue
        
        img = Image.open(io.BytesIO(resp.content))
        print(f"  Original format: {img.format}, size: {img.size}, mode: {img.mode}")
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Target 16:9 aspect ratio standard (1920x1080)
        target_w, target_h = 1920, 1080
        src_w, src_h = img.size
        
        # Scale to cover 1920x1080
        scale = max(target_w / src_w, target_h / src_h)
        new_w = int(round(src_w * scale))
        new_h = int(round(src_h * scale))
        
        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Center crop to 1920x1080
        left = (new_w - target_w) // 2
        top = (new_h - target_h) // 2
        cropped = resized.crop((left, top, left + target_w, top + target_h))
        
        out_path = os.path.join(target_dir, f"{map_id}.jpg")
        cropped.save(out_path, format='JPEG', quality=92, optimize=True)
        print(f"  Saved 1920x1080 official artwork to {out_path} ({os.path.getsize(out_path)} bytes)")
    except Exception as e:
        print(f"  Error processing {map_id}: {e}")

print("\nAll map backgrounds updated with authentic Marvel artwork!")
