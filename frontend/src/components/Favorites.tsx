import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { IAstronomyPicture } from '../types';
import ConstellationCard from './ConstellationCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState<IAstronomyPicture[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>('Laddar favoriter...');
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites) && parsedFavorites.length > 0) {
          // Sortera efter datum med nyaste först
          setFavorites(parsedFavorites.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }));
        } else {
          setEmptyMessage('Du har inte sparat några favoriter än.');
        }
      } else {
        setEmptyMessage('Du har inte sparat några favoriter än.');
      }
    } catch (error) {
      console.error('Fel vid inläsning av favoriter:', error);
      setEmptyMessage('Kunde inte läsa in favoriter. Något gick fel.');
    }
  };

  const removeFavorite = useCallback((date: string) => {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        const updatedFavorites = parsedFavorites.filter(
          (fav: IAstronomyPicture) => fav.date !== date
        );
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        setFavorites(updatedFavorites);
        
        if (updatedFavorites.length === 0) {
          setEmptyMessage('Du har inte sparat några favoriter än.');
        }
      }
    } catch (error) {
      console.error('Fel vid borttagning av favorit:', error);
    }
  }, []);

  const formatDate = (dateString: string) => {
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
        if (index < favorites.length - 1) {
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
        if (index + numCols < favorites.length) {
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
      case 'Delete':
        e.preventDefault();
        if (index >= 0 && index < favorites.length) {
          removeFavorite(favorites[index].date);
          // Efter borttagning, fokusera på föregående objekt eller första om det var det första
          if (index > 0) {
            setFocusedIndex(index - 1);
          } else if (favorites.length > 1) {
            setFocusedIndex(0);
          }
        }
        break;
      default:
        break;
    }
  }, [favorites.length, removeFavorite]);

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
        Dina favoriter
      </h1>

      {favorites.length === 0 ? (
        <div 
          className="text-center py-12 bg-cosmic-primary rounded-lg border border-cosmic-border shadow-md"
          role="status"
          aria-live="polite"
        >
          <p className="text-cosmic-text text-lg mb-4">{emptyMessage}</p>
          <Link 
            to="/gallery" 
            className="btn btn-primary rounded-md py-2 px-4 hover:bg-cosmic-accent-soft transition-colors"
            aria-label="Gå till bildgalleriet för att utforska bilder"
          >
            Utforska bildgalleriet
          </Link>
        </div>
      ) : (
        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gallery-grid"
          role="grid"
          aria-label="Dina favoritbilder"
        >
          {favorites.map((picture, index) => (
            <div 
              key={picture.date} 
              className="relative gallery-item"
              role="gridcell"
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              <ConstellationCard astronomyPicture={picture} />
              <button
                onClick={() => removeFavorite(picture.date)}
                className="absolute top-2 right-2 bg-cosmic-primary bg-opacity-70 hover:bg-cosmic-secondary p-2 rounded-full transition-all duration-300 z-10"
                aria-label={`Ta bort ${picture.title} från favoriter`}
                title="Ta bort från favoriter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="mt-6 text-cosmic-text text-sm" aria-live="polite">
          <p>
            <span className="sr-only">Tangentbordsnavigation: </span>
            Använd piltangenterna för att navigera bland dina favoriter. 
            <span className="hidden md:inline"> Tryck Delete-tangenten för att ta bort en favorit.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites; 