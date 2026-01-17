import dotenv from 'dotenv';
import { encryptData } from './utils/encryption.js';
import { createClient } from 'redis';

dotenv.config({ path: '.env.local' });

const sampleOfficeData = [
  {
    "Name":"Sirish",
    "Amt":955000.0,
    "Paid":0,
    "Desc":"Mid jan"
  },
  {
    "Name":"Sudheer",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"Sep"
  },
  {
    "Name":"Venu",
    "Amt":50000.0,
    "Paid":0,
    "Desc":"Nov"
  },
  {
    "Name":"Ameya",
    "Amt":50000.0,
    "Paid":0,
    "Desc":"June end"
  },
  {
    "Name":"Ankit D",
    "Amt":136000.0,
    "Paid":0,
    "Desc":null
  },
  {
    "Name":"Shreeya",
    "Amt":31000.0,
    "Paid":0,
    "Desc":"June end"
  },
  {
    "Name":"Guru",
    "Amt":150000.0,
    "Paid":0,
    "Desc":"Nov end"
  },
  {
    "Name":"Srinidhi",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"Mid Jan"
  },
  {
    "Name":"Animesh",
    "Amt":150000.0,
    "Paid":0,
    "Desc":"June End"
  },
  {
    "Name":"Prakash",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"Dec 15th"
  },
  {
    "Name":"Darshan",
    "Amt":75000.0,
    "Paid":0,
    "Desc":"Mid Jan"
  },
  {
    "Name":"Sirish",
    "Amt":420000.0,
    "Paid":0,
    "Desc":null
  },
  {
    "Name":"Simi",
    "Amt":50000.0,
    "Paid":0,
    "Desc":"Jan end"
  },
  {
    "Name":"Yashwanth",
    "Amt":10000.0,
    "Paid":0,
    "Desc":"Jan end"
  },
  {
    "Name":"Sandeep B",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"Jan end"
  },
  {
    "Name":"Durga",
    "Amt":30000.0,
    "Paid":0,
    "Desc":"Jan end"
  },
  {
    "Name":"Vasanth",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"Jan end"
  },
  {
    "Name":"Jagan",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"Jan end"
  },
  {
    "Name":"Gaurav Shelar",
    "Amt":100000.0,
    "Paid":0,
    "Desc":"Jan end"
  },
  {
    "Name":"Nitish",
    "Amt":70000.0,
    "Paid":0,
    "Desc":"Jan end"
  }
];

async function uploadOfficeData() {
  if (!process.env.REDIS_URL) {
    console.error('✗ Error: REDIS_URL environment variable not set');
    console.error('Please set REDIS_URL before running this script');
    process.exit(1);
  }

  const password = process.env.OFFICE_PASSWORD || '372237';
  const jsonString = JSON.stringify(sampleOfficeData, null, 2);
  const encryptedData = encryptData(jsonString, password);

  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis error:', err));
  
  await redisClient.connect();
  
  try {
    await redisClient.set('office_data', encryptedData);
    console.log('✓ Office data uploaded to Redis successfully!');
    console.log(`  - Password: ${password}`);
    console.log(`  - Records: ${sampleOfficeData.length}`);
  } catch (error) {
    console.error('✗ Failed to upload office data:', error);
    process.exit(1);
  } finally {
    await redisClient.disconnect();
  }
}

uploadOfficeData();
