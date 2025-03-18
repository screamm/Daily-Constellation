// src/services/cacheService.ts

// Enkelt cache-objekt för att lagra NASA API-responser
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Cache för att spara API-responser
const cache: Record<string, CacheItem<any>> = {};

// Cache expire-tid i millisekunder (24 timmar)
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Hämta data från cache
 * @param key Unik nyckel för cachad data
 * @returns Cachad data eller null om ingen giltig cache finns
 */
export const getFromCache = <T>(key: string): T | null => {
  const item = cache[key];
  
  // Om ingen cache finns
  if (!item) {
    return null;
  }
  
  // Kontrollera om cachen är för gammal
  const now = Date.now();
  if (now - item.timestamp > CACHE_TTL) {
    delete cache[key];
    return null;
  }
  
  return item.data;
};

/**
 * Spara data i cache
 * @param key Unik nyckel för data
 * @param data Data att spara
 */
export const saveToCache = <T>(key: string, data: T): void => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

/**
 * Rensa hela eller delar av cachen
 * @param keyPrefix Valfritt prefix för att rensa specifika delar av cachen
 */
export const clearCache = (keyPrefix?: string): void => {
  if (keyPrefix) {
    // Rensa bara matchande nycklar
    Object.keys(cache).forEach(key => {
      if (key.startsWith(keyPrefix)) {
        delete cache[key];
      }
    });
  } else {
    // Rensa hela cachen
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  }
}; 