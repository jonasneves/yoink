# Logo Setup Guide

## Quick Start

Once you generate your logo with AI:

1. **Save your generated logo** as `logo-original.png` in this directory (any size, preferably 512x512 or larger)

2. **Run the resize script**:
   ```bash
   cd canvas-mcp-server/canvas-mcp-extension
   python3 resize-logo.py logo-original.png
   ```

3. **Done!** The script will create:
   - `logo-16.png` (16x16) - Toolbar icon
   - `logo-48.png` (48x48) - Extension management page
   - `logo-128.png` (128x128) - Chrome Web Store

## Icon Specifications

### Chrome Extension Requirements:
- **16x16**: Displayed in browser toolbar
- **48x48**: Displayed in Extensions management page
- **128x128**: Displayed in Chrome Web Store

### Design Tips:
- Keep it simple - must be recognizable at 16x16
- Use solid colors or simple gradients
- Avoid thin lines (min 2px)
- Center important elements
- Test on both light and dark backgrounds

## Current Status

✅ Manifest configured for proper icon sizes
✅ Resize script ready to use
⏳ Waiting for logo file

## AI Prompt Used

The CanvasFlow logo was designed using this prompt:

> Modern minimalist app icon: A sleek document/checklist with flowing wave elements integrated into the design. Deep blue (#00539B) and orange (#D97706) gradient. Flat design, rounded corners, clean geometric shapes. Professional student productivity app. No text. Simple enough to recognize at 16px size. White subtle highlights.
