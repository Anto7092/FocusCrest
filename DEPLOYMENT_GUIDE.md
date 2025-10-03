# Focus Crest - Vercel Deployment Guide

## Overview
This guide will help you deploy the Focus Crest application to Vercel with all features working correctly.

## Prerequisites
1. A Vercel account (free tier is sufficient)
2. A Google Gemini API key
3. A YouTube Data API v3 key

## API Keys Setup

### 1. Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. YouTube Data API v3 Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to "Credentials" and create an API key
5. Copy the API key

## Deployment Steps

### Step 1: Update API Keys
1. Open `api/gemini.ts`
2. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key
3. Replace `YOUR_YOUTUBE_API_KEY_HERE` with your actual YouTube API key

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to link your project

#### Option B: Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect the configuration

### Step 3: Verify Deployment
1. Check that all routes are working:
   - Main app: `https://your-domain.vercel.app/`
   - API endpoint: `https://your-domain.vercel.app/api/gemini`

## Features Included

### ✅ Working Features
- **AI Study Planner**: Generate personalized study plans
- **AI Assistant**: Chat with AI for educational queries
- **YouTube Integration**: Find educational videos
- **Pomodoro Timer**: Focus sessions with customizable settings
- **Notes System**: Take and save notes
- **Focus Music**: Background music for concentration
- **Custom Themes**: Multiple background themes
- **Settings**: Customize app preferences

### 🔧 Technical Features
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Beautiful dark interface
- **Local Storage**: Settings persist across sessions
- **IndexedDB**: Custom background images
- **Real-time Streaming**: AI responses stream in real-time

## File Structure
```
focus-crest/
├── api/
│   └── gemini.ts          # Serverless API handler
├── components/            # React components
├── services/             # API service functions
├── types.ts             # TypeScript type definitions
├── vercel.json          # Vercel configuration
├── vite.config.ts       # Vite build configuration
└── package.json         # Dependencies and scripts
```

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure API keys are correctly replaced in `api/gemini.ts`
   - Check that API keys have proper permissions

2. **Build Failures**
   - Run `npm install` to ensure all dependencies are installed
   - Check that all imports are correct

3. **Runtime Errors**
   - Check Vercel function logs in the dashboard
   - Ensure API endpoints are accessible

### Performance Optimization
- The app is optimized for Vercel's serverless functions
- API calls are cached where possible
- Images are optimized for web delivery

## Security Notes
- API keys are hardcoded for deployment (as requested)
- Remember to replace with your actual keys before deployment
- Consider using environment variables for production

## Support
If you encounter any issues:
1. Check the Vercel function logs
2. Verify API key permissions
3. Test API endpoints individually
4. Check browser console for client-side errors

## Next Steps After Deployment
1. Test all features thoroughly
2. Customize the API keys as needed
3. Set up custom domain (optional)
4. Configure analytics (optional)
