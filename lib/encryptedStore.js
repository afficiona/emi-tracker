import { encryptData, decryptData } from '../utils/encryption.js';
import { getValue, setValue } from './redis.js';

export async function readEncryptedCollection(key, password) {
  const encryptedData = await getValue(key);
  if (!encryptedData) {
    return [];
  }

  const decryptedData = decryptData(encryptedData, password);
  return JSON.parse(decryptedData);
}

export async function writeEncryptedCollection(key, password, data) {
  const jsonString = JSON.stringify(data, null, 2);
  const encryptedData = encryptData(jsonString, password);
  await setValue(key, encryptedData);
}

export function createEncryptedStoreHandler({ key, resourceName }) {
  return async function handler(req, res) {
    if (req.method === 'GET') {
      try {
        const { password: requestPassword } = req.query;

        if (!requestPassword) {
          return res.status(400).json({ error: 'Password is required' });
        }

        const data = await readEncryptedCollection(key, requestPassword);
        return res.status(200).json(data);
      } catch {
        return res.status(401).json({
          error: `Failed to read ${resourceName}. Invalid password or corrupted data.`,
        });
      }
    }

    if (req.method === 'PUT') {
      try {
        const { password: requestPassword } = req.query;

        if (!requestPassword) {
          return res.status(400).json({ error: 'Password is required' });
        }

        await writeEncryptedCollection(key, requestPassword, req.body);
        return res.status(200).json({ success: true });
      } catch {
        return res.status(500).json({ error: `Failed to update ${resourceName}.` });
      }
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  };
}
