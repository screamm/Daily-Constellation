import { useState, useEffect } from 'react';

interface ThemeSettings {
  theme: 'dark' | 'light' | 'cosmic';
}

const Settings = () => {
  const [settings, setSettings] = useState<ThemeSettings>({ theme: 'cosmic' });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Hämta sparade inställningar vid laddning
  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing stored settings:', error);
      }
    }
  }, []);

  // Spara inställningar till Local Storage
  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveStatus('Inställningarna har sparats!');
    
    // Uppdatera dokumentets tema
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Ta bort statusmeddelande efter 3 sekunder
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleThemeChange = (theme: 'dark' | 'light' | 'cosmic') => {
    setSettings({ ...settings, theme });
  };

  return (
    <div className="min-h-screen bg-cosmic-background">
      <header className="sticky top-0 z-50 w-full bg-cosmic-primary shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-cosmic-text">
            Inställningar
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto bg-cosmic-primary rounded-lg shadow-lg p-6">
          <h2 className="text-cosmic-text text-xl font-semibold mb-6">Anpassa din upplevelse</h2>
          
          {/* Tema-inställningar */}
          <div className="mb-8">
            <h3 className="text-cosmic-accent font-medium mb-4">Välj tema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kosmiskt tema */}
              <button
                onClick={() => handleThemeChange('cosmic')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                  settings.theme === 'cosmic'
                  ? 'border-cosmic-accent bg-cosmic-background bg-opacity-50'
                  : 'border-cosmic-primary hover:border-cosmic-accent hover:border-opacity-50'}
                  border-2 w-full h-32`}
              >
                <div className="w-12 h-12 rounded-full bg-cosmic-primary border-2 border-cosmic-accent mb-2"></div>
                <span className="text-cosmic-text">Kosmiskt</span>
              </button>
              
              {/* Mörkt tema */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                  settings.theme === 'dark'
                  ? 'border-cosmic-accent bg-cosmic-background bg-opacity-50'
                  : 'border-cosmic-primary hover:border-cosmic-accent hover:border-opacity-50'}
                  border-2 w-full h-32`}
              >
                <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border-2 border-[#6ba5ff] mb-2"></div>
                <span className="text-cosmic-text">Mörkt</span>
              </button>
              
              {/* Ljust tema */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                  settings.theme === 'light'
                  ? 'border-cosmic-accent bg-cosmic-background bg-opacity-50'
                  : 'border-cosmic-primary hover:border-cosmic-accent hover:border-opacity-50'}
                  border-2 w-full h-32`}
              >
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#2563eb] mb-2"></div>
                <span className="text-cosmic-text">Ljust</span>
              </button>
            </div>
          </div>
          
          {/* Spara-knapp */}
          <div className="flex justify-end">
            <button 
              onClick={saveSettings}
              className="px-6 py-2 bg-cosmic-accent text-cosmic-background rounded hover:bg-opacity-90 transition-colors"
            >
              Spara inställningar
            </button>
          </div>
          
          {/* Statusmeddelande */}
          {saveStatus && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500 text-green-200 rounded">
              {saveStatus}
            </div>
          )}
        </div>
        
        {/* Information om inställningar */}
        <div className="max-w-2xl mx-auto mt-8 bg-cosmic-primary rounded-lg shadow-lg p-6">
          <h3 className="text-cosmic-accent font-medium mb-4">Om inställningarna</h3>
          <p className="text-cosmic-text mb-3">
            Dina inställningar sparas lokalt i din webbläsare med Local Storage. 
            Inställningarna förblir även om du stänger webbläsaren, men de kan försvinna 
            om du rensar webbläsarens data.
          </p>
          <p className="text-cosmic-text">
            För att återställa alla inställningar till standard, använd "Rensa webbdata" i din webbläsare
            eller ta bort appens data manuellt från webbläsarens inställningar.
          </p>
        </div>
      </main>

      <footer className="mt-8 p-4 bg-cosmic-primary">
        <div className="container mx-auto text-center text-cosmic-text text-sm">
          <p>Drivs av NASA's APOD API</p>
        </div>
      </footer>
    </div>
  );
};

export default Settings; 