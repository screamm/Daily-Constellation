import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Funktion för att avgöra om en länk är aktiv
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Stäng menyn när man klickar på en länk (för mobilvy)
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-cosmic-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logotyp */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <span className="text-2xl text-cosmic-accent">★</span>
              <span className="text-xl font-bold text-cosmic-text">Daily Constellation</span>
            </Link>
          </div>

          {/* Desktop-navigering */}
          <div className="hidden md:flex md:space-x-6">
            <Link 
              to="/" 
              className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/') ? 'bg-cosmic-background bg-opacity-20 px-2 rounded' : ''}`}
            >
              Dagens bild
            </Link>
            
            <Link 
              to="/gallery" 
              className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/gallery') ? 'bg-cosmic-background bg-opacity-20 px-2 rounded' : ''}`}
            >
              Historiskt galleri
            </Link>
            
            <Link 
              to="/favorites" 
              className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/favorites') ? 'bg-cosmic-background bg-opacity-20 px-2 rounded' : ''}`}
            >
              Favoriter
            </Link>
            
            <Link 
              to="/settings" 
              className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/settings') ? 'bg-cosmic-background bg-opacity-20 px-2 rounded' : ''}`}
            >
              Inställningar
            </Link>
          </div>

          {/* Hamburgarmenyn - Mobil */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-cosmic-text hover:text-cosmic-accent focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobil navigering */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                onClick={closeMenu}
                className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/') ? 'bg-cosmic-background/20 px-2 rounded' : ''}`}
              >
                Dagens bild
              </Link>
              <Link 
                to="/gallery" 
                onClick={closeMenu}
                className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/gallery') ? 'bg-cosmic-background/20 px-2 rounded' : ''}`}
              >
                Galleri
              </Link>
              <Link 
                to="/favorites" 
                onClick={closeMenu}
                className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/favorites') ? 'bg-cosmic-background/20 px-2 rounded' : ''}`}
              >
                Favoriter
              </Link>
              <Link 
                to="/settings" 
                onClick={closeMenu}
                className={`text-cosmic-text hover:text-cosmic-accent transition-colors py-2 ${isActive('/settings') ? 'bg-cosmic-background/20 px-2 rounded' : ''}`}
              >
                Inställningar
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 