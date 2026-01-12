#!/bin/bash

# Quick GitHub Pages Deployment Script
# Run this script after creating your GitHub repository

echo "🚀 Daily Schedule Tracker - GitHub Pages Deployment"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files..."
git add .

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "Creating commit..."
    git commit -m "Deploy Daily Schedule Tracker to GitHub Pages"
else
    echo "No changes to commit."
fi

# Get repository URL from user
echo ""
echo "Enter your GitHub repository URL:"
echo "Example: https://github.com/YOUR_USERNAME/daily-tracker.git"
read -r REPO_URL

# Add remote if it doesn't exist
if git remote get-url origin &>/dev/null; then
    echo "Updating remote origin..."
    git remote set-url origin "$REPO_URL"
else
    echo "Adding remote origin..."
    git remote add origin "$REPO_URL"
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to your repository on GitHub"
echo "2. Click Settings → Pages"
echo "3. Select 'main' branch and '/ (root)' folder"
echo "4. Click Save"
echo ""
echo "Your site will be live at: https://YOUR_USERNAME.github.io/daily-tracker/"
echo ""
