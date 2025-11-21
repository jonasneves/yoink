.PHONY: help release package clean test

# Default target
help:
	@echo "CanvasFlow - Chrome Web Store Release Automation"
	@echo ""
	@echo "Available commands:"
	@echo "  make release       - Create release packages (prompts for version)"
	@echo "  make package       - Same as release"
	@echo "  make test          - Verify extension structure"
	@echo "  make clean         - Remove build artifacts"
	@echo ""
	@echo "Examples:"
	@echo "  make release       # Creates release with current version"
	@echo "  VERSION=1.0.1 make release  # Creates release with specific version"

# Create release packages
release:
	@echo "Creating release packages..."
	@if [ -n "$(VERSION)" ]; then \
		./scripts/release.sh $(VERSION); \
	else \
		./scripts/release.sh; \
	fi

# Alias for release
package: release

# Test extension structure
test:
	@echo "Verifying extension structure..."
	@echo ""
	@echo "Checking manifest..."
	@if [ -f extension/manifest.json ]; then \
		echo "✓ manifest.json exists"; \
		cat extension/manifest.json | jq -r '.version' | xargs -I {} echo "  Version: {}"; \
	else \
		echo "✗ manifest.json not found"; \
		exit 1; \
	fi
	@echo ""
	@echo "Checking icons..."
	@for size in 16 48 128; do \
		if [ -f "extension/icon-$$size.png" ]; then \
			echo "✓ icon-$$size.png exists"; \
		else \
			echo "✗ icon-$$size.png missing"; \
		fi; \
	done
	@echo ""
	@echo "Checking CSP compliance..."
	@if grep -r "onclick\|onload\|onerror" extension/*.html > /dev/null 2>&1; then \
		echo "✗ Found inline event handlers (CSP violation)"; \
		grep -n "onclick\|onload\|onerror" extension/*.html; \
		exit 1; \
	else \
		echo "✓ No inline event handlers"; \
	fi
	@echo ""
	@echo "Checking for eval()..."
	@if grep -r "eval(" extension/*.js --exclude-dir=lib > /dev/null 2>&1; then \
		echo "⚠ Found eval() usage"; \
		grep -n "eval(" extension/*.js --exclude-dir=lib; \
	else \
		echo "✓ No eval() usage"; \
	fi
	@echo ""
	@echo "All checks passed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist/
	@rm -rf screenshots/*.png
	@echo "✓ Cleaned dist/ and screenshots/"

# Quick start guide
quickstart:
	@echo "CanvasFlow Quick Start"
	@echo ""
	@echo "1. Create release packages:"
	@echo "   make release"
	@echo ""
	@echo "2. Follow the checklist in:"
	@echo "   dist/submission-checklist-vX.X.X.md"
	@echo ""
