


// src/components/ConstellationInfo.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const ConstellationInfo = () => {
  const [astronomyPicture, setAstronomyPicture] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAstronomyPicture = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/constellation');
        setAstronomyPicture(response.data);
      } catch (err) {
        setError('Failed to fetch astronomy picture. Please try again later.');
        console.error('Error fetching astronomy picture:', err);
      }
    };

    fetchAstronomyPicture();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!astronomyPicture) {
    return <div className="text-cosmic-secondary text-center mt-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cosmic-background">
      <h1 className="text-4xl font-bold text-cosmic-accent mb-4">
        Astronomy Picture of the Day
      </h1>
      <div className="bg-cosmic-primary p-6 rounded-lg shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold text-cosmic-accent mb-4">
          {astronomyPicture.title}
        </h2>
        {astronomyPicture.media_type === 'image' ? (
          <img
            src={astronomyPicture.url}
            alt={astronomyPicture.title}
            className="mb-4 rounded-lg w-full"
          />
        ) : (
          <iframe
            src={astronomyPicture.url}
            title={astronomyPicture.title}
            className="mb-4 rounded-lg w-full h-64"
            allowFullScreen
          />
        )}
        <p className="text-cosmic-text">{astronomyPicture.explanation}</p>
      </div>
    </div>
  );
};

export default ConstellationInfo;


