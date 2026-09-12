import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

CANONICAL_MAPPING = {
    # Tier 1 - Reality (Red)
    't1_r01': ('A-Bomb', 'Richard Jones (Earth-616)'),
    't1_r02': ('Abomination', 'Emil Blonsky (Earth-616)'),
    't1_r03': ('Agent Anti-Venom', 'Eugene Thompson (Earth-616)'),
    't1_r04': ('Agent Coulson', 'Phillip Coulson (Earth-616)'),
    't1_r05': ('Agatha Harkness', 'Agatha Harkness (Earth-616)'),
    't1_r06': ('Angel', 'Warren Worthington III (Earth-616)'),
    't1_r07': ('Arcade', 'Arcade (Earth-616)'),
    't1_r08': ('Elektra', 'Elektra Natchios (Earth-616)'),

    # Tier 1 - Space (Blue)
    't1_s01': ('Batroc', 'Georges Batroc (Earth-616)'),
    't1_s02': ('Bishop', 'Lucas Bishop (Earth-1191)'),
    't1_s03': ('Black Cat', 'Felicia Hardy (Earth-616)'),
    't1_s04': ('Blade', 'Eric Brooks (Earth-616)'),
    't1_s05': ('Bullseye', 'Bullseye (Lester) (Earth-616)'),
    't1_s06': ('Cloak', 'Tyrone Johnson (Earth-616)'),
    't1_s07': ('Dagger', 'Tandy Bowen (Earth-616)'),
    't1_s08': ('Falcon', 'Samuel Wilson (Earth-616)'),

    # Tier 1 - Soul (Orange)
    't1_o01': ('Iron Fist', 'Daniel Rand (Earth-616)'),
    't1_o02': ('Jubilee', 'Jubilation Lee (Earth-616)'),
    't1_o03': ('Kamala Khan', 'Kamala Khan (Earth-616)'),
    't1_o04': ('Kraven', 'Sergei Kravinoff (Earth-616)'),
    't1_o05': ('Lizard', 'Curtis Connors (Earth-616)'),
    't1_o06': ('Luke Cage', 'Lucas Cage (Earth-616)'),
    't1_o07': ('M.O.D.O.K.', 'George Tarleton (Earth-616)'),
    't1_o08': ('Hammerhead', 'Hammerhead (Earth-616)'),

    # Tier 1 - Mind (Yellow)
    't1_t01': ('Machine Man', 'Z2P45-9-X-51 (Earth-616)'),
    't1_t02': ('Medusa', 'Medusalith Amaquelin (Earth-616)'),
    't1_t03': ('Moon Knight', 'Marc Spector (Earth-616)'),
    't1_t04': ('Nightcrawler', 'Kurt Wagner (Earth-616)'),
    't1_t05': ('Nova', 'Richard Rider (Earth-616)'),
    't1_t06': ('Okoye', 'Okoye (Earth-616)'),
    't1_t07': ('Patriot', 'Elijah Bradley (Earth-616)'),
    't1_t08': ('Dazzler', 'Alison Blaire (Earth-616)'),

    # Tier 1 - Power (Purple)
    't1_a01': ('Polaris', 'Lorna Dane (Earth-616)'),
    't1_a02': ('Prowler', 'Hobie Brown (Earth-616)'),
    't1_a03': ('Squirrel Girl', 'Doreen Green (Earth-616)'),
    't1_a04': ('Taskmaster', 'Tony Masters (Earth-616)'),
    't1_a05': ('Taskmaster (Variant)', 'Tony Masters (Earth-616)'),
    't1_a06': ('Spider-Woman', 'Jessica Drew (Earth-616)'),
    't1_a07': ('Gwen Stacy', 'Gwendolyn Stacy (Earth-616)'),
    't1_a08': ('Gwenpool', 'Gwendolyn Poole (Earth-616)'),

    # Tier 2 - Reality (Red)
    't2_r01': ('Ant-Man', 'Scott Lang (Earth-616)'),
    't2_r02': ('Black Bolt', 'Blackagar Boltagon (Earth-616)'),
    't2_r03': ('Black Widow', 'Natalia Romanova (Earth-616)'),
    't2_r04': ('Cable', 'Nathan Summers (Earth-616)'),
    't2_r05': ('Carnage', 'Cletus Kasady (Earth-616)'),
    't2_r06': ('Dormammu', 'Dormammu (Earth-616)'),

    # Tier 2 - Space (Blue)
    't2_s01': ('Colossus', 'Piotr Rasputin (Earth-616)'),
    't2_s02': ('Cyclops', 'Scott Summers (Earth-616)'),
    't2_s03': ('Daredevil', 'Matthew Murdock (Earth-616)'),
    't2_s04': ('Deadpool', 'Wade Wilson (Earth-616)'),
    't2_s05': ('Doctor Octopus', 'Otto Octavius (Earth-616)'),
    't2_s06': ('Hawkeye', 'Clinton Barton (Earth-616)'),

    # Tier 2 - Soul (Orange)
    't2_o01': ('Hela', 'Hela (Earth-616)'),
    't2_o02': ('Invisible Woman', 'Susan Storm (Earth-616)'),
    't2_o03': ('Iron Fist (Level 2)', 'Daniel Rand (Earth-616)'),
    't2_o04': ('Juggernaut', 'Cain Marko (Earth-616)'),
    't2_o05': ('Kingpin', 'Wilson Fisk (Earth-616)'),
    't2_o06': ('Ghost Rider', 'Johnathon Blaze (Earth-616)'),

    # Tier 2 - Mind (Yellow)
    't2_t01': ('Loki', 'Loki Laufeyson (Earth-616)'),
    't2_t02': ('Miles Morales', 'Miles Morales (Earth-1610)'),
    't2_t03': ('Mysterio', 'Quentin Beck (Earth-616)'),
    't2_t04': ('Mystique', 'Raven Darkholme (Earth-616)'),
    't2_t05': ('Punisher', 'Frank Castle (Earth-616)'),
    't2_t06': ('Green Goblin', 'Norman Osborn (Earth-616)'),

    # Tier 2 - Power (Purple)
    't2_a01': ('Red Skull', 'Johann Shmidt (Earth-616)'),
    't2_a02': ('Rogue', 'Anna Marie LeBeau (Earth-616)'),
    't2_a03': ('She-Hulk', 'Jennifer Walters (Earth-616)'),
    't2_a04': ('Spider-Gwen', 'Gwendolyn Stacy (Earth-65)'),
    't2_a05': ('Spider-Man', 'Peter Parker (Earth-616)'),
    't2_a06': ('Gambit', 'Remy LeBeau (Earth-616)'),

    # Tier 3 - Reality (Red)
    't3_r01': ('Black Panther', "T'Challa (Earth-616)"),
    't3_r02': ('Captain America', 'Steven Rogers (Earth-616)'),
    't3_r03': ('Captain Marvel', 'Carol Danvers (Earth-616)'),
    't3_r04': ('Storm', 'Ororo Munroe (Earth-616)'),

    # Tier 3 - Space (Blue)
    't3_s01': ('Doctor Strange', 'Stephen Strange (Earth-616)'),
    't3_s02': ('Emma Frost', 'Emma Frost (Earth-616)'),
    't3_s03': ('Galactus', 'Galan (Earth-616)'),
    't3_s04': ('Groot', 'Groot (Earth-616)'),

    # Tier 3 - Soul (Orange)
    't3_o01': ('Iron Man', 'Anthony Stark (Earth-616)'),
    't3_o02': ('Jean Grey', 'Jean Grey (Earth-616)'),
    't3_o03': ('Magneto', 'Max Eisenhardt (Earth-616)'),
    't3_o04': ('Gamora', 'Gamora (Earth-616)'),

    # Tier 3 - Mind (Yellow)
    't3_t01': ('Nick Fury', 'Nicholas Fury (Earth-616)'),
    't3_t02': ('Professor X', 'Charles Xavier (Earth-616)'),
    't3_t03': ('Rocket Raccoon', 'Rocket Raccoon (Earth-616)'),
    't3_t04': ('Thanos', 'Thanos (Earth-616)'),

    # Tier 3 - Power (Purple)
    't3_a01': ('Scarlet Witch', 'Wanda Maximoff (Earth-616)'),
    't3_a02': ('Silver Surfer', 'Norrin Radd (Earth-616)'),
    't3_a03': ('Star-Lord', 'Peter Quill (Earth-616)'),
    't3_a04': ('Hulk', 'Robert Bruce Banner (Earth-616)'),

    # Locations
    'g01': ('Triskelion', 'Triskelion'),
    'g02': ('Avengers Tower', 'Avengers Tower'),
    'g03': ('Wakanda', 'Wakanda'),
    'g04': ('Asgard', 'Asgard'),
    'g05': ('Knowhere', 'Knowhere'),
    'g06': ('Attilan', 'Attilan'),
    'g07': ("Hell's Kitchen", "Hell's Kitchen, Manhattan"),
    'g08': ('Sanctum Sanctorum', 'Sanctum Sanctorum'),
    'g09': ('X-Mansion', 'Xavier Institute'),
    'g10': ('Helicarrier', 'Helicarrier'),
}

print(f"Total entries to check: {len(CANONICAL_MAPPING)}")

# Check in batches of 40 (API limit)
items = list(CANONICAL_MAPPING.items())
batch_size = 35

missing = []
found = {}

for i in range(0, len(items), batch_size):
    batch = items[i:i+batch_size]
    titles_str = '|'.join([title for _, (_, title) in batch])
    url = f"https://marvel.fandom.com/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=600&titles={titles_str}&format=json"
    r = session.get(url, timeout=15).json()
    pages = r.get('query', {}).get('pages', {})
    
    title_to_thumb = {}
    for pid, p in pages.items():
        title = p.get('title')
        thumb = p.get('thumbnail', {}).get('source')
        if thumb:
            title_to_thumb[title] = thumb
    
    for _id, (name, target_title) in batch:
        thumb = title_to_thumb.get(target_title)
        if thumb:
            found[_id] = (name, target_title, thumb)
        else:
            missing.append((_id, name, target_title))

print(f"Found: {len(found)}")
print(f"Missing: {len(missing)}")
for _id, name, title in missing:
    print(f"  MISSING: {_id} {name} -> '{title}'")
