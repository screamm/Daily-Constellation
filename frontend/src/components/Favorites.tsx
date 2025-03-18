import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AstronomyPicture } from '../types/AstronomyPicture';
import { ClipLoader } from 'react-spinners';
import { format } from 'date-fns';

const Favorites = () => {
  const [favorites, setFavorites] = useState<AstronomyPicture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Ladda favoriter från localStorage
    setLoading(true);
    const storedFavorites = localStorage.getItem('favorites');
    
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        // Sortera favoriter efter datum, nyaste först
        setFavorites(parsedFavorites.sort((a: AstronomyPicture, b: AstronomyPicture) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (error) {
        console.error('Error parsing favorites:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const handleDateClick = (date: string) => {
    setSelectedDate(date === selectedDate ? '' : date);
  };

  const removeFromFavorites = (picture: AstronomyPicture) => {
    const updatedFavorites = favorites.filter(fav => fav.date !== picture.date);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Filtrera favoriter baserat på söktermen
  const filteredFavorites = favorites.filter(fav => 
    fav.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    fav.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-background">
        <div className="text-center">
          <ClipLoader color="#1E90FF" size={50} />
          <p className="mt-4 text-cosmic-text">Laddar favoriter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-background">
      <header className="sticky top-0 z-40 w-full bg-cosmic-primary shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-cosmic-text">
            Mina favoriter
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Sökfält */}
        <div className="mb-8 p-4 bg-cosmic-primary rounded-lg">
          <div className="relative">
            <input 
              type="text"
              placeholder="Sök bland dina favoriter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-cosmic-background text-cosmic-text border border-cosmic-accent rounded"
            />
            <svg 
              className="absolute left-3 top-3.5 h-5 w-5 text-cosmic-text opacity-70" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12 bg-cosmic-primary rounded-lg">
            <p className="text-cosmic-text text-lg mb-4">
              Du har inga favoritmarkerade bilder ännu.
            </p>
            <Link 
              to="/gallery" 
              className="btn-primary inline-block"
            >
              Utforska galleriet
            </Link>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12 bg-cosmic-primary rounded-lg">
            <p className="text-cosmic-text text-lg">
              Inga favoriter matchade din sökning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((picture) => (
              <div 
                key={picture.date} 
                className="card transition-transform hover:scale-102"
              >
                <div className="relative pb-[65%]">
                  {picture.media_type === 'image' ? (
                    <img 
                      src={picture.url} 
                      alt={picture.title} 
                      className="absolute w-full h-full object-cover cursor-pointer"
                      onClick={() => handleDateClick(picture.date)}
                    />
                  ) : (
                    <div 
                      className="absolute w-full h-full flex items-center justify-center bg-black cursor-pointer"
                      onClick={() => handleDateClick(picture.date)}
                    >
                      <iframe 
                        src={picture.url} 
                        title={picture.title} 
                        className="absolute w-full h-full" 
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold truncate">{picture.title}</h3>
                    <p className="text-gray-300 text-sm">{formatDate(picture.date)}</p>
                  </div>

                  {/* Knapp för att ta bort från favoriter */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(picture);
                    }}
                    className="absolute top-2 right-2 bg-cosmic-background bg-opacity-70 hover:bg-cosmic-primary rounded-full p-2 transition-colors"
                    aria-label="Ta bort från favoriter"
                  >
                    <svg 
                      className="h-5 w-5 text-red-500 fill-current" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  </button>
                </div>
                
                {selectedDate === picture.date && (
                  <div className="p-4">
                    <h3 className="text-cosmic-accent font-bold text-lg mb-2">{picture.title}</h3>
                    <p className="text-cosmic-text text-sm mb-2">
                      Datum: {formatDate(picture.date)}
                      {picture.copyright && ` | © ${picture.copyright}`}
                    </p>
                    <p className="text-cosmic-text text-sm max-h-32 overflow-y-auto">
                      {picture.explanation}
                    </p>
                    <div className="mt-3 flex justify-between">
                      <Link 
                        to={`/day/${picture.date}`} 
                        className="text-cosmic-accent hover:underline text-sm"
                      >
                        Visa fullständig vy
                      </Link>
                      <a 
                        href={picture.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cosmic-accent hover:underline text-sm"
                      >
                        Öppna i nytt fönster
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
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

export default Favorites; 