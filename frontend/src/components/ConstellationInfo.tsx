import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { format, isValid, parseISO, addDays, subDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import { AstronomyPicture } from '../types/AstronomyPicture';

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
      <div className="flex-grow flex items-center justify-center">
        <ClipLoader color="#4d76e3" size={60} />
      </div>
    );
  }

  // Rendera felmeddelande
  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-cosmic-text p-6">
        <div className="bg-cosmic-primary p-8 rounded-lg shadow-lg max-w-lg text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Oj, något gick fel</h2>
          <p className="text-cosmic-text/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cosmic-accent text-white rounded hover:bg-opacity-90 transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  // Rendera om ingen bild hittades
  if (!astronomyPicture) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="max-w-md p-6 text-center">
          <div className="mb-6">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl mb-3">Ingen bild hittades</h2>
          <p className="text-white/70 mb-6">
            Det finns ingen astronomisk bild för det begärda datumet.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-white/20 hover:bg-white/10 rounded-md transition-colors"
          >
            Tillbaka till startsidan
          </button>
        </div>
      </div>
    );
  }

  // Huvudkomponent
  return (
    <div className="constellation-container h-full flex flex-col relative overflow-hidden">
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <ClipLoader color="#4d76e3" size={60} />
        </div>
      ) : error ? (
        <div className="flex-grow flex flex-col items-center justify-center text-cosmic-text p-6">
          <div className="bg-cosmic-primary p-8 rounded-lg shadow-lg max-w-lg text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Oj, något gick fel</h2>
            <p className="text-cosmic-text/70 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cosmic-accent text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Försök igen
            </button>
          </div>
        </div>
      ) : astronomyPicture ? (
        <>
          {/* Bakgrundsbild med overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${astronomyPicture.url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/70 backdrop-blur-sm"></div>
          </div>
          
          {/* Demo-indikator */}
          {astronomyPicture.demo && (
            <div className="absolute top-0 left-0 right-0 bg-yellow-600 text-white text-center text-xs py-1 z-20">
              Demo-läge: Visar fallback-data eftersom NASA API inte kunde nås.
            </div>
          )}
          
          {/* Huvudinnehåll */}
          <div className="relative z-10 flex flex-col h-full py-2">
            {/* Kontroller-rad */}
            <div className="px-4 py-1 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateDay('prev')}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Föregående dag"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={handleDatePickerClick}
                  className="text-white text-sm md:text-base opacity-90 hover:opacity-100 transition-opacity"
                >
                  {format(new Date(astronomyPicture.date), "d MMMM yyyy", { locale: sv })}
                </button>
                
                <button
                  onClick={() => navigateDay('next')}
                  className={`text-white ${new Date(astronomyPicture.date) >= new Date() ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100 transition-opacity'}`}
                  aria-label="Nästa dag"
                  disabled={new Date(astronomyPicture.date) >= new Date()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity ml-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
              </div>
              
              {/* Favoritknapp och delningsknapp */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  className={`text-white ${isFavorite ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}
                  aria-label={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
                >
                  <svg 
                    className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`}
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
                
                <div className="relative">
                  <button
                    onClick={shareUrl}
                    className="text-white opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Dela"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
                      />
                    </svg>
                  </button>
                  
                  {copySuccess && (
                    <div className="absolute right-0 bottom-full mb-1 bg-white/10 backdrop-blur-md text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Länk kopierad
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Innehållssektionen - titel och bild */}
            <div className="flex-grow flex flex-col justify-center items-center px-4 py-2">
              <h1 className="text-xl md:text-2xl font-semibold text-white text-center mb-3">
                {astronomyPicture.title}
              </h1>
              
              <div className="w-full h-full flex items-center justify-center">
                {astronomyPicture.media_type === 'image' ? (
                  <img
                    src={astronomyPicture.url}
                    alt={astronomyPicture.title}
                    className="w-full h-full object-cover rounded-lg shadow-2xl" 
                    style={{ maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)' }}
                    loading="eager"
                  />
                ) : (
                  <iframe
                    src={astronomyPicture.url}
                    title={astronomyPicture.title}
                    className="w-full aspect-video rounded-lg shadow-2xl"
                    style={{ maxHeight: 'calc(100vh - 220px)', height: 'calc(100vh - 220px)' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
            
            {/* Informationspanel i botten */}
            <div className="relative mt-auto">
              <div className="flex justify-center">
                <button 
                  onClick={toggleInfo} 
                  className="mb-1 w-8 h-8 flex items-center justify-center text-white bg-black/40 rounded-full backdrop-blur-md"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
              
              <div className={`bg-black/80 backdrop-blur-md text-white transition-all duration-300 ${showInfo ? 'max-h-32 md:max-h-36 p-3' : 'max-h-0 p-0'} overflow-auto`}>
                <div className="max-w-3xl mx-auto">
                  {astronomyPicture.copyright && (
                    <p className="text-white/60 text-xs mb-1">
                      © {astronomyPicture.copyright}
                    </p>
                  )}
                  
                  <div className="text-white/80 text-sm md:text-base font-light">
                    <p className="line-clamp-3">{astronomyPicture.explanation}</p>
                  </div>

                  {/* Sociala delningsknappar */}
                  <div className="mt-2 pt-1 border-t border-white/10 flex justify-between items-center">
                    <div className="text-white/60 text-xs">
                      NASA APOD
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => shareOnSocialMedia('twitter')}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Dela på Twitter"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => shareOnSocialMedia('facebook')}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Dela på Facebook"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => shareOnSocialMedia('linkedin')}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Dela på LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ConstellationInfo;