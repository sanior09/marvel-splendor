from PIL import Image
import numpy as np

im1_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196574799.png'
im2_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196576437.png'

im1 = Image.open(im1_path).convert('RGBA')
im2 = Image.open(im2_path).convert('RGBA')

# In im1 (83 x 100):
# Time stone (Green) is near the top
# Shield token (Grey) is near the bottom
time_chip = im1.crop((35, 5, 80, 50))
shield_chip = im1.crop((15, 50, 65, 95))

time_chip.save(r'c:\Bord Game\client\public\images\crop_time.png')
shield_chip.save(r'c:\Bord Game\client\public\images\crop_shield.png')

# In im2 (352 x 94):
# 5 coins from left to right:
# 1. Yellow (Mind) ~ x: 10 to 80
# 2. Red (Reality) ~ x: 80 to 145
# 3. Orange (Soul) ~ x: 145 to 215
# 4. Blue (Space) ~ x: 215 to 280
# 5. Purple (Power) ~ x: 275 to 345

mind_chip = im2.crop((15, 10, 80, 80))
reality_chip = im2.crop((85, 10, 150, 85))
soul_chip = im2.crop((150, 10, 215, 80))
space_chip = im2.crop((215, 10, 280, 80))
power_chip = im2.crop((275, 10, 345, 80))

mind_chip.save(r'c:\Bord Game\client\public\images\crop_mind.png')
reality_chip.save(r'c:\Bord Game\client\public\images\crop_reality.png')
soul_chip.save(r'c:\Bord Game\client\public\images\crop_soul.png')
space_chip.save(r'c:\Bord Game\client\public\images\crop_space.png')
power_chip.save(r'c:\Bord Game\client\public\images\crop_power.png')

print("Cropped successfully!")
