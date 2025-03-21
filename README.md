# Daily Constellation 🌌

En modern webbapplikation som visar NASA:s Astronomy Picture of the Day (APOD) med möjlighet att bläddra historiskt, markera favoriter och dela på sociala medier.

![App Preview](screenshots/png/app-preview.png)

## ✨ Funktioner

- **Dagens astronomiska bild**: Se dagens bild från NASA's APOD API
- **Historiskt galleri**: Utforska bilder från specifika datum eller datumintervall
- **Favoritmarkering**: Spara dina favoritbilder för enkel åtkomst senare
- **Delningsfunktion**: Dela dagens bild på sociala medier eller kopiera länk
- **Responsiv design**: En vacker upplevelse på alla enheter
- **Tema-stöd**: Växla mellan mörkt, ljust och kosmiskt tema
- **Tangentbordsnavigation**: Fullständigt stöd för tangentbordsnavigation i bildgalleri 
- **Tillgänglighet**: ARIA-attribut och skärmläsarstöd
- **Animerad stjärnbakgrund**: Subtil och elegant kosmisk känsla

## 🛠️ Teknologier

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **API**: NASA APOD API

## 🚀 Kom igång

### Förutsättningar

- Node.js (version 14.x eller högre)
- npm eller yarn
- En API-nyckel från NASA (se instruktioner nedan)

### Installation

1. Klona detta repository:
```bash
git clone https://github.com/ditt-användarnamn/daily-constellation.git
cd daily-constellation
```

2. Installera beroenden för både backend och frontend:
```bash
npm install
cd frontend
npm install
cd ..
```

3. Skapa en `.env`-fil i backend-mappen:
```bash
cd backend
touch .env
```

4. Lägg till följande i `.env`-filen:
```
NASA_API_KEY=DEMO_KEY
PORT=4001
```

## 🔑 NASA API-nyckel

Applikationen använder NASA:s APOD API. Du kan använda "DEMO_KEY" men den har begränsningar:
- Maximalt 30 anrop per IP-adress per timme
- Maximalt 50 anrop per IP-adress per dag

För att skaffa din egen API-nyckel utan dessa begränsningar:

1. Besök [NASA API Portal](https://api.nasa.gov/)
2. Fyll i formuläret
3. Du får en API-nyckel skickad till din e-post
4. Uppdatera `.env`-filen med din nya nyckel:
   ```
   NASA_API_KEY=din_api_nyckel_här
   ```

### Starta applikationen

För att starta både frontend och backend samtidigt:

```bash
npm run dev
```

Detta kommer att starta:
- Backend på http://localhost:4001
- Frontend på http://localhost:5174

Du kan också starta dem separat:

```bash
# Endast backend
npm run start:backend

# Endast frontend
npm run start:frontend
```

## 📱 Användning

När applikationen är igång kan du:

1. Bläddra mellan olika vyer via navigationsfältet
2. Se dagens astronomiska bild på startsidan
3. Markera bilder som favoriter genom att klicka på stjärnikonen
4. Dela bilder genom att klicka på delningsikonen
5. Utforska historiska bilder genom att besöka gallerisidan och välja datumintervall
6. Använd piltangenterna för att navigera i bildgalleriet

## 📷 Skärmdumpar

![Hem-vy](screenshots/png/home-view.png)
*Huvudvyn visar dagens astronomiska bild/video från NASA*

![Galleri-vy](screenshots/png/gallery-view.png)
*Galleri-vyn där du kan utforska historiska bilder*

![Favorit-vy](screenshots/png/favorites-view.png)
*Favorit-vyn där du kan se dina sparade bilder*

## 📝 Lägga till egna skärmdumpar

För att lägga till skärmdumpar som visas korrekt på GitHub:

1. Ta en skärmdump av din applikation
2. Spara bilden i PNG-format i mappen `screenshots/png/`
3. Lägg till bilden i README.md med följande Markdown-syntax:
   ```markdown
   ![Beskrivning av din bild](screenshots/png/filnamn.png)
   ```
4. För att lägga till bildtext, lägg till en asterisk-rad direkt under bilden:
   ```markdown
   *Detta är en beskrivande bildtext*
   ```

5. Commita och pusha ändringarna till GitHub:
   ```bash
   git add screenshots/png/filnamn.png README.md
   git commit -m "Lägger till skärmdump av [funktionen]"
   git push
   ```

## 🔄 Arbetsflöde

Applikationen fungerar enligt följande:
1. Frontend skickar en förfrågan till backend-API:et
2. Backend hämtar data från NASA:s APOD API med din API-nyckel
3. Datan skickas tillbaka till frontend och visas för användaren
4. Bilden/videon och beskrivningen uppdateras varje dag när NASA publicerar nytt innehåll

## 🚧 Felsökning

Om du stöter på problem:

1. Kontrollera att både frontend och backend körs
2. Verifiera att din NASA API-nyckel är korrekt i .env-filen
3. Se till att port 4001 är tillgänglig för backend-servern
4. Kontrollera att ts-node är installerat: `npm install -D ts-node typescript`
5. Om du ser "Failed to fetch astronomy picture", kan det bero på att backend-servern inte svarar
6. Kontrollera att alla färger är definierade i `tailwind.config.js` om du får CSS-fel

## 📄 Licens

Detta projekt är licensierat under MIT-licensen - se [LICENSE](LICENSE) filen för mer information.

## 👨‍💻 Bidrag

Bidrag, problem och förfrågningar välkomnas! Tveka inte att checka ut [issues page](https://github.com/yourusername/Daily-Constellation/issues).

---

Skapat med ❤️ av [Ditt Namn] 