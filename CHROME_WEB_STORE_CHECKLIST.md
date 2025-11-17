# Chrome Web Store Publication Checklist

## Completed

- [x] Reorganized project structure
  - Renamed canvas-mcp-extension to extension/
  - Renamed canvas-mcp-native to native-host/
  - Created lib/ directory for library files
  - Removed test files and duplicates
- [x] Claude API optimizations
  - Implemented Extended Thinking
  - Optimized JSON schemas for direct HTTP API
  - Adaptive token budgets
  - Streamlined prompts
- [x] Updated all file references in HTML
- [x] Removed inline event handlers (CSP compliance)

## Required Before Publishing

### 1. Manifest Updates
- [ ] Verify manifest.json version 3 compliance
- [ ] Set proper version number (suggest: 1.0.0)
- [ ] Add detailed description
- [ ] Verify permissions are minimal
- [ ] Add homepage_url
- [ ] Review content_security_policy if needed

### 2. Store Listing Assets
- [ ] Create multiple icon sizes:
  - 16x16px
  - 48x48px
  - 128x128px
- [ ] Create promotional images:
  - Small promo tile: 440x280px
  - Marquee promo tile: 1400x560px (optional)
- [ ] Capture screenshots (1280x800 or 640x400):
  - Dashboard view
  - Sidepanel with AI insights
  - Settings panel
  - Weekly schedule generation

### 3. Documentation
- [ ] Create extension/README.md with:
  - Installation instructions
  - Features overview
  - Screenshots
  - Configuration guide
- [ ] Create PRIVACY_POLICY.md (required if collecting data)
- [ ] Update main README.md with:
  - Extension download link (after publishing)
  - Native host installation instructions
  - Quick start guide

### 4. Native Host Packaging
- [ ] Create GitHub Actions workflow (.github/workflows/build-native.yml)
- [ ] Build cross-platform binaries:
  - Windows (.exe)
  - macOS (universal binary)
  - Linux (AppImage or tar.gz)
- [ ] Create installation scripts
- [ ] Add manifest.json for native messaging
- [ ] Test native host installation on each platform

### 5. Testing
- [ ] Test extension loading in Chrome
- [ ] Test all features work after restructure
- [ ] Test on multiple Canvas instances
- [ ] Verify API key configuration works
- [ ] Test native messaging (if implemented)
- [ ] Check for console errors
- [ ] Verify CSP compliance

### 6. Legal/Compliance
- [ ] Privacy policy (if collecting data)
- [ ] Terms of service
- [ ] Verify Canvas API usage compliance
- [ ] Anthropic API usage terms compliance

## Publication Steps

1. Create Chrome Web Store developer account ($5 one-time fee)
2. Prepare ZIP file of extension/ directory (exclude .git, node_modules)
3. Upload to Chrome Web Store dashboard
4. Fill in store listing:
   - Detailed description
   - Screenshots
   - Category: Productivity
   - Language: English
5. Submit for review
6. Monitor review status (typically 1-3 days)

## Post-Publication

- [ ] Add Chrome Web Store link to README
- [ ] Create release notes
- [ ] Set up GitHub releases for native host
- [ ] Update MCP Server tab in extension with download links
- [ ] Create user documentation/wiki
- [ ] Set up issue templates for bug reports

## Current File Structure

```
canvasflow/
├── extension/
│   ├── background.js
│   ├── content.js
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── dashboard.css
│   ├── sidepanel.html
│   ├── sidepanel.js
│   ├── manifest.json
│   ├── icon.png
│   ├── lib/
│   │   ├── ai-schemas-sidepanel.js
│   │   ├── ai-schemas-dashboard.js
│   │   ├── ai-mappers.js
│   │   ├── claude-client.js
│   │   ├── lucide.min.js
│   │   └── lucide-init.js
│   └── types/
│       └── ai-types.d.ts
│
├── native-host/
│   ├── host.js
│   ├── package.json
│   ├── package-lock.json
│   └── manifest.json
│
├── README.md
└── CLEANUP_PLAN.md
```

## Notes

- Extension is now properly organized for Chrome Web Store review
- All test files removed
- CSP-compliant (no inline event handlers)
- Claude API optimized with structured outputs
- Ready for packaging once assets are created
