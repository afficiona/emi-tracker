import fs from 'fs';
import path from 'path';
import { encryptData, decryptData } from '../../utils/encryption.js';

const loansFilePath = path.join(process.cwd(), 'all_loans.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { password } = req.query;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const encryptedData = fs.readFileSync(loansFilePath, 'utf8');
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
      fs.writeFileSync(loansFilePath, encryptedData);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update loans.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
