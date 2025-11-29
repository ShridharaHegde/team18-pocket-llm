#!/bin/bash

# Force clean restart script for PocketLLM Frontend

echo "🧹 Cleaning all caches..."

# Stop any running dev server (if applicable)
echo "Stopping any running processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Remove all cache directories
echo "Removing node_modules/.vite cache..."
rm -rf node_modules/.vite

echo "Removing .vite cache..."
rm -rf .vite

echo "Removing dist..."
rm -rf dist

echo "✅ Cache cleared!"
echo ""
echo "🚀 Starting dev server..."
npm run dev
