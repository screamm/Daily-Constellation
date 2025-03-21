import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { format, isValid, parseISO, addDays, subDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import { AstronomyPicture } from '../types/AstronomyPicture';
import { Link } from 'react-router-dom';

// Cache-nyckel för backend-status
const BACKEND_STATUS_KEY = 'backend_status';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuter i millisekunder

const ConstellationInfo = () => {
  const [astronomyPicture, setAstronomyPicture] = useState<AstronomyPicture | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [backendUnavailable, setBackendUnavailable] = useState<boolean>(false);
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Rensa cachen för backend-status vid komponentladdning
  useEffect(() => {
    try {
      localStorage.removeItem(BACKEND_STATUS_KEY);
      console.log('Backend-statuscache rensad för ny anslutning');
    } catch (err) {
      console.error('Kunde inte rensa cache:', err);
    }
  }, []);

  // Kontrollera backend-status från cache
  const checkBackendStatus = () => {
    try {
      const cachedStatus = localStorage.getItem(BACKEND_STATUS_KEY);
      if (cachedStatus) {
        const { unavailable, timestamp } = JSON.parse(cachedStatus);
        
        // Om det inte gått mer än 5 minuter sedan senaste checkingen, använd cachad status
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Använder cachad backend-status:', unavailable ? 'Otillgänglig' : 'Tillgänglig');
          setBackendUnavailable(unavailable);
          return unavailable;
        }
      }
      return false; // Om ingen cachad status eller cache utgången, anta att backend är tillgänglig
    } catch (err) {
      console.error('Fel vid kontroll av backend-status:', err);
      return false;
    }
  };

  // Uppdatera backend-status i cache
  const updateBackendStatus = (unavailable: boolean) => {
    try {
      localStorage.setItem(BACKEND_STATUS_KEY, JSON.stringify({
        unavailable,
        timestamp: Date.now()
      }));
      setBackendUnavailable(unavailable);
    } catch (err) {
      console.error('Kunde inte uppdatera backend-status i cache:', err);
    }
  };

  // Hämta astronomisk bild
  useEffect(() => {
    const fetchAstronomyPicture = async () => {
      setLoading(true);
      setError(null);
      
      // Kontrollera om backend är tillgänglig enligt cache
      const isBackendUnavailable = checkBackendStatus();
      
      // Om vi vet att backend är otillgänglig, använd fallback direkt
      if (isBackendUnavailable) {
        console.log('Backend är markerad som otillgänglig, använder fallback-data direkt');
        useFallbackData();
        setLoading(false);
        return;
      }
      
      try {
        const endpoint = date 
          ? `/api/constellation/date/${date}` 
          : '/api/constellation/today';
        
        console.log('Försöker ansluta till endpoint:', endpoint);
        
        try {
          // Sätt en timeout på 5 sekunder
          const response = await axios.get(endpoint, { 
            timeout: 5000,
            // Förhindra att webbläsaren cachar resultatet
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (response.status === 200) {
            console.log('Framgångsrikt API-svar:', response.data);
        setAstronomyPicture(response.data);
            // Markera backend som tillgänglig
            updateBackendStatus(false);
            
            // Kontrollera om bilden är favorit
            checkIfFavorite(response.data.date);
          } else {
            console.warn('Oväntat API-svar status:', response.status);
            // Använd fallback vid oväntat svar
            useFallbackData();
            // Markera backend som otillgänglig
            updateBackendStatus(true);
          }
        } catch (apiError: any) {
          console.error('API-anropsfel:', apiError);
          
          // Markera backend som otillgänglig
          updateBackendStatus(true);
          
          // Visa felmeddelande om det finns ett från backend
          if (apiError.response && apiError.response.data && apiError.response.data.error) {
            // Spara felmeddelande från backend
            setError(apiError.response.data.error);
            console.warn('Detaljerat API-fel:', apiError.response.data.error);
          }
          
          // Använd fallback-data vid alla anslutningsfel
          useFallbackData();
        }
      } catch (err: any) {
        console.error('Oväntat fel vid hämtning av astronomisk bild:', err);
        updateBackendStatus(true);
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
    
    // Valet av högkvalitativa astronomibilder för fallback
    const fallbackImages = [
      {
        url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop",
        title: "Galaxen - Cosmic Wonders",
        explanation: "Detta är lokal fallback-data som visas eftersom backend inte kan nås. Bilden visar ett stjärnfyllt galaktiskt landskap som representerar de oändliga underverken i vårt universum. För att se riktiga NASA-bilder, se till att backend-servern körs och att API-nyckeln är konfigurerad korrekt.",
      },
      {
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2000&auto=format&fit=crop",
        title: "Nebulosa - Cosmic Dust",
        explanation: "Detta är lokal fallback-data. Bilden visar en färgglad nebulosa, ett enormt moln av gas och kosmiskt damm där nya stjärnor föds. Nebulosor är några av de mest visuellt imponerande fenomenen i vårt universum och studeras intensivt av astronomer. För att se riktiga NASA-bilder, kontrollera att backend-servern körs korrekt.",
      },
      {
        url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2000&auto=format&fit=crop",
        title: "Stjärnbilden - Cosmic Patterns",
        explanation: "Detta är lokal fallback-data. Bilden visar ett stjärnfyllt nattlandskap med en fascinerande stjärnbild. Stjärnbilder har spelat en central roll i mänsklighetens navigering och mytologier genom historien. För att se riktiga NASA-bilder med vetenskapliga förklaringar, säkerställ att backend-tjänsten fungerar korrekt.",
      },
      {
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop",
        title: "Djupa rymden - Beyond Stars",
        explanation: "Detta är lokal fallback-data. Bilden visar en fascinerande vy av den djupa rymden, fylld med stjärnor och galaxer. Människans utforskning av universum har alltid varit driven av vår nyfikenhet att förstå kosmos oändliga mysterier. För att se riktiga NASA-bilder, säkerställ att backend-anslutningen fungerar.",
      }
    ];
    
    // Välj en slumpmässig bild från samlingen
    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    const selectedImage = fallbackImages[randomIndex];
    
    return {
      date: formattedDate,
      explanation: selectedImage.explanation,
      hdurl: selectedImage.url,
      media_type: "image",
      service_version: "v1",
      title: selectedImage.title,
      url: selectedImage.url,
      copyright: "Demo Mode (Unsplash)"
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
        favoritesArray = favoritesArray.filter(fav => fav.date !== astronomyPicture.date);
      } else {
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
    
    const newDate = direction === 'next' 
      ? addDays(currentDate, 1)
      : subDays(currentDate, 1);
    
    const formattedDate = format(newDate, 'yyyy-MM-dd');
    navigate(`/day/${formattedDate}`);
  };

  // Toggla visning av information
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Lägg till showDatePicker funktion
  const handleDatePickerClick = () => {
    setShowDatePicker(true);
  };

  // Rendera laddning
  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color={getComputedStyle(document.documentElement).getPropertyValue('--color-cosmic-accent')} size={50} />
        <p className="mt-4 text-cosmic-text">Hämtar dagens stjärnbild...</p>
      </div>
    );
  }

  // Rendera felmeddelande
  if (error) {
    return (
      <div className="error-container">
        <h2 className="text-xl font-bold mb-2">Något gick fel</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary mt-4"
          aria-label="Försök igen genom att ladda om sidan"
        >
          Försök igen
        </button>
      </div>
    );
  }

  // Rendera om ingen bild hittades
  if (!astronomyPicture) {
    return (
      <div className="error-container">
        <h2 className="text-xl font-bold mb-2">Inget innehåll hittades</h2>
        <p>Vi kunde inte hitta någon stjärnbild för det begärda datumet.</p>
        <Link to="/" className="btn btn-primary mt-4 inline-block">
          Gå till dagens bild
        </Link>
      </div>
    );
  }

  // Huvudkomponent
  return (
    <div className="constellation-container">
      {loading ? (
        <div className="loading-container">
          <ClipLoader color={getComputedStyle(document.documentElement).getPropertyValue('--color-cosmic-accent')} size={50} />
          <p className="mt-4 text-cosmic-text">Hämtar dagens stjärnbild...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h2 className="text-xl font-bold mb-2">Något gick fel</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mt-4"
            aria-label="Försök igen genom att ladda om sidan"
          >
            Försök igen
          </button>
        </div>
      ) : astronomyPicture ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-cosmic-text">
              {astronomyPicture.title}
            </h1>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleInfo}
                className="btn btn-secondary text-sm p-2 rounded-md hover:bg-cosmic-secondary"
                aria-label={showInfo ? "Dölj information" : "Visa information"}
                title={showInfo ? "Dölj information" : "Visa information"}
              >
                {showInfo ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={toggleFavorite}
                className={`btn btn-secondary text-sm p-2 rounded-md hover:bg-cosmic-secondary ${isFavorite ? 'text-yellow-400 border-yellow-400' : ''}`}
                aria-label={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
                title={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
              >
                {isFavorite ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={shareUrl}
                className="btn btn-secondary text-sm p-2 rounded-md hover:bg-cosmic-secondary"
                aria-label="Dela denna sida"
                title="Dela denna sida"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              
              <div className="relative">
                <button
                  onClick={handleDatePickerClick}
                  className="btn btn-secondary text-sm p-2 rounded-md hover:bg-cosmic-secondary"
                  aria-label="Välj datum"
                  title="Välj datum"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 p-2 bg-cosmic-primary rounded-lg shadow-lg z-10 border border-cosmic-border">
                    <input
                      type="date"
                      value={astronomyPicture.date}
                      onChange={(e) => {
                        if (e.target.value) {
                          navigate(`/day/${e.target.value}`);
                        }
                      }}
                      className="bg-cosmic-secondary text-cosmic-text p-2 rounded-md border border-cosmic-border focus:border-cosmic-accent-soft"
                      aria-label="Välj datum för stjärnbild"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="relative mb-4 overflow-hidden rounded-lg">
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-cosmic-primary bg-opacity-50 z-10 loading-placeholder">
              <ClipLoader color={getComputedStyle(document.documentElement).getPropertyValue('--color-cosmic-accent')} size={40} />
            </div>
            
            <img
              src={astronomyPicture.url}
              alt={astronomyPicture.title}
              className="max-w-full h-auto rounded-lg transition-all duration-300"
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                const placeholder = target.parentElement?.querySelector('.loading-placeholder');
                if (placeholder) {
                  placeholder.classList.add('opacity-0');
                  setTimeout(() => {
                    placeholder.remove();
                  }, 300);
                }
              }}
            />
          </div>
          
          {copySuccess && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
              Länk kopierad till urklipp!
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigateDay('prev')}
              className="btn btn-secondary text-sm"
              aria-label="Föregående dag"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Föregående dag
            </button>
            
            <div className="text-center text-cosmic-text">
              <span className="font-medium">{formatDate(astronomyPicture.date)}</span>
            </div>
            
            <button
              onClick={() => navigateDay('next')}
              className="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Nästa dag"
              disabled={astronomyPicture.date === format(new Date(), 'yyyy-MM-dd')}
            >
              Nästa dag
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {showInfo && (
            <div className="mt-4 bg-cosmic-primary rounded-lg p-4 border border-cosmic-border shadow-md">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => navigateDay('prev')}
                  className="btn btn-secondary rounded-md py-1 px-3 hover:bg-cosmic-secondary flex items-center"
                  aria-label="Föregående dag"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Föregående
                </button>
                
                <span className="text-sm md:text-base font-medium text-cosmic-text">
                  {formatDate(astronomyPicture.date)}
                </span>
                
                <button
                  onClick={() => navigateDay('next')}
                  disabled={astronomyPicture.date === format(new Date(), 'yyyy-MM-dd')}
                  className="btn btn-secondary rounded-md py-1 px-3 hover:bg-cosmic-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Nästa dag"
                >
                  Nästa
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
                <div className="text-cosmic-text" dangerouslySetInnerHTML={{ __html: astronomyPicture.explanation }} />
              </div>
              
              {location.pathname.includes('/offline/') && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md border border-yellow-400 text-sm">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      Du visar offlineinnehåll. Vissa funktioner kanske inte fungerar som förväntat. 
                      <a href="/" className="underline ml-1 text-cosmic-accent-soft hover:text-cosmic-accent">Gå till onlineläge</a>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex flex-wrap gap-2">
                <a 
                  href={`https://twitter.com/intent/tweet?text=Dagens astronomibild: ${astronomyPicture.title}&url=${window.location.href}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm py-1 px-3 rounded-md hover:bg-cosmic-secondary flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  Twitter
                </a>
                
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm py-1 px-3 rounded-md hover:bg-cosmic-secondary flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  Facebook
                </a>
                
                <a 
                  href={`mailto:?subject=Dagens astronomibild: ${astronomyPicture.title}&body=Kolla in dagens astronomibild: ${window.location.href}`} 
                  className="btn btn-secondary text-sm py-1 px-3 rounded-md hover:bg-cosmic-secondary flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  E-post
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="error-container">
          <h2 className="text-xl font-bold mb-2">Inget innehåll hittades</h2>
          <p>Vi kunde inte hitta någon stjärnbild för det begärda datumet.</p>
          <Link to="/" className="btn btn-primary mt-4 inline-block">
            Gå till dagens bild
          </Link>
        </div>
      )}
    </div>
  );
};

export default ConstellationInfo;