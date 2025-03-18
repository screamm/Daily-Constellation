// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import ConstellationInfo from './components/ConstellationInfo';
import HistoricalGallery from './components/HistoricalGallery';
import Favorites from './components/Favorites';
import NavigationBar from './components/NavigationBar';
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
    } catch (error) {
      console.error('Kunde inte initialisera tema:', error);
      // Använd cosmic-tema som fallback om något går fel
      document.documentElement.setAttribute('data-theme', 'cosmic');
    }
  }, []);

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
      </div>
    </Router>
  );
};

export default App;