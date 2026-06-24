import { pingRedis, getRedisClient } from '../lib/redis.js';

async function main() {
  const connected = await pingRedis();
  if (!connected) {
    throw new Error('Redis ping failed');
  }

  const client = await getRedisClient();
  const info = await client.info('server');
  const version = info.match(/redis_version:(.+)/)?.[1]?.trim();

  console.log('Redis connection OK');
  const url = process.env.REDIS_URL ?? '';
  const safeUrl = url.replace(/:([^:@/]+)@/, ':***@');
  console.log(`URL: ${safeUrl}`);
  if (version) {
    console.log(`Version: ${version}`);
  }
}

main().catch((error) => {
  console.error('Redis connection failed:', error.message);
  process.exit(1);
});
