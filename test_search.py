import requests
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

names = [
    'Arcade', 'Nightcrawler', 'Kingpin', 'Hela', 'Elektra',
    'Groot', 'Hulk', 'Thanos', 'Falcon', 'Hawkeye', 'Storm',
    'Gamora', 'Ghost Rider', 'Green Goblin', 'Gambit', "Hell's Kitchen"
]

for name in names:
    # 1. Search for Earth-616 or direct character
    url = f"https://marvel.fandom.com/api.php?action=query&list=search&srsearch={name}&srlimit=8&format=json"
    r = session.get(url, timeout=10).json()
    search_results = r.get('query', {}).get('search', [])
    
    # Prioritize title with Earth-616, or exact match
    chosen_title = None
    for res in search_results:
        title = res['title']
        if '(Earth-616)' in title:
            chosen_title = title
            break
    if not chosen_title and search_results:
        chosen_title = search_results[0]['title']
        
    print(f"Name: {name} -> Selected Page: {chosen_title}")
    
    # 2. Fetch image for that page
    if chosen_title:
        img_url = f"https://marvel.fandom.com/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=600&titles={chosen_title}&format=json"
        ir = session.get(img_url, timeout=10).json()
        pages = ir.get('query', {}).get('pages', {})
        thumb = None
        for pid, pdata in pages.items():
            thumb = pdata.get('thumbnail', {}).get('source')
        print(f"   Image URL: {thumb}")
