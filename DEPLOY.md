# Quick Deployment Guide

## Option 1: GitHub Pages (Recommended - Free & Easy)

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/daily-tracker.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click Settings → Pages
   - Under "Source", select "main" branch and "/ (root)" folder
   - Click Save
   - Your site will be live at: `https://YOUR_USERNAME.github.io/daily-tracker/`

## Option 2: Netlify Drop (Easiest - No Git Required)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your entire `Daily_tracker` folder
3. Your site is live instantly!
4. You'll get a URL like: `https://random-name.netlify.app`

## Option 3: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. In your project folder, run: `vercel`
3. Follow the prompts
4. Your site is deployed!

## Option 4: Any Static Hosting

Upload these 3 files to any web hosting:
- `index.html`
- `style.css`
- `script.js`

That's it! The app works entirely client-side.

## Testing Locally

Before deploying, test locally:
1. Open `index.html` in your browser
2. Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```
3. Visit `http://localhost:8000`
