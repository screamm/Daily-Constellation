// src/services/cacheService.ts
import fs from 'fs';
import path from 'path';

// Typer för cache-struktur
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expires: number; // Expiration timestamp
  type: string;    // Cache item type
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  createdAt: Date;
}

// Standardinställningar för cache
const CACHE_DIRECTORY = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIRECTORY, 'nasa-api-cache.json');
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 timmar i millisekunder

// Anpassade TTL-värden beroende på typ av data
const TTL_SETTINGS = {
  today: 1 * 60 * 60 * 1000,        // 1 timme för dagens bild
  date: 30 * 24 * 60 * 60 * 1000,   // 30 dagar för historiska datum
  range: 7 * 24 * 60 * 60 * 1000,   // 7 dagar för datumintervall
  random: 4 * 60 * 60 * 1000,       // 4 timmar för slumpmässiga bilder
};

// Cache-objekt med data och statistik
class CacheService {
  private cache: Record<string, CacheItem<any>>;
  private stats: CacheStats;
  private persistInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.cache = {};
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      createdAt: new Date()
    };
    
    this.loadFromDisk();
    this.startPersistInterval();
    
    // Rensa utgången cache varje timme
    setInterval(() => this.cleanExpiredCache(), 60 * 60 * 1000);
  }
  
  /**
   * Starta intervallfunktion för att spara cache till disk
   */
  private startPersistInterval() {
    // Spara cache till disk var 5:e minut
    this.persistInterval = setInterval(() => {
      this.saveToDisk();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Hämta data från cache
   * @param key Unik nyckel för cachad data
   * @returns Cachad data eller null om ingen giltig cache finns
   */
  public get<T>(key: string): T | null {
    const item = this.cache[key];
    
    // Om ingen cache finns
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Kontrollera om cachen är för gammal
    const now = Date.now();
    if (now > item.expires) {
      delete this.cache[key];
      this.stats.misses++;
      this.stats.size = Object.keys(this.cache).length;
      return null;
    }
    
    // Giltigt cache-träff
    this.stats.hits++;
    return item.data;
  }
  
  /**
   * Spara data i cache
   * @param key Unik nyckel för data
   * @param data Data att spara
   * @param type Typ av data som avgör TTL (today, date, range, random)
   */
  public set<T>(key: string, data: T, type: string = 'default'): void {
    const ttl = TTL_SETTINGS[type as keyof typeof TTL_SETTINGS] || DEFAULT_TTL;
    const now = Date.now();
    
    this.cache[key] = {
      data,
      timestamp: now,
      expires: now + ttl,
      type
    };
    
    this.stats.size = Object.keys(this.cache).length;
    
    // Om cache börjar bli för stor (>1000 poster), städa
    if (this.stats.size > 1000) {
      this.pruneCache();
    }
  }
  
  /**
   * Kontrollera om en nyckel finns i cache och är giltig
   */
  public has(key: string): boolean {
    const item = this.cache[key];
    if (!item) return false;
    
    const now = Date.now();
    return now <= item.expires;
  }
  
  /**
   * Rensa cache för utgångna poster
   */
  public cleanExpiredCache(): void {
    const now = Date.now();
    let removed = 0;
    
    Object.keys(this.cache).forEach(key => {
      if (now > this.cache[key].expires) {
        delete this.cache[key];
        removed++;
      }
    });
    
    this.stats.size = Object.keys(this.cache).length;
    console.log(`Cache cleaned: ${removed} expired items removed. Current size: ${this.stats.size}`);
    
    // Spara uppdaterad cache till disk
    if (removed > 0) {
      this.saveToDisk();
    }
  }
  
  /**
   * Rensa hela eller delar av cachen
   * @param keyPrefix Valfritt prefix för att rensa specifika delar av cachen
   */
  public clear(keyPrefix?: string): void {
    let removed = 0;
    
    if (keyPrefix) {
      // Rensa bara matchande nycklar
      Object.keys(this.cache).forEach(key => {
        if (key.startsWith(keyPrefix)) {
          delete this.cache[key];
          removed++;
        }
      });
    } else {
      // Rensa hela cachen
      removed = Object.keys(this.cache).length;
      this.cache = {};
    }
    
    this.stats.size = Object.keys(this.cache).length;
    console.log(`Cache cleared: ${removed} items removed. ${keyPrefix ? `Prefix: ${keyPrefix}` : 'All cache'}`);
    
    // Spara uppdaterad cache till disk
    this.saveToDisk();
  }
  
  /**
   * Hämta cache statistik
   */
  public getStats(): CacheStats & { hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? `${(this.stats.hits / total * 100).toFixed(2)}%` : '0%';
    
    return {
      ...this.stats,
      hitRate
    };
  }
  
  /**
   * Spara cache till disk för persistens
   */
  private saveToDisk(): void {
    try {
      // Skapa cache-katalog om den inte finns
      if (!fs.existsSync(CACHE_DIRECTORY)) {
        fs.mkdirSync(CACHE_DIRECTORY, { recursive: true });
      }
      
      const data = {
        cache: this.cache,
        stats: this.stats,
        updatedAt: new Date()
      };
      
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
      console.log(`Cache saved to disk: ${Object.keys(this.cache).length} items`);
    } catch (error) {
      console.error('Error saving cache to disk:', error);
    }
  }
  
  /**
   * Ladda cache från disk
   */
  private loadFromDisk(): void {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        this.cache = data.cache || {};
        this.stats = data.stats || {
          hits: 0,
          misses: 0,
          size: Object.keys(this.cache).length,
          createdAt: new Date()
        };
        
        console.log(`Cache loaded from disk: ${Object.keys(this.cache).length} items`);
        
        // Rensa utgångna poster direkt efter laddning
        this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('Error loading cache from disk:', error);
      // Återställ till tomt cache-objekt vid fel
      this.cache = {};
      this.stats = {
        hits: 0,
        misses: 0,
        size: 0,
        createdAt: new Date()
      };
    }
  }
  
  /**
   * Beskär cache om det blir för stort genom att ta bort de äldsta posterna
   */
  private pruneCache(): void {
    const keys = Object.keys(this.cache);
    if (keys.length <= 1000) return;
    
    // Sortera nycklar efter timestamp (äldst först)
    const sortedKeys = keys.sort((a, b) => {
      return this.cache[a].timestamp - this.cache[b].timestamp;
    });
    
    // Ta bort de äldsta 20% av posterna
    const removeCount = Math.floor(sortedKeys.length * 0.2);
    for (let i = 0; i < removeCount; i++) {
      delete this.cache[sortedKeys[i]];
    }
    
    this.stats.size = Object.keys(this.cache).length;
    console.log(`Cache pruned: ${removeCount} oldest items removed. New size: ${this.stats.size}`);
  }
  
  /**
   * Avsluta caching-service, rensa intervaller och spara till disk
   */
  public shutdown(): void {
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
      this.persistInterval = null;
    }
    
    this.saveToDisk();
    console.log('Cache service shutdown complete');
  }
}

// Skapa en singleton-instans
const cacheService = new CacheService();

// Hantera avslutningssignaler för att spara cache vid stängning
process.on('SIGINT', () => {
  console.log('Saving cache before shutdown...');
  cacheService.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Saving cache before shutdown...');
  cacheService.shutdown();
  process.exit(0);
});

// Backport kompatibilitetsmetoder för att inte bryta befintlig kod
export const getFromCache = <T>(key: string): T | null => {
  return cacheService.get<T>(key);
};

export const saveToCache = <T>(key: string, data: T, type: string = 'default'): void => {
  cacheService.set<T>(key, data, type);
};

export const clearCache = (keyPrefix?: string): void => {
  cacheService.clear(keyPrefix);
};

// Exportera hela cache-tjänsten för avancerad användning
export default cacheService; 