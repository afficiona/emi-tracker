import dotenv from 'dotenv';
import { encryptData } from './utils/encryption.js';
import { createClient } from 'redis';

dotenv.config({ path: '.env.local' });

const sampleFriendsData = [
    {
    "Name":"Bro",
    "Amt":500000.0,
    "Paid":0,
    "Desc":"Dec end"
  },
  {
    "Name":"Pratham",
    "Amt":130000.0,
    "Paid":0,
    "Desc":"Ins till April end"
  },
  {
    "Name":"Sandeep Mishra",
    "Amt":95000.0,
    "Paid":0,
    "Desc":"Dec 14th"
  },
  {
    "Name":"Gud CC",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"rolling"
  },
  {
    "Name":"Tarun",
    "Amt":125000.0,
    "Paid":0,
    "Desc":"July"
  },
  {
    "Name":"Neha",
    "Amt":200000.0,
    "Paid":0,
    "Desc":"rolling"
  },
  {
    "Name":"Pooja",
    "Amt":35000.0,
    "Paid":0,
    "Desc":"June end"
  },
  {
    "Name":"Shubhang",
    "Amt":200000.0,
    "Paid":0,
    "Desc":"Dec end"
  },
  {
    "Name":"Tushar",
    "Amt":200000.0,
    "Paid":0,
    "Desc":"Nov"
  },
  {
    "Name":"Shreeya",
    "Amt":31000.0,
    "Paid":0,
    "Desc":"June end"
  },
  {
    "Name":"Kunal S",
    "Amt":30000.0,
    "Paid":0,
    "Desc":null
  },
  {
    "Name":"Satya",
    "Amt":350000.0,
    "Paid":0,
    "Desc":"June end"
  },
  {
    "Name":"Ankur B",
    "Amt":50000.0,
    "Paid":0,
    "Desc":"Mid Jan"
  },
  {
    "Name":"Sravya",
    "Amt":200000.0,
    "Paid":0,
    "Desc":null
  },
  {
    "Name":"Rahul Bhaiya",
    "Amt":200000.0,
    "Paid":0,
    "Desc":"April Mid"
  },
  {
    "Name":"Col Sharma",
    "Amt":300000.0,
    "Paid":0,
    "Desc":"April Mid"
  }
];

async function uploadFriendsData() {
  if (!process.env.REDIS_URL) {
    console.error('✗ Error: REDIS_URL environment variable not set');
    console.error('Please set REDIS_URL before running this script');
    process.exit(1);
  }

  const password = process.env.FRIENDS_PASSWORD || '372237';
  const jsonString = JSON.stringify(sampleFriendsData, null, 2);
  const encryptedData = encryptData(jsonString, password);

  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis error:', err));
  
  await redisClient.connect();
  
  try {
    await redisClient.set('friends_data', encryptedData);
    console.log('✓ Friends data uploaded to Redis successfully!');
    console.log(`  - Password: ${password}`);
    console.log(`  - Records: ${sampleFriendsData.length}`);
  } catch (error) {
    console.error('✗ Failed to upload friends data:', error);
    process.exit(1);
  } finally {
    await redisClient.disconnect();
  }
}

uploadFriendsData();
