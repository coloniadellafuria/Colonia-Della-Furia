document.addEventListener('DOMContentLoaded', () => {

    // ====================================
    // WARENKORB LOGIK
    // ====================================
    
    const CART_STORAGE_KEY = 'coloniaFuriaCart';

    /**
     * Lädt den Warenkorb aus dem localStorage.
     * @returns {Array} Array von Warenkorb-Artikeln.
     */
    function getCart() {
        const cartString = localStorage.getItem(CART_STORAGE_KEY);
        return cartString ? JSON.parse(cartString) : [];
    }

    /**
     * Speichert den aktuellen Warenkorb im localStorage.
     * @param {Array} cart - Array von Warenkorb-Artikeln.
     */
    function saveCart(cart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
        if (document.getElementById('cart-section')) {
            renderCart();
        }
    }

    /**
     * Aktualisiert die Anzahl der Artikel im Warenkorb (in der Navigationsleiste).
     */
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const countElements = document.querySelectorAll('#cart-count-nav');
        countElements.forEach(el => el.textContent = totalItems);
    }
    
    /**
     * Zeigt eine Toast-Benachrichtigung an.
     * @param {string} message - Die anzuzeigende Nachricht.
     */
    function showToast(message) {
        const toast = document.getElementById('toastNotification');
        if (toast) {
             toast.textContent = message;
             toast.classList.add('show');
             setTimeout(() => {
                 toast.classList.remove('show');
             }, 3000);
        }
    }

    /**
     * Fügt ein Produkt zum Warenkorb hinzu.
     * @param {string} id - Produkt-ID.
     * @param {string} name - Produkt-Name.
     * @param {string} description - Produkt-Beschreibung.
     */
    function addToCart(id, name, description) {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, description, quantity: 1 });
        }

        saveCart(cart);
        showToast(`${name} wurde zum Warenkorb hinzugefügt!`);
    }
    
    /**
     * Entfernt einen Artikel aus dem Warenkorb.
     * @param {string} id - Produkt-ID.
     */
    function removeFromCart(id) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
    }

    /**
     * Leert den gesamten Warenkorb.
     */
    function clearCart() {
        saveCart([]);
        showToast('Warenkorb geleert.');
        renderCart(); // Neu rendern, um die leere Liste anzuzeigen
    }
    
    /**
     * Erstellt eine Bestell-E-Mail und leert den Warenkorb.
     */
    function createOrderEmail() {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Ihr Warenkorb ist leer!');
            return;
        }

        const subject = 'Bestellanfrage Colonia Della Furia';
        let body = 'Hallo,\n\nich möchte die folgenden Artikel bestellen (Anfrage):\n\n';
        let totalItems = 0;

        cart.forEach((item, index) => {
            body += `${index + 1}. ${item.name} (ID: ${item.id})\n`;
            body += `   Menge: ${item.quantity}\n`;
            body += `   Beschreibung: ${item.description}\n\n`;
            totalItems += item.quantity;
        });

        body += `\nGesamtanzahl Artikel: ${totalItems}`;
        body += `\n\n--- BITTE HIER IHRE KONTAKTDATEN HINZUFÜGEN ---\n`;
        body += `Name:\n`;
        body += `E-Mail:\n`;
        body += `Telefon (optional):\n`;
        body += `Adresse:\n`;
        body += `Sonstige Anmerkungen (Größen, etc.):\n`;

        const mailtoLink = `mailto:coloniadellafuria1972@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Öffne das E-Mail-Programm
        window.location.href = mailtoLink;

        // Leere den Warenkorb nach dem Senden (optional, kann auch nach Bestätigung erfolgen)
        // clearCart();
        
        // Statt des automatischen Leerens nach dem Klick, eine Bestätigung
        alert('Ihre Bestell-Anfrage wurde vorbereitet. Bitte senden Sie die E-Mail ab und leeren Sie danach Ihren Warenkorb manuell.');
    }
    
    /**
     * Rendert den Warenkorb auf der warenkorb.html Seite.
     */
    function renderCart() {
        const cart = getCart();
        const listElement = document.getElementById('cart-items');
        const totalItemsElement = document.getElementById('cart-total-items');
        const cartContent = document.getElementById('cart-content');
        const emptyMessage = document.getElementById('empty-cart-message');

        if (!listElement) return;

        if (cart.length === 0) {
            cartContent.style.display = 'none';
            emptyMessage.style.display = 'block';
            listElement.innerHTML = '';
            totalItemsElement.textContent = '0';
        } else {
            cartContent.style.display = 'block';
            emptyMessage.style.display = 'none';

            let listHTML = '';
            let totalItems = 0;

            cart.forEach(item => {
                totalItems += item.quantity;
                listHTML += `
                    <li class="cart-item">
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <span class="item-description">(${item.description})</span>
                        </div>
                        <div class="item-quantity">
                            Menge: ${item.quantity}
                        </div>
                        <button class="remove-btn" data-id="${item.id}">Entfernen</button>
                    </li>
                `;
            });

            listElement.innerHTML = listHTML;
            totalItemsElement.textContent = totalItems;
        }
    }


    // ====================================
    // SPIELPLAN LOGIK
    // ====================================

    /**
     * Formatiert Datum und Uhrzeit aus dem ISO-Format.
     * @param {string} isoString - Das ISO-Datum aus der JSON.
     * @returns {{dateStr: string, timeStr: string, isPast: boolean}}
     */
    function formatGameDate(isoString) {
        const gameDate = new Date(isoString);
        const now = new Date();
        const isPast = gameDate < now;

        const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };

        const dateStr = gameDate.toLocaleDateString('de-DE', dateOptions);
        const timeStr = gameDate.toLocaleTimeString('de-DE', timeOptions).substring(0, 5); // Kürzt Sekunden ab

        return { dateStr, timeStr, isPast };
    }

    /**
     * Sucht das nächste Spiel und zeigt den Spielplan an.
     */
    function displayUpcomingGames() {
        const highlightElement = document.getElementById('next-game-highlight');
        const listElement = document.getElementById('upcoming-games-list');
        const listContainer = document.getElementById('upcoming-games-list-container');
        const toggleBtn = document.getElementById('toggle-games-btn');

        if (!highlightElement || !listElement) return;

        // Lädt die JSON-Datei
        fetch('./spiele.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netzwerk-Antwort war nicht ok.');
                }
                return response.json();
            })
            .then(data => {
                const upcomingGames = data
                    .filter(spiel => !formatGameDate(spiel.datum).isPast)
                    .sort((a, b) => new Date(a.datum) - new Date(b.datum));

                // 1. Highlight-Spiel
                if (upcomingGames.length > 0) {
                    const highlightGame = upcomingGames[0];
                    const { dateStr, timeStr } = formatGameDate(highlightGame.datum);
                    
                    // KORRIGIERTE LOGIK FÜR DAS HIGHLIGHT
                    const highlightOrtKuerzel = highlightGame.ort === 'Heimspiel' ? 'HEIM' : 'AUSWÄRTS';

                    highlightElement.innerHTML = `
                        <div class="card-content">
                            <div class="highlight-title">Nächstes Spiel</div>
                            <div class="highlight-opponent">${highlightGame.gegner}</div>
                            <div class="highlight-details">
                                <span class="highlight-date-time">${dateStr}, ${timeStr} Uhr</span>
                                <span class="highlight-location">${highlightOrtKuerzel} (${highlightGame.arena})</span>
                            </div>
                        </div>
                    `;
                    
                } else {
                    highlightElement.innerHTML = `
                        <div class="card-content">
                            <div class="highlight-title">Keine Spiele gefunden</div>
                            <div class="highlight-opponent">Die Saison ist möglicherweise beendet oder der Spielplan ist noch nicht verfügbar.</div>
                        </div>
                    `;
                }

                // 2. Liste der restlichen Spiele
                const remainingGames = upcomingGames.slice(1);
                
                if (remainingGames.length > 0) {
                    
                    // Setzt den Button-Text korrekt basierend auf dem Status
                    if (toggleBtn) {
                        toggleBtn.textContent = listContainer.classList.contains('active') 
                            ? 'Weitere Spiele ausblenden ▲' 
                            : 'Alle weiteren Spiele anzeigen ▼';
                    }
                    
                    let listHTML = '';
                    remainingGames.forEach((spiel) => {
                        const { dateStr, timeStr } = formatGameDate(spiel.datum);
                        
                        // KORRIGIERTE LOGIK FÜR DIE LISTE
                        // Dies war die Zeile, die zuvor nur 'H' oder 'A' ausgegeben hat.
                        const ortKuerzel = spiel.ort === 'Heimspiel' ? 'HEIM' : 'AUSWÄRTS';
                        
                        listHTML += `
                            <div class="list-item">
                                <div class="date-time">${dateStr} / ${timeStr}</div>
                                <div class="opponent-name">${spiel.gegner}</div>
                                <div class="location-info">
                                    ${ortKuerzel} (${spiel.arena})
                                </div>
                            </div>
                        `;
                    });
                    listElement.innerHTML = listHTML;
                } else {
                     listElement.innerHTML = '<p class="loading-text">Keine weiteren Spiele in der Liste.</p>';
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


    // ====================================
    // INIT & Allgemeine Funktionen
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
    
    if (cookieConsent && acceptCookiesBtn) {
        if (localStorage.getItem('cookieConsent') !== 'accepted') {
            cookieConsent.style.display = 'flex';
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.style.display = 'none';
        });
    }


    // Warenkorb: Event Listener für "In den Warenkorb" Buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const name = button.dataset.name;
            const description = button.dataset.description;
            addToCart(id, name, description);
        });
    });

    // Warenkorb: Event Listener für "Entfernen" Buttons (auf der warenkorb.html Seite)
    const cartItemsElement = document.getElementById('cart-items');
    if (cartItemsElement) {
        cartItemsElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const id = e.target.dataset.id;
                removeFromCart(id);
            }
        });
    }

    // 3. Warenkorb leeren Button
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // 4. Bestell-Anfrage Button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', createOrderEmail);
    }

    // Zurück nach oben Button Logik
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // INIT der Warenkorb-Logik
    updateCartCount();

    // Rendere den Warenkorb nur, wenn wir auf der warenkorb.html Seite sind
    if (document.getElementById('cart-section')) {
        renderCart();
    }


    // INIT des Spielplans
    displayUpcomingGames();

    // Führt die Funktion alle 5 Minuten (300.000 Millisekunden) erneut aus,
    // um neue Daten abzurufen und das Highlight automatisch zu aktualisieren.
    setInterval(displayUpcomingGames, 300000); 
    
    // Initialisiert die Ausklapp-Logik
    setupToggleGames(); 

});