// src/controllers/constellationController.ts
import { Request, Response } from 'express';
import { getTodaysConstellation } from '../services/constellationService';

export const getConstellation = async (req: Request, res: Response) => {
  try {
    const constellation = await getTodaysConstellation();
    res.json(constellation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch constellation data' });
  }
};