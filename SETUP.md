# EMI Tracker Setup Guide

This project uses **Redis as the only database**. All data is stored exclusively in Redis - no JSON files are used.

## Database Setup

### Prerequisites
- Node.js installed
- Redis instance running (local or remote)
- Redis URL available as an environment variable

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
REDIS_URL=redis://your-redis-connection-url
LOANS_PASSWORD=372237
FRIENDS_PASSWORD=372237
OFFICE_PASSWORD=372237
```

### Initialize Redis Database

Before running the application for the first time, initialize the Redis database with sample data:

```bash
# Initialize loans data
node init-loans.js

# Initialize friends debts data
node init-friends.js

# Initialize office debts data
node init-office.js
```

These scripts will encrypt and store the initial data in Redis.

### Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Architecture

- **Database**: Redis (encrypted data)
- **API Endpoints**: `/pages/api/loans.js`, `/pages/api/friends.js`, `/pages/api/office.js`
- **Data Flow**: Browser → Next.js API Routes → Redis
- **Encryption**: All data is encrypted with the specified passwords before storage

## Data Structure

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

### Office Debts & Friends Debts
```json
{
  "Name": "Person Name",
  "Amt": 500000.0,
  "Paid": 0,
  "Desc": "Description"
}
```

## Modifying Data

All data modifications are made through the web interface and automatically synced to Redis. No manual JSON file edits are needed.
