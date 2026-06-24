import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeEncryptedCollection } from '../lib/encryptedStore.js';
import { REDIS_KEYS, LEGACY_REDIS_KEYS } from '../lib/keys.js';
import { getRedisClient, pingRedis } from '../lib/redis.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_DIR = path.join(__dirname, '..', 'store');

const COLLECTIONS = [
  { name: 'loans', key: REDIS_KEYS.loans, file: 'loans.json', passwordEnv: 'LOANS_PASSWORD' },
  { name: 'lumpsum', key: REDIS_KEYS.lumpsum, file: 'lumpsum.json', passwordEnv: 'LUMPSUM_PASSWORD' },
  { name: 'cashflow', key: REDIS_KEYS.cashflow, file: 'cashflow.json', passwordEnv: 'CASHFLOW_PASSWORD' },
];

function getCollectionPassword(collection) {
  if (collection.name === 'lumpsum') {
    return getLumpsumPassword();
  }
  if (collection.name === 'cashflow') {
    return process.env.CASHFLOW_PASSWORD || process.env.LOANS_PASSWORD;
  }
  return process.env[collection.passwordEnv];
}

function loadJson(fileName) {
  const filePath = path.join(STORE_DIR, fileName);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function getLumpsumPassword() {
  return (
    process.env.LUMPSUM_PASSWORD ||
    process.env.FRIENDS_PASSWORD ||
    process.env.OFFICE_PASSWORD
  );
}

async function seed() {
  const connected = await pingRedis();
  if (!connected) {
    throw new Error('Could not connect to Redis. Is it running?');
  }

  for (const collection of COLLECTIONS) {
    const password = getCollectionPassword(collection);

    if (!password) {
      const envName =
        collection.name === 'lumpsum'
          ? 'LUMPSUM_PASSWORD'
          : collection.name === 'cashflow'
            ? 'CASHFLOW_PASSWORD'
            : collection.passwordEnv;
      throw new Error(`${envName} environment variable is not set`);
    }

    const data = loadJson(collection.file);
    await writeEncryptedCollection(collection.key, password, data);
    console.log(`Seeded ${collection.name}: ${data.length} records → ${collection.key}`);
  }

  const client = await getRedisClient();
  if (LEGACY_REDIS_KEYS.length > 0) {
    const removed = await client.del(LEGACY_REDIS_KEYS);
    if (removed > 0) {
      console.log(`Removed ${removed} legacy Redis key(s)`);
    }
  }

  console.log('Redis seed complete.');
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
