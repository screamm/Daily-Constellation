// src/routes/constellationRoutes.ts
import express from 'express';
import { 
  getConstellation, 
  getConstellationByDate,
  getConstellationRange
} from '../controllers/constellationController';

const router = express.Router();

// Hämta dagens APOD
router.get('/', getConstellation);

// Hämta APOD för specifikt datum
router.get('/date/:date', getConstellationByDate);

// Hämta APOD för ett datumintervall
router.get('/range', getConstellationRange);

export default router;
