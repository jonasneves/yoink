#!/usr/bin/env python3
"""
Resize logo for Chrome extension icon sizes.
Usage: python resize-logo.py <source-logo.png>
Creates: logo-16.png, logo-48.png, logo-128.png
"""

import sys
import os

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow library not found")
    print("Install with: pip install Pillow")
    sys.exit(1)

def resize_logo(source_path):
    """Resize logo to Chrome extension icon sizes."""
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found")
        return False

    try:
        # Open source image
        img = Image.open(source_path)

        # Convert to RGBA if needed (for transparency)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')

        # Get directory of source file
        target_dir = os.path.dirname(source_path) or '.'

        # Define sizes
        sizes = [16, 48, 128]

        for size in sizes:
            # Resize with high-quality antialiasing
            resized = img.resize((size, size), Image.Resampling.LANCZOS)

            # Save
            output_path = os.path.join(target_dir, f'logo-{size}.png')
            resized.save(output_path, 'PNG', optimize=True)
            print(f"✓ Created {output_path} ({size}x{size})")

        print("\n✅ All icon sizes created successfully!")
        print("\nNext steps:")
        print("1. Update manifest.json to use the new sizes:")
        print('   "icons": {')
        print('     "16": "logo-16.png",')
        print('     "48": "logo-48.png",')
        print('     "128": "logo-128.png"')
        print('   }')

        return True

    except Exception as e:
        print(f"Error processing image: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python resize-logo.py <source-logo.png>")
        print("\nExample:")
        print("  python resize-logo.py logo.png")
        sys.exit(1)

    source = sys.argv[1]
    success = resize_logo(source)
    sys.exit(0 if success else 1)
