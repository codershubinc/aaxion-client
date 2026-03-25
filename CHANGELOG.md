# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - Initial Release

> ⚠️ **EARLY RELEASE WARNING:** This is an early alpha release. Expect potential bugs and instability as core features are still being actively refined.

This is the very first foundational release of the Aaxion Client.

For a full list of features introduced in this initial release, please see the dedicated release document: **[v0.0.1 Features Document](docs/v0.0.1.md)**.

### Added

- Setup initial Next.js and Tauri workspace structure.
- Developed Aaxion Drive module for remote file viewing, uploading, and image previewing.
- Developed Aaxion Streamer module for structured movie/series metadata browsing.
- Implemented robust OMDB API integrations to fetch cast, summary, and poster artwork.
- Integrated direct native VLC Player casting through customized Lua-based HTTP API requests.
- Added VLC remote control overlay directly into the frontend React components.
- Added local server discovery protocol to auto-connect to the Aaxion backend.
- Added seamless borderless custom TitleBar for the desktop environment.
- Packaged desktop icons and universal `install.sh` Linux AppImage installation script.
