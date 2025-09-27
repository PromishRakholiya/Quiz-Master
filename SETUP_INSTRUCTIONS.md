# 🚀 Quiz System Setup Instructions

## 📋 Quick Setup Checklist

### 1. Create Environment Files

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install Dependencies & Start Servers

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Verify Setup

1. **Backend Health Check:** Visit http://localhost:5000/api/health
   - Should show: `{"status":"OK","message":"Quiz System API is running"}`

2. **Frontend:** Visit http://localhost:5173
   - Should show the homepage without white screen
   - API health check banner should be green or hidden

## 🎯 How to Use the Enhanced Quiz System

### Admin Workflow:
1. **Signup/Login** as admin at `/signup` or `/login-admin`
2. **Create Quiz** at `/admin` → Fill form with title, description, duration
3. **Add Questions** → Auto-scrolls to question form → Add MSQ/True-False/Descriptive
4. **Publish Quiz** → Click Publish button (or auto-publishes after first question)
5. **View Analytics** → Click Stats button for detailed performance data

### Student Workflow:
1. **Signup/Login** at `/signup` or `/login`
2. **Browse Quizzes** at `/dashboard` → Filter by category/difficulty/search
3. **Preview Quiz** → Click quiz card → See complete details before starting
4. **Take Quiz** → Enhanced timer, numbered questions, multiple choice support
5. **View Results** → Detailed results page with question-by-question review

## ✨ Key Features Implemented

- **🔐 Complete Authentication** - Auto-generated avatars, profile management
- **📊 Rich Quiz Analytics** - Question performance, pass rates, recent attempts
- **⏱️ Enhanced Timer** - Visual progress, warnings, auto-submit
- **🎨 Modern UI** - Toast notifications, loading states, smooth animations
- **📱 Mobile Responsive** - Works perfectly on all screen sizes
- **🛡️ Robust Error Handling** - Clear messages, network diagnostics
- **🔄 Real-time Updates** - Auto-refresh, live feedback

## 🐛 Troubleshooting

### White Screen Issues:
1. Check browser console (F12) for JavaScript errors
2. Ensure `.env` files exist with correct values
3. Verify both servers are running
4. Clear browser cache and localStorage

### Connection Issues:
1. Check if MongoDB is running (local) or connection string is correct (Atlas)
2. Verify ports 5000 (backend) and 5173 (frontend) are not blocked
3. Check Windows Firewall settings for Node.js

### Question Count Not Showing:
1. The backend should populate `questionCount` and `totalMarks` fields
2. After adding questions, the admin panel auto-refreshes to show updated counts
3. Quiz preview shows all available information with fallbacks

## 🎉 You're All Set!

Your Quiz System now includes all professional features:
- Complete CRUD operations for quizzes and questions
- Real-time analytics and statistics
- Enhanced user experience with proper error handling
- Mobile-responsive design with smooth animations
- Comprehensive quiz preview and results system

Happy quizzing! 🚀
