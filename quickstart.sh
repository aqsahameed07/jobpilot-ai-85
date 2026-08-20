#!/bin/bash
# Quick Start Script for JobPilot Profile & Settings

echo "🚀 JobPilot Profile & Settings - Quick Start"
echo "============================================"
echo ""

# Check if we're in the project root
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Please run this script from the jobPilot project root directory"
    exit 1
fi

echo "📦 Step 1: Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

echo ""
echo "📦 Step 2: Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Update your .env files:"
echo "   - Backend: backend/.env (MongoDB URI, JWT_SECRET, etc.)"
echo "   - Frontend: frontend/.env (VITE_API_URL)"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Navigate to http://localhost:5173"
echo "5. Login and go to /settings to test the new profile functionality"
echo ""
echo "📚 For detailed configuration, see: PROFILE_SETTINGS_CONFIG.md"
