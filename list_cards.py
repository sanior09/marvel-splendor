import re

data_file = r'c:\Bord Game\src\engine\CardData.ts'
with open(data_file, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"id:\s*'([^']+)',\s*name:\s*'([^']+)'"
cards = re.findall(pattern, content)

for i, (_id, name) in enumerate(cards, 1):
    print(f"{i:2d}. {_id}: {name}")
