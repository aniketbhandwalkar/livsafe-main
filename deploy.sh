#!/bin/bash

echo "🚀 Medical Assistant Deployment Script"
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run: git init"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Prepare for deployment"
fi

# Push to main branch
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Environment: Node"
echo ""
echo "5. Set these environment variables in Render:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET=your_very_secure_jwt_secret_here"
echo "   - MONGO_URI=your_mongodb_atlas_connection_string"
echo "   - CLIENT_URL=https://your-frontend.vercel.app"
echo ""
echo "6. After backend is deployed, deploy frontend to Vercel"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Import your repository"
echo "   - Set VITE_API_BASE_URL=https://your-backend.onrender.com/api"
