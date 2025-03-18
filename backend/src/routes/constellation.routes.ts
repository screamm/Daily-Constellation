import { Router } from 'express';
import * as constellationController from '../controllers/constellation.controller';

const router = Router();

// Hämta dagens astronomiska bild
router.get('/today', constellationController.getToday);

// Hämta astronomisk bild för ett specifikt datum
router.get('/date/:date', constellationController.getByDate);

// Hämta astronomiska bilder för ett datumintervall
router.get('/range', constellationController.getDateRange);

// Slumpmässig astronomisk bild
router.get('/random', constellationController.getRandom);

export default router; 