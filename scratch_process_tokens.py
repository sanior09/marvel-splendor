from PIL import Image
import numpy as np
import os

token_dir = r'c:\Bord Game\client\public\images\tokens'
os.makedirs(token_dir, exist_ok=True)

im1_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196574799.png'
im2_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196576437.png'

im1 = Image.open(im1_path).convert('RGBA')
im2 = Image.open(im2_path).convert('RGBA')

# Function to remove white background and make transparent
def make_transparent_and_clean(img, bg_threshold=240):
    data = np.array(img)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    # mask white background
    white_mask = (r > bg_threshold) & (g > bg_threshold) & (b > bg_threshold)
    data[:,:,3][white_mask] = 0
    return Image.fromarray(data)

# Let's extract each coin with precise coordinates
# im1: (83, 100)
# Time (top right):
crop_time = im1.crop((36, 12, 79, 52))
# Shield (bottom):
crop_shield = im1.crop((16, 54, 60, 95))

# im2: (352, 94)
# Mind:
crop_mind = im2.crop((21, 16, 74, 69))
# Reality:
crop_reality = im2.crop((88, 14, 142, 68))
# Soul:
crop_soul = im2.crop((157, 16, 210, 69))
# Space:
crop_space = im2.crop((225, 16, 278, 69))
# Power:
crop_power = im2.crop((287, 16, 340, 69))

crops = {
    'emerald': crop_time,    # Time
    'gold': crop_shield,     # S.H.I.E.L.D.
    'topaz': crop_mind,      # Mind
    'ruby': crop_reality,    # Reality
    'obsidian': crop_soul,   # Soul
    'sapphire': crop_space,  # Space
    'amethyst': crop_power,  # Power
}

for color, img in crops.items():
    cleaned = make_transparent_and_clean(img)
    # Resize with high quality Lanczos filter to 128x128
    resized = cleaned.resize((128, 128), Image.Resampling.LANCZOS)
    save_path = os.path.join(token_dir, f'{color}.png')
    resized.save(save_path)
    print(f"Saved {color}.png ({resized.size})")

print("All 7 token images extracted and processed!")
