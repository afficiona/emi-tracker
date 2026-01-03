import { encryptData, decryptData } from '../../utils/encryption.js';
import { createClient } from 'redis';

const KV_KEY = 'loans_data';

let redisClient = null;

async function initRedis() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
  }
  return redisClient;
}

async function getLoansData() {
  const client = await initRedis();
  return await client.get(KV_KEY);
}

async function setLoansData(encryptedData) {
  const client = await initRedis();
  await client.set(KV_KEY, encryptedData);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { password } = req.query;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const encryptedData = await getLoansData();
      if (!encryptedData) {
        return res.status(200).json([]);
      }
      const decryptedData = decryptData(encryptedData, password);
      const loans = JSON.parse(decryptedData);
      res.status(200).json(loans);
    } catch (error) {
      res.status(401).json({ error: 'Failed to read loans. Invalid password or corrupted data.' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { password } = req.query;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const updatedLoans = req.body;
      const jsonString = JSON.stringify(updatedLoans, null, 2);
      const encryptedData = encryptData(jsonString, password);
      await setLoansData(encryptedData);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update loans.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
