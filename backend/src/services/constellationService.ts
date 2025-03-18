// src/services/constellationService.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

export const getTodaysAstronomyPicture = async () => {
  try {
    const response = await axios.get(
      `${NASA_API_URL}?api_key=${NASA_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching astronomy picture:', error);
    throw new Error('Failed to fetch astronomy picture from NASA API');
  }
};

// Ny funktion för att hämta APOD för ett specifikt datum
export const getAstronomyPictureByDate = async (date: string) => {
  try {
    const response = await axios.get(
      `${NASA_API_URL}?api_key=${NASA_API_KEY}&date=${date}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching astronomy picture for date ${date}:`, error);
    throw new Error(`Failed to fetch astronomy picture for date ${date}`);
  }
};

// Ny funktion för att hämta APOD för en datumperiod
export const getAstronomyPicturesForRange = async (startDate: string, endDate: string) => {
  try {
    const response = await axios.get(
      `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching astronomy pictures for range ${startDate} to ${endDate}:`, error);
    throw new Error(`Failed to fetch astronomy pictures for date range`);
  }
};


