
# Screenshot Capture Guide

## Required Screenshots (1280x800 pixels)

Follow these steps to capture high-quality screenshots for the Chrome Web Store:

### Setup

1. **Load the extension:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/` folder

2. **Prepare sample data:**
   - Create a Canvas test account or use a development instance
   - Add sample assignments with various due dates
   - Ensure clean, realistic data (no personal information)

3. **Set viewport:**
   - Open Chrome DevTools (F12)
   - Click the device toolbar icon (Ctrl+Shift+M / Cmd+Shift+M)
   - Set "Responsive" mode
   - Set dimensions to **1280 x 800**

### Screenshot #1: Assignment Dashboard

**What to show:**
- Sidepanel open with assignment list
- All three summary cards visible (Overdue, Due Today, Upcoming)
- Assignments grouped and color-coded
- Filters and sorting visible

**Steps:**
1. Open a Canvas page
2. Click the CanvasFlow extension icon
3. Ensure sidepanel shows assignments
4. Make sure you have a mix of overdue, due today, and upcoming assignments
5. Capture: Use Chrome's built-in screenshot tool or:
   - Mac: Cmd + Shift + 4, then Space, click window
   - Windows: Windows + Shift + S
   - Or DevTools: Cmd/Ctrl + Shift + P, type "screenshot", select "Capture screenshot"

**Save as:** `screenshot-1-dashboard.png`

### Screenshot #2: AI Insights Panel

**What to show:**
- AI Insights tab active
- Generated insights visible with:
  - Workload assessment
  - Priority recommendations
  - Study tips

**Steps:**
1. Ensure you have Claude API key configured
2. Switch to "AI Insights" tab
3. Click "Generate AI Insights" button
4. Wait for insights to load
5. Scroll to show the complete insights panel
6. Capture screenshot

**Save as:** `screenshot-2-ai-insights.png`

### Screenshot #3: Weekly Schedule

**What to show:**
- Full-page weekly schedule view
- 7-day plan visible
- Time blocks and tasks displayed
- Strategic recommendations

**Steps:**
1. In the sidepanel, click the calendar icon (top right)
2. This opens the weekly schedule in a new tab
3. Wait for schedule to generate
4. Ensure full week is visible
5. Capture screenshot

**Save as:** `screenshot-3-weekly-schedule.png`

### Screenshot #4: Settings Panel

**What to show:**
- Settings modal open
- Canvas instance configuration visible
- API key field (empty or masked)
- Time range settings
- Auto-refresh toggle

**Steps:**
1. Open sidepanel
2. Click the settings gear icon (top right)
3. Settings modal appears
4. Ensure all settings sections are visible
5. Capture screenshot

**Save as:** `screenshot-4-settings.png`

### Screenshot #5: In-Context View

**What to show:**
- CanvasFlow sidepanel open alongside a Canvas page
- Shows integration context
- Canvas assignments page visible on left
- CanvasFlow panel on right

**Steps:**
1. Navigate to a Canvas assignments page
2. Open CanvasFlow sidepanel
3. Arrange windows to show both Canvas and CanvasFlow
4. Ensure browser chrome (address bar, tabs) is visible
5. Capture full browser window

**Save as:** `screenshot-5-context.png`

## Post-Processing (Optional)

After capturing screenshots:

1. **Verify dimensions:** All should be 1280x800 pixels
2. **Optimize file size:**
   - Use TinyPNG.com or ImageOptim
   - Keep under 5MB each (Chrome Web Store limit)
3. **Check quality:**
   - No pixelation or blur
   - Text is readable
   - Colors are accurate
4. **Add annotations (optional):**
   - Subtle arrows pointing to key features
   - Small text callouts
   - Don't overdo it - keep it clean

## Automated Alternative

If you want to automate screenshots with a headless browser:

```bash
# Install dependencies
npm install puppeteer

# Run automated capture (requires extension to be loaded)
node scripts/puppeteer-screenshots.js
```

Note: Automated screenshot capture of Chrome extensions is complex
and may require additional setup with Chrome DevTools Protocol.

## Tips for Great Screenshots

- ✅ Use realistic but clean sample data
- ✅ Ensure good contrast and readability
- ✅ Show the extension solving a problem
- ✅ Highlight unique features
- ✅ Keep UI elements aligned and tidy
- ✅ Use consistent Canvas theme/branding
- ❌ Don't include personal information
- ❌ Don't show error states
- ❌ Don't use cluttered or messy data
