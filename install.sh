#!/bin/sh
set -e

# Aaxion Drive / Client - Universal Linux Installer
echo "🚀 Starting Aaxion installation..."

# --- 1. Base OS Check ---
OS=$(uname -s)
if [ "$OS" != "Linux" ]; then
    echo "❌ Unsupported Operating System: $OS."
    echo "This script currently only supports Linux installations."
    exit 1
fi

APP_NAME="Aaxion"
BIN_NAME="aaxion"
REPO="codershubinc/aaxion-client"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"

# --- 2. Architecture Check ---
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
else
    echo "❌ Unsupported architecture: $ARCH. Only x86_64/amd64 is supported currently."
    exit 1
fi

# --- 3. Parse Arguments ---
VERSION="latest"

while [ $# -gt 0 ]; do
    case "$1" in
        -v|--version)
            if [ -n "$2" ]; then
                VERSION="$2"
                shift 2
            else
                echo "❌ Error: --version requires a non-empty argument."
                exit 1
            fi
            ;;
        *)
            echo "❌ Error: Invalid argument: $1"
            echo "Usage: $0 [-v <version>]"
            exit 1
            ;;
    esac
done

# --- 4. Fetch Release Information ---
echo "🔍 Finding release info for: $VERSION..."
if [ "$VERSION" = "latest" ]; then
    RELEASE_ENDPOINT="https://api.github.com/repos/$REPO/releases/latest"
else
    # Fetch a specific tag (e.g., v0.0.1)
    RELEASE_ENDPOINT="https://api.github.com/repos/$REPO/releases/tags/$VERSION"
fi

RELEASE_DATA=$(curl -sL "$RELEASE_ENDPOINT")

# Check if the release was actually found
if echo "$RELEASE_DATA" | grep -q '"message": "Not Found"'; then
    echo "❌ Error: Release version '$VERSION' not found."
    exit 1
fi

# Extract the AppImage download URL from the JSON payload
DOWNLOAD_URL=$(echo "$RELEASE_DATA" | grep "browser_download_url.*\.AppImage" | head -n 1 | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ Could not find an AppImage in the $VERSION release."
    echo "Please check if releases are published correctly at https://github.com/$REPO/releases"
    exit 1
fi

echo "📥 Downloading $APP_NAME ($VERSION)..."
mkdir -p "$INSTALL_DIR"
# Download with progress bar to target AppImage
if ! curl -L -# -o "$INSTALL_DIR/$BIN_NAME.AppImage" "$DOWNLOAD_URL"; then
    echo "❌ Download failed!"
    exit 1
fi

# Make it executable
chmod +x "$INSTALL_DIR/$BIN_NAME.AppImage"

# Setup symlink so user can just type 'aaxion' in terminal
ln -sf "$INSTALL_DIR/$BIN_NAME.AppImage" "$INSTALL_DIR/$BIN_NAME"

# Add ~/.local/bin to PATH in current session just in case
export PATH="$INSTALL_DIR:$PATH"

# --- 5. Setup Desktop Entry & Icon ---
echo "🖥️  Setting up desktop shortcut..."
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# Try to extract the icon from the Github repo raw content (or fallback to generic)
curl -sL "https://raw.githubusercontent.com/$REPO/main/src-tauri/icons/icon.png" -o "$ICON_DIR/$BIN_NAME.png" > /dev/null 2>&1 || true

cat > "$DESKTOP_DIR/$BIN_NAME.desktop" << EOF
[Desktop Entry]
Name=$APP_NAME
Exec=$INSTALL_DIR/$BIN_NAME.AppImage
Icon=$ICON_DIR/$BIN_NAME.png
Type=Application
Categories=Network;FileTransfer;AudioVideo;
Terminal=false
Comment=Aaxion Drive and Streamer Client
EOF

# Update desktop database if available
if command -v update-desktop-database > /dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" > /dev/null 2>&1
fi

echo ""
echo "✅ $APP_NAME successfully installed!"
echo "Version installed: $VERSION"
echo "You can now launch it from your application menu, or by typing '$BIN_NAME' in your terminal."
echo "Note: Make sure $INSTALL_DIR is in your system PATH."
