from PIL import Image
import numpy as np

im1_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196574799.png'
im2_path = r'C:\Users\sanio\.gemini\antigravity-ide\brain\c006d3af-a15a-45c8-b4be-a9016823d9d6\.user_uploaded\media_1789196576437.png'

im1 = Image.open(im1_path)
im2 = Image.open(im2_path)

print("im1 size:", im1.size)
print("im2 size:", im2.size)

# Let's save a visual inspection breakdown
im1.save(r'c:\Bord Game\client\public\images\test_im1.png')
im2.save(r'c:\Bord Game\client\public\images\test_im2.png')
