


// src/controllers/constellationController.ts
import { Request, Response } from 'express';
import { getTodaysAstronomyPicture } from '../services/constellationService';

export const getConstellation = async (req: Request, res: Response) => {
  try {
    const astronomyPicture = await getTodaysAstronomyPicture();
    res.json(astronomyPicture);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch astronomy picture' });
  }
};


