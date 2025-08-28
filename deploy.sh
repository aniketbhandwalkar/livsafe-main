#!/bin/bash

echo "🚀 Starting LivSafe Medical Assistant Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Step 1: Install dependencies
print_status "Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

print_status "Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

# Step 2: Build frontend
print_status "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

# Step 3: Build backend
print_status "Building backend..."
cd server
npm run build
if [ $? -ne 0 ]; then
    print_error "Backend build failed"
    exit 1
fi
cd ..

print_success "Build completed successfully!"

# Step 4: Create deployment files
print_status "Creating deployment configuration..."

# Create Railway configuration
cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Create Vercel configuration
cat > vercel.json << EOF
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
EOF

print_success "Deployment configuration created!"

# Step 5: Create environment templates
print_status "Creating environment variable templates..."

cat > .env.frontend.template << EOF
# Frontend Environment Variables
VITE_API_BASE_URL=https://your-backend-app.up.railway.app/api
NODE_ENV=production
EOF

cat > .env.backend.template << EOF
# Backend Environment Variables
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medical_assistant
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-app.vercel.app
SEED_DATA=false
EOF

print_success "Environment templates created!"

# Step 6: Create deployment instructions
cat > DEPLOYMENT_INSTRUCTIONS.md << EOF
# 🚀 Deployment Instructions

## Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Railway account (free tier)
- Vercel account (free tier)

## Step 1: Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP: 0.0.0.0/0 (all IPs)
5. Get your connection string

## Step 2: Backend Deployment (Railway)
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set root directory to: \`server\`
4. Add environment variables from \`.env.backend.template\`
5. Deploy!

## Step 3: Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to: \`/\` (project root)
4. Add environment variables from \`.env.frontend.template\`
5. Deploy!

## Step 4: Update URLs
1. Copy your Railway backend URL
2. Update VITE_API_BASE_URL in Vercel
3. Copy your Vercel frontend URL
4. Update CLIENT_URL in Railway

## Step 5: Test
1. Visit your frontend URL
2. Try logging in with test credentials
3. Test all features

## URLs to Update:
- Backend: https://your-app-name.up.railway.app
- Frontend: https://your-app-name.vercel.app
- Database: Your MongoDB Atlas connection string

## Test Credentials:
- Email: sarah.johnson@citygeneral.com
- Password: doctor123
EOF

print_success "Deployment instructions created!"

print_success "🎉 Deployment preparation completed!"
echo ""
print_status "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Follow the instructions in DEPLOYMENT_INSTRUCTIONS.md"
echo "3. Set up MongoDB Atlas database"
echo "4. Deploy backend to Railway"
echo "5. Deploy frontend to Vercel"
echo ""
print_warning "Don't forget to update environment variables with your actual URLs!"
