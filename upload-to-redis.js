import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = path.join(__dirname, 'all_loans.json');
const KV_KEY = 'loans_data';

async function uploadToRedis() {
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL environment variable not set');
    process.exit(1);
  }

  const client = createClient({ url: process.env.REDIS_URL });
  
  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  try {
    console.log('🔗 Connecting to Redis...');
    await client.connect();
    console.log('✅ Connected to Redis');

    if (!fs.existsSync(DATA_FILE)) {
      console.error(`❌ File not found: ${DATA_FILE}`);
      process.exit(1);
    }

    const encryptedData = fs.readFileSync(DATA_FILE, 'utf-8');
    console.log(`📄 Read encrypted data from ${DATA_FILE}`);
    console.log(`   Data size: ${encryptedData.length} characters`);

    console.log(`🚀 Uploading to Redis with key: "${KV_KEY}"...`);
    await client.set(KV_KEY, encryptedData);
    console.log('✅ Data successfully uploaded to Redis!');

    // Verify by reading it back
    console.log('\n🔍 Verifying upload...');
    const stored = await client.get(KV_KEY);
    if (stored && stored.length === encryptedData.length) {
      console.log('✅ Verification successful - data matches!');
    } else {
      console.error('❌ Verification failed - data mismatch');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.quit();
    console.log('\n✅ Done!');
  }
}

uploadToRedis();
