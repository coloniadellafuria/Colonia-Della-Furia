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
        // Aktualisiert alle Elemente mit der ID
        countElements.forEach(el => {
            el.textContent = totalItems > 0 ? totalItems : '';
            el.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        });
    }

    /**
     * Fügt ein Produkt zum Warenkorb hinzu.
     * @param {object} product - Das Produktobjekt (name, description, price, image).
     * @param {number} quantity - Die hinzuzufügende Menge.
     */
    function addToCart(product, quantity = 1) {
        const cart = getCart();
        const existingItem = cart.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }

        saveCart(cart);
        showToast(`${quantity}x ${product.name} hinzugefügt!`);
    }
    
    /**
     * Entfernt ein Produkt komplett aus dem Warenkorb.
     * @param {string} productName - Der Name des zu entfernenden Produkts.
     */
    function removeItem(productName) {
        let cart = getCart();
        cart = cart.filter(item => item.name !== productName);
        saveCart(cart);
        showToast(`${productName} entfernt.`);
    }

    /**
     * Rendert die Warenkorb-Artikel auf der Warenkorb-Seite.
     */
    function renderCart() {
        const cartList = document.getElementById('cart-items');
        const emptyMessage = document.getElementById('empty-cart-message');
        const summary = document.getElementById('cart-summary');
        const cart = getCart();

        if (!cartList || !emptyMessage || !summary) return;

        cartList.innerHTML = ''; // Liste leeren

        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            summary.style.display = 'none';
            return;
        }

        emptyMessage.style.display = 'none';
        summary.style.display = 'block';

        let emailBody = "Hallo Furia Team,\n\nich möchte die folgenden Artikel anfragen:\n\n";

        cart.forEach(item => {
            const listItem = document.createElement('li');
            const totalItemPrice = (item.price * item.quantity).toFixed(2);
            
            listItem.innerHTML = `
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.name} (${item.description})</p>
                    <p class="cart-item-price">${item.quantity} x ${parseFloat(item.price).toFixed(2)}€ = **${totalItemPrice}€**</p>
                </div>
                <div class="cart-item-controls">
                    <label for="quantity-${item.name}">Menge:</label>
                    <input type="number" id="quantity-${item.name}" data-name="${item.name}" value="${item.quantity}" min="1" class="item-quantity-input">
                    <button class="remove-item-btn" data-name="${item.name}">Entfernen</button>
                </div>
            `;
            cartList.appendChild(listItem);
            
            // Text für die Bestell-Anfrage-E-Mail
            emailBody += `- ${item.quantity}x ${item.name} (${item.description})\n`;
        });
        
        // Fügt die Fußzeile der E-Mail hinzu
        emailBody += "\nBitte lasst mich wissen, wie die Verfügbarkeit, die Zahlungsmodalitäten und die Gesamtkosten (inkl. Versand) aussehen.\n\nVielen Dank!";
        
        // Setzt den E-Mail-Link
        const orderButton = document.getElementById('order-request-btn');
        if (orderButton) {
            const mailtoLink = `mailto:coloniadellafuria1972@gmail.com?subject=Bestell-Anfrage%20über%20Webseite&body=${encodeURIComponent(emailBody)}`;
            orderButton.onclick = () => { window.location.href = mailtoLink; };
        }

        setupQuantityListeners();
    }
    
    /**
     * Richtet Listener für Mengenänderungen im Warenkorb ein.
     */
    function setupQuantityListeners() {
        document.querySelectorAll('.item-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productName = e.target.getAttribute('data-name');
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity < 1 || isNaN(newQuantity)) {
                    e.target.value = 1; // Setzt auf Minimum 1
                    return;
                }

                let cart = getCart();
                const item = cart.find(i => i.name === productName);
                if (item) {
                    item.quantity = newQuantity;
                    saveCart(cart);
                }
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productName = e.target.getAttribute('data-name');
                removeItem(productName);
            });
        });
    }

    /**
     * Leert den gesamten Warenkorb.
     */
    function clearCart() {
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartCount();
        if (document.getElementById('cart-section')) {
            renderCart();
            showToast('Warenkorb geleert.');
        }
    }

    /**
     * Richtet Event Listener für alle "In den Warenkorb"-Buttons ein.
     */
    function setupCartListeners() {
        const productSections = document.querySelectorAll('.product-list');

        productSections.forEach(section => {
            section.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) {
                    const button = e.target;
                    const product = {
                        name: button.getAttribute('data-name'),
                        description: button.getAttribute('data-description'),
                        price: parseFloat(button.getAttribute('data-price')),
                        image: button.getAttribute('data-image')
                    };
                    addToCart(product);
                }
            });
        });
        
        // Listener für den "Warenkorb leeren" Button auf der Warenkorb-Seite
        document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);
    }
    
    /**
     * Zeigt eine kurze Toast-Benachrichtigung an.
     * @param {string} message - Die anzuzeigende Nachricht.
     */
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('visible');
            setTimeout(() => {
                toast.classList.remove('visible');
            }, 3000);
        }
    }


    // ===================================
    // SPIELPLAN LOGIK
    // ===================================

    // Simuliert das Laden von Spieldaten (sollte später durch eine echte JSON/API ersetzt werden)
    async function fetchGameData() {
        // Beispiel-Daten (bitte passen Sie diese Daten regelmäßig an!)
        return [
            { id: 1, opponent: "Düsseldorfer EG", date: "2025-10-04T19:30:00", location: "Köln Arena (HEIMSPIEL)", type: "DEL" },
            { id: 2, opponent: "Adler Mannheim", date: "2025-10-06T14:00:00", location: "Mannheim SAP Arena", type: "DEL" },
            { id: 3, opponent: "Eisbären Berlin", date: "2025-10-11T19:30:00", location: "Köln Arena (HEIMSPIEL)", type: "DEL" },
            { id: 4, opponent: "Iserlohn Roosters", date: "2025-10-13T17:00:00", location: "Iserlohn Balver Zinn Arena", type: "DEL" },
            { id: 5, opponent: "Straubing Tigers", date: "2025-10-18T19:30:00", location: "Köln Arena (HEIMSPIEL)", type: "DEL" },
            { id: 6, opponent: "Grizzlys Wolfsburg", date: "2025-10-20T17:00:00", location: "Wolfsburg Eis Arena", type: "DEL" },
            { id: 7, opponent: "Schwenninger Wild Wings", date: "2025-10-25T19:30:00", location: "Villingen-Schwenningen Helios Arena", type: "DEL" },
            { id: 8, opponent: "Red Bull München", date: "2025-10-27T17:00:00", location: "Köln Arena (HEIMSPIEL)", type: "DEL" },
        ];
    }
    
    /**
     * Erzeugt den HTML-String für eine einzelne Spielkarte.
     * @param {object} game - Das Spielobjekt.
     * @param {boolean} isUpcoming - Ist das Spiel eines der nächsten Spiele (sichtbar)?
     * @returns {string} Der HTML-String der Spielkarte.
     */
    function createGameCardHTML(game, isUpcoming) {
        // Logik zur Bestimmung des Heimspiels (Passen Sie dies ggf. an Ihre Daten an)
        const isHomeGame = game.location.includes('Köln Arena');
        const opponent = game.opponent;
        const dateObj = new Date(game.date);

        // Datums- und Zeitformatierung
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
        const year = dateObj.getFullYear();
        const time = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        const formattedDate = `${day}.${month}.${year}`;

        // ***********************************************************************************
        // KORRIGIERTE LOGIK: Link zeigt IMMER auf shop.html
        // ***********************************************************************************
        const buttonText = isHomeGame ? 'Tickets' : 'Fanbus';
        // HIER: Der Link wird auf shop.html festgelegt, wie vom Benutzer gewünscht.
        const actionLinkHTML = `<a href="shop.html" class="game-action-link">${buttonText}</a>`; 
        // ***********************************************************************************

        const locationIcon = isHomeGame ? '🏠' : '🚌'; 
        // Klassen für die Anzeige/Ausblendung
        const visibilityClass = isUpcoming ? '' : 'hidden-upcoming-game';

        return `
            <div class="game-card ${visibilityClass}">
                <div class="game-details">
                    <p class="game-date">${formattedDate} | ${time} Uhr</p>
                    <h3 class="opponent-name">${opponent}</h3>
                    <p class="game-location">${locationIcon} ${game.location}</p>
                    <p class="game-type">${game.type}</p>
                </div>
                <div class="game-action">
                    ${actionLinkHTML}
                </div>
            </div>
        `;
    }

    /**
     * Lädt Spieldaten, sortiert sie und rendert die kommenden Spiele.
     */
    async function loadAndRenderUpcomingGames() {
        const gameListContainer = document.getElementById('game-list');
        if (!gameListContainer) return; // Beendet die Funktion, wenn das Element nicht auf der Seite ist

        try {
            const allGames = await fetchGameData();
            const now = new Date();

            // 1. Spiele filtern: Nur zukünftige Spiele
            const upcomingGames = allGames.filter(game => new Date(game.date) > now);

            // 2. Spiele sortieren: Nach Datum aufsteigend
            upcomingGames.sort((a, b) => new Date(a.date) - new Date(b.date));

            displayUpcomingGames(upcomingGames);
        } catch (error) {
            console.error('Fehler beim Laden der Spieldaten:', error);
            gameListContainer.innerHTML = '<p class="error-message">Spieldaten konnten nicht geladen werden.</p>';
        }
    }

    /**
     * Zeigt die kommenden Spiele im DOM an.
     * @param {Array} upcomingGames - Array der gefilterten und sortierten Spiele.
     */
    function displayUpcomingGames(upcomingGames = []) {
        const gameListContainer = document.getElementById('game-list');
        const toggleBtn = document.getElementById('toggle-games-btn');
        const nextGameSection = document.getElementById('next-games');
        
        if (!gameListContainer) return;

        gameListContainer.innerHTML = ''; // Vorherige Karten löschen
        
        if (upcomingGames.length === 0) {
            gameListContainer.innerHTML = '<p class="no-games">Aktuell sind keine Spiele im Spielplan verzeichnet.</p>';
            if (toggleBtn) toggleBtn.style.display = 'none';
            return;
        }

        // Standardmäßig die ersten 3 Spiele anzeigen, den Rest ausblenden
        const initialCount = 3;
        let htmlContent = '';

        upcomingGames.forEach((game, index) => {
            const isUpcoming = index < initialCount; // Bestimmt, ob es eines der ersten 3 ist
            htmlContent += createGameCardHTML(game, isUpcoming);
        });

        gameListContainer.innerHTML = htmlContent;

        // Logik für den "Alle weiteren Spiele anzeigen" Button
        if (toggleBtn) {
            if (upcomingGames.length > initialCount) {
                toggleBtn.style.display = 'block';
                setupGameToggle(); 
            } else {
                toggleBtn.style.display = 'none';
            }
        }
    }

    /**
     * Fügt den Event Listener für den Spiele-Toggle-Button hinzu.
     */
    function setupGameToggle() {
        const toggleBtn = document.getElementById('toggle-games-btn');
        const gameListContainer = document.getElementById('game-list');
        const hiddenGames = gameListContainer ? gameListContainer.querySelectorAll('.hidden-upcoming-game') : [];

        if (toggleBtn && gameListContainer) {
            toggleBtn.removeEventListener('click', handleToggleClick); // Alten Listener entfernen, falls vorhanden
            toggleBtn.addEventListener('click', handleToggleClick);

            // Initialen Text setzen
            toggleBtn.textContent = 'Alle weiteren Spiele anzeigen';
        }
        
        function handleToggleClick() {
            const isActive = gameListContainer.classList.toggle('active');

            hiddenGames.forEach(game => {
                game.classList.toggle('visible', isActive);
            });

            if (isActive) {
                toggleBtn.textContent = 'Weitere Spiele ausblenden ▲';
            } else {
                toggleBtn.textContent = 'Alle weiteren Spiele anzeigen ';
            }
        }
    }


    // ===================================
    // INIT & Allgemeine Funktionen
    // ===================================
    
    updateCartCount();
    setupCartListeners(); 

    if (document.getElementById('cart-section')) {
        renderCart();
        // Listener für den "Bestell-Anfrage senden" Button wird in renderCart() gesetzt
    }

    // Lädt die Spieldaten und rendert sie, wenn der Container vorhanden ist (z.B. auf index.html)
    if (document.getElementById('game-list')) {
        loadAndRenderUpcomingGames();
        // Aktualisiert die Spiele alle 5 Minuten (300000 ms)
        setInterval(loadAndRenderUpcomingGames, 300000); 
    }
});