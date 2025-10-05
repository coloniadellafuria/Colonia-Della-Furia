document.addEventListener('DOMContentLoaded', () => {

    // ===================================
    // WARENKORB LOGIK
    // ===================================
    
    const CART_STORAGE_KEY = 'coloniaFuriaCart';

    /**
     * Lädt den Warenkorb aus dem localStorage.
     * @returns {Array} Array von Warenkorb-Artikeln.
     */
    function getCart() {
        const cartString = localStorage.getItem(CART_STORAGE_KEY);
        // Stellt sicher, dass ein Array zurückgegeben wird
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
        // Berechnet die Gesamtanzahl der Produkte im Warenkorb
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const countElements = document.querySelectorAll('#cart-count-nav');
        // Aktualisiert alle Elemente mit der ID #cart-count-nav (z.B. in der mobilen und Desktop-Navigation)
        countElements.forEach(el => el.textContent = totalItems);
    }
    
    /**
     * Zeigt eine kurze Benachrichtigung (Toast) an.
     * @param {string} message - Die anzuzeigende Nachricht.
     */
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');
        
        // Entfernt die 'show' Klasse nach 3 Sekunden, um die Benachrichtigung auszublenden
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Fügt ein Produkt zum Warenkorb hinzu oder erhöht die Menge, wenn es bereits existiert.
     * @param {Object} product - Das Produktobjekt mit id, name, description und price.
     */
    function addToCart(product) {
        let cart = getCart();
        // Sucht nach dem Produkt im Warenkorb
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Fügt das neue Produkt hinzu mit einer Startmenge von 1
            // product enthält nun auch den Preis
            cart.push({ ...product, quantity: 1 });
        }

        saveCart(cart);
        // NEU: Die Bestätigungsnachricht wurde hier angepasst.
        showToast(`✔ ${product.name} erfolgreich hinzugefügt!`);
    }

    /**
     * Entfernt ein Produkt vollständig aus dem Warenkorb.
     * @param {string} id - Die ID des zu entfernenden Produkts.
     */
    function removeFromCart(id) {
        let cart = getCart();
        const newCart = cart.filter(item => item.id !== id);
        saveCart(newCart);
        showToast("Artikel entfernt.");
    }
    
    /**
     * Aktualisiert die Menge eines Produkts im Warenkorb.
     * @param {string} id - Die ID des Produkts.
     * @param {number} quantity - Die neue Menge.
     */
    function updateItemQuantity(id, quantity) {
        let cart = getCart();
        const item = cart.find(i => i.id === id);
        
        if (item) {
            item.quantity = quantity;
            // Ruft saveCart auf, was wiederum renderCart aufruft, um den Preis zu aktualisieren
            saveCart(cart); 
        }
    }

    /**
     * Rendert die Warenkorb-Liste auf der Warenkorb-Seite.
     */
    function renderCart() {
        const cartItemsList = document.getElementById('cart-items');
        const cartContentDiv = document.getElementById('cart-content');
        const emptyMessageDiv = document.getElementById('empty-cart-message');
        const totalItemsSpan = document.getElementById('cart-total-items');
        // NEU: Element für den Gesamtpreis
        const totalPriceSpan = document.getElementById('cart-total-price'); 

        if (!cartItemsList || !cartContentDiv || !totalPriceSpan) return;

        const cart = getCart();
        let totalItems = 0;
        let totalPrice = 0; // NEU: Gesamtpreis-Variable
        let listHTML = '';

        if (cart.length === 0) {
            cartContentDiv.style.display = 'none';
            emptyMessageDiv.style.display = 'block';
        } else {
            emptyMessageDiv.style.display = 'none';
            cartContentDiv.style.display = 'block';

            cart.forEach(item => {
                totalItems += item.quantity;
                
                // NEU: Zwischensumme für das Produkt berechnen
                const itemSubtotal = item.quantity * item.price; 
                totalPrice += itemSubtotal; 
                
                listHTML += `
                    <li class="cart-item">
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <span class="item-description">${item.description}</span>
                            <span class="item-price">${item.price.toFixed(2)} € pro Stück</span> 
                        </div>
                        <div class="item-controls">
                            <label for="qty-${item.id}">Menge:</label>
                            <input type="number" 
                                id="qty-${item.id}" 
                                class="quantity-input" 
                                data-id="${item.id}" 
                                value="${item.quantity}" 
                                min="1" 
                                style="width: 50px;">
                            <span class="item-subtotal">${itemSubtotal.toFixed(2)} €</span> 
                            <button class="remove-btn" data-id="${item.id}">Entfernen</button>
                        </div>
                    </li>
                `;
            });
        }
        
        cartItemsList.innerHTML = listHTML;
        
        // NEU: Gesamtpreis im Zusammenfassungs-Block aktualisieren
        totalPriceSpan.textContent = totalPrice.toFixed(2);
        
        if (totalItemsSpan) {
            totalItemsSpan.textContent = totalItems;
        }
    }

    /**
     * Leert den gesamten Warenkorb und aktualisiert die Ansicht.
     */
    function clearCart() {
        if (confirm('Bist du sicher, dass du den Warenkorb leeren möchtest?')) {
            localStorage.removeItem(CART_STORAGE_KEY);
            updateCartCount();
            if (document.getElementById('cart-section')) {
                renderCart();
            }
            showToast("Warenkorb geleert.");
        }
    }

    /**
     * Erstellt eine E-Mail-Bestellanfrage mit dem Inhalt des Warenkorbs.
     */
    function createOrderEmail() {
        const cart = getCart();
        const totalPrice = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        const recipient = 'coloniadellafuria1972@gmail.com';
        const subject = 'Bestell-Anfrage Colonia Della Furia';
        
        let body = 'Hallo,\n\nich möchte die folgenden Artikel bestellen:\n\n';

        if (cart.length === 0) {
            alert('Dein Warenkorb ist leer. Füge zuerst Produkte hinzu.');
            return;
        }

        cart.forEach(item => {
            const itemSubtotal = (item.quantity * item.price).toFixed(2);
            body += `- ${item.quantity}x ${item.name} (${item.description}) - Einzelpreis: ${item.price.toFixed(2)} € (Zwischensumme: ${itemSubtotal} €)\n`;
        });
        
        // NEU: Gesamtpreis zur E-Mail hinzufügen
        body += `\nGesamtpreis der Anfrage (Platzhalter): ${totalPrice.toFixed(2)} €`;
        body += '\n\nBitte senden Sie mir die finalen Informationen zu Preis und Verfügbarkeit zu.';
        body += '\n\nViele Grüße,\n[Dein Name]';

        // Kodiert den Body für die URL
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;
    }

    // --- 1. Warenkorb Event Listener ---
    function setupCartListeners() {
        // Event Listener für "In den Warenkorb" Buttons (auf Produktseiten)
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // KORRIGIERTE LOGIK: Produktinformationen inklusive Preis auslesen
                const product = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    description: button.dataset.description,
                    // NEU: Preis auslesen und als float speichern
                    price: parseFloat(button.dataset.price) || 0.00 
                };
                
                addToCart(product);
            });
        });
        
        // 2. Event Listener für Mengenänderungen (input) auf der Warenkorb-Seite
        const cartItemsList = document.getElementById('cart-items');
        if (cartItemsList) {
            cartItemsList.addEventListener('input', (e) => {
                if (e.target.classList.contains('quantity-input')) {
                    const id = e.target.dataset.id;
                    const newQuantity = parseInt(e.target.value);
                    
                    if (newQuantity > 0) {
                        updateItemQuantity(id, newQuantity);
                    } else if (newQuantity === 0) {
                        removeFromCart(id);
                    }
                }
            });
            
            // 3. Event Listener für Entfernen Button auf der Warenkorb-Seite
            cartItemsList.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) {
                    const id = e.target.dataset.id;
                    removeFromCart(id);
                }
            });
        }
        
        // 4. Warenkorb leeren Button
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }
        
        // 5. Bestell-Anfrage Button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', createOrderEmail);
        }
    }
    
    // ===================================
    // Allgemeine Funktionen
    // ===================================

    // Smooth Scrolling für Navigationslinks
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop, 
                    behavior: 'smooth'
                });
            }
        });
    });

    // CTA Button Platzhalter
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent.includes('Mitglied werden') || button.textContent.includes('Anmeldeformular')) {
                console.log('Anmeldeformular Aktion ausgelöst.');
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
    toggleHeaderCompact();

    // Cookie-Consent Logik
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    const COOKIE_CONSENT_KEY = 'coloniaFuriaCookieConsent';

    function checkCookieConsent() {
        if (localStorage.getItem(COOKIE_CONSENT_KEY) !== 'accepted' && cookieConsent) {
            cookieConsent.style.display = 'flex';
        } else if (cookieConsent) {
            cookieConsent.style.display = 'none';
        }
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
            if (cookieConsent) {
                cookieConsent.style.display = 'none';
            }
        });
    }
    checkCookieConsent();

    // Scroll-To-Top Button Logik
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.onscroll = function() {scrollFunction()};

        function scrollFunction() {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        }

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Fixed Navigation Logic (NEU: Nur für Desktop) ---
    const nav = document.querySelector('.main-nav');
    const mobileBreakpoint = 600; 
    
    if (nav) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        const updateFixedNav = () => {
            if (window.innerWidth > mobileBreakpoint) {
                if (window.scrollY > headerHeight) {
                    nav.classList.add('fixed-compact-nav');
                } else {
                    nav.classList.remove('fixed-compact-nav');
                }
            } else {
                nav.classList.remove('fixed-compact-nav');
            }
        };

        window.addEventListener('scroll', updateFixedNav);
        window.addEventListener('resize', updateFixedNav); 
        updateFixedNav(); 
    }

    // ===================================
    // SPIELE LOGIK
    // ===================================
    /**
     * Helferfunktion: Formatiert das Datum und die Uhrzeit.
     * @param {string} isoString - Datum als ISO 8601 String.
     * @returns {Object} { datum: string, uhrzeit: string }
     */
    function formatDateTime(isoString) {
        if (!isoString) return { datum: 'TBA', uhrzeit: '' };

        const date = new Date(isoString);
        const datum = date.toLocaleDateString('de-DE', { 
            weekday: 'short', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
        const uhrzeit = date.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return { datum, uhrzeit };
    }

    /**
     * Ruft Spieldaten ab und rendert sie.
     */
    function displayUpcomingGames() {
        const url = 'https://api.coloniadellafuria.de/api/spiele'; 

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP-Fehler! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                renderGames(data.spiele);
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Spieldaten:', error);
            });
    }

    /**
     * Rendert die Spieldaten in die HTML-Struktur.
     * @param {Array} games - Liste der kommenden Spiele.
     */
    function renderGames(games) {
        const gameHighlightContainer = document.getElementById('game-highlight');
        const gameListContainer = document.getElementById('game-list-container');
        const gameList = document.getElementById('games-list');
        const toggleBtn = document.getElementById('toggle-games-btn');

        if (!gameHighlightContainer || !gameList) return;

        games.sort((a, b) => new Date(a.date) - new Date(b.date));

        const nextGame = games[0];
        const upcomingGames = games.slice(1);

        // 1. Highlight rendern
        if (nextGame) {
            const { datum, uhrzeit } = formatDateTime(nextGame.date);
            
            let locationText;
            if (nextGame.heimspiel) {
                locationText = nextGame.opponent.includes('Köln') ? 'Heimspiel in Köln' : `Heimspiel gegen ${nextGame.opponent}`;
            } else {
                locationText = `Auswärtsspiel bei ${nextGame.opponent}`;
            }

            gameHighlightContainer.innerHTML = `
                <div class="highlight-info">
                    <h3>Nächstes Spiel</h3>
                    <div class="match-details">
                        <div class="detail-item">
                            <span class="icon">📅</span>
                            <p>${datum}</p>
                        </div>
                        <div class="detail-item">
                            <span class="icon">🕒</span>
                            <p>${uhrzeit} Uhr</p>
                        </div>
                        <div class="detail-item">
                            <span class="icon">📍</span>
                            <p>${locationText}</p>
                        </div>
                    </div>
                    <a href="${nextGame.link || '#spiele'}" class="cta-button" target="_blank" rel="noopener noreferrer">Details anzeigen</a>
                </div>
            `;
        } else {
            gameHighlightContainer.innerHTML = '<p>Derzeit sind keine Spieltermine bekannt.</p>';
        }

        // 2. Liste weiterer Spiele rendern
        let listHTML = '';
        if (upcomingGames.length > 0) {
            upcomingGames.forEach(game => {
                const { datum, uhrzeit } = formatDateTime(game.date);
                const locationText = game.heimspiel ? 'Heimspiel' : 'Auswärts';

                listHTML += `
                    <li>
                        <span class="game-date">${datum} (${uhrzeit} Uhr)</span>
                        <span class="game-opponent">${game.opponent}</span>
                        <span class="game-location">${locationText}</span>
                    </li>
                `;
            });
            gameList.innerHTML = listHTML;
            if (gameListContainer && toggleBtn) {
                gameListContainer.style.display = 'block';
                toggleBtn.style.display = 'block'; 
            }
        } else {
            if (gameListContainer && toggleBtn) {
                gameListContainer.style.display = 'none';
                toggleBtn.style.display = 'none';
            }
        }
        
        if (gameListContainer) {
            gameListContainer.classList.remove('active');
        }
    }

    /**
     * Fügt den Event Listener für den Spiele-Toggle-Button hinzu.
     */
    function setupGameToggle() {
        const toggleBtn = document.getElementById('toggle-games-btn');
        const listContainer = document.getElementById('game-list-container');

        if (toggleBtn && listContainer) {
            toggleBtn.addEventListener('click', () => {
                const isActive = listContainer.classList.toggle('active');
                toggleBtn.classList.toggle('active');

                if (isActive) {
                    toggleBtn.textContent = 'Weitere Spiele ausblenden ▲';
                } else {
                    toggleBtn.textContent = 'Alle weiteren Spiele anzeigen ▼';
                }
            });

            toggleBtn.textContent = 'Alle weiteren Spiele anzeigen ▼';
        }
    }


    // ===================================
    // INIT & Allgemeine Funktionen
    // ===================================
    
    updateCartCount();
    setupCartListeners(); 

    if (document.getElementById('cart-section')) {
        renderCart();
    }

    displayUpcomingGames();

    setInterval(displayUpcomingGames, 300000); 
    
    setupGameToggle();

});