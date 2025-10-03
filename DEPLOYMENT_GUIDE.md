# Focus Crest - Easy Vercel Deployment Guide

## 🚀 Quick Deployment (Recommended)

### Option 1: One-Click Deploy
1. **Update API Keys** in `api/gemini.ts`:
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your Gemini API key
   - Replace `YOUR_YOUTUBE_API_KEY_HERE` with your YouTube API key

2. **Deploy with Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" → Import from GitHub
4. Vercel will auto-detect and deploy

## 🔑 API Keys Setup

### Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in and create a new API key
3. Copy the key

### YouTube Data API v3 Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → Enable YouTube Data API v3
3. Create API key in Credentials section
4. Copy the key

## ✅ What's Fixed for Deployment
- ✅ Simplified vercel.json configuration
- ✅ Removed complex import maps from HTML
- ✅ Added @vercel/node dependency
- ✅ Optimized build configuration
- ✅ Added .vercelignore file
- ✅ Created deployment script

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
