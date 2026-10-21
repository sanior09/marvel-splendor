import requests
import urllib.parse
import re
import os

data_file = r'c:\Bord Game\src\engine\CardData.ts'
cards_dir = r'c:\Bord Game\client\public\images\cards'
loc_dir = r'c:\Bord Game\client\public\images\locations'

with open(data_file, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"id:\s*'([^']+)',\s*name:\s*'([^']+)'"
items = re.findall(pattern, content)

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})

print(f"{'ID':<10} {'CARD NAME':<25} {'STATUS':<12} {'FILE SIZE':<10}")
print("-" * 65)

for _id, name in items:
    folder = cards_dir if _id.startswith('t') else loc_dir
    img_path = os.path.join(folder, f"{_id}.jpg")
    exists = os.path.exists(img_path)
    size = os.path.getsize(img_path) if exists else 0
    status = "EXISTS" if exists and size > 2000 else "MISSING"
    print(f"{_id:<10} {name:<25} {status:<12} {size:<10}")
