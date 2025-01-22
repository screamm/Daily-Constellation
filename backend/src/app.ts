// src/app.ts
import express from 'express';
import cors from 'cors';
import constellationRoutes from './routes/constellationRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/constellation', constellationRoutes);

export default app;