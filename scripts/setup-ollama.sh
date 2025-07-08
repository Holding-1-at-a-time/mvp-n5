#!/bin/bash

# Ollama Setup Script for Vehicle Inspection System
# This script downloads and configures the required Ollama models

set -e

echo "🚀 Setting up Ollama for Vehicle Inspection System..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install Ollama first:"
    echo "   curl -fsSL https://ollama.ai/install.sh | sh"
    exit 1
fi

echo "✅ Ollama is installed"

# Start Ollama service (if not running)
echo "🔄 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
sleep 5

# Function to check if Ollama is responding
check_ollama() {
    curl -s http://localhost:11434/api/tags > /dev/null 2>&1
}

# Wait up to 30 seconds for Ollama to be ready
for i in {1..30}; do
    if check_ollama; then
        echo "✅ Ollama is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Ollama failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Download required models
echo "📥 Downloading Llama 3.2 Vision model..."
ollama pull llama3.2-vision:latest

echo "📥 Downloading mxbai-embed-large model..."
ollama pull mxbai-embed-large:latest

# Verify models are installed
echo "🔍 Verifying installed models..."
MODELS=$(ollama list)

if echo "$MODELS" | grep -q "llama3.2-vision"; then
    echo "✅ llama3.2-vision model installed successfully"
else
    echo "❌ Failed to install llama3.2-vision model"
    exit 1
fi

if echo "$MODELS" | grep -q "mxbai-embed-large"; then
    echo "✅ mxbai-embed-large model installed successfully"
else
    echo "❌ Failed to install mxbai-embed-large model"
    exit 1
fi

# Test the models with sample requests
echo "🧪 Testing vision model..."
VISION_TEST=$(ollama run llama3.2-vision:latest "Describe what you see in this test." --verbose 2>/dev/null || echo "FAILED")

if [ "$VISION_TEST" != "FAILED" ]; then
    echo "✅ Vision model test passed"
else
    echo "⚠️  Vision model test failed, but model is installed"
fi

echo "🧪 Testing embedding model..."
EMBED_TEST=$(ollama run mxbai-embed-large:latest "Generate embedding for: test vehicle damage" --verbose 2>/dev/null || echo "FAILED")

if [ "$EMBED_TEST" != "FAILED" ]; then
    echo "✅ Embedding model test passed"
else
    echo "⚠️  Embedding model test failed, but model is installed"
fi

# Create environment configuration
echo "⚙️  Creating environment configuration..."
cat > .env.ollama << EOF
# Ollama Configuration for Vehicle Inspection System
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llama3.2-vision
OLLAMA_EMBED_MODEL=mxbai-embed-large

# Performance Settings
OLLAMA_NUM_PARALLEL=4
OLLAMA_MAX_LOADED_MODELS=2
OLLAMA_FLASH_ATTENTION=true

# Logging
OLLAMA_DEBUG=false
OLLAMA_VERBOSE=false
EOF

echo "📝 Environment configuration saved to .env.ollama"
echo "   Add these variables to your .env.local file"

# Display system information
echo ""
echo "📊 System Information:"
echo "   Ollama Version: $(ollama --version 2>/dev/null || echo 'Unknown')"
echo "   Available Models:"
ollama list | grep -E "(llama3.2-vision|mxbai-embed-large)" | sed 's/^/     /'

echo ""
echo "🎉 Ollama setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy the environment variables from .env.ollama to your .env.local file"
echo "2. Restart your Next.js development server"
echo "3. Visit /ollama-demo to test the integration"
echo "4. Monitor performance at /api/ai/v1/assess (GET) for health checks"
echo ""
echo "🔧 Troubleshooting:"
echo "   - If models fail to load, check available disk space and memory"
echo "   - Increase OLLAMA_MAX_LOADED_MODELS if you have sufficient RAM"
echo "   - Check Ollama logs with: ollama logs"
echo "   - Restart Ollama service with: ollama serve"

# Keep Ollama running in background
echo "🔄 Ollama is now running in the background (PID: $OLLAMA_PID)"
echo "   To stop: kill $OLLAMA_PID"
