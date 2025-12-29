#!/bin/bash

# Tizi Tracker - Development Server Runner
# This script helps you start the development server

set -e  # Exit on error

echo "🏋️  Tizi Tracker - Starting Development Server"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo ""
    echo "Please install Node.js first:"
    echo "  sudo apt update && sudo apt install nodejs npm"
    echo ""
    echo "Or use nvm (recommended):"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install npm: sudo apt install npm"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: No .env file found"
    echo "   The AI Coach feature will not work without GEMINI_API_KEY"
    echo "   Create a .env file with: GEMINI_API_KEY=your_key_here"
    echo ""
fi

echo "🚀 Starting Vite development server..."
echo "   The app will be available at: http://localhost:3000"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev

