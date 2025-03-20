// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';

// Ladda miljövariabler från .env med explicit sökväg
const envPath = path.resolve(__dirname, '../.env');
console.log('Laddar miljövariabler från:', envPath);
dotenv.config({ path: envPath });

// Skriv ut API-nyckeln för felsökning (bara första tecknen)
const apiKey = process.env.NASA_API_KEY;
console.log('API-nyckel laddad:', apiKey ? `${apiKey.substring(0, 5)}...` : 'SAKNAS');

// Säkerställ att NASA_API_KEY verkligen är tillgänglig
if (!apiKey) {
  console.error('VARNING: NASA_API_KEY är inte definierad i miljövariablerna. API-anrop kommer att misslyckas!');
  console.error('Kontrollera att filen .env existerar och har rätt format:');
  console.error('NASA_API_KEY=din_api_nyckel_här');
  
  // Skriv ut tillgängliga miljövariabler för diagnostik (bara namnen, inte värdena)
  console.log('Tillgängliga miljövariabler:', Object.keys(process.env).filter(key => !key.startsWith('npm_')));
} else {
  // Sätt API-nyckeln globalt (för att vara säker på att den blir tillgänglig i controllers)
  process.env.NASA_API_KEY = apiKey;
  console.log('API-nyckel har satts globalt i process.env');
}

const app = express();
const PRIMARY_PORT = process.env.PORT || 4000;
const FALLBACK_PORT = 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Importera routes efter att miljövariablerna har satts
import constellationRoutes from './routes/constellation.routes';

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

// Skapa HTTP-server med Express-appen
const server = http.createServer(app);

// Försök starta servern först på primär port, fallback till reservport
server.listen(PRIMARY_PORT, () => {
  console.log(`Server körs på port ${PRIMARY_PORT}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PRIMARY_PORT} används redan, försöker med port ${FALLBACK_PORT} istället...`);
    
    // Försök med fallback-porten istället
    server.listen(FALLBACK_PORT, () => {
      console.log(`Server körs på fallback-port ${FALLBACK_PORT}`);
    }).on('error', (fallbackErr) => {
      console.error(`Kunde inte starta servern på någon port: ${fallbackErr.message}`);
      process.exit(1);
    });
  } else {
    console.error(`Serverfel: ${err.message}`);
    process.exit(1);
  }
});

export default app;