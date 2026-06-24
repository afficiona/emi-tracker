import { createClient } from 'redis';

const globalForRedis = globalThis;

function getRedisUrl() {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  return url;
}

export async function getRedisClient() {
  if (globalForRedis.redisClient?.isOpen) {
    return globalForRedis.redisClient;
  }

  const client = createClient({
    url: getRedisUrl(),
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries >= 3) {
          return new Error('Redis connection failed after 3 retries');
        }
        return Math.min(retries * 200, 1000);
      },
    },
  });

  client.on('error', (err) => {
    console.error('Redis client error:', err.message);
  });

  await client.connect();
  globalForRedis.redisClient = client;
  return client;
}

export async function pingRedis() {
  const client = await getRedisClient();
  const response = await client.ping();
  return response === 'PONG';
}

export async function getValue(key) {
  const client = await getRedisClient();
  return client.get(key);
}

export async function setValue(key, value) {
  const client = await getRedisClient();
  await client.set(key, value);
}
