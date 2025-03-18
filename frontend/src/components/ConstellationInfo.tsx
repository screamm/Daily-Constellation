import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { format, isValid, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { AstronomyPicture } from '../types/AstronomyPicture';

const ConstellationInfo = () => {
  const [astronomyPicture, setAstronomyPicture] = useState<AstronomyPicture | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();

  // Hämta astronomisk bild
  useEffect(() => {
    const fetchAstronomyPicture = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const endpoint = date 
          ? `/api/constellation/date/${date}` 
          : '/api/constellation/today';
        
        console.log('Försöker ansluta till endpoint:', endpoint);
        
        try {
          // Sätt en timeout på 5 sekunder
          const response = await axios.get(endpoint, { timeout: 5000 });
          
          if (response.status === 200) {
            console.log('Framgångsrikt API-svar:', response.data);
            setAstronomyPicture(response.data);
            
            // Kontrollera om bilden är favorit
            checkIfFavorite(response.data.date);
          } else {
            console.warn('Oväntat API-svar status:', response.status);
            // Använd fallback vid oväntat svar
            useFallbackData();
          }
        } catch (apiError: any) {
          console.error('API-anropsfel:', apiError);
          
          // Använd fallback-data vid alla anslutningsfel
          useFallbackData();
        }
      } catch (err: any) {
        console.error('Oväntat fel vid hämtning av astronomisk bild:', err);
        useFallbackData();
      } finally {
        setLoading(false);
      }
    };
    
    // Hjälpfunktion för att använda fallback-data
    const useFallbackData = () => {
      console.log('Använder lokal fallback-data');
      const fallbackData = getDemoFallbackData(date);
      setAstronomyPicture(fallbackData);
    };
    
    fetchAstronomyPicture();
  }, [date]);

  // Lokal fallback-funktion för demodata med förbättrad hantering
  const getDemoFallbackData = (requestedDate?: string): AstronomyPicture => {
    console.log('Genererar fallback-data för datum:', requestedDate);
    const today = new Date();
    const formattedDate = requestedDate || today.toISOString().split('T')[0];
    
    return {
      date: formattedDate,
      explanation: "Detta är lokal fallback-data som visas eftersom backend inte kan nås. I vanliga fall skulle du se en astronomisk bild från NASA's APOD API här. För att se riktiga bilder, se till att backend-servern körs och att API-nyckeln är konfigurerad korrekt.",
      hdurl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1400&auto=format&fit=crop",
      media_type: "image",
      service_version: "v1",
      title: "Fallback - Universum (Lokal data)",
      url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop",
      copyright: "Lokal fallback (Unsplash)"
    };
  };

  // Kontrollera om bilden är favorit
  const checkIfFavorite = (pictureDate: string) => {
    const storedFavorites = localStorage.getItem('favorites');
    
    if (storedFavorites) {
      try {
        const favorites = JSON.parse(storedFavorites);
        const isCurrentFavorite = favorites.some((fav: AstronomyPicture) => fav.date === pictureDate);
        setIsFavorite(isCurrentFavorite);
      } catch (error) {
        console.error('Fel vid kontroll av favoriter:', error);
      }
    }
  };

  // Ändra favorit-status
  const toggleFavorite = () => {
    if (!astronomyPicture) return;
    
    const storedFavorites = localStorage.getItem('favorites') || '[]';
    let favoritesArray: AstronomyPicture[] = [];
    
    try {
      favoritesArray = JSON.parse(storedFavorites);
      
      if (isFavorite) {
        // Ta bort från favoriter
        favoritesArray = favoritesArray.filter(fav => fav.date !== astronomyPicture.date);
      } else {
        // Lägg till i favoriter
        favoritesArray.push(astronomyPicture);
      }
      
      localStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Fel vid hantering av favoriter:', error);
    }
  };

  // Kopiera delnings-URL
  const shareUrl = () => {
    if (!astronomyPicture) return;
    
    const shareableUrl = `${window.location.origin}/day/${astronomyPicture.date}`;
    
    try {
      navigator.clipboard.writeText(shareableUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera URL:', err);
    }
  };

  // Dela på sociala medier
  const shareOnSocialMedia = (platform: string) => {
    if (!astronomyPicture) return;
    
    const shareUrl = `${window.location.origin}/day/${astronomyPicture.date}`;
    const shareTitle = `NASA - ${astronomyPicture.title}`;
    const shareText = `Kolla in denna fantastiska astronomiska bild: ${astronomyPicture.title}`;
    
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Formatera datum
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      
      return format(date, 'd MMMM yyyy', { locale: sv });
    } catch (error) {
      return dateString;
    }
  };

  // Navigera till föregående eller nästa dag
  const navigateDay = (direction: 'prev' | 'next') => {
    if (!astronomyPicture) return;
    
    const currentDate = new Date(astronomyPicture.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (direction === 'next' && currentDate >= today) {
      return; // Förhindra navigation till framtida datum
    }
    
    const newDate = new Date(currentDate);
    
    if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    
    const formattedDate = format(newDate, 'yyyy-MM-dd');
    navigate(`/day/${formattedDate}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-background">
        <div className="text-center">
          <ClipLoader color="#1E90FF" size={50} />
          <p className="mt-4 text-cosmic-text">Laddar astronomisk bild...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-background">
        <div className="max-w-md p-6 bg-cosmic-primary rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-cosmic-text mb-4">Ett fel uppstod</h2>
          <p className="text-cosmic-text mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Tillbaka till startsidan
          </button>
        </div>
      </div>
    );
  }

  if (!astronomyPicture) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-background">
        <div className="max-w-md p-6 bg-cosmic-primary rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-cosmic-text mb-4">Ingen bild hittades</h2>
          <p className="text-cosmic-text mb-4">
            Det finns ingen astronomisk bild för det begärda datumet.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Tillbaka till startsidan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-background pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-cosmic-primary rounded-lg shadow-lg overflow-hidden">
          <header className="p-4 md:p-6 border-b border-cosmic-accent border-opacity-30">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-cosmic-text">
                {astronomyPicture.title}
              </h1>
              
              <div className="flex space-x-2">
                {/* Navigationsknappar */}
                <button
                  onClick={() => navigateDay('prev')}
                  className="p-2 rounded-full bg-cosmic-background hover:bg-cosmic-background hover:bg-opacity-80 text-cosmic-text transition-colors"
                  aria-label="Föregående dag"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => navigateDay('next')}
                  className={`p-2 rounded-full ${
                    new Date(astronomyPicture.date) >= new Date() ? 
                    'bg-cosmic-background bg-opacity-50 text-cosmic-text text-opacity-50 cursor-not-allowed' : 
                    'bg-cosmic-background hover:bg-cosmic-background hover:bg-opacity-80 text-cosmic-text transition-colors'
                  }`}
                  aria-label="Nästa dag"
                  disabled={new Date(astronomyPicture.date) >= new Date()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-2 text-cosmic-text text-opacity-70 text-sm">
              {formatDate(astronomyPicture.date)}
              {astronomyPicture.copyright && ` • © ${astronomyPicture.copyright}`}
            </div>
          </header>

          <div className="relative">
            {/* Bild/Video */}
            <div className="bg-black w-full">
              {astronomyPicture.media_type === 'image' ? (
                <img 
                  src={astronomyPicture.hdurl || astronomyPicture.url} 
                  alt={astronomyPicture.title}
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                  onError={(e) => {
                    // Fallback till en alternativ källa om bilden inte kan laddas
                    console.log('Bilden kunde inte laddas:', e);
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?q=80&w=800&auto=format&fit=crop';
                  }}
                />
              ) : (
                <div className="relative pt-[56.25%]">
                  <iframe
                    src={astronomyPicture.url}
                    title={astronomyPicture.title}
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Åtgärdsknappar */}
            <div className="absolute top-2 right-2 flex space-x-2">
              {/* Favorit-knapp */}
              <button
                onClick={toggleFavorite}
                className="p-2 rounded-full bg-cosmic-background bg-opacity-70 hover:bg-cosmic-primary transition-colors"
                aria-label={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
              >
                <svg 
                  className={`w-6 h-6 ${isFavorite ? 'text-cosmic-accent' : 'text-cosmic-text'}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>

              {/* Delningsknapp */}
              <div className="relative">
                <button
                  onClick={shareUrl}
                  className="p-2 rounded-full bg-cosmic-background bg-opacity-70 hover:bg-cosmic-primary transition-colors"
                  aria-label="Dela"
                >
                  <svg className="w-6 h-6 text-cosmic-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                
                {copySuccess && (
                  <div className="absolute right-0 bottom-full mb-2 bg-green-500 text-white py-1 px-2 rounded text-xs whitespace-nowrap">
                    Länk kopierad!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Beskrivningstext */}
          <div className="p-4 md:p-6">
            <div className="prose prose-invert max-w-none text-cosmic-text">
              <p>{astronomyPicture.explanation}</p>
            </div>

            {/* Sociala medier */}
            <div className="mt-6 pt-4 border-t border-cosmic-accent border-opacity-30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-cosmic-text font-medium">Dela denna bild</h3>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => shareOnSocialMedia('twitter')}
                    className="p-2 rounded-full bg-cosmic-background hover:bg-[#1DA1F2] text-cosmic-text hover:text-white transition-colors"
                    aria-label="Dela på Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => shareOnSocialMedia('facebook')}
                    className="p-2 rounded-full bg-cosmic-background hover:bg-[#4267B2] text-cosmic-text hover:text-white transition-colors"
                    aria-label="Dela på Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => shareOnSocialMedia('linkedin')}
                    className="p-2 rounded-full bg-cosmic-background hover:bg-[#0077B5] text-cosmic-text hover:text-white transition-colors"
                    aria-label="Dela på LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={shareUrl}
                    className="p-2 rounded-full bg-cosmic-background hover:bg-cosmic-accent text-cosmic-text hover:text-cosmic-background transition-colors"
                    aria-label="Kopiera länk"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-cosmic-text/70 text-sm">
            Dagens astronomiska bild
          </p>
          <p className="text-cosmic-text/50 text-xs mt-1">
            Drivs av NASA's APOD API
          </p>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-6 text-cosmic-text opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Tillbaka till toppen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstellationInfo;