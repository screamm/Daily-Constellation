// src/controllers/constellationController.ts
import { Request, Response } from 'express';
import { 
  getTodaysAstronomyPicture, 
  getAstronomyPictureByDate,
  getAstronomyPicturesForRange
} from '../services/constellationService';

export const getConstellation = async (req: Request, res: Response) => {
  try {
    const astronomyPicture = await getTodaysAstronomyPicture();
    res.json(astronomyPicture);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch astronomy picture' });
  }
};

// Ny controller-funktion för att hämta APOD för ett specifikt datum
export const getConstellationByDate = async (req: Request, res: Response) => {
  const { date } = req.params;
  
  // Validera datumet (YYYY-MM-DD format)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }
  
  try {
    const astronomyPicture = await getAstronomyPictureByDate(date);
    res.json(astronomyPicture);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch astronomy picture for date ${date}` });
  }
};

// Ny controller-funktion för att hämta APOD för en datumperiod
export const getConstellationRange = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  // Validera datum
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string' || 
      !dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD for both start and end dates' });
  }
  
  try {
    const astronomyPictures = await getAstronomyPicturesForRange(startDate, endDate);
    res.json(astronomyPictures);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch astronomy pictures for date range' });
  }
};


