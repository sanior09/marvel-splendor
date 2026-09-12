from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

token_dir = r'c:\Bord Game\client\public\images\tokens'

im1_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196574799.png'
im2_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196576437.png'

im1 = Image.open(im1_path).convert('RGBA')
im2 = Image.open(im2_path).convert('RGBA')

# High quality circle extraction with anti-aliasing
def extract_circle_token(img, box, target_size=(256, 256)):
    cropped = img.crop(box)
    w, h = cropped.size
    
    # Create high-res circular mask
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((1, 1, w - 2, h - 2), fill=255)
    
    # Also remove white background
    data = np.array(cropped)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    white_dist = np.sqrt((255 - r)**2 + (255 - g)**2 + (255 - b)**2)
    # Smooth alpha feathering on white background
    white_alpha = np.clip((white_dist - 15) * 5, 0, 255).astype(np.uint8)
    
    combined_mask = np.minimum(np.array(mask), white_alpha)
    data[:,:,3] = combined_mask
    
    result = Image.fromarray(data)
    # Upscale smoothly with Lanczos
    return result.resize(target_size, Image.Resampling.LANCZOS)

# Coordinate boxes for each token face:
# In im1 (83 x 100):
# Time:
token_time = extract_circle_token(im1, (36, 12, 79, 52))
# Shield:
token_shield = extract_circle_token(im1, (16, 54, 60, 95))

# In im2 (352 x 94):
# Mind (Yellow):
token_mind = extract_circle_token(im2, (20, 16, 75, 70))
# Reality (Red):
token_reality = extract_circle_token(im2, (88, 14, 142, 68))
# Soul (Orange):
token_soul = extract_circle_token(im2, (156, 15, 211, 70))
# Space (Blue):
token_space = extract_circle_token(im2, (224, 15, 279, 70))
# Power (Purple):
token_power = extract_circle_token(im2, (286, 15, 341, 70))

tokens = {
    'emerald': token_time,
    'gold': token_shield,
    'topaz': token_mind,
    'ruby': token_reality,
    'obsidian': token_soul,
    'sapphire': token_space,
    'amethyst': token_power,
}

for color, img in tokens.items():
    p = os.path.join(token_dir, f'{color}.png')
    img.save(p, 'PNG')
    print(f"Saved refined {p}")

print("Done refining token images!")
