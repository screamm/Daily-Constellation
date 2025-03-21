import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { format, subDays, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ClipLoader } from 'react-spinners';
import { IAstronomyPicture } from '../types';
import ConstellationCard from './ConstellationCard';

const HistoricalGallery = () => {
  const [pictures, setPictures] = useState<IAstronomyPicture[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [favorites, setFavorites] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Ladda favoriter från localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        const favoriteDates = parsedFavorites.map((fav: IAstronomyPicture) => fav.date);
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

  const toggleFavorite = useCallback((picture: IAstronomyPicture) => {
    try {
      const storedFavorites = localStorage.getItem('favorites') || '[]';
      let favoritesArray: IAstronomyPicture[] = [];
      
      favoritesArray = JSON.parse(storedFavorites);
      
      const existingIndex = favoritesArray.findIndex(fav => fav.date === picture.date);
      
      if (existingIndex >= 0) {
        // Ta bort från favoriter
        favoritesArray = favoritesArray.filter(fav => fav.date !== picture.date);
        setFavorites(favoritesArray.map(fav => fav.date));
      } else {
        // Lägg till i favoriter
        favoritesArray.push(picture);
        setFavorites(prev => [...prev, picture.date]);
      }
      
      localStorage.setItem('favorites', JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Fel vid hantering av favoriter:', error);
    }
  }, []);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'd MMMM yyyy', { locale: sv });
    } catch (error) {
      return dateString;
    }
  };

  // Hantera tangentbordsnavigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const numCols = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (index < pictures.length - 1) {
          setFocusedIndex(index + 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          setFocusedIndex(index - 1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index + numCols < pictures.length) {
          setFocusedIndex(index + numCols);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index - numCols >= 0) {
          setFocusedIndex(index - numCols);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Simulera klick på kortet
        if (gridRef.current) {
          const card = gridRef.current.children[index] as HTMLElement;
          const link = card.querySelector('a');
          if (link) {
            link.click();
          }
        }
        break;
      default:
        break;
    }
  }, [pictures.length]);

  // Fokusera på den valda bilden när focusedIndex ändras
  useEffect(() => {
    if (focusedIndex >= 0 && gridRef.current && gridRef.current.children[focusedIndex]) {
      const focusElement = gridRef.current.children[focusedIndex] as HTMLElement;
      if (focusElement) {
        focusElement.focus();
      }
    }
  }, [focusedIndex]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-cosmic-text mb-6">
        Historiskt bildgalleri
      </h1>

      {/* Datumväljare */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" role="search" aria-label="Filtrera bilder efter tidsperiod">
        <div>
          <label htmlFor="startDate" className="block text-cosmic-text mb-2">Startdatum:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full p-2 bg-cosmic-secondary text-cosmic-text border border-cosmic-border rounded-md focus:border-cosmic-accent-soft"
            max={endDate}
            aria-describedby="dateRangeHint"
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-cosmic-text mb-2">Slutdatum:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full p-2 bg-cosmic-secondary text-cosmic-text border border-cosmic-border rounded-md focus:border-cosmic-accent-soft"
            max={new Date().toISOString().split('T')[0]}
            min={startDate}
            aria-describedby="dateRangeHint"
          />
        </div>
        <div id="dateRangeHint" className="sr-only">
          Välj ett startdatum och slutdatum för att filtrera astronomibilder inom det tidsintervallet
        </div>
      </div>

      {/* Felhantering */}
      {error && (
        <div 
          className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6" 
          role="alert" 
          aria-live="assertive"
        >
          <p>{error}</p>
        </div>
      )}

      {/* Laddningsindikator */}
      {loading && (
        <div 
          className="flex justify-center items-center py-12" 
          role="status" 
          aria-live="polite"
        >
          <ClipLoader color={getComputedStyle(document.documentElement).getPropertyValue('--color-cosmic-accent')} size={50} />
          <p className="ml-4 text-cosmic-text">Laddar bilder...</p>
        </div>
      )}

      {/* Bildgalleri */}
      {!loading && pictures.length > 0 && (
        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gallery-grid"
          role="grid" 
          aria-label="Bildgalleri"
        >
          {pictures.map((picture, index) => (
            <div 
              key={picture.date} 
              className="relative gallery-item"
              role="gridcell"
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              <ConstellationCard astronomyPicture={picture} />
              <button
                onClick={() => toggleFavorite(picture)}
                className="absolute top-2 right-2 bg-cosmic-primary bg-opacity-70 hover:bg-cosmic-secondary p-2 rounded-full transition-all duration-300 z-10"
                aria-label={favorites.includes(picture.date) ? `Ta bort ${picture.title} från favoriter` : `Lägg till ${picture.title} i favoriter`}
                aria-pressed={favorites.includes(picture.date)}
              >
                {favorites.includes(picture.date) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cosmic-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tom status */}
      {!loading && pictures.length === 0 && !error && (
        <div 
          className="text-center py-12 bg-cosmic-primary rounded-lg border border-cosmic-border shadow-md"
          role="status"
          aria-live="polite"
        >
          <p className="text-cosmic-text text-lg mb-4">
            Inga bilder hittades för det valda datumintervallet.
          </p>
          <p className="text-cosmic-text">
            Prova att välja ett annat datumintervall.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoricalGallery; 