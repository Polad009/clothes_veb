import rembg
from PIL import Image

input_path = 'C:/Users/Elsan/.gemini/antigravity/brain/ef8fb2a7-1e28-4f02-9f33-fb05f6ade985/.user_uploaded/media_1794242624462_6ccf8263.jpg'
output_path = 'public/images/categories/trio_pants_cutout.png'

print('Removing background from user pants image...')
img = Image.open(input_path).convert('RGB')
cutout = rembg.remove(img)
cutout.save(output_path, 'PNG')
print('Successfully saved transparent cutout:', output_path)
