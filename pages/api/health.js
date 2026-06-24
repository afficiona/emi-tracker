import { pingRedis, getValue } from '../../lib/redis.js';
import { REDIS_KEYS } from '../../lib/keys.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const connected = await pingRedis();

    const keys = Object.entries(REDIS_KEYS);
    const dataStatus = {};
    for (const [name, key] of keys) {
      const value = await getValue(key);
      dataStatus[name] = value ? 'populated' : 'empty';
    }

    return res.status(200).json({
      redis: connected ? 'connected' : 'disconnected',
      data: dataStatus,
    });
  } catch (error) {
    return res.status(503).json({
      redis: 'disconnected',
      error: error.message,
    });
  }
}
