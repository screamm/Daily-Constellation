



// src/services/constellationService.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NASA_API_KEY = process.env.NASA_API_KEY;

export const getTodaysAstronomyPicture = async () => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching astronomy picture:', error);
    throw new Error('Failed to fetch astronomy picture from NASA API');
  }
};


