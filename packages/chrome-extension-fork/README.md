<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Prompt GPT Chrome Extension

A Chrome extension that helps you improve your AI chat prompts across multiple platforms using guided refinement.

## Supported Platforms

The extension now works on **11 AI platforms**:

- ✅ **ChatGPT** (OpenAI) - chatgpt.com
- ✅ **Google Gemini** - gemini.google.com
- ✅ **Canva** - canva.com
- ✅ **Claude** (Anthropic) - claude.ai
- ✅ **Perplexity AI** - perplexity.ai
- ✅ **Microsoft Copilot** - copilot.microsoft.com
- ✅ **Midjourney** - midjourney.com & Discord
- ✅ **Leonardo.ai** - leonardo.ai
- ✅ **GitHub Copilot** - github.com/copilot
- ✅ **Meta AI** - meta.ai
- ✅ **Figma** (including Figma Make) - figma.com

## Features

- 🎯 **Guided Prompt Refinement** - Answer questions to improve your prompt step-by-step
- ⚡ **Quick Improve** - Get instant prompt improvements
- 🔄 **Cross-Platform Support** - Works seamlessly across 11 AI platforms (chat, image generation, design tools)
- 🎨 **Non-Intrusive UI** - Integrates naturally with each platform
- 🔌 **Extensible Architecture** - Easy to add support for new platforms

## Development

### Prerequisites

- Node.js
- pnpm (or npm)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   # For local development (keeps extension "key" for consistent ID)
   pnpm run build:prod
   
   # For Chrome Web Store submission (removes "key" field)
   pnpm run build:store
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the project

### Build Commands

- **`pnpm build:dev`** - Development build with dev API endpoints
- **`pnpm build:prod`** - Production build with prod API endpoints (keeps "key" field)
- **`pnpm build:store`** - Production build for Chrome Web Store (removes "key" field)

See [BUILD.md](BUILD.md) for detailed build documentation.

### Adding Support for New Sites

Want to add support for another AI chat platform? Check out our comprehensive guide:

📖 **[Site Adapters Documentation](SITE_ADAPTERS.md)**

The extension uses a modular **Site Adapter** system that makes it easy to add new platforms. Each adapter is a simple TypeScript file that defines:
- How to find the prompt input field
- How to get/set text
- Where to inject the extension button

## Architecture

The extension uses a modular architecture with environment-specific configuration:

### Directory Structure
```
src/
├── siteAdapters/           # Modular site integration system
│   ├── types.ts           # SiteAdapter interface
│   ├── registry.ts        # Registry of all adapters
│   ├── utils.ts           # Helper functions
│   ├── chatgpt.ts         # ChatGPT adapter
│   ├── claude.ts          # Claude adapter
│   ├── perplexity.ts      # Perplexity adapter
│   └── ...                # More adapters
├── config.ts              # Environment-specific configuration (API URLs, etc.)
├── App.tsx                # Main React application
├── background.tsx         # Service worker
├── contentScript.tsx      # Extension injection logic
└── ...                    # Other components
```

### Build System

The project uses a custom build system that:
- **Prevents code splitting** - Each entry point (background, contentScript, popup) is built separately
- **Inlines all dependencies** - No separate chunk files are created
- **Environment-specific builds** - Different API URLs for dev/prod
- **Manifest management** - Automatically updates manifest.json with correct API permissions

See [BUILD.md](BUILD.md) for complete build documentation.

## Building

The project supports multiple build targets:

```bash
# Development build (dev API endpoints)
pnpm run build:dev

# Production build for local testing (keeps extension key)
pnpm run build:prod

# Production build for Chrome Web Store (removes extension key)
pnpm run build:store
```

For detailed information about the build system, environment configuration, and how to update URLs, see [BUILD.md](BUILD.md).

## Contributing

Contributions are welcome! Especially:
- Adding support for new AI chat platforms
- Improving existing adapters
- Bug fixes and improvements

See [SITE_ADAPTERS.md](SITE_ADAPTERS.md) for how to add new platform support.

## License

[Add your license here]

