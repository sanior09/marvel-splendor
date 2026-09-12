import requests
import xml.etree.ElementTree as ET

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://boardgamegeek.com/xmlapi2/thing?id=314812'
r = requests.get(url, headers=headers)
print("BGG Status:", r.status_code)
root = ET.fromstring(r.content)
for img in root.findall('.//image'):
    print("Main image:", img.text)

# Also search BGG gallery photos for tokens
gallery_url = 'https://api.geekdo.com/api/images?objectid=314812&objecttype=thing&page=1&showAll=1&size=large'
r_gal = requests.get(gallery_url, headers=headers)
print("Gallery status:", r_gal.status_code)
if r_gal.status_code == 200:
    data = r_gal.json()
    images = data.get('images', [])
    print(f"Found {len(images)} photos in gallery")
    for item in images[:10]:
        print("Caption:", item.get('caption'))
        print("URL:", item.get('images', {}).get('large', {}).get('src'))
