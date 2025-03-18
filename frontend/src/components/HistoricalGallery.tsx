import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { AstronomyPicture } from '../types/AstronomyPicture';

const HistoricalGallery = () => {
  const [pictures, setPictures] = useState<AstronomyPicture[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [favorites, setFavorites] = useState<string[]>([]);

  // Ladda favoriter från localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        const favoriteDates = parsedFavorites.map((fav: AstronomyPicture) => fav.date);
        setFavorites(favoriteDates);
      } catch (error) {
        console.error('Fel vid inläsning av favoriter:', error);
      }
    }
  }, []);

  // Hämta bilder när datumintervallet ändras
  useEffect(() => {
    const fetchPictures = async () => {
      if (!startDate || !endDate) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/constellation/range`, {
          params: { start_date: startDate, end_date: endDate }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
          // Sortera bilderna med nyaste först
          setPictures(response.data.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }));
        } else {
          setError('Kunde inte hämta bilderna. Försök igen senare.');
        }
      } catch (error) {
        console.error('Fel vid hämtning av bilder:', error);
        setError('Ett fel uppstod. Kontrollera din internetanslutning eller försök igen senare.');
      } finally {
        setLoading(false);
      }
    };

    fetchPictures();
  }, [startDate, endDate]);

  const toggleFavorite = (picture: AstronomyPicture) => {
    const storedFavorites = localStorage.getItem('favorites') || '[]';
    let favoritesArray: AstronomyPicture[] = [];
    
    try {
      favoritesArray = JSON.parse(storedFavorites);
      
      const existingIndex = favoritesArray.findIndex(fav => fav.date === picture.date);
      
      if (existingIndex >= 0) {
        // Ta bort från favoriter
        favoritesArray = favoritesArray.filter(fav => fav.date !== picture.date);
        setFavorites(favoritesArray.map(fav => fav.date));
      } else {
        // Lägg till i favoriter
        favoritesArray.push(picture);
        setFavorites([...favorites, picture.date]);
      }
      
      localStorage.setItem('favorites', JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Fel vid hantering av favoriter:', error);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-background">
      <header className="sticky top-0 z-40 w-full bg-cosmic-primary shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-cosmic-text">
            Historiskt bildgalleri
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Datumväljare */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-cosmic-text mb-2">Startdatum:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-cosmic-background text-cosmic-text border border-cosmic-accent border-opacity-50 rounded"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-cosmic-text mb-2">Slutdatum:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-cosmic-background text-cosmic-text border border-cosmic-accent border-opacity-50 rounded"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Felhantering */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Laddningsindikator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <ClipLoader color="#1E90FF" size={50} />
            <p className="ml-4 text-cosmic-text">Laddar bilder...</p>
          </div>
        )}

        {/* Bildgalleri */}
        {!loading && pictures.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pictures.map((picture) => (
              <div 
                key={picture.date} 
                className="card transition-transform hover:scale-102"
              >
                <div className="relative pb-[65%]">
                  <Link to={`/day/${picture.date}`}>
                    {picture.media_type === 'image' ? (
                      <img 
                        src={picture.url} 
                        alt={picture.title} 
                        className="absolute w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="absolute w-full h-full flex items-center justify-center bg-black rounded-t-lg">
                        <iframe 
                          src={picture.url} 
                          title={picture.title} 
                          className="absolute w-full h-full rounded-t-lg" 
                          allowFullScreen
                        />
                      </div>
                    )}
                  </Link>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold truncate">{picture.title}</h3>
                    <p className="text-gray-300 text-sm">{formatDisplayDate(picture.date)}</p>
                  </div>

                  {/* Favorit-knapp */}
                  <button
                    onClick={() => toggleFavorite(picture)}
                    className="absolute top-2 right-2 bg-cosmic-background bg-opacity-70 hover:bg-cosmic-primary rounded-full p-2 transition-colors"
                    aria-label={favorites.includes(picture.date) ? "Ta bort från favoriter" : "Lägg till i favoriter"}
                  >
                    <svg 
                      className={`h-5 w-5 ${favorites.includes(picture.date) ? 'text-red-500 fill-current' : 'text-white'}`}
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={favorites.includes(picture.date) ? 0 : 2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        fill={favorites.includes(picture.date) ? 'currentColor' : 'none'}
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tom status */}
        {!loading && pictures.length === 0 && !error && (
          <div className="text-center py-12 bg-cosmic-primary rounded-lg">
            <p className="text-cosmic-text text-lg mb-4">
              Inga bilder hittades för det valda datumintervallet.
            </p>
            <p className="text-cosmic-text">
              Prova att välja ett annat datumintervall.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-8 p-4 bg-cosmic-primary">
        <div className="container mx-auto text-center text-cosmic-text text-sm">
          <p>Drivs av NASA's APOD API</p>
        </div>
      </footer>
    </div>
  );
};

export default HistoricalGallery; 