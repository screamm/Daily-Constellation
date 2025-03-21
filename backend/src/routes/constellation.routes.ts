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

// Admin-funktioner för cache-hantering (skyddade endpoints)
// Dessa skulle idealt skyddas med autentisering i en produktionsmiljö
router.get('/admin/cache/stats', constellationController.getCacheStats);
router.post('/admin/cache/clear', constellationController.clearApiCache);

export default router; 