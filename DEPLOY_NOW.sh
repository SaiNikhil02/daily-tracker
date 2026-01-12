#!/bin/bash

# Deployment script for SaiNikhil02
# Run this script to deploy Daily Tracker to GitHub Pages

echo "🚀 Deploying Daily Schedule Tracker to GitHub Pages"
echo "=================================================="
echo ""

# Navigate to project directory
cd /Users/sainikhilsainikhil/Desktop/Daily_tracker

# Initialize git if needed
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

# Set branch to main
git branch -M main

# Set remote (remove if exists, then add)
if git remote get-url origin &>/dev/null; then
    echo "Updating remote origin..."
    git remote set-url origin https://github.com/SaiNikhil02/daily-tracker.git
else
    echo "Adding remote origin..."
    git remote add origin https://github.com/SaiNikhil02/daily-tracker.git
fi

echo ""
echo "Ready to push! Make sure you've created the repository at:"
echo "https://github.com/SaiNikhil02/daily-tracker"
echo ""
read -p "Press Enter to push to GitHub (or Ctrl+C to cancel)..."

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/SaiNikhil02/daily-tracker/settings/pages"
echo "2. Under 'Source', select:"
echo "   - Branch: main"
echo "   - Folder: / (root)"
echo "3. Click Save"
echo ""
echo "Your site will be live at:"
echo "https://SaiNikhil02.github.io/daily-tracker/"
echo ""
