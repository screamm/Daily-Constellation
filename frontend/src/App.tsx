// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import ConstellationInfo from './components/ConstellationInfo';
import HistoricalGallery from './components/HistoricalGallery';
import Favorites from './components/Favorites';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import './App.css';

const App = () => {
  useEffect(() => {
    try {
      // Initiera tema från localStorage eller använd default
      const savedTheme = localStorage.getItem('theme') || 'cosmic';
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      // Applicera temat direkt via CSS-variabler för extra säkerhet
      const root = document.documentElement;
      
      // Grundläggande tema-stilar som fallback
      if (savedTheme === 'cosmic') {
        root.style.setProperty('--color-cosmic-background', '#0a0e17');
        root.style.setProperty('--color-cosmic-primary', '#121a2b');
        root.style.setProperty('--color-cosmic-accent', '#4d76e3');
        root.style.setProperty('--color-cosmic-text', '#e2e8f0');
      } else if (savedTheme === 'dark') {
        root.style.setProperty('--color-cosmic-background', '#121212');
        root.style.setProperty('--color-cosmic-primary', '#1e1e1e');
        root.style.setProperty('--color-cosmic-accent', '#6ba5ff');
        root.style.setProperty('--color-cosmic-text', '#e5e5e5');
      } else if (savedTheme === 'light') {
        root.style.setProperty('--color-cosmic-background', '#f5f8fa');
        root.style.setProperty('--color-cosmic-primary', '#ffffff');
        root.style.setProperty('--color-cosmic-accent', '#2563eb');
        root.style.setProperty('--color-cosmic-text', '#334155');
      }
      
      // Lägg till stjärnanimationsvariabler
      root.style.setProperty('--twinkle-duration', '4s');
      root.style.setProperty('--star-opacity', savedTheme === 'light' ? '0.3' : '0.8');
      root.style.setProperty('--glow-opacity', savedTheme === 'light' ? '0.1' : '0.3');
      
      // Skapa stjärnor dynamiskt om de inte redan finns
      if (!document.querySelector('.starry-background')) {
        createStarryBackground();
      }
    } catch (error) {
      console.error('Fel vid initialisering av tema:', error);
    }
  }, []);

  // Skapa den animerade stjärnbakgrunden
  const createStarryBackground = () => {
    const starryBackground = document.createElement('div');
    starryBackground.className = 'starry-background';
    starryBackground.setAttribute('aria-hidden', 'true');
    
    // Skapa mellan 100-200 stjärnor
    const starCount = Math.floor(Math.random() * 100) + 100;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Slumpmässig position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Slumpmässig storlek
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Slumpmässig blinkfördröjning
      star.style.animationDelay = `${Math.random() * 4}s`;
      
      // Slumpmässig blinktid
      const twinkleDuration = 3 + Math.random() * 5;
      star.style.setProperty('--twinkle-duration', `${twinkleDuration}s`);
      
      starryBackground.appendChild(star);
    }
    
    // Lägg till stjärnbakgrunden som första barn i body-elementet
    document.body.insertBefore(starryBackground, document.body.firstChild);
  };

  return (
    <Router>
      <div className="app-container">
        <NavigationBar />
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<ConstellationInfo />} />
            <Route path="/day/:date" element={<ConstellationInfo />} />
            <Route path="/gallery" element={<HistoricalGallery />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;