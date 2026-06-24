import crypto from 'crypto';
import { readEncryptedCollection, writeEncryptedCollection } from '../../../lib/encryptedStore.js';
import { REDIS_KEYS } from '../../../lib/keys.js';

function codesMatch(provided, expected) {
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { password } = req.query;
  const { resetCode } = req.body || {};
  const expectedCode = process.env.EMI_RESET_CODE;

  if (!expectedCode) {
    return res.status(503).json({ error: 'Reset is not configured on the server.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!resetCode || typeof resetCode !== 'string') {
    return res.status(400).json({ error: 'Reset code is required' });
  }
  if (!codesMatch(resetCode, expectedCode)) {
    return res.status(403).json({ error: 'Incorrect reset code.' });
  }

  try {
    const loans = await readEncryptedCollection(REDIS_KEYS.loans, password);
    const resetLoans = loans.map((loan) => ({ ...loan, paid: 0 }));
    await writeEncryptedCollection(REDIS_KEYS.loans, password, resetLoans);
    return res.status(200).json(resetLoans);
  } catch {
    return res.status(401).json({
      error: 'Failed to reset loans. Invalid password or corrupted data.',
    });
  }
}
