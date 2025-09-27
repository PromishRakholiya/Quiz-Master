# 🧪 Create Test Data - Quick Guide

## 📝 Sample Quiz Data

### **Quiz 1: General Knowledge**
- **Title**: "General Knowledge Quiz"
- **Description**: "Test your general knowledge with these fun questions!"
- **Duration**: 15 minutes
- **Category**: General
- **Difficulty**: Easy

**Questions:**
1. **Q1**: "What is the capital of France?"
   - Type: Multiple choice
   - Options: London, Berlin, **Paris** ✅, Madrid

2. **Q2**: "The Earth is flat."
   - Type: True/False
   - Options: True, **False** ✅

3. **Q3**: "What is the largest ocean?"
   - Type: Fill-in-blank
   - Correct Answer: "Pacific Ocean"

### **Quiz 2: Mathematics**
- **Title**: "Basic Math Quiz"
- **Description**: "Simple mathematics questions for everyone to enjoy and learn!"
- **Duration**: 10 minutes
- **Category**: Mathematics
- **Difficulty**: Medium

**Questions:**
1. **Q1**: "What is 15 + 27?"
   - Type: Multiple choice
   - Options: 40, **42** ✅, 44, 45

2. **Q2**: "Is 17 a prime number?"
   - Type: True/False
   - Options: **True** ✅, False

3. **Q3**: "What is 8 × 7?"
   - Type: Fill-in-blank
   - Correct Answer: "56"

### **Quiz 3: Science**
- **Title**: "Science Basics"
- **Description**: "Fundamental science concepts that everyone should know!"
- **Duration**: 20 minutes
- **Category**: Science
- **Difficulty**: Hard

**Questions:**
1. **Q1**: "What is the chemical symbol for water?"
   - Type: Multiple choice
   - Options: **H2O** ✅, CO2, NaCl, O2

2. **Q2**: "Light travels faster than sound."
   - Type: True/False
   - Options: **True** ✅, False

3. **Q3**: "How many bones are in the adult human body?"
   - Type: Fill-in-blank
   - Correct Answer: "206"

## 🚀 Quick Creation Steps

### **For Each Quiz:**
1. **Login as Admin** → `/admin`
2. **Create Quiz** → Fill form with above data
3. **Add Questions** → Use the question data provided
4. **Verify Published** → Check quiz card shows "✅ Published"
5. **Test as Student** → Login as student and check dashboard

### **Verification Checklist:**
- ✅ Quiz appears in admin panel with question count
- ✅ Quiz shows "✅ Published" status
- ✅ Students can see quiz on dashboard
- ✅ Students can start and complete quiz
- ✅ Results and leaderboard work properly

## 🎯 Expected Result

After creating these 3 sample quizzes, students should see:

```
📚 Available Quizzes (3)

🎯 General Knowledge Quiz
📝 3 questions • ⏱️ 15 min • 📊 3 marks • 📂 General • 🎯 Easy
[🚀 Start Quiz] [🏆 Leaderboard]

🔢 Basic Math Quiz  
📝 3 questions • ⏱️ 10 min • 📊 3 marks • 📂 Mathematics • 🎯 Medium
[🚀 Start Quiz] [🏆 Leaderboard]

🔬 Science Basics
📝 3 questions • ⏱️ 20 min • 📊 3 marks • 📂 Science • 🎯 Hard
[🚀 Start Quiz] [🏆 Leaderboard]
```

## 🐛 Troubleshooting

**If quizzes don't appear for students:**
1. **Check Publication**: Quiz must show "✅ Published" in admin panel
2. **Check Questions**: Quiz must have at least 1 question to be published
3. **Check User Role**: Make sure you're logged in as "student" not "admin"
4. **Refresh Page**: Try refreshing the dashboard page
5. **Check Network**: Look for errors in browser console (F12)

**If admin can't create quizzes:**
1. **Check Backend**: Make sure `npm start` is running in backend folder
2. **Check Database**: MongoDB must be connected
3. **Check Validation**: Title ≥3 chars, Description ≥10 chars
4. **Check Console**: Look for errors in browser console (F12)
