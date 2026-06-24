import { createEncryptedStoreHandler } from '../../lib/encryptedStore.js';
import { REDIS_KEYS } from '../../lib/keys.js';

export default createEncryptedStoreHandler({
  key: REDIS_KEYS.lumpsum,
  resourceName: 'lumpsum data',
});
