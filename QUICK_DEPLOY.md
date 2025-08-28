# 🚀 Quick Deployment Guide - LivSafe Medical Assistant

## 📋 What You Need
- GitHub account
- MongoDB Atlas account (free)
- Railway account (free)
- Vercel account (free)

## ⚡ Quick Start (5 minutes)

### 1. **Prepare Your Project**
```bash
# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

### 2. **Push to GitHub**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3. **Set Up Database (MongoDB Atlas)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Create database user
5. Whitelist IP: `0.0.0.0/0`
6. Copy connection string

### 4. **Deploy Backend (Railway)**
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory: `server`
6. Add environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key_32_chars_min
   NODE_ENV=production
   PORT=5000
   ```
7. Deploy!

### 5. **Deploy Frontend (Vercel)**
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Set root directory: `/` (project root)
6. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-railway-app.up.railway.app/api
   ```
7. Deploy!

### 6. **Connect Everything**
1. Copy your Railway backend URL
2. Update `VITE_API_BASE_URL` in Vercel
3. Copy your Vercel frontend URL
4. Add `CLIENT_URL` in Railway with your Vercel URL

## 🎯 Your URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.up.railway.app`
- **API**: `https://your-app.up.railway.app/api`

## 🧪 Test Your Deployment
1. Visit your frontend URL
2. Try logging in with:
   - Email: `sarah.johnson@citygeneral.com`
   - Password: `doctor123`

## 🔧 Troubleshooting

### Common Issues:
- **CORS Error**: Make sure `CLIENT_URL` is set in Railway
- **Database Error**: Check MongoDB connection string
- **Build Fails**: Ensure all dependencies are installed

### Check Logs:
- **Railway**: Project → Deployments → View logs
- **Vercel**: Project → Functions → View logs

## 📞 Need Help?
1. Check the full deployment guide in `DEPLOYMENT.md`
2. Verify all environment variables are set
3. Test API endpoints with Postman
4. Check service logs

## 🎉 Success!
Your LivSafe Medical Assistant is now live and ready to use!
