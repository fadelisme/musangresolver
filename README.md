# Musang Resolver

A modern web application that resolves redirect URLs and exports results to CSV format. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Paste & Process**: Simply paste URLs (one per line) into the textarea
- **Automatic Resolution**: Resolves all redirect URLs in parallel with a 5-second timeout per URL
- **Real-time Results**: View resolved URLs immediately in a formatted table
- **CSV Export**: Download results as a CSV file with original and resolved URLs
- **Clean UI**: Modern, responsive interface built with Tailwind CSS
- **Fast & Reliable**: Server-side processing avoids CORS issues

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.17+ and npm/yarn
- Git (for deployment)
- GitHub account (for Vercel deployment)

## Installation

### Local Setup

1. **Clone the repository** (or download the project folder)
   ```bash
   cd musangresolver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - You should see the Musang Resolver interface

## How to Use

1. **Paste URLs**: Copy and paste redirect URLs into the textarea (one URL per line)
   - Example format: `https://example.com/redirect?...`

2. **Click "Resolve URLs"**: The app will process all URLs and resolve redirects

3. **View Results**: See the resolved URLs in the results table (first 10 shown)

4. **Download CSV**: Click the "Download CSV" button to export all results

5. **Clear**: Use the "Clear" button to reset and start over

## Deployment on Vercel

Vercel is the recommended platform for deploying this Next.js application. It's free, easy, and handles both frontend and API routes automatically.

### Step-by-Step Deployment

#### 1. Prepare Your Code for GitHub

```bash
# Initialize Git repository (if not already done)
git init

# Create a .gitignore file (already included in the project)
# It excludes node_modules, .next, .env files, etc.

# Add all files to Git
git add .

# Create an initial commit
git commit -m "Initial commit: Musang Resolver app"
```

#### 2. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right corner → "New repository"
3. Name it: `musangresolver`
4. Choose "Private" or "Public"
5. Click "Create repository"

#### 3. Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/musangresolver.git
git branch -M main
git push -u origin main
```

(Replace `YOUR_USERNAME` with your actual GitHub username)

#### 4. Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended for Beginners)**

1. Go to [Vercel](https://vercel.com) and sign up/log in with your GitHub account
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Find and select your `musangresolver` repository
5. Click "Import"
6. Vercel will automatically detect the Next.js configuration
7. Click "Deploy"
8. Wait for the deployment to complete (usually 2-3 minutes)
9. You'll get a live URL like: `https://musangresolver-xyz.vercel.app`

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to Vercel
vercel

# Follow the prompts:
# - Log in with GitHub
# - Link to existing project or create new one
# - Press Enter to accept defaults
# - Wait for deployment to complete
```

### After Deployment

1. **Test Your Live Site**: Visit the URL provided by Vercel
2. **Share the URL**: Give this URL to anyone who needs to use the app
3. **Updates**: Any commits pushed to the `main` branch will automatically redeploy

## Project Structure

```
musangresolver/
├── app/
│   ├── api/
│   │   └── resolve/
│   │       └── route.ts          # Backend API endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main UI component
│   └── globals.css               # Global styles
├── public/                       # Static assets (optional)
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind CSS config
├── next.config.js               # Next.js config
├── postcss.config.js            # PostCSS config
└── .gitignore                   # Git ignore rules
```

## API Endpoint

### POST /api/resolve

Resolves redirect URLs.

**Request:**
```json
{
  "urls": [
    "https://example.com/redirect1",
    "https://example.com/redirect2"
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "original": "https://example.com/redirect1",
      "resolved": "https://example.com/article"
    }
  ]
}
```

**Error Handling:**
- Returns `400` for invalid input (empty or non-array URLs)
- Returns `500` for server errors
- Individual URL failures are marked as `FAILED TO RESOLVE: [URL]`

## Troubleshooting

### Issue: "npm command not found"
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org)

### Issue: Build fails locally
```bash
# Try clearing cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Issue: Deployment fails on Vercel
1. Check the deployment logs in Vercel dashboard
2. Make sure all files were pushed to GitHub
3. Verify the `.gitignore` doesn't exclude necessary files
4. Try redeploying from the Vercel dashboard

### Issue: URLs not resolving
- Check that the URLs are valid redirect links
- Some URLs might fail if the redirect target no longer exists
- The app has a 5-second timeout per URL

## Environment Variables

Currently, no environment variables are required. The app works out of the box.

If you want to add features like rate limiting in the future, you can add:
- `.env.local` for local development
- Environment variables in Vercel dashboard for production

## Performance Notes

- Parallel processing: All URLs are processed simultaneously for speed
- 5-second timeout: Prevents hanging on unresponsive servers
- Results cached in UI state: No server-side storage

## Future Enhancements

Possible improvements:
- Progress bar during URL resolution
- Batch processing for very large URL lists
- History of previous resolutions
- Custom timeout settings
- Rate limiting to prevent abuse
- Authentication for shared deployments

## License

Free to use for personal and commercial projects.

## Support

If you encounter issues:
1. Check the browser console (F12 → Console tab)
2. Check Vercel deployment logs
3. Verify your Brand24 URLs are valid
4. Test with a small batch of URLs first

## Next Steps After Deployment

1. **Share the URL**: Give the live Vercel URL to anyone who needs it
2. **Use Regularly**: Bookmark the link for quick access
3. **Update Code**: Any code changes pushed to GitHub automatically redeploy
4. **Custom Domain** (Optional): Add your own domain in Vercel settings

---

**Happy resolving! 🚀**
