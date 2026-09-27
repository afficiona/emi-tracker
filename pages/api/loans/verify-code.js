import { codesMatch } from '../../../lib/accessCode.js';

// Checks the same code used by Reset; the EMI page uses it to unlock "Show all".
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { code } = req.body || {};
  const expectedCode = process.env.EMI_RESET_CODE;

  if (!expectedCode) {
    return res.status(503).json({ error: 'Access code is not configured on the server.' });
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }
  if (!codesMatch(code, expectedCode)) {
    return res.status(403).json({ error: 'Incorrect code.' });
  }

  return res.status(200).json({ success: true });
}
