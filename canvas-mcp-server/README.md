# Canvas MCP Server

A Chrome extension that bridges Canvas LMS with Claude Desktop using the Model Context Protocol (MCP).

## Features

- Access Canvas courses and assignments directly from Claude Desktop
- Simple one-time extension installation
- Automatic Canvas URL detection
- Support for custom Canvas instances

## Quick Setup

### 1. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `canvas-mcp-extension` folder
5. Configure Canvas URL in extension settings

### 2. Install Claude Desktop Extension

1. Open Claude Desktop → Settings → Extensions
2. Click "Install Unpacked Extension"
3. Select: `canvas-mcp-native` folder
4. Extension will start automatically ✅

### 3. Use It!

1. Click the Chrome extension icon
2. Click "Refresh Canvas Data"
3. In Claude Desktop, ask:
   - "What courses do I have in Canvas?"
   - "List my Canvas courses"
   - "Show me assignments for [course name]"

That's it! No config files, no scripts, just two simple installs.

## Project Structure

```
canvas-mcp-server/
├── canvas-mcp-extension/    # Chrome extension
│   ├── manifest.json
│   ├── background.js         # Fetches Canvas data via API
│   ├── content.js           # Canvas API integration
│   ├── popup.html/js        # Extension popup UI
│   └── options.html/js      # Settings page
└── canvas-mcp-native/       # Claude Desktop extension
    ├── manifest.json         # DXT manifest
    ├── host.js              # MCP server (stdio + HTTP)
    └── package.json
```

## How It Works

1. **Chrome Extension** fetches Canvas data using Canvas API
2. **HTTP Server** (port 8765) receives Canvas data from Chrome extension
3. **Claude Desktop** launches the MCP server via STDIO
4. **Claude** queries Canvas data through MCP protocol
5. All communication is local (no external servers)

## Troubleshooting

### MCP Server shows "Disconnected"

1. Check Chrome extension status:
   - Open `chrome://extensions/`
   - Reload Canvas MCP Server extension

2. Check Claude Desktop extension:
   - Settings → Extensions
   - Verify "Canvas LMS MCP Server" is listed
   - Check logs: `tail -f ~/canvas-mcp-host.log`

3. Restart both:
   - Reload Chrome extension
   - Restart Claude Desktop

### Canvas URL not detected

1. Open your Canvas site in a browser tab
2. Click extension icon → Settings
3. Click "Auto-Detect from Open Tabs"
4. Or manually enter your Canvas URL (e.g., `https://canvas.duke.edu`)

### Claude says "No courses data available"

1. In Chrome extension popup, click "Refresh Canvas Data"
2. Check extension shows "MCP Server: Connected" (green)
3. Verify courses appear in "Test: List Courses"

## Development

### View Logs

```bash
tail -f ~/canvas-mcp-host.log
```

### Debug Extension

- Right-click Chrome extension icon → Inspect (popup console)
- Or `chrome://extensions/` → Click "service worker" (background console)

## Available MCP Tools

- `list_courses` - Get all Canvas courses for the current user
- `get_course_assignments` - Get assignments for a specific course (requires course_id)

## License

MIT
