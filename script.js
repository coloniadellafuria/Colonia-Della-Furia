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
     * Zeigt eine Toast-Benachrichtigung an (ersetzt alert()).
     * @param {string} message - Die anzuzeigende Nachricht.
     */
    function showNotification(message) {
        let notification = document.getElementById('notification-toast');
        
        // Erstellen, falls noch nicht vorhanden
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification-toast';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        
        // Entfernt die Klasse nach 3 Sekunden, um die Benachrichtigung auszublenden
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    /**
     * Fügt ein Produkt zum Warenkorb hinzu oder erhöht die Menge.
     * @param {string} id - Eindeutige Produkt-ID.
     * @param {string} name - Produktname.
     * @param {string} description - Produktbeschreibung.
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
        // NEU: Zeige die benutzerdefinierte Benachrichtigung
        showNotification(`${name} wurde zum Warenkorb hinzugefügt!`);
    }

    /**
     * Aktualisiert die Menge eines Artikels im Warenkorb.
     * @param {string} id - Eindeutige Produkt-ID.
     * @param {number} newQuantity - Die neue Menge.
     */
    function updateCartItemQuantity(id, newQuantity) {
        let cart = getCart();
        const quantity = parseInt(newQuantity);

        if (quantity < 1) {
            // Wenn Menge 0 oder weniger, entferne das Element
            removeFromCart(id);
            return;
        }

        cart = cart.map(item => {
            if (item.id === id) {
                return { ...item, quantity: quantity };
            }
            return item;
        });

        saveCart(cart);
    }

    /**
     * Entfernt einen Artikel komplett aus dem Warenkorb.
     * @param {string} id - Eindeutige Produkt-ID.
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
        if (confirm('Bist du sicher, dass du den Warenkorb leeren möchtest?')) {
            localStorage.removeItem(CART_STORAGE_KEY);
            saveCart([]); // Speichert den leeren Warenkorb
        }
    }

    /**
     * Zeigt den Inhalt des Warenkorbs auf der warenkorb.html an.
     */
    function renderCart() {
        const cart = getCart();
        const listElement = document.getElementById('cart-items');
        const totalItemsElement = document.getElementById('cart-total-items');
        const emptyMessage = document.getElementById('empty-cart-message');
        const cartContent = document.getElementById('cart-content');

        if (!listElement) return;

        listElement.innerHTML = ''; // Leere die aktuelle Liste

        if (cart.length === 0) {
            cartContent.style.display = 'none';
            emptyMessage.style.display = 'block';
            totalItemsElement.textContent = '0';
            return;
        }

        cartContent.style.display = 'block';
        emptyMessage.style.display = 'none';

        let totalItems = 0;
        
        cart.forEach(item => {
            totalItems += item.quantity;
            const listItem = document.createElement('li');
            listItem.className = 'cart-item';
            
            listItem.innerHTML = `
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                </div>
                <div class="quantity-controls">
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           data-id="${item.id}"
                           class="quantity-input">
                    <button class="remove-btn" data-id="${item.id}">Entfernen</button>
                </div>
            `;
            listElement.appendChild(listItem);
        });
        
        totalItemsElement.textContent = totalItems;
    }
    
    /**
     * Erstellt die Bestell-E-Mail.
     */
    function createOrderEmail() {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Dein Warenkorb ist leer.');
            return;
        }

        let body = "Hallo Colonia Della Furia Team,\n\nIch möchte folgende Artikel bestellen:\n\n";
        
        cart.forEach(item => {
            body += `- ${item.quantity}x ${item.name} (${item.description})\n`;
        });
        
        body += "\nBitte sende mir Informationen zu Verfügbarkeit, Gesamtpreis und Zahlungsmodalitäten. Ich benötige auch die gewünschten Größen für die Bekleidung.\n\n"
        body += "--- Bitte folgende Felder ausfüllen ---\n"
        body += "Dein Name: [Dein Name]\n"
        body += "Deine E-Mail: [Deine E-Mail]\n"
        body += "Deine Adresse: [Deine Adresse]\n"
        body += "Gewünschte Größen/Anmerkungen: [z.B. Hoodie S, T-Shirt XL]\n"


        const subject = "Bestell-Anfrage Fanartikel";
        const mailtoLink = `mailto:coloniadellafuria1972@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Öffnet das E-Mail-Programm des Nutzers
        window.location.href = mailtoLink;
    }

    // ===================================
    // EVENT LISTENER
    // ===================================

    // 1. Produkt-Buttons auf bekleidung.html und sticker.html
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const description = this.dataset.description;
            addToCart(id, name, description);
        });
    });

    // 2. Event Listener für Warenkorb-Änderungen (Menge/Entfernen) auf warenkorb.html
    const cartList = document.getElementById('cart-items');
    if (cartList) {
        cartList.addEventListener('change', function(e) {
            if (e.target.classList.contains('quantity-input')) {
                const id = e.target.dataset.id;
                const newQuantity = e.target.value;
                updateCartItemQuantity(id, newQuantity);
            }
        });
        cartList.addEventListener('click', function(e) {
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

    // ===================================
    // INIT & Allgemeine Funktionen
    // ===================================
    
    updateCartCount();

    // Rendere den Warenkorb nur, wenn wir auf der warenkorb.html Seite sind
    if (document.getElementById('cart-section')) {
        renderCart();
    }
    
    // Smooth Scrolling für Navigationslinks (Beibehalten)
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
    
});