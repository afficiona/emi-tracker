# EMI Tracker Setup Guide

This project uses **Redis as the only database**. All data is stored as encrypted blobs in Redis.

## Data model

Two collections:

| Collection | Redis key | Source file | Description |
|---|---|---|---|
| **Loans** | `loans_data` | `store/loans.json` | EMI loans |
| **Lumpsum** | `lumpsum_data` | `store/lumpsum.json` | Office + Friends debts combined |

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Redis URL and passwords

npm run db:ping
npm run db:seed
npm run dev
```

## Environment variables

```
REDIS_URL=redis://127.0.0.1:6379
LOANS_PASSWORD=your-loans-password
LUMPSUM_PASSWORD=your-lumpsum-password
```

| Variable | Purpose |
|---|---|
| `REDIS_URL` | Redis connection string |
| `LOANS_PASSWORD` | Encrypts/decrypts loans data |
| `LUMPSUM_PASSWORD` | Encrypts/decrypts lumpsum data |

`npm run db:seed` falls back to `FRIENDS_PASSWORD` or `OFFICE_PASSWORD` for lumpsum if `LUMPSUM_PASSWORD` is not set (legacy migration).

## NPM scripts

| Script | Description |
|---|---|
| `npm run redis:up` | Start local Redis via Docker Compose |
| `npm run redis:down` | Stop local Redis |
| `npm run db:ping` | Test Redis connectivity |
| `npm run db:seed` | Load `store/*.json` into Redis (encrypted) |
| `npm run dev` | Start Next.js dev server |

## Architecture

```
Browser → /api/loans, /api/lumpsum → lib/encryptedStore.js → lib/redis.js → Redis
```

## Data structures

### Loans
```json
{
  "name": "Loan Name",
  "type": "Self/Other",
  "total": 350000,
  "emi": 12065,
  "due_day": 5,
  "source": "source",
  "paid": 0
}
```

### Lumpsum
```json
{
  "name": "Person Name",
  "total": 500000,
  "paid": 0,
  "desc": "Description",
  "category": "Office"
}
```

`category` is `"Office"` or `"Friends"` to distinguish the original source.

## Vercel deployment

Set `REDIS_URL`, `LOANS_PASSWORD`, and `LUMPSUM_PASSWORD` in Vercel project environment variables, then redeploy.

Pull env vars locally:

```bash
npx vercel env pull .env.local
```

After first deploy or schema change, run `npm run db:seed` once to populate Redis.
