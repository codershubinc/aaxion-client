# Aaxion Client

[![Version](https://img.shields.io/badge/version-v0.0.1-blue.svg)](docs/v0.0.1.md)

> ⚠️ **EARLY RELEASE WARNING:** This is an early alpha release (v0.0.1). The software is actively under development and you may encounter bugs, incomplete features, or instability.

A unified cross-platform client for the Aaxion Drive and Media streamer ecosystem. Built with a high-performance **Tauri** desktop backend and a lightweight **Next.js** frontend UI.

## 🌟 Capabilities

- **Aaxion Drive**: Browse, upload, organize, and preview your remote files with a beautiful dark interface.
- **Aaxion Streamer**: A complete media center for your movies and TV shows, with automatic localized OMDB metadata processing and custom cover art.
- **Native VLC Casting**: Send videos directly from your Aaxion server straight to your local VLC Player, avoiding heavy browser transcoding. Includes a built-in VLC remote control overlay directly in the app.
- **Auto Server Discovery**: Automatically discovers and securely connects to Aaxion servers running on your local network.
- **Desktop First**: Features a fully borderless transparent window, custom drag-and-drop title bar, and system-level performance optimizations.

👉 For a comprehensive list of features, read the **[v0.0.1 Release Details](docs/v0.0.1.md)**.

## 📥 Installation

### Universal Linux Installer

You can quickly install or update the Aaxion desktop client on modern Linux distributions. Run this script in your terminal to fetch the latest binary and seamlessly configure it on your system launcher:

```bash
curl -sL https://raw.githubusercontent.com/codershubinc/aaxion-client/main/install.sh | sh
```

_(This automatically downloads the client to `~/.local/bin/aaxion` and securely creates a desktop `.desktop` shortcut with the correct icon so you can find it via Gnome/KDE/search menus)._

---

### Building from Source

If you prefer to run it manually or build it yourself:

**Prerequisites:**

- [Bun](https://bun.sh/)
- [Rust & Cargo](https://rustup.rs/) (for the Tauri desktop wrapper)
- VLC Media Player (for native casting features)

```bash
# Clone the repository
git clone https://github.com/codershubinc/aaxion-client.git
cd aaxion-client

# Install dependencies
bun install

# Run the Desktop App in Development Mode:
bun run desktop

# OR Run as a Web Client only:
bun dev
```

## 📚 Documentation

- [Changelog](CHANGELOG.md)
- [v0.0.1 Key Features](docs/v0.0.1.md)

## 🤝 Contributing

Contributions, issues, and feature requests are heavily encouraged during this alpha period! Feel free to check the [issues page](https://github.com/codershubinc/aaxion-client/issues).
