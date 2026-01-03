import { kv } from '@vercel/kv';
import { encryptData, decryptData } from '../../utils/encryption.js';
import fs from 'fs';
import path from 'path';

const KV_KEY = 'loans_data';
const DATA_FILE = path.join(process.cwd(), 'all_loans.json');
const USE_FILE_FALLBACK = !process.env.KV_REST_API_TOKEN;

async function getLoansData() {
  if (USE_FILE_FALLBACK) {
    // Local development - use file storage
    if (fs.existsSync(DATA_FILE)) {
      return fs.readFileSync(DATA_FILE, 'utf-8');
    }
    return null;
  } else {
    // Production - use Vercel KV
    return await kv.get(KV_KEY);
  }
}

async function setLoansData(encryptedData) {
  if (USE_FILE_FALLBACK) {
    // Local development - use file storage
    fs.writeFileSync(DATA_FILE, encryptedData);
  } else {
    // Production - use Vercel KV
    await kv.set(KV_KEY, encryptedData);
  }
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
