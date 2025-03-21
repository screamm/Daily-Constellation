import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { format, subDays, parseISO } from 'date-fns';
import cacheService, { getFromCache, saveToCache } from '../services/cacheService';
import { 
  getDemoTodayPicture, 
  getDemoDatePicture, 
  getDemoRangePictures,
  getDemoRandomPicture 
} from '../services/demoService';

// Konstanter för NASA API
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_API_TIMEOUT = 10000; // 10 sekunder timeout

// Använd miljövariabeln för att avgöra om demodata ska användas
const USE_DEMO_DATA = process.env.USE_DEMO_DATA === 'true';
console.log('Controller: Demo-läge:', USE_DEMO_DATA);

// Hjälpfunktion för att hämta aktuell API-nyckel
const getApiKey = () => {
  const apiKey = process.env.NASA_API_KEY;
  return apiKey;
};

// Hjälpfunktion för att hantera API-fel
const handleApiError = (error: any, res: Response, context: string): Response => {
  console.error(`Error in ${context}:`, error.message);

  // Detaljerad loggning av fel
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('NASA API response status:', axiosError.response.status);
      console.error('NASA API response headers:', axiosError.response.headers);
      console.error('NASA API response data:', axiosError.response.data);
      
      const status = axiosError.response.status;
      const responseData = axiosError.response.data as any;
      
      // Hantera specifika HTTP-felkoder
      switch (status) {
        case 400:
          return res.status(400).json({ 
            error: 'Ogiltig förfrågan till NASA API. Kontrollera parametrarna och försök igen.',
            details: responseData?.error?.message || responseData?.msg
          });
        case 403:
          return res.status(503).json({ 
            error: `Problem med NASA API-nyckeln: ${
              responseData?.error?.message || 
              responseData?.msg || 
              'API-begränsning nådd eller ogiltig nyckel'
            }. Vänligen försök igen senare eller skaffa en egen API-nyckel på https://api.nasa.gov/.`
          });
        case 429:
          return res.status(503).json({ 
            error: 'För många förfrågningar till NASA API. Vänligen försök igen om en stund.'
          });
        case 500:
        case 502:
        case 503:
        case 504:
          return res.status(503).json({ 
            error: `NASA-tjänsten är för närvarande otillgänglig (${status}). Vänligen försök igen senare.`
          });
        default:
          break;
      }
    } else if (axiosError.request) {
      // Nätverksfel / timeout
      console.error('Network error:', axiosError.code);
      return res.status(503).json({ 
        error: `Kunde inte nå NASA API: ${axiosError.code === 'ECONNABORTED' ? 
          'Tidsgränsen för anslutningen överskreds.' : 
          'Nätverksfel vid anslutning till tjänsten.'}`
      });
    }
  }
  
  // Generellt fel
  return res.status(500).json({ 
    error: `Kunde inte hämta data från NASA API: ${error.message}` 
  });
};

/**
 * Hämta dagens astronomiska bild
 */
export const getToday = async (req: Request, res: Response) => {
  const API_KEY = getApiKey();
  console.log("Demo-läge aktiverat:", USE_DEMO_DATA);
  console.log("Använder API-nyckel:", API_KEY ? `${API_KEY.substring(0, 5)}...` : 'ingen nyckel');
  
  // Kontrollera om en API-nyckel finns tillgänglig
  if (!API_KEY) {
    console.error("NASA_API_KEY saknas i miljövariabler - kan inte göra API-anrop!");
    if (USE_DEMO_DATA) {
      console.log('Använder demodata istället på grund av saknad API-nyckel');
      const demoData = getDemoTodayPicture();
      return res.json(demoData);
    } else {
      return res.status(500).json({ 
        error: 'NASA API-nyckel saknas i konfigurationen. Vänligen lägg till en giltig API-nyckel i .env-filen.' 
      });
    }
  }
  
  // Om demo-läge är aktiverat, använd demodata direkt
  if (USE_DEMO_DATA) {
    console.log('Använder demodata för dagens astronomiska bild');
    const demoData = getDemoTodayPicture();
    return res.json(demoData);
  }

  // Skapa cache-nyckel för dagens datum
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cacheKey = `apod:today:${today}`;
  
  // Försök hämta från cache först
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log('Returnerar cachad data för dagens astronomiska bild');
    return res.json(cachedData);
  }
  
  try {
    console.log(`Anropar NASA API med URL: ${NASA_API_URL}?api_key=${API_KEY?.substr(0, 3)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { api_key: API_KEY },
      timeout: NASA_API_TIMEOUT
    });
    
    // Validera svarsdata
    if (!response.data || typeof response.data !== 'object') {
      return res.status(500).json({ 
        error: 'Ogiltig svarsdata från NASA API.' 
      });
    }
    
    // Spara i cache med specifik typ
    saveToCache(cacheKey, response.data, 'today');
    
    // Logga cache-statistik
    console.log('Cache statistik:', cacheService.getStats());
    
    return res.json(response.data);
  } catch (error: any) {
    return handleApiError(error, res, 'getToday');
  }
};

/**
 * Hämta astronomisk bild för ett specifikt datum
 */
export const getByDate = async (req: Request, res: Response) => {
  const { date } = req.params;
  const API_KEY = getApiKey();
  
  // Validera datum-format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Ogiltigt datumformat. Använd YYYY-MM-DD.' });
  }
  
  // Kontrollera om en API-nyckel finns tillgänglig
  if (!API_KEY) {
    console.error("NASA_API_KEY saknas i miljövariabler - kan inte göra API-anrop!");
    if (USE_DEMO_DATA) {
      console.log(`Använder demodata istället på grund av saknad API-nyckel för datum ${date}`);
      const demoData = getDemoDatePicture(date);
      return res.json(demoData);
    } else {
      return res.status(500).json({ 
        error: 'NASA API-nyckel saknas i konfigurationen. Vänligen lägg till en giltig API-nyckel i .env-filen.' 
      });
    }
  }
  
  // Om demo-läge är aktiverat, använd demodata direkt
  if (USE_DEMO_DATA) {
    console.log(`Använder demodata för astronomisk bild på datum ${date}`);
    const demoData = getDemoDatePicture(date);
    return res.json(demoData);
  }
  
  // Skapa cache-nyckel för det angivna datumet
  const cacheKey = `apod:date:${date}`;
  
  // Försök hämta från cache först
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log(`Returnerar cachad data för datum ${date}`);
    return res.json(cachedData);
  }
  
  try {
    console.log(`Anropar NASA API för datum ${date} med API-nyckel: ${API_KEY.substring(0, 5)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { 
        api_key: API_KEY,
        date: date
      },
      timeout: NASA_API_TIMEOUT
    });
    
    // Validera svarsdata
    if (!response.data || typeof response.data !== 'object') {
      return res.status(500).json({ 
        error: 'Ogiltig svarsdata från NASA API.' 
      });
    }
    
    // Spara i cache med specifik typ
    saveToCache(cacheKey, response.data, 'date');
    
    return res.json(response.data);
  } catch (error: any) {
    return handleApiError(error, res, `getByDate(${date})`);
  }
};

/**
 * Hämta astronomiska bilder för ett datumintervall
 */
export const getDateRange = async (req: Request, res: Response) => {
  const { start_date, end_date } = req.query;
  const API_KEY = getApiKey();
  
  // Validera datum-format (YYYY-MM-DD)
  if (!start_date || !end_date || 
      !/^\d{4}-\d{2}-\d{2}$/.test(start_date as string) || 
      !/^\d{4}-\d{2}-\d{2}$/.test(end_date as string)) {
    return res.status(400).json({ error: 'Ogiltigt datumformat. Använd YYYY-MM-DD.' });
  }
  
  // Validera datumintervall (max 30 dagar)
  const startDate = parseISO(start_date as string);
  const endDate = parseISO(end_date as string);
  
  const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays > 30) {
    return res.status(400).json({ 
      error: 'För stort datumintervall. Max 30 dagar mellan start- och slutdatum.' 
    });
  }
  
  if (diffInDays < 0) {
    return res.status(400).json({ 
      error: 'Startdatum måste vara före slutdatum.' 
    });
  }
  
  // Kontrollera om en API-nyckel finns tillgänglig
  if (!API_KEY) {
    console.error("NASA_API_KEY saknas i miljövariabler - kan inte göra API-anrop!");
    if (USE_DEMO_DATA) {
      console.log(`Använder demodata istället på grund av saknad API-nyckel för intervall ${start_date} till ${end_date}`);
      const demoData = getDemoRangePictures(start_date as string, end_date as string);
      return res.json(demoData);
    } else {
      return res.status(500).json({ 
        error: 'NASA API-nyckel saknas i konfigurationen. Vänligen lägg till en giltig API-nyckel i .env-filen.' 
      });
    }
  }
  
  // Om demo-läge är aktiverat, använd demodata direkt
  if (USE_DEMO_DATA) {
    console.log(`Använder demodata för datumintervall ${start_date} till ${end_date}`);
    const demoData = getDemoRangePictures(start_date as string, end_date as string);
    return res.json(demoData);
  }
  
  // Skapa cache-nyckel för datumintervallet
  const cacheKey = `apod:range:${start_date}-${end_date}`;
  
  // Försök hämta från cache först
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log(`Returnerar cachad data för datumintervall ${start_date} till ${end_date}`);
    return res.json(cachedData);
  }
  
  try {
    console.log(`Anropar NASA API för datumintervall med API-nyckel: ${API_KEY.substring(0, 5)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { 
        api_key: API_KEY,
        start_date: start_date,
        end_date: end_date
      },
      timeout: NASA_API_TIMEOUT
    });
    
    // Validera svarsdata
    if (!response.data || !Array.isArray(response.data)) {
      return res.status(500).json({ 
        error: 'Ogiltig svarsdata från NASA API, förväntade en array.' 
      });
    }
    
    // Sortera data efter datum (nyaste först)
    const sortedData = [...response.data].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Spara i cache med specifik typ
    saveToCache(cacheKey, sortedData, 'range');
    
    return res.json(sortedData);
  } catch (error: any) {
    return handleApiError(error, res, `getDateRange(${start_date} to ${end_date})`);
  }
};

/**
 * Slumpmässig astronomisk bild
 */
export const getRandom = async (req: Request, res: Response) => {
  const API_KEY = getApiKey();
  
  // Kontrollera om en API-nyckel finns tillgänglig
  if (!API_KEY) {
    console.error("NASA_API_KEY saknas i miljövariabler - kan inte göra API-anrop!");
    if (USE_DEMO_DATA) {
      console.log(`Använder demodata istället på grund av saknad API-nyckel för slumpmässig bild`);
      const demoData = getDemoRandomPicture();
      return res.json(demoData);
    } else {
      return res.status(500).json({ 
        error: 'NASA API-nyckel saknas i konfigurationen. Vänligen lägg till en giltig API-nyckel i .env-filen.' 
      });
    }
  }
  
  // Om demo-läge är aktiverat, använd demodata direkt
  if (USE_DEMO_DATA) {
    console.log('Använder demodata för slumpmässig astronomisk bild');
    const demoData = getDemoRandomPicture();
    return res.json(demoData);
  }
  
  try {
    // Generera ett slumpmässigt datum mellan 1995-06-16 (första APOD) och idag
    const startDate = new Date('1995-06-16');
    const today = new Date();
    const randomTime = startDate.getTime() + Math.random() * (today.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);
    const formattedDate = randomDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Skapa cache-nyckel för det slumpmässiga datumet
    const cacheKey = `apod:random:${formattedDate}`;
    
    // Försök hämta från cache först
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log(`Returnerar cachad data för slumpmässigt datum ${formattedDate}`);
      return res.json(cachedData);
    }
    
    console.log(`Anropar NASA API för slumpmässigt datum ${formattedDate} med API-nyckel: ${API_KEY.substring(0, 5)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { 
        api_key: API_KEY,
        date: formattedDate
      },
      timeout: NASA_API_TIMEOUT
    });
    
    // Validera svarsdata
    if (!response.data || typeof response.data !== 'object') {
      return res.status(500).json({ 
        error: 'Ogiltig svarsdata från NASA API.' 
      });
    }
    
    // Spara i cache med specifik typ
    saveToCache(cacheKey, response.data, 'random');
    
    return res.json(response.data);
  } catch (error: any) {
    return handleApiError(error, res, 'getRandom');
  }
};

/**
 * Rensa cache (administrationsfunktion)
 */
export const clearApiCache = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    if (type && typeof type === 'string') {
      // Rensa specifik typ av cache
      const prefix = `apod:${type}:`;
      cacheService.clear(prefix);
      return res.json({ 
        success: true, 
        message: `Cache rensad för typ: ${type}`,
        stats: cacheService.getStats()
      });
    } else {
      // Rensa all cache
      cacheService.clear();
      return res.json({ 
        success: true, 
        message: 'All cache rensad',
        stats: cacheService.getStats()
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: `Kunde inte rensa cache: ${error.message}` 
    });
  }
};

/**
 * Hämta cache-statistik (administrationsfunktion)
 */
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const stats = cacheService.getStats();
    return res.json({ 
      success: true,
      stats
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: `Kunde inte hämta cache-statistik: ${error.message}` 
    });
  }
}; 