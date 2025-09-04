# Render Deployment Guide

This guide will help you deploy your Medical Assistant backend to Render (better alternative to Railway).

## Why Render over Railway?

- ✅ **Always-on free tier** - No sleeping
- ✅ **Built-in MongoDB** - No external database needed
- ✅ **Easy GitHub integration** - Auto-deploy on push
- ✅ **Better free tier** than Heroku
- ✅ **Good performance** and reliability

## Quick Deployment Steps

### 1. Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### 2. Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `medical-assistant-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. **Set Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_very_secure_jwt_secret_here`
   - `CLIENT_URL`: `https://your-frontend.vercel.app` (update after frontend deployment)

6. **Add Database**:
   - Click "New +" → "PostgreSQL" (or use MongoDB Atlas)
   - **Name**: `medical-assistant-db`
   - **Plan**: `Free`
   - Copy the connection string to `MONGO_URI`

### 3. Alternative: Use MongoDB Atlas

If you prefer MongoDB (which your app uses):

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create a free cluster**
3. **Get connection string**
4. **Set in Render environment variables**:
   - `MONGO_URI`: `mongodb+srv://username:password@cluster.mongodb.net/medical_assistant?retryWrites=true&w=majority`

### 4. Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Get your backend URL** (e.g., `https://medical-assistant-backend.onrender.com`)

### 5. Test Your Backend

Visit: `https://your-app-name.onrender.com/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Frontend Deployment (Vercel)

### 1. Deploy Frontend to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Import your GitHub repository**
3. **Set environment variable**:
   - `VITE_API_BASE_URL`: `https://your-app-name.onrender.com/api`

### 2. Update Backend CORS

In Render dashboard, update the environment variable:
- `CLIENT_URL`: `https://your-frontend.vercel.app`

## Environment Variables Summary

### Backend (Render)
- `NODE_ENV=production`
- `JWT_SECRET=your_very_secure_jwt_secret`
- `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medical_assistant?retryWrites=true&w=majority`
- `CLIENT_URL=https://your-frontend.vercel.app`

### Frontend (Vercel)
- `VITE_API_BASE_URL=https://your-app-name.onrender.com/api`

## Advantages of Render over Railway

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | Always-on | Limited hours |
| Database | Built-in PostgreSQL | External only |
| Cold Starts | Minimal | Yes |
| Auto Deploy | ✅ | ✅ |
| Custom Domains | ✅ | ✅ |
| SSL/HTTPS | ✅ | ✅ |
| Pricing | $0-7/month | $5+/month |

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Check network access settings

3. **CORS Errors**:
   - Ensure `CLIENT_URL` matches your Vercel URL
   - Check CORS configuration in your Express app

### Useful Commands

```bash
# Check Render logs
# (Available in Render dashboard)

# Test API locally
curl https://your-app-name.onrender.com/health

# Test API with authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://your-app-name.onrender.com/api/auth/me
```

## Next Steps

1. **Set up custom domain** (optional)
2. **Configure monitoring** (Render provides basic monitoring)
3. **Set up database backups** (MongoDB Atlas handles this)
4. **Configure CI/CD** (automatic with GitHub integration)

## Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Render** | Always-on, 750 hours | $7/month |
| **Railway** | $5 credit/month | $5+/month |
| **Heroku** | 550 hours, sleeps | $7+/month |
| **DigitalOcean** | None | $5/month |

**Render wins** for free tier projects!
