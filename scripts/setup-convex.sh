#!/bin/bash

# Convex Local Development Setup Script
# This script sets up Convex for local development

set -e

echo "🚀 Setting up Convex for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install Convex CLI globally if not already installed
if ! command -v convex &> /dev/null; then
    echo "📦 Installing Convex CLI globally..."
    npm install -g convex
else
    echo "✅ Convex CLI is already installed"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "⚠️  Please edit .env.local with your configuration values"
else
    echo "✅ .env.local already exists"
fi

# Initialize Convex if not already initialized
if [ ! -d "convex/_generated" ]; then
    echo "🔧 Initializing Convex..."
    npx convex init --yes
else
    echo "✅ Convex is already initialized"
fi

# Generate Convex types
echo "🔄 Generating Convex types..."
npx convex dev --once

echo ""
echo "✅ Convex setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Start development servers:"
echo "   npm run dev:full    # Start both Convex and Next.js"
echo "   OR"
echo "   npm run convex:dev  # Start Convex (Terminal 1)"
echo "   npm run dev         # Start Next.js (Terminal 2)"
echo ""
echo "3. Open Convex dashboard:"
echo "   npm run convex:dashboard"
echo ""
echo "Happy coding! 🎉"
