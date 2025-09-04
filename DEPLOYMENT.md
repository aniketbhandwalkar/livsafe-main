# Deployment Guide

This guide will help you deploy your Medical Assistant application using Heroku for the backend and Vercel for the frontend.

## Prerequisites

- Node.js installed locally
- Git repository
- Heroku account
- Vercel account
- MongoDB Atlas account (for production database)

## Backend Deployment (Heroku)

### 1. Prepare the Backend

1. **Set up environment variables**:
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit `.env` file with your local development values:
   ```env
   MONGO_URI=mongodb://localhost:27017/medical_assistant
   JWT_SECRET=your_very_secure_jwt_secret_key_here_make_it_long_and_complex
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

2. **Test locally**:
   ```bash
   cd server
   npm install
   npm run build
   npm start
   ```

### 2. Deploy to Heroku

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   cd server
   heroku create your-app-name-backend
   ```

3. **Set up MongoDB Atlas**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string
   - Replace `<password>` and `<dbname>` in the connection string

4. **Set environment variables on Heroku**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_very_secure_jwt_secret_for_production
   heroku config:set MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medical_assistant?retryWrites=true&w=majority
   heroku config:set CLIENT_URL=https://your-frontend-app.vercel.app
   ```

5. **Deploy**:
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

6. **Check deployment**:
   ```bash
   heroku logs --tail
   heroku open
   ```

### 3. Verify Backend

Visit `https://your-app-name-backend.herokuapp.com/health` to verify the backend is running.

## Frontend Deployment (Vercel)

### 1. Prepare the Frontend

1. **Set up environment variables**:
   Create `.env.local` in the root directory:
   ```env
   VITE_API_BASE_URL=https://your-app-name-backend.herokuapp.com/api
   ```

2. **Test locally**:
   ```bash
   npm install
   npm run build
   npm run preview
   ```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login and deploy**:
   ```bash
   vercel login
   vercel
   ```

3. **Set environment variables**:
   ```bash
   vercel env add VITE_API_BASE_URL
   # Enter: https://your-app-name-backend.herokuapp.com/api
   ```

#### Option B: Using Vercel Dashboard

1. **Connect GitHub repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure build settings**:
   - Framework Preset: Vite
   - Root Directory: `./` (root of your repo)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set environment variables**:
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_BASE_URL` with value `https://your-app-name-backend.herokuapp.com/api`

4. **Deploy**:
   - Click "Deploy"

### 3. Update Backend CORS

After getting your Vercel URL, update the backend CORS settings:

```bash
heroku config:set CLIENT_URL=https://your-frontend-app.vercel.app
```

## Environment Variables Summary

### Backend (Heroku)
- `NODE_ENV=production`
- `JWT_SECRET=your_very_secure_jwt_secret_for_production`
- `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medical_assistant?retryWrites=true&w=majority`
- `CLIENT_URL=https://your-frontend-app.vercel.app`
- `PORT` (automatically set by Heroku)

### Frontend (Vercel)
- `VITE_API_BASE_URL=https://your-app-name-backend.herokuapp.com/api`

## Testing the Deployment

1. **Backend Health Check**:
   ```
   GET https://your-app-name-backend.herokuapp.com/health
   ```

2. **Frontend**:
   Visit your Vercel URL and test the application

3. **API Integration**:
   Test login, registration, and other API endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `CLIENT_URL` in backend matches your Vercel URL
   - Check that CORS is properly configured

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Check network access settings in MongoDB Atlas

3. **JWT Errors**:
   - Ensure `JWT_SECRET` is set in both environments
   - Verify JWT secret is the same across deployments

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`

### Useful Commands

```bash
# Check Heroku logs
heroku logs --tail

# Check Heroku config
heroku config

# Restart Heroku app
heroku restart

# Check Vercel deployment
vercel logs

# Check Vercel environment variables
vercel env ls
```

## Security Notes

1. **JWT Secret**: Use a strong, random JWT secret in production
2. **Database**: Use MongoDB Atlas with proper network access rules
3. **CORS**: Only allow your frontend domain
4. **Environment Variables**: Never commit `.env` files to version control

## Next Steps

After successful deployment:
1. Set up custom domains (optional)
2. Configure SSL certificates (handled by Heroku/Vercel)
3. Set up monitoring and logging
4. Configure CI/CD pipelines
5. Set up database backups
