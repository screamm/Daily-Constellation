import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-cosmic-background flex items-center justify-center">
      <div className="text-center p-8 bg-cosmic-primary rounded-lg shadow-lg max-w-md">
        <h1 className="text-4xl font-bold text-cosmic-text mb-4">404</h1>
        <div className="space-y-6 mb-4">
          <svg 
            className="w-24 h-24 mx-auto text-cosmic-accent" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 14l9-5-9-5-9 5 9 5z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" 
            />
          </svg>
          <h2 className="text-2xl font-bold text-cosmic-text">Sidan kunde inte hittas</h2>
          <p className="text-cosmic-text">
            Det ser ut som att du har flugit utanför vår galax.
            Sidan du letar efter verkar inte existera.
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-primary inline-block"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 