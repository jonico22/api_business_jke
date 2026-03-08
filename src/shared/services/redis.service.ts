import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

// 1. Configuración de variables de entorno (más limpio)
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const getRedisHost = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname || 'localhost';
  } catch {
    return 'localhost';
  }
};

const redisHost = getRedisHost(redisUrl);
const useTls = redisUrl.startsWith('rediss');

// Configuración de reintentos y timeouts para Docker
const socketConfig = useTls
  ? {
    connectTimeout: 10000,
    keepAlive: 5000,

    // 3. Estrategia de reconexión robusta
    reconnectStrategy: (retries: number) => {
      const delay = Math.min(retries * 100, 3000);
      logger.warn(`⚠️ Redis: Intentando reconectar en ${delay}ms... (Intento ${retries})`);
      return delay;
    },
    tls: true as const,
    host: redisHost,
    rejectUnauthorized: false
  }
  : {
    connectTimeout: 10000,
    reconnectStrategy: (retries: number) => Math.min(retries * 50, 2000),
    tls: false as const,
    host: redisHost
  };

const client: RedisClientType = createClient({
  url: redisUrl,
  socket: socketConfig
});

// Estado interno
let isReady = false;

// Manejadores de eventos
client.on('connect', () => logger.info('⏳ Redis: Conectando...'));
client.on('ready', () => {
  isReady = true;
  logger.info('✅ Redis: Listo y conectado');
});
client.on('error', (err) => {
  // Si es un error de socket cerrado, es un warning, no un error crítico
  if (err.message.includes('Socket closed unexpectedly')) {
    logger.warn('ℹ️ Redis: Conexión cerrada por el servidor. Reconectando automáticamente...');
  } else {
    logger.error('❌ Redis: Error de cliente', err);
  }
});
client.on('end', () => {
  isReady = false;
  logger.warn('⚠️ Redis: Conexión cerrada');
});

/**
 * Inicializa la conexión. Se debe llamar en el arranque de la API.
 */
export const connectRedis = async () => {
  logger.info(`[Redis] Inicializando... ENABLED=${REDIS_ENABLED}, URL=${redisUrl.replace(/:[^:]*@/, ':****@')}`); // Ocultar contraseña
  if (!REDIS_ENABLED) {
    logger.warn('[Redis] Deshabilitado por configuración (REDIS_ENABLED != true)');
    return;
  }
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (error) {
    logger.error('❌ Redis: Error fatal en la conexión inicial:', error);
  }
};

/**
 * Interfaz de ayuda para la aplicación
 */
export const redis = {
  enabled: REDIS_ENABLED,

  /**
   * Verifica si Redis está operativo en este momento
   */
  get status() {
    return REDIS_ENABLED && isReady;
  },

  async ping(): Promise<boolean> {
    if (!this.status) return false;
    try {
      await client.ping();
      return true;
    } catch (error) {
      logger.error('[Redis] Ping failed:', error);
      return false;
    }
  },

  async get<T>(key: string): Promise<T | null> {
    if (!this.status) return null;

    try {
      const rawValue = await client.get(key);
      if (typeof rawValue !== 'string') return null;

      try {
        return JSON.parse(rawValue) as T;
      } catch {
        return (rawValue as unknown) as T;
      }
    } catch (error) {
      logger.error(`[Redis] Error getting key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl = 60): Promise<void> {
    if (!this.status) return;

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await client.set(key, serialized, { EX: ttl });
    } catch (error) {
      logger.error(`[Redis] Error guardando clave ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    if (!this.status) return;
    await client.del(key);
  },

  async deleteKeysByPrefix(prefix: string): Promise<void> {
    if (!this.status) return;

    let cursor = 0;
    try {
      let keysToDelete: string[] = [];

      do {
        const scanResult = await client.scan(cursor.toString(), {
          MATCH: `${prefix}*`,
          COUNT: 100
        });

        keysToDelete = keysToDelete.concat(scanResult.keys);
        cursor = Number(scanResult.cursor);

      } while (cursor !== 0);

      if (keysToDelete.length > 0) {
        await client.del(keysToDelete);
        logger.info(`[Redis] Eliminadas ${keysToDelete.length} claves con prefijo '${prefix}' usando SCAN.`);
      }
    } catch (error) {
      logger.error(`[Redis] Error limpiando prefijo ${prefix}:`, error);
    }
  },

  /**
   * Genera una clave de caché determinista ordenando las propiedades del objeto
   */
  generateDeterministicKey(prefix: string, obj: any): string {
    const sortObject = (o: any): any => {
      if (o === null || typeof o !== 'object') return o;
      if (Array.isArray(o)) return o.map(sortObject);
      return Object.keys(o)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = sortObject(o[key]);
          return acc;
        }, {});
    };

    const sortedStr = JSON.stringify(sortObject(obj));
    return `${prefix}:${sortedStr}`;
  }
};

export default client;
