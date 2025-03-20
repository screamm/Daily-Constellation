import { Request, Response } from 'express';
import axios from 'axios';
import { format, subDays, parseISO } from 'date-fns';
import { getFromCache, saveToCache } from '../services/cacheService';
import { 
  getDemoTodayPicture, 
  getDemoDatePicture, 
  getDemoRangePictures,
  getDemoRandomPicture 
} from '../services/demoService';

// Konstanter för NASA API
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Använd miljövariabeln för att avgöra om demodata ska användas
const USE_DEMO_DATA = process.env.USE_DEMO_DATA === 'true';
console.log('Controller: Demo-läge:', USE_DEMO_DATA);

// Hjälpfunktion för att hämta aktuell API-nyckel
const getApiKey = () => {
  const apiKey = process.env.NASA_API_KEY;
  return apiKey;
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
    return res.json(cachedData);
  }
  
  try {
    console.log(`Anropar NASA API med URL: ${NASA_API_URL}?api_key=${API_KEY?.substr(0, 3)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { api_key: API_KEY }
    });
    
    // Spara i cache
    saveToCache(cacheKey, response.data);
    
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching today\'s astronomy picture:', error.message);
    
    // Mer detaljerad logginformation för felsökning
    if (error.response) {
      console.error('NASA API svarstatus:', error.response.status);
      console.error('NASA API svarsdata:', error.response.data);
      
      if (error.response.status === 403) {
        // Kontrollera om det finns ett detaljerat felmeddelande från NASA API
        const errorMessage = error.response.data?.error?.message || 
                            error.response.data?.msg || 
                            'NASA API begränsning nådd eller ogiltig API-nyckel.';
        
        return res.status(503).json({ 
          error: `Problem med NASA API: ${errorMessage} Vänligen försök igen senare eller skaffa en egen API-nyckel på https://api.nasa.gov/.` 
        });
      }
      if (error.response.status === 429) {
        return res.status(503).json({ 
          error: 'För många förfrågningar till NASA API. Vänligen försök igen om en stund.' 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Kunde inte hämta dagens astronomiska bild från NASA API.' 
    });
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
    return res.json(cachedData);
  }
  
  try {
    console.log(`Anropar NASA API för datum ${date} med API-nyckel: ${API_KEY.substring(0, 5)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { 
        api_key: API_KEY,
        date: date
      }
    });
    
    // Spara i cache
    saveToCache(cacheKey, response.data);
    
    return res.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching astronomy picture for date ${date}:`, error.message);
    
    // Hantera specifika API-fel
    if (error.response) {
      if (error.response.status === 403) {
        return res.status(503).json({ 
          error: 'NASA API begränsning nådd. Tjänsten är tillfälligt otillgänglig. Vänligen försök igen senare eller skaffa en egen API-nyckel på https://api.nasa.gov/.' 
        });
      }
      if (error.response.status === 429) {
        return res.status(503).json({ 
          error: 'För många förfrågningar till NASA API. Vänligen försök igen om en stund.' 
        });
      }
      if (error.response.status === 400) {
        return res.status(400).json({ error: 'Ogiltigt datum eller utanför tillåtet intervall.' });
      }
    }
    
    return res.status(500).json({ 
      error: 'Kunde inte hämta astronomisk bild för det angivna datumet.' 
    });
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
    return res.json(cachedData);
  }
  
  try {
    console.log(`Anropar NASA API för datumintervall med API-nyckel: ${API_KEY.substring(0, 5)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { 
        api_key: API_KEY,
        start_date: start_date,
        end_date: end_date
      }
    });
    
    // Spara i cache
    saveToCache(cacheKey, response.data);
    
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching astronomy pictures for date range:', error.message);
    
    // Hantera specifika API-fel
    if (error.response) {
      if (error.response.status === 403) {
        return res.status(503).json({ 
          error: 'NASA API begränsning nådd. Tjänsten är tillfälligt otillgänglig. Vänligen försök igen senare eller skaffa en egen API-nyckel på https://api.nasa.gov/.' 
        });
      }
      if (error.response.status === 429) {
        return res.status(503).json({ 
          error: 'För många förfrågningar till NASA API. Vänligen försök igen om en stund.' 
        });
      }
      if (error.response.status === 400) {
        return res.status(400).json({ error: 'Ogiltigt datumintervall.' });
      }
    }
    
    return res.status(500).json({ 
      error: 'Kunde inte hämta astronomiska bilder för det angivna datumintervallet.' 
    });
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
    // Generera ett slumpmässigt datum mellan första APOD (1995-06-16) och idag
    const today = new Date();
    const startDate = new Date('1995-06-16');
    const randomDate = new Date(
      startDate.getTime() + Math.random() * (today.getTime() - startDate.getTime())
    );
    
    const formattedDate = format(randomDate, 'yyyy-MM-dd');
    
    console.log(`Anropar NASA API för slumpmässigt datum ${formattedDate} med API-nyckel: ${API_KEY.substring(0, 5)}...`);
    const response = await axios.get(NASA_API_URL, {
      params: { 
        api_key: API_KEY,
        date: formattedDate
      }
    });
    
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching random astronomy picture:', error.message);
    
    // Hantera specifika API-fel
    if (error.response) {
      if (error.response.status === 403) {
        return res.status(503).json({ 
          error: 'NASA API begränsning nådd. Tjänsten är tillfälligt otillgänglig. Vänligen försök igen senare eller skaffa en egen API-nyckel på https://api.nasa.gov/.' 
        });
      }
      if (error.response.status === 429) {
        return res.status(503).json({ 
          error: 'För många förfrågningar till NASA API. Vänligen försök igen om en stund.' 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Kunde inte hämta en slumpmässig astronomisk bild.' 
    });
  }
}; 