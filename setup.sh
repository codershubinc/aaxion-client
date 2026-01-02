#!/bin/bash

# Aaxion Web Client Setup Script
echo "🚀 Setting up Aaxion Web Client..."

# Navigate to web directory
cd "$(dirname "$0")"

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed."
    echo "📥 Install Bun by running: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun $(bun --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created"
fi

echo ""
echo "✨ Setup complete! You can now run:"
echo "   bun dev    - Start development server"
echo "   bun run build  - Build for production"
echo "   bun start  - Start production server"
echo ""
echo "🌐 The app will be available at http://localhost:3000"
echo "⚠️  Make sure the backend is running on http://localhost:8080"
