// src/app.ts
import express from 'express';
import cors from 'cors';
import constellationRoutes from './routes/constellationRoutes';

const app = express();

const allowedOrigins = [
  'https://nasa-daily-constellation.vercel.app',
  'http://localhost:5173',  // Vite's default development port
  'http://localhost:4173'   // Vite's default preview port
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/constellation', constellationRoutes);

export default app;