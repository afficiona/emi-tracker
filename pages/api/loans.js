import { kv } from '@vercel/kv';
import { encryptData, decryptData } from '../../utils/encryption.js';

const KV_KEY = 'loans_data';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { password } = req.query;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const encryptedData = await kv.get(KV_KEY);
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
      await kv.set(KV_KEY, encryptedData);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update loans.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
