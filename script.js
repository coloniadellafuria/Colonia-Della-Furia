// ==========================================================
// Allgemeine JavaScript-Funktionalität für die Website
// ==========================================================

// 1. Spiele-Lade-Funktion (VISUELL ÜBERARBEITET)
function loadUpcomingGames() {
    const container = document.getElementById('upcoming-games-container');
    if (!container) return; // Stoppt, wenn der Container nicht gefunden wird

    // fetch('spiele.json') geht davon aus, dass die Datei existiert und korrekt ist
    // Da ich die Datei spiele.json nicht direkt bearbeiten kann, bleibe ich bei der fetch-Logik
    fetch('spiele.json')
        .then(response => {
            if (!response.ok) {
                // Bei einem HTTP-Fehler (z.B. 404 Datei nicht gefunden)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 1. Spiele filtern: Nur zukünftige Spiele anzeigen (max. 3)
            const now = new Date();
            const upcomingGames = data.filter(game => {
                // 'datum' liegt im ISO-Format vor: "YYYY-MM-DDT19:30:00"
                const gameDate = new Date(game.datum);
                // Spiel ist zukünftig, wenn die Zeit + 1 Minute (für Puffer) > aktuelle Zeit
                return gameDate.getTime() > now.getTime();
            }).slice(0, 3); // Die nächsten 3 Spiele anzeigen

            if (upcomingGames.length === 0) {
                 // Zeige eine Nachricht, wenn keine Spiele gefunden wurden
                 container.innerHTML = '<p style="text-align: center; width: 100%; margin: 20px 0; font-size: 1.1em; color: #aaa;">Derzeit sind keine aktuellen Spiele geplant oder die Saison ist beendet.</p>';
                 return;
            }
            
            let gamesHTML = '';

            // 2. Spiele rendern
            upcomingGames.forEach(game => {
                const gameDateTime = new Date(game.datum);
                
                // Datum formatieren: z.B. "SO 12. NOV" (Oswald Schriftstil)
                const dateOptions = { weekday: 'short', day: '2-digit', month: 'short' };
                // Wochentag in DE (So), Punkt entfernen, Großbuchstaben
                const formattedDate = gameDateTime.toLocaleDateString('de-DE', dateOptions).replace('.', '').toUpperCase(); 

                // Uhrzeit formatieren: z.B. "19:30"
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
                const formattedTime = gameDateTime.toLocaleTimeString('de-DE', timeOptions);
                
                const isHomeGame = game.ort === 'Heimspiel';
                const locationDisplay = isHomeGame ? 'LANXESS arena' : game.arena;
                
                // Neue Game Card Struktur
                gamesHTML += `
                    <div class="game-card ${isHomeGame ? 'game-card-home' : 'game-card-away'}">
                        <div class="game-date-time-box">
                            <p class="game-day">${formattedDate.split(',')[0].trim()}</p>
                            <p class="game-date">${formattedDate.split(',')[1].trim()}</p>
                            <p class="game-time">${formattedTime}</p>
                        </div>
                        <div class="game-details">
                            <span class="game-tag">${isHomeGame ? 'HEIMSPIEL' : 'AUSWÄRTS'}</span>
                            <h4 class="game-opponent">vs. ${game.gegner}</h4>
                            <p class="game-location">Ort: ${locationDisplay}</p>
                            <a href="aktuelles.html" class="cta-button game-cta">Zum Spielplan</a>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = gamesHTML;
        })
        .catch(error => {
            console.error("Fehler beim Laden der Spiele:", error);
            // Zeige eine Fehlermeldung, wenn die Datei nicht geladen werden konnte
            container.innerHTML = '<p style="text-align: center; width: 100%; margin: 20px 0; color: #FF0000;">Aktuelle Spiele konnten nicht geladen werden. Fehler beim Abrufen der spiele.json.</p>';
        });
}


// Führt alle Skripte aus, sobald das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Spiele laden ---
    loadUpcomingGames(); 
    
    // --- 2. Cookie Consent Logic ---
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    
    if (localStorage.getItem('cookiesAccepted') !== 'true') {
        if (cookieConsent) cookieConsent.style.display = 'block';
    } else {
        if (cookieConsent) cookieConsent.style.display = 'none'; // Verstecke, falls schon akzeptiert
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            if (cookieConsent) cookieConsent.style.display = 'none';
        });
    }

    // --- 3. Scroll-to-Top Button Logic ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    window.onscroll = function() { scrollFunction() };

    function scrollFunction() {
        if (scrollToTopBtn) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        }
    }

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // --- 4. Fixed Navigation Logic ---
    const nav = document.querySelector('.main-nav');
    if (nav) {
        // Berechne die Höhe des Headers dynamisch
        const headerHeight = document.querySelector('header').offsetHeight; 
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > headerHeight) {
                nav.classList.add('fixed-compact-nav');
            } else {
                nav.classList.remove('fixed-compact-nav');
            }
        });
    }
});