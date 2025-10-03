#!/bin/bash

# Focus Crest - Easy Vercel Deployment Script

echo "🚀 Deploying Focus Crest to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "📦 Building and deploying..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be live at the URL provided above."
echo ""
echo "📝 Don't forget to:"
echo "1. Replace API keys in api/gemini.ts with your actual keys"
echo "2. Test all features after deployment"
