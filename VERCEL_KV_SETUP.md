# Vercel KV Setup Instructions

Your app now uses Vercel KV (Redis) to store encrypted loans data instead of the filesystem. This works on both localhost and Vercel.

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Vercel KV Database

**If hosting on Vercel:**
1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Choose "KV" (Redis)
5. Give it a name and select a region
6. Click "Create"

**For local development with Vercel KV:**
1. Install Vercel CLI: `npm install -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull`

This creates a `.env.local` file with your KV connection strings.

### 3. Environment Variables

Your `.env.local` should now contain:
```
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

These are automatically added by Vercel when you create the KV database.

### 4. Run Locally
```bash
npm run dev
```

Visit `http://localhost:3000` and enter your password: `372237`

### 5. Deploy to Vercel
```bash
git push
```

Vercel will automatically:
- Install dependencies
- Build your project
- Connect to your KV database
- Deploy your app

## How It Works

- **Encryption:** Your data is encrypted with your password before being stored
- **Storage:** Encrypted data is stored in Vercel KV (Redis database)
- **Decryption:** Password is required to decrypt and read your data
- **Persistence:** Data persists across deployments and page reloads

## Password

Keep your password safe: **372237**

## Troubleshooting

**Error: "Failed to read loans"**
- Check that KV database is created in Vercel
- Verify environment variables are set correctly
- Try pulling env again: `vercel env pull`

**Data not persisting**
- Ensure KV_URL, KV_REST_API_URL, and KV_REST_API_TOKEN are in `.env.local`
- Check Vercel dashboard > Storage > KV to see your data

**Localhost connection issues**
- Run `vercel env pull` to get latest env variables
- Restart your dev server: `npm run dev`
