// src/routes/constellationRoutes.ts
import express from 'express';
import { getConstellation } from '../controllers/constellationController';

const router = express.Router();

router.get('/', getConstellation);

export default router;
