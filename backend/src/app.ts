// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import constellationRoutes from './routes/constellation.routes';

// Ladda miljövariabler från .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// API-routes
app.use('/api/constellation', constellationRoutes);

// Servera statiska filer i produktion
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist');
  
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404-hantering
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint hittades inte' });
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Server körs på port ${PORT}`);
});