// src/services/demoService.ts
// Innehåller exempeldata för att visa när NASA API inte är tillgängligt

import { format, subDays } from 'date-fns';

// AstronomyPicture interface
interface AstronomyPicture {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

// Exempelbild för dagens datum
export const getDemoTodayPicture = (): AstronomyPicture => {
  const today = new Date();
  const formattedDate = format(today, 'yyyy-MM-dd');
  
  return {
    date: formattedDate,
    explanation: "Detta är exempeldata som visas eftersom NASA API är otillgängligt. NASA:s Astronomy Picture of the Day (APOD) visar varje dag en ny spektakulär astronomisk bild tillsammans med en kort förklaring skriven av en astronom. För att se riktiga bilder, vänligen skaffa en egen API-nyckel på https://api.nasa.gov/ och uppdatera .env-filen.",
    hdurl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1400&auto=format&fit=crop",
    media_type: "image",
    service_version: "v1",
    title: "Exempelbild - Norrsken över Kanada",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop",
    copyright: "Exempeldata (Unsplash)"
  };
};

// Demobild för ett specifikt datum
export const getDemoDatePicture = (date: string): AstronomyPicture => {
  return {
    date: date,
    explanation: "Detta är exempeldata för ett historiskt datum som visas eftersom NASA API är otillgängligt. För att se riktiga bilder, vänligen skaffa en egen API-nyckel på https://api.nasa.gov/ och uppdatera .env-filen.",
    hdurl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1400&auto=format&fit=crop",
    media_type: "image",
    service_version: "v1",
    title: "Exempelbild - Galax",
    url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=800&auto=format&fit=crop",
    copyright: "Exempeldata (Unsplash)"
  };
};

// Demo bildgalleri för ett datumintervall
export const getDemoRangePictures = (startDate: string, endDate: string): AstronomyPicture[] => {
  // Skapa några exempel-bilder
  const demoImages: AstronomyPicture[] = [
    {
      date: startDate,
      explanation: "Detta är den första exempelbilden i ett intervall. För att se riktiga bilder, vänligen skaffa en egen API-nyckel på https://api.nasa.gov/.",
      hdurl: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=1400&auto=format&fit=crop",
      media_type: "image",
      service_version: "v1",
      title: "Exempelbild 1 - Universum",
      url: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=800&auto=format&fit=crop"
    },
    {
      date: format(subDays(new Date(startDate), 1), 'yyyy-MM-dd'),
      explanation: "Detta är den andra exempelbilden i ett intervall. För att se riktiga bilder, vänligen skaffa en egen API-nyckel på https://api.nasa.gov/.",
      hdurl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1400&auto=format&fit=crop",
      media_type: "image",
      service_version: "v1",
      title: "Exempelbild 2 - Nebulosa",
      url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop",
      copyright: "Unsplash"
    },
    {
      date: format(subDays(new Date(startDate), 2), 'yyyy-MM-dd'),
      explanation: "Detta är den tredje exempelbilden i ett intervall. För att se riktiga bilder, vänligen skaffa en egen API-nyckel på https://api.nasa.gov/.",
      hdurl: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1400&auto=format&fit=crop",
      media_type: "image",
      service_version: "v1",
      title: "Exempelbild 3 - Stjärnor",
      url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=800&auto=format&fit=crop",
      copyright: "Unsplash"
    },
    {
      date: endDate,
      explanation: "Detta är den sista exempelbilden i ett intervall. För att se riktiga bilder, vänligen skaffa en egen API-nyckel på https://api.nasa.gov/.",
      hdurl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1400&auto=format&fit=crop",
      media_type: "image",
      service_version: "v1",
      title: "Exempelbild 4 - Rymden",
      url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop"
    }
  ];
  
  return demoImages;
};

// Slumpmässig bild för randomfunktionen
export const getDemoRandomPicture = (): AstronomyPicture => {
  const randomDate = format(new Date(2000 + Math.floor(Math.random() * 23), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)), 'yyyy-MM-dd');
  
  return {
    date: randomDate,
    explanation: "Detta är en slumpmässig exempelbild som visas eftersom NASA API är otillgängligt. För att se riktiga bilder, vänligen skaffa en egen API-nyckel på https://api.nasa.gov/.",
    hdurl: "https://images.unsplash.com/photo-1532798442725-41036acc7489?q=80&w=1400&auto=format&fit=crop",
    media_type: "image",
    service_version: "v1",
    title: "Exempelbild - Stjärnfall",
    url: "https://images.unsplash.com/photo-1532798442725-41036acc7489?q=80&w=800&auto=format&fit=crop",
    copyright: "Exempeldata (Unsplash)"
  };
}; 