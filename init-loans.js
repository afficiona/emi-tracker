import dotenv from 'dotenv';
import { encryptData } from './utils/encryption.js';
import { createClient } from 'redis';

dotenv.config({ path: '.env.local' });

const sampleLoansData = [
  {
    "name": "Cred",
    "type": "Self",
    "total": 350000,
    "emi": 12065,
    "due_day": 5,
    "source": "hello",
    "paid": "12065"
  },
  {
    "name": "Fibe",
    "type": "Self",
    "total": 50000,
    "emi": 9077,
    "due_day": 4,
    "source": null,
    "paid": 9077
  },
  {
    "name": "Kreditbee",
    "type": "Self",
    "total": 500000,
    "emi": 19394,
    "due_day": 8,
    "source": null,
    "paid": null
  },
  {
    "name": "Navi",
    "type": "Self",
    "total": 434000,
    "emi": 19330,
    "due_day": 1,
    "source": null,
    "paid": 19330
  },
  {
    "name": "Bajaj",
    "type": "Self",
    "total": 700000,
    "emi": 8330,
    "due_day": 2,
    "source": null,
    "paid": 8330
  },
  {
    "name": "HDFC Home Loan",
    "type": "Self",
    "total": 10700000,
    "emi": 85000,
    "due_day": 5,
    "source": "HDFC",
    "paid": null
  },
  {
    "name": "ICICI",
    "type": "Self",
    "total": 2300000,
    "emi": 65000,
    "due_day": 10,
    "source": "HDFC",
    "paid": null
  },
  {
    "name": "ABFC",
    "type": "Self",
    "total": 2350000,
    "emi": 65560,
    "due_day": 5,
    "source": "HDFC",
    "paid": null
  },
  {
    "name": "Tata",
    "type": "Self",
    "total": 1330000,
    "emi": 41828,
    "due_day": 5,
    "source": "HDFC",
    "paid": null
  },
  {
    "name": "G-Cred",
    "type": "Friend",
    "total": 170000,
    "emi": 8513,
    "due_day": 2,
    "source": null,
    "paid": 8513
  },
  {
    "name": "G-Cred",
    "type": "Friend",
    "total": 499000,
    "emi": 17668,
    "due_day": 2,
    "source": null,
    "paid": 17668
  },
  {
    "name": "G-Paytm",
    "type": "Friend",
    "total": 320000,
    "emi": 12180,
    "due_day": 5,
    "source": null,
    "paid": 12180
  },
  {
    "name": "G-Kbee",
    "type": "Friend",
    "total": 212000,
    "emi": 14453,
    "due_day": 8,
    "source": null,
    "paid": null
  },
  {
    "name": "G-Axis",
    "type": "Friend",
    "total": 410000,
    "emi": 13595,
    "due_day": 10,
    "source": null,
    "paid": null
  },
  {
    "name": "G-Tneu",
    "type": "Friend",
    "total": 194303,
    "emi": 5052,
    "due_day": 7,
    "source": null,
    "paid": null
  },
  {
    "name": "G-Navi",
    "type": "Friend",
    "total": 220000,
    "emi": 8300,
    "due_day": 30,
    "source": null,
    "paid": 8300
  },
  {
    "name": "Sirish",
    "type": "Colleague",
    "total": 400000,
    "emi": 9311,
    "due_day": 5,
    "source": null,
    "paid": 9311
  },
  {
    "name": "Sirish",
    "type": "Colleague",
    "total": 680000,
    "emi": 16052,
    "due_day": 2,
    "source": null,
    "paid": 16052
  },
  {
    "name": "Sirish",
    "type": "Colleague",
    "total": 545000,
    "emi": 13260,
    "due_day": 1,
    "source": null,
    "paid": 13260
  },
  {
    "name": "Abi Tiwari",
    "type": "Friend",
    "total": 177000,
    "emi": 4632,
    "due_day": 5,
    "source": null,
    "paid": 4632
  },
  {
    "name": "Ankit D",
    "type": "Colleague",
    "total": 2350000,
    "emi": 43016,
    "due_day": 7,
    "source": null,
    "paid": null
  },
  {
    "name": "Ankit D",
    "type": "Colleague",
    "total": 1400000,
    "emi": 27225,
    "due_day": 2,
    "source": null,
    "paid": 27225
  },
  {
    "name": "Ankit D",
    "type": "Colleague",
    "total": 500000,
    "emi": 15030,
    "due_day": 7,
    "source": null,
    "paid": null
  },
  {
    "name": "Sruthi",
    "type": "Colleague",
    "total": 1000000,
    "emi": 21950,
    "due_day": 7,
    "source": null,
    "paid": null
  },
  {
    "name": "Pal",
    "type": "Friend",
    "total": 1500000,
    "emi": 27045,
    "due_day": 24,
    "source": null,
    "paid": 27045
  },
  {
    "name": "Janani",
    "type": "Colleague",
    "total": 150000,
    "emi": 12000,
    "due_day": 4,
    "source": null,
    "paid": 12000
  },
  {
    "name": "Janani",
    "type": "Colleague",
    "total": 300000,
    "emi": 16011,
    "due_day": 5,
    "source": null,
    "paid": 16011
  },
  {
    "name": "Yash",
    "type": "Colleague",
    "total": 1900000,
    "emi": 30529,
    "due_day": 2,
    "source": null,
    "paid": 30529
  },
  {
    "name": "Yash",
    "type": "Colleague",
    "total": 2000000,
    "emi": 43535,
    "due_day": 5,
    "source": null,
    "paid": 43535
  },
  {
    "name": "Chaubey PL",
    "type": "Friend",
    "total": 1600000,
    "emi": 34000,
    "due_day": 5,
    "source": null,
    "paid": 34000
  },
  {
    "name": "Chaubey Nik",
    "type": "Friend",
    "total": 1200000,
    "emi": 24000,
    "due_day": 25,
    "source": null,
    "paid": 24000
  },
  {
    "name": "Gold",
    "type": "Self",
    "total": 1000000,
    "emi": 9750,
    "due_day": 30,
    "source": "ICICI",
    "paid": 9750
  },
  {
    "name": "Titu",
    "type": "Friend",
    "total": 300000,
    "emi": 6000,
    "due_day": 20,
    "source": null,
    "paid": 6000
  },
  {
    "name": "Papa",
    "type": "Friend",
    "total": 720000,
    "emi": 13500,
    "due_day": 2,
    "source": null,
    "paid": 13500
  },
  {
    "name": "Ujjwal",
    "type": "Friend",
    "total": 1000000,
    "emi": 13500,
    "due_day": 5,
    "source": null,
    "paid": 22183
  },
  {
    "name": "ICICI PL",
    "type": "Neha",
    "total": 1478000,
    "emi": 38000,
    "due_day": 5,
    "source": null,
    "paid": 38000
  },
  {
    "name": "Cred",
    "type": "Neha",
    "total": 230000,
    "emi": 6000,
    "due_day": 2,
    "source": null,
    "paid": 6000
  },
  {
    "name": "HDFC CC",
    "type": "Neha",
    "total": 140000,
    "emi": 14000,
    "due_day": 30,
    "source": null,
    "paid": 14000
  },
  {
    "name": "Navi",
    "type": "Neha",
    "total": 380000,
    "emi": 15000,
    "due_day": 1,
    "source": null,
    "paid": 15000
  },
  {
    "name": "ICICI 4001",
    "type": "Neha",
    "total": 310000,
    "emi": 11500,
    "due_day": 28,
    "source": null,
    "paid": 11500
  },
  {
    "name": "Paytm",
    "type": "Neha",
    "total": 380000,
    "emi": 15416,
    "due_day": 5,
    "source": null,
    "paid": 15416
  },
  {
    "name": "ICICI 6002",
    "type": "Neha",
    "total": null,
    "emi": 7500,
    "due_day": 12,
    "source": null,
    "paid": 7500
  },
  {
    "name": "ICICI 5007",
    "type": "Neha",
    "total": null,
    "emi": 20500,
    "due_day": 12,
    "source": null,
    "paid": null
  }
]

async function uploadLoansData() {
  if (!process.env.REDIS_URL) {
    console.error('✗ Error: REDIS_URL environment variable not set');
    console.error('Please set REDIS_URL before running this script');
    process.exit(1);
  }

  const password = process.env.LOANS_PASSWORD || '372237';
  const jsonString = JSON.stringify(sampleLoansData, null, 2);
  const encryptedData = encryptData(jsonString, password);

  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis error:', err));
  
  await redisClient.connect();
  
  try {
    await redisClient.set('loans_data', encryptedData);
    console.log('✓ Loans data uploaded to Redis successfully!');
    console.log(`  - Password: ${password}`);
    console.log(`  - Records: ${sampleLoansData.length}`);
  } catch (error) {
    console.error('✗ Failed to upload loans data:', error);
    process.exit(1);
  } finally {
    await redisClient.disconnect();
  }
}

uploadLoansData();
