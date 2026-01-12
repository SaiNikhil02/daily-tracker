# GitHub Pages Deployment Guide

Follow these steps to deploy your Daily Schedule Tracker to GitHub Pages:

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `daily-tracker` (or any name you prefer)
4. Description: "Daily Schedule Tracker - Track your daily tasks and productivity"
5. Choose **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 2: Initialize Git and Push to GitHub

Open Terminal in your project folder (`/Users/sainikhilsainikhil/Desktop/Daily_tracker`) and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Daily Schedule Tracker"

# Rename branch to main (if needed)
git branch -M main

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/daily-tracker.git

# Push to GitHub
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username and `daily-tracker` with your repository name.

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **"Source"**, select:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

## Step 4: Access Your Live Site

GitHub will provide you with a URL like:
```
https://YOUR_USERNAME.github.io/daily-tracker/
```

**Note:** It may take 1-2 minutes for the site to be available after enabling Pages.

## Step 5: Update Your Site (Future Updates)

Whenever you make changes:

```bash
# Add changed files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

GitHub Pages will automatically update your site within 1-2 minutes.

## Troubleshooting

### If you get authentication errors:
- Use GitHub Personal Access Token instead of password
- Or use GitHub Desktop app for easier authentication

### If the site shows 404:
- Make sure the repository is **Public**
- Wait 1-2 minutes after enabling Pages
- Check that `index.html` is in the root folder

### If changes don't appear:
- Clear your browser cache
- Wait a few minutes for GitHub Pages to rebuild
- Check the repository's Actions tab for build status

## Your Site Structure

Your repository should have these files:
```
daily-tracker/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
└── (other documentation files)
```

That's it! Your Daily Schedule Tracker is now live on GitHub Pages! 🎉
