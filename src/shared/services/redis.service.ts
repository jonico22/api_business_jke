// src/shared/services/redis.service.ts
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client: RedisClientType | undefined;

if (REDIS_ENABLED) {
  client = createClient({ url: REDIS_URL });

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  client.connect().then(() => {
    console.log('[Redis] Conectado correctamente');
  }).catch((err) => {
    console.error('[Redis] Error de conexión', err);
  });
}

export const redis = {
  enabled: REDIS_ENABLED,
  async get(key: string) {
    if (!REDIS_ENABLED || !client) return null;
    return await client.get(key);
  },
  async set(key: string, value: any, ttl = 60) {
    if (!REDIS_ENABLED || !client) return;
    await client.set(key, JSON.stringify(value), { EX: ttl });
  },
  async del(key: string) {
    if (!REDIS_ENABLED || !client) return;
    await client.del(key);
  },
  async deleteKeysByPrefix(prefix: string) {
    if (!REDIS_ENABLED || !client) return;
    const keys = await client.keys(`${prefix}*`);
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
};
