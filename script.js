document.addEventListener('DOMContentLoaded', () => {

    // ====================================
    // Allgemeine Funktionen
    // ====================================

    // Smooth Scrolling für Navigationslinks
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Manuelle Offset-Berechnung ist nicht nötig, da 'scroll-padding-top' im CSS die Fixierung übernimmt.
                window.scrollTo({
                    top: targetElement.offsetTop, 
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header Funktionalität (fixieren und kompakte Ansicht beim Scrollen)
    const header = document.querySelector('header');
    const toggleHeaderCompact = () => {
        if (window.scrollY > 50) {
            header.classList.add('compact');
        } else {
            header.classList.remove('compact');
        }
    };
    
    window.addEventListener('scroll', toggleHeaderCompact);
    // Initialer Check, falls die Seite nicht ganz oben geladen wird
    toggleHeaderCompact();
    
    // Cookie-Consent Logik
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    
    if (localStorage.getItem('cookiesAccepted') !== 'true') {
        cookieConsent.style.display = 'block';
    } else {
        cookieConsent.style.display = 'none';
    }
    
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.style.display = 'none';
        });
    }
    
    // Scroll-To-Top Button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    const toggleScrollToTop = () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    };
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    window.addEventListener('scroll', toggleScrollToTop);
    toggleScrollToTop(); // Initialer Check

    // ====================================
    // SPIELPLAN LOGIK
    // ====================================
    
    /**
     * Lädt die Spieldaten aus spiele.json und aktualisiert das Highlight/die Liste.
     */
    function displayUpcomingGames() {
        const highlightElement = document.getElementById('next-game-highlight');
        const listElement = document.getElementById('upcoming-games-list');
        const toggleBtn = document.getElementById('toggle-games-btn');

        // Sicherstellen, dass die Elemente existieren
        if (!highlightElement || !listElement) {
            return;
        }

        // Zeigt "Lade..." an
        highlightElement.innerHTML = '<div class="card-content"><p class="loading-text">Lade Spielplan...</p></div>';
        listElement.innerHTML = '';


        fetch('spiele.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const now = new Date();

                // Filtern: Nur zukünftige Spiele
                const upcomingGames = data.filter(spiel => new Date(spiel.datum) > now);

                if (upcomingGames.length > 0) {
                    // 1. Das nächste Spiel (Highlight)
                    const nextGame = upcomingGames[0];
                    const nextGameDate = new Date(nextGame.datum);

                    // Ort-Kürzel für Highlight
                    const ortKuerzelHighlight = nextGame.ort === 'Heimspiel' ? 'HEIMSPIEL' : 'AUSWÄRTS';
                    const highlightHTML = `
                        <div class="card-content">
                            <div class="highlight-date">${nextGameDate.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <div class="highlight-opponent">vs. ${nextGame.gegner}</div>
                            <div class="highlight-details">${ortKuerzelHighlight} | ${nextGameDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr | ${nextGame.arena}</div>
                        </div>
                    `;
                    highlightElement.innerHTML = highlightHTML;

                    // 2. Die restlichen Spiele (Liste)
                    const remainingGames = upcomingGames.slice(1); // Alle außer dem ersten
                    
                    if (remainingGames.length > 0) {
                        // Zeigt den Button an, wenn es mehr als ein Spiel gibt
                        if (toggleBtn) {
                            toggleBtn.style.display = 'inline-block';
                        }
                        
                        const listHTML = remainingGames.map(spiel => {
                            const gameDate = new Date(spiel.datum);
                            const ortKuerzel = spiel.ort === 'Heimspiel' ? 'H' : 'A';
                            
                            return `
                                <div class="game-item">
                                    <div class="date-info">${gameDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} | ${gameDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div class="opponent-info">
                                        vs. ${spiel.gegner}
                                    </div>
                                    <div class="location-info">
                                        ${ortKuerzel} (${spiel.arena})
                                    </div>
                                </div>
                            `;
                        }).join('');
                        listElement.innerHTML = listHTML;
                    } else {
                         listElement.innerHTML = '<p class="loading-text" style="color: #f0f0f0;">Keine weiteren Spiele in der Liste.</p>';
                         if (toggleBtn) {
                            toggleBtn.style.display = 'none'; // Versteckt den Button, wenn nur ein Spiel da ist
                        }
                    }
                } else {
                    // Keine kommenden Spiele
                    highlightElement.innerHTML = '<div class="card-content"><div class="highlight-title">KEINE SPIELE</div><div class="highlight-opponent">Aktuell sind keine weiteren Spiele geplant.</div></div>';
                    listElement.innerHTML = '';
                    if (toggleBtn) {
                        toggleBtn.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                // Fehlerbehandlung falls die Datei nicht geladen werden konnte
                console.error('Fehler beim Laden der Spieldaten:', error);
                if (highlightElement) {
                    highlightElement.innerHTML = `
                        <div class="card-content">
                            <div class="highlight-title">FEHLER!</div>
                            <div class="highlight-opponent">Daten konnten nicht geladen werden.</div>
                            <div class="highlight-details">Bitte prüfen Sie, ob die Datei 'spiele.json' im richtigen Ordner liegt.</div>
                        </div>
                    `;
                }
                if (listElement) {
                    listElement.innerHTML = '';
                }
            });

    }
    
    // ====================================
    // NEUE FUNKTION: Ausklapp-Logik für Spiele
    // ====================================
    function setupToggleGames() {
        const toggleBtn = document.getElementById('toggle-games-btn');
        const listContainer = document.getElementById('upcoming-games-list-container');

        if (toggleBtn && listContainer) {
            // Event-Listener für den Klick
            toggleBtn.addEventListener('click', () => {
                const isActive = listContainer.classList.toggle('active');
                toggleBtn.classList.toggle('active');

                if (isActive) {
                    toggleBtn.textContent = 'Weitere Spiele ausblenden ▲';
                } else {
                    toggleBtn.textContent = 'Alle weiteren Spiele anzeigen ▼';
                }
            });

            // Setzt den Button-Text initial korrekt (wird in displayUpcomingGames() angepasst)
            toggleBtn.textContent = 'Alle weiteren Spiele anzeigen ▼';
        }
    }


    displayUpcomingGames();

    // Führt die Funktion alle 5 Minuten (300.000 Millisekunden) erneut aus,
    // um neue Daten abzurufen und das Highlight automatisch zu aktualisieren.
    setInterval(displayUpcomingGames, 300000); 
    
    // Initialisiert die Ausklapp-Logik
    setupToggleGames(); 

});