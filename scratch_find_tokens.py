import requests
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# 1. Check Steam Workshop description
urls = [
    'https://steamcommunity.com/sharedfiles/filedetails/?id=2273030310',
    'https://steamcommunity.com/sharedfiles/filedetails/?id=2247545465',
    'https://steamcommunity.com/sharedfiles/filedetails/?id=2311497914'
]

for u in urls:
    try:
        r = requests.get(u, headers=headers, timeout=10)
        imgur = re.findall(r'https?://(?:i\.)?imgur\.com/[a-zA-Z0-9_\.]+', r.text)
        steam_cloud = re.findall(r'https?://steamusercontent-a\.akamaihd\.net/ugc/[^\s\"\'<>]+', r.text)
        print(f"{u} -> Imgur: {len(imgur)}, SteamCloud: {len(steam_cloud)}")
        if imgur:
            print("  Imgur:", imgur[:5])
        if steam_cloud:
            print("  SteamCloud:", steam_cloud[:5])
    except Exception as e:
        print(e)
