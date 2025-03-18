export interface AstronomyPicture {
  date: string;
  explanation: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  copyright?: string;
  hdurl?: string;
} 