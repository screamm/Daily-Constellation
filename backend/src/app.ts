// src/app.ts
import express from 'express';
import cors from 'cors';
import constellationRoutes from './routes/constellationRoutes';

const app = express();

const isDevelopment = process.env.NODE_ENV !== 'production';

// Utvecklingsvänlig CORS-konfiguration
if (isDevelopment) {
  app.use(cors());
} else {
  // Produktionskonfiguration med specifika origins
  const allowedOrigins = [
    'https://nasa-daily-constellation.vercel.app',
    'http://localhost:5173'
  ];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
}

app.use(express.json());
app.use('/api/constellation', constellationRoutes);

export default app;