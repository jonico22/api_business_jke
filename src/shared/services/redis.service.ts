import { createClient, RedisClientType } from 'redis';

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

// Configuración de reintentos y timeouts para Docker
const client: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      // Reintento exponencial: 50ms, 100ms... hasta 2 segundos
      return Math.min(retries * 50, 2000);
    }
  }
});

// Estado interno
let isReady = false;

// Manejadores de eventos
client.on('connect', () => console.log('⏳ Redis: Conectando...'));
client.on('ready', () => {
  isReady = true;
  console.log('✅ Redis: Listo y conectado');
});
client.on('error', (err) => {
  isReady = false;
  console.error('❌ Redis: Error de cliente', err);
});
client.on('end', () => {
  isReady = false;
  console.warn('⚠️ Redis: Conexión cerrada');
});

/**
 * Inicializa la conexión. Se debe llamar en el arranque de la API.
 */
export const connectRedis = async () => {
  if (!REDIS_ENABLED) return;
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (error) {
    console.error('❌ Redis: Error fatal en la conexión inicial:', error);
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

  async get<T>(key: string): Promise<T | null> {
    if (!this.status) return null;

    try {
      const value = await client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (e) {
      // Si no es JSON, devolvemos el valor crudo como T (fallback)
      const value = await client.get(key);
      return value as unknown as T;
    }
  },

  async set(key: string, value: any, ttl = 60): Promise<void> {
    if (!this.status) return;

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await client.set(key, serialized, { EX: ttl });
    } catch (error) {
      console.error(`[Redis] Error guardando clave ${key}:`, error);
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
        cursor = parseInt(scanResult.cursor, 10);

      } while (cursor !== 0);

      if (keysToDelete.length > 0) {
        await client.del(keysToDelete);
        console.log(`[Redis] Eliminadas ${keysToDelete.length} claves con prefijo '${prefix}' usando SCAN.`);
      }
    } catch (error) {
      console.error(`[Redis] Error limpiando prefijo ${prefix}:`, error);
    }
  }
};

export default client;