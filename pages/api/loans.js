import fs from 'fs';
import path from 'path';

const loansFilePath = path.join(process.cwd(), 'all_loans.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(loansFilePath, 'utf8');
      const loans = JSON.parse(data);
      res.status(200).json(loans);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read loans.' });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedLoans = req.body;
      fs.writeFileSync(loansFilePath, JSON.stringify(updatedLoans, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update loans.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
