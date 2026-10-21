import re
import os
import time
import requests
import urllib.parse

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
card_data_path = os.path.join(base_dir, 'src', 'engine', 'CardData.ts')
cards_img_dir = os.path.join(base_dir, 'client', 'public', 'images', 'cards')
locations_img_dir = os.path.join(base_dir, 'client', 'public', 'images', 'locations')

os.makedirs(cards_img_dir, exist_ok=True)
os.makedirs(locations_img_dir, exist_ok=True)

cards = []
locations = []

with open(card_data_path, 'r', encoding='utf-8') as f:
    content = f.read()
    pattern = r"id:\s*'([^']+)',\s*name:\s*'([^']+)'"
    matches = re.findall(pattern, content)
    for _id, name in matches:
        if _id.startswith('g'):
            locations.append((_id, name))
        elif _id.startswith('t'):
            cards.append((_id, name))

def download_avatar(name, filepath, bg_color="random"):
    if os.path.exists(filepath):
        return True
    
    encoded_name = urllib.parse.quote(name)
    # Using UI-Avatars to generate nice initial placeholders
    url = f"https://ui-avatars.com/api/?name={encoded_name}&background={bg_color}&color=fff&size=512&font-size=0.33"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"Saved {filepath}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

print("Downloading Card placeholders...")
for _id, name in cards:
    filepath = os.path.join(cards_img_dir, f"{_id}.jpg")
    download_avatar(name, filepath, "random")
    time.sleep(0.1)

print("Downloading Location placeholders...")
for _id, name in locations:
    filepath = os.path.join(locations_img_dir, f"{_id}.jpg")
    download_avatar(name, filepath, "000000") # Black bg for locations
    time.sleep(0.1)

print("Done!")
