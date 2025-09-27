# 🔧 Quiz System Troubleshooting Guide

## ❌ "Failed to load quizzes" Error

This error means users can't see published quizzes. Here's how to fix it:

### 🚀 Quick Fix (Recommended)
**Run the startup script:**
1. Double-click `start-quiz-system.bat`
2. Wait for both servers to start
3. Visit http://localhost:5173

### 🔧 Manual Fix

#### Step 1: Create Environment Files

**Create `frontend/.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

**Create `backend/.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-system
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### Step 2: Start Servers

**Backend (Terminal 1):**
```bash
cd backend
npm install
npm start
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```

#### Step 3: Verify Setup

1. **Backend health**: http://localhost:5000/api/health
2. **Frontend**: http://localhost:5173
3. **No red error banners** should appear

## 🎯 How Quiz Visibility Works

### For Students:
- Can only see **published** quizzes
- Quizzes must have at least 1 question to be published
- No date restrictions (can see all published quizzes)

### For Admins:
- Can see **all** quizzes (published and unpublished)
- Can publish/unpublish quizzes
- Can create and manage questions

## 📊 Testing the System

### Create a Test Quiz (Admin):
1. Login as admin at `/login-admin`
2. Go to `/admin`
3. Create a quiz with title and description (10+ chars)
4. Add at least one question
5. Click "Publish" or enable "Auto-publish after first question"

### View Quizzes (Student):
1. Login as student at `/login`
2. Go to `/dashboard`
3. Should see the published quiz
4. Click "Start Quiz" to attempt it

## 🐛 Common Issues

### "Connection Failed" Banner:
- Backend not running → Start with `npm start` in backend folder
- Wrong API URL → Check `frontend/.env` has correct VITE_API_URL
- CORS issues → Restart both servers after creating .env files

### "No quizzes found":
- No published quizzes → Admin needs to create and publish quizzes
- User not logged in → Login required to see quizzes
- Database empty → Create test data

### White Screen:
- JavaScript errors → Check browser console (F12)
- Missing dependencies → Run `npm install` in both folders
- Environment variables → Ensure .env files exist

### MongoDB Issues:
- **Local MongoDB**: Install MongoDB Community Server
- **Cloud MongoDB**: Use MongoDB Atlas (recommended)
  - Create free cluster at mongodb.com/atlas
  - Replace MONGODB_URI with Atlas connection string

## 🎉 Success Indicators

When everything works correctly:
- ✅ No red error banners on homepage
- ✅ Students can see published quizzes on dashboard
- ✅ Admins can create, edit, and publish quizzes
- ✅ Quiz attempts work with timer and results
- ✅ Leaderboards show participant scores

## 📞 Still Having Issues?

1. Check browser console (F12) for JavaScript errors
2. Verify both servers are running without errors
3. Test API directly: http://localhost:5000/api/health
4. Clear browser cache and localStorage
5. Try in incognito/private browsing mode
