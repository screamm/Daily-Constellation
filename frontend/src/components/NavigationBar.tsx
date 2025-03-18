import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const location = useLocation();
  const [theme, setTheme] = useState('cosmic');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      // Hämta tema från localStorage om det finns
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (error) {
      console.error('Kunde inte ladda tema:', error);
      // Använd standard-tema om det uppstår fel
      document.documentElement.setAttribute('data-theme', 'cosmic');
    }
  }, []);

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'cosmic' : 'light';
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Uppdatera CSS-variabler direkt på dokumentet om det behövs
      applyThemeStyles(newTheme);
    } catch (error) {
      console.error('Kunde inte ändra tema:', error);
    }
  };
  
  // Hjälpfunktion för att direkt applicera tema-stilar på root-elementet
  const applyThemeStyles = (themeName: string) => {
    const root = document.documentElement;
    
    if (themeName === 'cosmic') {
      root.style.setProperty('--color-cosmic-background', '#0a0e17');
      root.style.setProperty('--color-cosmic-primary', '#121a2b');
      root.style.setProperty('--color-cosmic-secondary', '#1a2740');
      root.style.setProperty('--color-cosmic-accent', '#4d76e3');
      root.style.setProperty('--color-cosmic-text', '#e2e8f0');
      root.style.setProperty('--color-cosmic-background-rgb', '10, 14, 23');
      root.style.setProperty('--color-cosmic-accent-rgb', '77, 118, 227');
    } else if (themeName === 'dark') {
      root.style.setProperty('--color-cosmic-background', '#121212');
      root.style.setProperty('--color-cosmic-primary', '#1e1e1e');
      root.style.setProperty('--color-cosmic-secondary', '#2a2a2a');
      root.style.setProperty('--color-cosmic-accent', '#6ba5ff');
      root.style.setProperty('--color-cosmic-text', '#e5e5e5');
      root.style.setProperty('--color-cosmic-background-rgb', '18, 18, 18');
      root.style.setProperty('--color-cosmic-accent-rgb', '107, 165, 255');
    } else if (themeName === 'light') {
      root.style.setProperty('--color-cosmic-background', '#f5f8fa');
      root.style.setProperty('--color-cosmic-primary', '#ffffff');
      root.style.setProperty('--color-cosmic-secondary', '#e8f0fe');
      root.style.setProperty('--color-cosmic-accent', '#2563eb');
      root.style.setProperty('--color-cosmic-text', '#334155');
      root.style.setProperty('--color-cosmic-background-rgb', '245, 248, 250');
      root.style.setProperty('--color-cosmic-accent-rgb', '37, 99, 235');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Stäng menyn när sidan ändras
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-cosmic-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/" className="text-cosmic-text text-xl font-bold">
              Daily Constellation
            </Link>
          </div>

          {/* Desktop meny */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link 
              to="/" 
              className={`text-cosmic-text hover:text-cosmic-accent transition-colors ${location.pathname === '/' ? 'text-cosmic-accent' : ''}`}
            >
              Dagens bild
            </Link>
            <Link 
              to="/gallery" 
              className={`text-cosmic-text hover:text-cosmic-accent transition-colors ${location.pathname === '/gallery' ? 'text-cosmic-accent' : ''}`}
            >
              Historiskt galleri
            </Link>
            <Link 
              to="/favorites" 
              className={`text-cosmic-text hover:text-cosmic-accent transition-colors ${location.pathname === '/favorites' ? 'text-cosmic-accent' : ''}`}
            >
              Favoriter
            </Link>
            <button 
              onClick={toggleTheme}
              className="text-cosmic-text hover:text-cosmic-accent transition-colors p-2 rounded-full"
              aria-label="Byt tema"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobil meny-knapp */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-cosmic-text hover:text-cosmic-accent focus:outline-none"
              aria-label={isMenuOpen ? 'Stäng meny' : 'Öppna meny'}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobil utfällbar meny */}
        {isMenuOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-2">
            <Link 
              to="/" 
              className={`block py-2 px-4 rounded hover:bg-cosmic-background transition-colors ${location.pathname === '/' ? 'text-cosmic-accent' : 'text-cosmic-text'}`}
            >
              Dagens bild
            </Link>
            <Link 
              to="/gallery" 
              className={`block py-2 px-4 rounded hover:bg-cosmic-background transition-colors ${location.pathname === '/gallery' ? 'text-cosmic-accent' : 'text-cosmic-text'}`}
            >
              Historiskt galleri
            </Link>
            <Link 
              to="/favorites" 
              className={`block py-2 px-4 rounded hover:bg-cosmic-background transition-colors ${location.pathname === '/favorites' ? 'text-cosmic-accent' : 'text-cosmic-text'}`}
            >
              Favoriter
            </Link>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full text-left py-2 px-4 rounded hover:bg-cosmic-background transition-colors text-cosmic-text"
            >
              <span>Byt tema ({theme === 'light' ? 'Ljust' : theme === 'dark' ? 'Mörkt' : 'Kosmiskt'})</span>
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar; 