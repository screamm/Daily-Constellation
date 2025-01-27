import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';

// Använd relativ URL - detta fungerar oavsett hosting
const API_URL = '/api/constellation';

const ConstellationInfo = () => {
  const [astronomyPicture, setAstronomyPicture] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAstronomyPicture = async () => {
      try {
        const response = await axios.get(API_URL);
        setAstronomyPicture(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch astronomy picture. Please try again later.';
        setError(errorMessage);
        console.error('Error fetching astronomy picture:', err);
      }
    };

    fetchAstronomyPicture();
  }, []);


  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-background">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!astronomyPicture) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-background">
        <div className="text-center">
          <ClipLoader color="#1E90FF" size={50} />
          <p className="mt-4 text-cosmic-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-cosmic-primary shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-cosmic-text">
            Astronomy Picture of the Day
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <article className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-cosmic-accent mb-6">
            {astronomyPicture.title}
          </h2>
          
          <div className="mb-8">
            {astronomyPicture.media_type === 'image' ? (
              <img
                src={astronomyPicture.url}
                alt={astronomyPicture.title}
                className="w-full object-cover max-h-[70vh]"
              />
            ) : (
              <div className="relative pt-[56.25%]">
                <iframe
                  src={astronomyPicture.url}
                  title={astronomyPicture.title}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-cosmic-text text-lg leading-relaxed">
              {astronomyPicture.explanation}
            </p>
          </div>
        </article>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 w-full bg-cosmic-primary shadow-lg mt-8">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cosmic-text text-sm mb-2 md:mb-0">
            Powered by NASA's APOD API
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2 bg-cosmic-accent text-cosmic-background hover:bg-opacity-90 transition-colors"
          >
            Back to top
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ConstellationInfo;