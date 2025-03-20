import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-cosmic-primary text-cosmic-text py-3 border-t border-cosmic-accent/10 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="mb-2 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Daily Constellation</p>
        </div>
        <div className="flex space-x-4 items-center">
          <a 
            href="https://api.nasa.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cosmic-text hover:text-cosmic-accent transition-colors"
          >
            NASA API
          </a>
          <span className="text-cosmic-text/50">|</span>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cosmic-text hover:text-cosmic-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 