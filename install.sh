#!/bin/sh
set -e

# Aaxion Drive / Client - Universal Linux Installer
echo "🚀 Starting Aaxion installation..."

APP_NAME="Aaxion"
BIN_NAME="aaxion"
REPO="codershubinc/aaxion-client"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"

# 1. Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
else
    echo "❌ Unsupported architecture: $ARCH. Only x86_64/amd64 is supported currently."
    exit 1
fi

# 2. Fetch latest release from GitHub
echo "🔍 Finding latest release..."
LATEST_RELEASE=$(curl -sL https://api.github.com/repos/$REPO/releases/latest)
# Extract the AppImage download URL
DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | grep "browser_download_url.*AppImage" | cut -d : -f 2,3 | tr -d '\"' | xargs | awk '{print $1}')

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ Could not find an AppImage in the latest release."
    echo "Please check if releases are published at https://github.com/$REPO/releases"
    exit 1
fi

echo "📥 Downloading $APP_NAME..."
mkdir -p "$INSTALL_DIR"
curl -L -# -o "$INSTALL_DIR/$BIN_NAME.AppImage" "$DOWNLOAD_URL"

# Make it executable
chmod +x "$INSTALL_DIR/$BIN_NAME.AppImage"

# Setup symlink so user can just type 'aaxion' in terminal
ln -sf "$INSTALL_DIR/$BIN_NAME.AppImage" "$INSTALL_DIR/$BIN_NAME"

# Add ~/.local/bin to PATH in current session just in case
export PATH="$INSTALL_DIR:$PATH"

# 3. Setup Desktop Entry & Icon
echo "🖥️  Setting up desktop shortcut..."
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# Try to extract the icon from the Github repo raw content (or fallback to generic)
curl -sL "https://raw.githubusercontent.com/$REPO/main/src-tauri/icons/icon.png" -o "$ICON_DIR/$BIN_NAME.png" || true

cat > "$DESKTOP_DIR/$BIN_NAME.desktop" << EOF
[Desktop Entry]
Name=$APP_NAME
Exec=$INSTALL_DIR/$BIN_NAME.AppImage
Icon=$BIN_NAME
Type=Application
Categories=Network;FileTransfer;AudioVideo;
Terminal=false
Comment=Aaxion Drive and Streamer Client
EOF

# Update desktop database if available
if command -v update-desktop-database > /dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR"
fi

echo ""
echo "✅ $APP_NAME successfully installed!"
echo "You can now launch it from your application menu, or by typing '$BIN_NAME' in your terminal."
echo "Note: Make sure $INSTALL_DIR is in your system PATH."
