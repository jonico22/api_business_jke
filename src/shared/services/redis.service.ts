// src/shared/services/redis.service.ts
import { createClient, RedisClientType } from 'redis';

// 1. Configuración de variables de entorno (más limpio)
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Usamos un tipo para el cliente y la promesa de conexión
let client: RedisClientType | undefined;
let isReady = false;

// 2. Función de Inicialización Asíncrona
export async function initializeRedis() {
  if (!REDIS_ENABLED) {
    console.log('[Redis] Servicio deshabilitado por configuración.');
    return;
  }

  try {
    client = createClient({ url: REDIS_URL });

    // Manejo de errores en tiempo de ejecución
    client.on('error', (err) => {
      console.error('🚨 Redis error:', err);
    });

    // 💡 Conectar y esperar a que esté listo
    await client.connect();
    isReady = true;
    console.log(`✅ [Redis] Conectado correctamente a ${REDIS_URL}`);
  } catch (err) {
    console.error(`❌ [Redis] Error de conexión a ${REDIS_URL}:`, err);
    // Si falla la conexión, deshabilitamos el servicio para evitar fallos futuros
    client = undefined;
    isReady = false;
  }
}

// 3. Objeto de Interfaz pública con seguridad de conexión
export const redis = {
  enabled: REDIS_ENABLED,
  isReady: () => isReady,

  async get<T>(key: string): Promise<T | string | null> {
    if (!REDIS_ENABLED || !client || !isReady) return null;
    
    const value = await client.get(key);
    if (value === null) return null;

    // 💡 Deserializar de vuelta a un objeto
    try {
      // Intentar parsear el JSON; si falla, devolvemos la cadena original.
      return JSON.parse(value) as T;
    } catch (e) {
      console.warn(`[Redis] Fallo al deserializar JSON para la clave: ${key}`);
      return value; // Devuelve la cadena si no es JSON válido
    }
  },

  async set(key: string, value: any, ttl = 60): Promise<void> {
    if (!REDIS_ENABLED || !client || !isReady) return;
    
    // Serializar el valor a JSON
    let serializedValue: string;
    if (typeof value === 'object' && value !== null) {
      serializedValue = JSON.stringify(value);
    } else {
      serializedValue = String(value);
    }
    
    await client.set(key, serializedValue, { EX: ttl });
  },

  async del(key: string): Promise<void> {
    if (!REDIS_ENABLED || !client || !isReady) return;
    await client.del(key);
  },

  // 💡 Implementación de SCAN para evitar bloqueo de la instancia de Redis
  async deleteKeysByPrefix(prefix: string): Promise<void> {
    if (!REDIS_ENABLED || !client || !isReady) return;
    
    let cursor = 0;
    let keysToDelete: string[] = [];

    do {
      // Usamos SCAN en lugar de KEYS
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
  }
};