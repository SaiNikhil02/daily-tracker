# Exact Commands for Deployment

Your GitHub username: **SaiNikhil02**

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `daily-tracker`
3. Description: "Daily Schedule Tracker - Track your daily tasks and productivity"
4. Make it **Public** ✅
5. **DO NOT** check "Add a README file"
6. Click **"Create repository"**

## Step 2: Run These Commands

Copy and paste these commands **one by one** into your terminal:

```bash
cd /Users/sainikhilsainikhil/Desktop/Daily_tracker

git init

git add .

git commit -m "Initial commit: Daily Schedule Tracker"

git branch -M main

git remote add origin https://github.com/SaiNikhil02/daily-tracker.git

git push -u origin main
```

**Note:** When prompted for credentials:
- Username: `SaiNikhil02`
- Password: Use a GitHub Personal Access Token (not your GitHub password)
  - Get token at: https://github.com/settings/tokens
  - Create token with `repo` permissions

## Step 3: Enable GitHub Pages

1. Go to: https://github.com/SaiNikhil02/daily-tracker/settings/pages
2. Under **"Source"**:
   - Branch: Select **`main`**
   - Folder: Select **`/ (root)`**
3. Click **"Save"**

## Step 4: Access Your Site

Your site will be live at:
**https://SaiNikhil02.github.io/daily-tracker/**

Wait 1-2 minutes for GitHub Pages to build and deploy.

---

## Quick Script Option

Or simply run:
```bash
cd /Users/sainikhilsainikhil/Desktop/Daily_tracker
./DEPLOY_NOW.sh
```

This script will handle everything automatically!
