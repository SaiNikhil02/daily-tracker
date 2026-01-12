# Manual Deployment Commands

Run these commands **one by one** in your terminal:

## Step 1: Navigate to project folder
```bash
cd /Users/sainikhilsainikhil/Desktop/Daily_tracker
```

## Step 2: Initialize Git (if not already done)
```bash
git init
```

## Step 3: Add all files
```bash
git add .
```

## Step 4: Create initial commit
```bash
git commit -m "Initial commit: Daily Schedule Tracker"
```

## Step 5: Rename branch to main
```bash
git branch -M main
```

## Step 6: Add GitHub repository as remote
**Replace `YOUR_USERNAME` and `daily-tracker` with your actual values:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/daily-tracker.git
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/daily-tracker.git
```

## Step 7: Push to GitHub
```bash
git push -u origin main
```

**Note:** You may be prompted for GitHub credentials. Use a Personal Access Token if password authentication doesn't work.

## Step 8: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/daily-tracker`
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Branch: Select **main**
   - Folder: Select **/ (root)**
5. Click **Save**

## Step 9: Access Your Site

Your site will be live at:
```
https://YOUR_USERNAME.github.io/daily-tracker/
```

Wait 1-2 minutes for GitHub Pages to build and deploy your site.

---

## Troubleshooting

### If you get "remote origin already exists" error:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/daily-tracker.git
```

### If authentication fails:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Use the token as your password when pushing

### If you need to update your site later:
```bash
git add .
git commit -m "Update: description of changes"
git push
```
