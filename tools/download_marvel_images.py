import os
import sys
import time
import requests
import io
from PIL import Image, ImageStat, ImageEnhance

sys.stdout.reconfigure(encoding='utf-8')

base_dir = os.path.dirname(os.path.abspath(__file__))
cards_img_dir = os.path.join(base_dir, 'client', 'public', 'images', 'cards')
locations_img_dir = os.path.join(base_dir, 'client', 'public', 'images', 'locations')

os.makedirs(cards_img_dir, exist_ok=True)
os.makedirs(locations_img_dir, exist_ok=True)

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
})

CANONICAL_MAPPING = {
    # Tier 1 - Reality (Red) — 8 cards
    't1_r01': ('A-Bomb', 'Richard Jones (Earth-616)'),
    't1_r02': ('Abomination', 'Emil Blonsky (Earth-616)'),
    't1_r03': ('Agent Anti-Venom', 'Eugene Thompson (Earth-616)'),
    't1_r04': ('Agent Coulson', 'Phillip Coulson (Earth-616)'),
    't1_r05': ('Agatha Harkness', 'Agatha Harkness (Earth-616)'),
    't1_r06': ('Angel', 'Warren Worthington III (Earth-616)'),
    't1_r07': ('Arcade', 'Arcade (Earth-616)'),
    't1_r08': ('Elektra', 'Elektra Natchios (Earth-616)'),

    # Tier 1 - Space (Blue) — 8 cards
    't1_s01': ('Batroc', 'Georges Batroc (Earth-616)'),
    't1_s02': ('Bishop', 'Lucas Bishop (Earth-1191)'),
    't1_s03': ('Black Cat', 'Felicia Hardy (Earth-616)'),
    't1_s04': ('Blade', 'Eric Brooks (Earth-616)'),
    't1_s05': ('Bullseye', 'Bullseye (Lester) (Earth-616)'),
    't1_s06': ('Cloak', 'Tyrone Johnson (Earth-616)'),
    't1_s07': ('Dagger', 'Tandy Bowen (Earth-616)'),
    't1_s08': ('Falcon', 'Samuel Wilson (Earth-616)'),

    # Tier 1 - Soul (Orange) — 8 cards
    't1_o01': ('Iron Fist', 'Daniel Rand (Earth-616)'),
    't1_o02': ('Jubilee', 'Jubilation Lee (Earth-616)'),
    't1_o03': ('Kamala Khan', 'Kamala Khan (Earth-616)'),
    't1_o04': ('Kraven', 'Sergei Kravinoff (Earth-616)'),
    't1_o05': ('Lizard', 'Curtis Connors (Earth-616)'),
    't1_o06': ('Luke Cage', 'Lucas Cage (Earth-616)'),
    't1_o07': ('M.O.D.O.K.', 'George Tarleton (Earth-616)'),
    't1_o08': ('Hammerhead', 'Hammerhead (Joseph) (Earth-616)'),

    # Tier 1 - Mind (Yellow) — 8 cards
    't1_t01': ('Machine Man', 'Aaron Stack (Earth-616)'),
    't1_t02': ('Medusa', 'Medusalith Amaquelin (Earth-616)'),
    't1_t03': ('Moon Knight', 'Marc Spector (Earth-616)'),
    't1_t04': ('Nightcrawler', 'Kurt Wagner (Earth-616)'),
    't1_t05': ('Nova', 'Richard Rider (Earth-616)'),
    't1_t06': ('Okoye', 'Okoye (Earth-616)'),
    't1_t07': ('Patriot', 'Elijah Bradley (Earth-616)'),
    't1_t08': ('Dazzler', 'Alison Blaire (Earth-616)'),

    # Tier 1 - Power (Purple) — 8 cards
    't1_a01': ('Polaris', 'Lorna Dane (Earth-616)'),
    't1_a02': ('Prowler', 'Hobart Brown (Earth-616)'),
    't1_a03': ('Squirrel Girl', 'Doreen Green (Earth-616)'),
    't1_a04': ('Taskmaster', 'Anthony Masters (Earth-616)'),
    't1_a05': ('Taskmaster (Variant)', 'Anthony Masters (Earth-616)'),
    't1_a06': ('Spider-Woman', 'Jessica Drew (Earth-616)'),
    't1_a07': ('Gwen Stacy', 'Gwendolyne Stacy (Earth-616)'),
    't1_a08': ('Gwenpool', 'Gwendolyn Poole (Earth-TRN565)'),

    # Tier 2 - Reality (Red) — 6 cards
    't2_r01': ('Ant-Man', 'Scott Lang (Earth-616)'),
    't2_r02': ('Black Bolt', 'Blackagar Boltagon (Earth-616)'),
    't2_r03': ('Black Widow', 'Natalia Romanova (Earth-616)'),
    't2_r04': ('Cable', 'Nathan Summers (Earth-616)'),
    't2_r05': ('Carnage', 'Cletus Kasady (Earth-616)'),
    't2_r06': ('Dormammu', 'Dormammu (Earth-616)'),

    # Tier 2 - Space (Blue) — 6 cards
    't2_s01': ('Colossus', 'Piotr Rasputin (Earth-616)'),
    't2_s02': ('Cyclops', 'Scott Summers (Earth-616)'),
    't2_s03': ('Daredevil', 'Matthew Murdock (Earth-616)'),
    't2_s04': ('Deadpool', 'Wade Wilson (Earth-616)'),
    't2_s05': ('Doctor Octopus', 'Otto Octavius (Earth-616)'),
    't2_s06': ('Hawkeye', 'Clinton Barton (Earth-616)'),

    # Tier 2 - Soul (Orange) — 6 cards
    't2_o01': ('Hela', 'Hela (Earth-616)'),
    't2_o02': ('Invisible Woman', 'Susan Storm (Earth-616)'),
    't2_o03': ('Iron Fist (Level 2)', 'Daniel Rand (Earth-616)'),
    't2_o04': ('Juggernaut', 'Cain Marko (Earth-616)'),
    't2_o05': ('Kingpin', 'Wilson Fisk (Earth-616)'),
    't2_o06': ('Ghost Rider', 'Johnathon Blaze (Earth-616)'),

    # Tier 2 - Mind (Yellow) — 6 cards
    't2_t01': ('Loki', 'Loki Laufeyson (Earth-616)'),
    't2_t02': ('Miles Morales', 'Miles Morales (Earth-1610)'),
    't2_t03': ('Mysterio', 'Quentin Beck (Earth-616)'),
    't2_t04': ('Mystique', 'Raven Darkhölme (Earth-616)'),
    't2_t05': ('Punisher', 'Francis Castle (Earth-616)'),
    't2_t06': ('Green Goblin', 'Green Goblin'),

    # Tier 2 - Power (Purple) — 6 cards
    't2_a01': ('Red Skull', 'Johann Shmidt (Earth-616)'),
    't2_a02': ('Rogue', 'Anna Marie LeBeau (Earth-616)'),
    't2_a03': ('She-Hulk', 'Jennifer Walters (Earth-616)'),
    't2_a04': ('Spider-Gwen', 'Gwendolyn Stacy (Earth-65)'),
    't2_a05': ('Spider-Man', 'Peter Parker (Earth-616)'),
    't2_a06': ('Gambit', 'Remy LeBeau (Earth-616)'),

    # Tier 3 - Reality (Red) — 4 cards
    't3_r01': ('Black Panther', "T'Challa (Earth-616)"),
    't3_r02': ('Captain America', 'Steven Rogers (Earth-616)'),
    't3_r03': ('Captain Marvel', 'Carol Danvers (Earth-616)'),
    't3_r04': ('Storm', 'Ororo Munroe (Earth-616)'),

    # Tier 3 - Space (Blue) — 4 cards
    't3_s01': ('Doctor Strange', 'Stephen Strange (Earth-616)'),
    't3_s02': ('Emma Frost', 'Emma Frost (Earth-616)'),
    't3_s03': ('Galactus', 'Galan (Earth-616)'),
    't3_s04': ('Groot', 'Groot (Earth-616)'),

    # Tier 3 - Soul (Orange) — 4 cards
    't3_o01': ('Iron Man', 'Anthony Stark (Earth-616)'),
    't3_o02': ('Jean Grey', 'Jean Grey (Earth-616)'),
    't3_o03': ('Magneto', 'Max Eisenhardt (Earth-616)'),
    't3_o04': ('Gamora', 'Gamora Zen Whoberi Ben Titan (Earth-7528)'),

    # Tier 3 - Mind (Yellow) — 4 cards
    't3_t01': ('Nick Fury', 'Nicholas Fury (Earth-616)'),
    't3_t02': ('Professor X', 'Charles Xavier (Earth-616)'),
    't3_t03': ('Rocket Raccoon', 'Rocket Raccoon (Earth-616)'),
    't3_t04': ('Thanos', 'Thanos (Earth-616)'),

    # Tier 3 - Power (Purple) — 4 cards
    't3_a01': ('Scarlet Witch', 'Wanda Maximoff (Earth-616)'),
    't3_a02': ('Thor', 'Thor Odinson (Earth-616)'),
    't3_a03': ('Star-Lord', 'Peter Quill (Earth-616)'),
    't3_a04': ('Hulk', 'Bruce Banner (Earth-616)'),

    # Locations (10 Tiles)
    'g01': ('Triskelion', 'Triskelion'),
    'g02': ('Avengers Tower', 'Stark Tower'),
    'g03': ('Wakanda', 'Wakanda'),
    'g04': ('Asgard', 'Asgard'),
    'g05': ('Knowhere', 'Knowhere'),
    'g06': ('Attilan', 'Attilan'),
    'g07': ("Hell's Kitchen", "Hell's Kitchen"),
    'g08': ('Sanctum Sanctorum', 'Sanctum Sanctorum'),
    'g09': ('X-Mansion', 'X-Mansion'),
    'g10': ('Helicarrier', 'S.H.I.E.L.D. Helicarrier'),
}

# Fetch thumbnail URLs in batches
print("Fetching official canonical image URLs...")
items = list(CANONICAL_MAPPING.items())
batch_size = 30
target_thumbs = {}

for i in range(0, len(items), batch_size):
    batch = items[i:i+batch_size]
    titles_str = '|'.join([title for _, (_, title) in batch])
    r = session.get('https://marvel.fandom.com/api.php', params={
        'action': 'query',
        'prop': 'pageimages',
        'piprop': 'thumbnail',
        'pithumbsize': 600,
        'titles': titles_str,
        'format': 'json'
    }, timeout=15).json()
    
    pages = r.get('query', {}).get('pages', {})
    for pid, p in pages.items():
        title = p.get('title')
        thumb = p.get('thumbnail', {}).get('source')
        if thumb:
            target_thumbs[title] = thumb

print(f"Total thumbnail URLs fetched: {len(target_thumbs)} / {len(CANONICAL_MAPPING)}")

# Download and enhance images
downloaded = 0
failed = 0

print("\nDownloading and processing canonical artwork...")
for idx, (_id, (name, title)) in enumerate(items, 1):
    save_folder = cards_img_dir if _id.startswith('t') else locations_img_dir
    save_path = os.path.join(save_folder, f"{_id}.jpg")
    
    thumb_url = target_thumbs.get(title)
    if not thumb_url:
        print(f"[{idx}/{len(items)}] {_id} ({name}): MISSING URL for '{title}'")
        failed += 1
        continue
    
    try:
        resp = session.get(thumb_url, timeout=15)
        if resp.status_code != 200:
            print(f"[{idx}/{len(items)}] {_id} ({name}): HTTP {resp.status_code}")
            failed += 1
            continue
        
        img = Image.open(io.BytesIO(resp.content))
        
        # Convert to RGB
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (15, 15, 25))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb_img.paste(img, mask=img.split()[3] if 'A' in img.getbands() else None)
            img = rgb_img
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Check brightness and enhance if too dark
        stat = ImageStat.Stat(img)
        mean_brightness = sum(stat.mean[:3]) / 3
        if mean_brightness < 45:
            # Lift shadows and boost brightness
            boost_factor = max(1.3, min(2.2, 50.0 / max(10, mean_brightness)))
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(boost_factor)
            # Add slight contrast enhancement
            contrast_enhancer = ImageEnhance.Contrast(img)
            img = contrast_enhancer.enhance(1.15)
        
        img.save(save_path, 'JPEG', quality=92)
        downloaded += 1
        print(f"[{idx}/{len(items)}] {_id} ({name:<18}) -> OK ({img.size[0]}x{img.size[1]}, brightness={round(mean_brightness, 1)})")
        
    except Exception as e:
        print(f"[{idx}/{len(items)}] {_id} ({name}): ERROR - {e}")
        failed += 1
    
    time.sleep(0.05)

print(f"\nCompleted! Successfully downloaded: {downloaded}, Failed: {failed}")
