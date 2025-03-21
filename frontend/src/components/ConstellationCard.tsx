import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { IAstronomyPicture } from '../types';

interface ConstellationCardProps {
  astronomyPicture: IAstronomyPicture;
}

const ConstellationCard: React.FC<ConstellationCardProps> = ({ astronomyPicture }) => {
  const formattedDate = format(new Date(astronomyPicture.date), 'd MMMM yyyy', { locale: sv });
  
  return (
    <div 
      className="constellation-card bg-cosmic-primary rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-cosmic-border hover:border-cosmic-accent-soft gallery-item"
      tabIndex={0}
    >
      <Link 
        to={`/day/${astronomyPicture.date}`} 
        className="block gallery-item-link"
        aria-label={`${astronomyPicture.title}, publicerad ${formattedDate}`}
      >
        <div className="relative pb-[75%] overflow-hidden bg-cosmic-secondary">
          <img 
            src={astronomyPicture.url} 
            alt={astronomyPicture.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cosmic-primary/90 to-transparent p-3">
            <h3 className="text-lg font-medium text-cosmic-text truncate">
              {astronomyPicture.title}
            </h3>
            <p className="text-sm text-cosmic-text text-opacity-80">
              {formattedDate}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ConstellationCard; 