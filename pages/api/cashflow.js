import crypto from 'crypto';
import { readEncryptedCollection, writeEncryptedCollection } from '../../lib/encryptedStore.js';
import { REDIS_KEYS } from '../../lib/keys.js';

export default async function handler(req, res) {
  const { password } = req.query;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (req.method === 'GET') {
    try {
      const data = await readEncryptedCollection(REDIS_KEYS.cashflow, password);
      return res.status(200).json(data);
    } catch {
      return res.status(401).json({
        error: 'Failed to read cash flow. Invalid password or corrupted data.',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const existing = await readEncryptedCollection(REDIS_KEYS.cashflow, password);
      const transaction = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...req.body,
      };
      await writeEncryptedCollection(REDIS_KEYS.cashflow, password, [...existing, transaction]);
      return res.status(201).json(transaction);
    } catch {
      return res.status(500).json({ error: 'Failed to save cash flow.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Transaction id is required' });
      }

      const existing = await readEncryptedCollection(REDIS_KEYS.cashflow, password);
      const filtered = existing.filter((entry) => entry.id !== id);
      if (filtered.length === existing.length) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      await writeEncryptedCollection(REDIS_KEYS.cashflow, password, filtered);
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: 'Failed to delete cash flow.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
