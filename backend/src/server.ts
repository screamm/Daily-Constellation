import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000; // Använder port 3000 från .env

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});