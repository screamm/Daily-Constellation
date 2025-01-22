// src/components/ConstellationInfo.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const ConstellationInfo = () => {
  // State för att lagra stjärnbildsdata
  const [constellation, setConstellation] = useState<any>(null);
  
  // State för att lagra eventuella felmeddelanden
  const [error, setError] = useState<string | null>(null);

  // useEffect för att hämta stjärnbildsdata när komponenten monteras
  useEffect(() => {
    const fetchConstellation = async () => {
      try {
        // Anropa backend-API:et för att hämta stjärnbildsdata
        const response = await axios.get('http://localhost:3000/api/constellation');
        
        // Uppdatera state med den hämtade datan
        setConstellation(response.data);
      } catch (err) {
        // Om något går fel, sätt ett felmeddelande
        setError('Failed to fetch constellation data. Please try again later.');
        console.error('Error fetching constellation data:', err);
      }
    };

    // Anropa funktionen för att hämta data
    fetchConstellation();
  }, []); // Tomt beroende-array innebär att detta endast körs en gång vid montering

  // Visa felmeddelande om något gick fel
  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        {error}
      </div>
    );
  }

  // Visa laddningsmeddelande medan data hämtas
  if (!constellation) {
    return (
      <div className="text-cosmic-secondary text-center mt-8">
        Loading...
      </div>
    );
  }

  // Visa stjärnbildsdata när den har hämtats
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cosmic-background">
      <h1 className="text-4xl font-bold text-cosmic-accent mb-4">
        Dagens Stjärnbild
      </h1>
      <div className="bg-cosmic-primary p-6 rounded-lg shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold text-cosmic-accent mb-2">
          {constellation.name}
        </h2>
        <p className="text-cosmic-text mb-4">
          {constellation.description}
        </p>
        <p className="text-cosmic-secondary">
          Synlighet: {constellation.visibility}
        </p>
      </div>
    </div>
  );
};

export default ConstellationInfo;