// src/services/constellationService.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;

export const getTodaysConstellation = async () => {
  const response = await axios.get(
    `https://api.astronomyapi.com/v1/constellations/today?apiKey=${API_KEY}`
  );
  return response.data;
};