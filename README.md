# 🏥 LivSafe - Medical Assistant Platform

A comprehensive medical platform for hepatic fibrosis analysis and patient management with AI-powered liver disease assessment capabilities.

## 🌟 Features

### 🔬 Medical Analysis
- **Liver Fibrosis Grading**: Advanced AI-powered analysis for hepatic fibrosis assessment (F0-F4)
- **Medical Image Processing**: Upload and analyze ultrasound images with confidence scoring
- **Clinical Documentation**: Generate comprehensive medical reports with PDF export

### 👥 User Management
- **Doctor Dashboard**: Patient record management, medical image analysis, and consultation tools
- **Organization Dashboard**: Multi-doctor management, statistics, and administrative controls
- **Authentication System**: Secure login for both doctors and healthcare organizations

### 🤖 AI-Powered Chat
- **Virtual Consultation**: Chat with Dr. Marcus Thompson (AI assistant) for medical insights
- **Context-Aware Responses**: AI understands patient data and provides relevant medical guidance
- **Export Conversations**: Download consultation transcripts for record-keeping

### 📊 Data Management
- **Patient Records**: Comprehensive patient information management
- **Medical History**: Track and maintain detailed medical histories
- **Report Generation**: Automated medical report creation and export

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Wouter** for routing
- **Lucide React** for icons
- **jsPDF** for PDF generation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads

### AI Integration
- **Google Gemini AI** for intelligent medical consultations
- **Medical image analysis** capabilities
- **Natural language processing** for clinical insights

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/livsafe-main.git
   cd livsafe-main
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the `server` directory:
   ```env
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/medical_assistant
   # OR for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medical_assistant

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

   Create `.env` file in the `client` directory:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:5000/api

   # Gemini AI API Key (optional, for chat functionality)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the application**
   
   **Option 1: Using the startup scripts**
   ```bash
   # Windows PowerShell
   .\dev.ps1
   
   # Windows Command Prompt
   .\dev.bat
   ```

   **Option 2: Manual start**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173 (or 5174)
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## 📁 Project Structure

```
livsafe-main/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries and API calls
│   │   ├── pages/          # Route components
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── dist/               # Compiled TypeScript
│   └── package.json
├── dev.ps1                 # PowerShell startup script
├── dev.bat                 # Batch startup script
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (doctors & organizations)
- `POST /api/auth/signup/doctor` - Doctor registration
- `POST /api/auth/signup/organization` - Organization registration
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Doctor Routes
- `GET /api/doctor/dashboard` - Doctor dashboard data
- `GET /api/doctor/records` - Get patient records
- `GET /api/doctor/records/:id` - Get specific record
- `POST /api/medical-images/upload` - Upload medical images
- `DELETE /api/doctor/records/:id` - Delete record

### Organization Routes
- `GET /api/organization/dashboard` - Organization dashboard
- `GET /api/doctor/all` - Get all doctors
- `POST /api/auth/signup/doctor` - Add new doctor
- `DELETE /api/doctor/:id` - Remove doctor

### Patient Management
- `GET /api/patients` - Get patients with pagination
- `GET /api/patients/:id` - Get specific patient
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for development and production
- **Rate Limiting**: Protection against API abuse
- **Helmet.js**: Security headers for Express
- **Input Validation**: Comprehensive request validation

## 🧪 Development

### Available Scripts

**Backend (`/server`)**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

**Frontend (`/client`)**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database Seeding

To populate the database with sample data:
```bash
cd server
npm run seed
```

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set production environment variables
3. Deploy the `dist` folder to your hosting service
4. Ensure MongoDB is accessible from production

### Frontend Deployment
1. Update `VITE_API_BASE_URL` in production `.env`
2. Build the application: `npm run build`
3. Deploy the `dist` folder to a static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Add feature"`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the [documentation](docs/)
- Review the API endpoints above

## 🏗️ Future Enhancements

- [ ] Mobile application
- [ ] Advanced AI diagnostic features
- [ ] Telemedicine integration
- [ ] Multi-language support
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for better healthcare management**
