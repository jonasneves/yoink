#!/usr/bin/env python3
"""
Better cropping strategy that preserves important context
"""
import os
from PIL import Image

TARGET_WIDTH = 1280
TARGET_HEIGHT = 800
base_dir = '/home/user/canvasflow/screenshots'

# Get actual filenames from directory
all_files = os.listdir(base_dir)

# Specific crop configurations with manual positions
crop_configs = [
    {
        'pattern': '8.10.03',
        'output': 'screenshot-4-in-context-v3.png',
        'description': 'In-Context View - Keep LEFT side to show Canvas icon',
        'strategy': 'left',  # Crop from RIGHT to keep the Canvas sidebar with icon visible
    },
    {
        'pattern': '8.33.48',
        'output': 'screenshot-6-claude-desktop-v3.png',
        'description': 'Claude Desktop - Keep TOP to show initial prompt',
        'strategy': 'top',  # Crop from BOTTOM to keep the user's question visible
    },
]

def smart_crop(img, target_w, target_h, strategy='center'):
    """
    Crop image to target dimensions using specified strategy

    Strategies:
    - 'center': Crop equally from all sides
    - 'top': Keep top portion (crop from bottom)
    - 'bottom': Keep bottom portion (crop from top)
    - 'left': Keep left portion (crop from right)
    - 'right': Keep right portion (crop from left)
    """
    orig_w, orig_h = img.size
    target_ratio = target_w / target_h
    orig_ratio = orig_w / orig_h

    if orig_ratio > target_ratio:
        # Image is wider than target - need to crop width
        new_w = int(orig_h * target_ratio)
        new_h = orig_h

        if strategy == 'left':
            # Keep left side, crop from right
            left = 0
        elif strategy == 'right':
            # Keep right side, crop from left
            left = orig_w - new_w
        else:  # center
            left = (orig_w - new_w) // 2

        top = 0

    else:
        # Image is taller than target - need to crop height
        new_w = orig_w
        new_h = int(orig_w / target_ratio)

        left = 0

        if strategy == 'top':
            # Keep top portion, crop from bottom
            top = 0
        elif strategy == 'bottom':
            # Keep bottom portion, crop from top
            top = orig_h - new_h
        else:  # center
            top = (orig_h - new_h) // 2

    # Crop
    cropped = img.crop((left, top, left + new_w, top + new_h))

    # Resize to exact target dimensions
    resized = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

    return resized

print('🎨 Creating improved screenshots with better cropping...\n')

for config in crop_configs:
    pattern = config['pattern']
    output = config['output']
    description = config['description']
    strategy = config.get('strategy', 'center')

    # Find matching file
    matching = [f for f in all_files if pattern in f and f.endswith('.png')]

    if not matching:
        print(f'   ❌ No file found matching pattern: {pattern}')
        continue

    input_file = matching[0]
    input_path = os.path.join(base_dir, input_file)
    output_path = os.path.join(base_dir, output)

    try:
        img = Image.open(input_path)
        print(f'📸 {description}')
        print(f'   Input: {input_file} ({img.width}x{img.height})')
        print(f'   Strategy: {strategy.upper()} crop')

        # Apply smart crop
        result = smart_crop(img, TARGET_WIDTH, TARGET_HEIGHT, strategy)

        # Save with optimization
        result.save(output_path, 'PNG', optimize=True)

        file_size = os.path.getsize(output_path) / 1024
        print(f'   ✅ Saved: {output} ({TARGET_WIDTH}x{TARGET_HEIGHT}, {file_size:.0f}KB)')
        print()

    except Exception as e:
        print(f'   ❌ Error: {e}')
        print()

print('✨ Done!')
print('\nNext: Open compare-screenshots.html to see the improvements!')
