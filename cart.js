// Dateiname: cart.js (FINAL Warenkorb Logik)

// =================================================================
// WARENKORB-SPEICHERUNG (localStorage)
// =================================================================

const CART_STORAGE_KEY = 'coloniaFuriaCart';

function getCart() {
    try {
        const cartString = localStorage.getItem(CART_STORAGE_KEY);
        return cartString ? JSON.parse(cartString) : [];
    } catch (e) {
        console.error("Fehler beim Laden des Warenkorbs:", e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
        
        // WICHTIG: Wenn die Warenkorbseite offen ist, neu rendern
        if (document.getElementById('cart-section')) {
            renderCart();
        }
    } catch (e) {
        console.error("Fehler beim Speichern des Warenkorbs:", e);
    }
}

// =================================================================
// UI-FUNKTIONEN (Zähler & Toast)
// =================================================================

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElements = document.querySelectorAll('#cart-count-nav');
    
    countElements.forEach(el => {
        el.textContent = totalItems > 0 ? totalItems : '0'; 
    });
}

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

// =================================================================
// WARENKORB-LOGIK (Hinzufügen/Entfernen/Aktualisieren)
// =================================================================

function handleAddToCartClick(event) {
    const button = event.currentTarget;
    const product = {
        name: button.getAttribute('data-name'),
        description: button.getAttribute('data-description'),
        price: parseFloat(button.getAttribute('data-price')) || 0, 
        image: button.getAttribute('data-image') || '' 
    };
    
    if (!product.name || product.price <= 0) {
        showToast("Fehler: Ungültige Produktdaten.");
        return;
    }

    let cart = getCart();
    const existingItem = cart.find(item => item.name === product.name);

    if (existingItem) {
        existingItem.quantity += 1; 
        showToast(`"${product.name}" Menge erhöht! (${existingItem.quantity}x)`);
    } else {
        cart.push({ ...product, quantity: 1 });
        showToast(`"${product.name}" wurde hinzugefügt!`);
    }

    saveCart(cart); 
}

function removeItem(productName) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== productName); 
    saveCart(cart);
    showToast(`"${productName}" entfernt.`);
}

function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    saveCart([]);
    showToast('Warenkorb geleert.');
}


// =================================================================
// WARENKORB-SEITE RENDER-LOGIK
// =================================================================

/**
 * Rendert die Artikel im Warenkorb auf der warenkorb.html Seite.
 */
function renderCart() {
    const cartList = document.getElementById('cart-items');
    const emptyMessage = document.getElementById('empty-cart-message');
    // WICHTIG: Muss die ID verwenden, die jetzt in warenkorb.html existiert!
    const summaryWrapper = document.getElementById('cart-summary-wrapper');
    const totalPriceElement = document.getElementById('cart-total-price');
    const totalItemsElement = document.getElementById('cart-total-items');

    const cart = getCart();
    let totalSum = 0;
    
    if (!cartList || !emptyMessage || !summaryWrapper) return; 

    cartList.innerHTML = ''; 
    let emailBody = "Hallo Furia Team,\n\nich möchte die folgenden Artikel anfragen:\n\n";

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        summaryWrapper.style.display = 'none'; 
        if (totalPriceElement) totalPriceElement.textContent = '0.00€';
        if (totalItemsElement) totalItemsElement.textContent = '0';
        return;
    }

    emptyMessage.style.display = 'none';
    summaryWrapper.style.display = 'block';

    cart.forEach(item => {
        const totalItemPrice = item.price * item.quantity;
        totalSum += totalItemPrice;
        
        const listItem = document.createElement('li');
        listItem.classList.add('cart-item'); 

        listItem.innerHTML = `
            <div class="item-details">
                <p class="item-name">${item.name}</p>
                <p class="item-description">${item.description}</p>
                <p class="item-price">${parseFloat(item.price).toFixed(2)}€ pro Stück</p>
            </div>
            <div class="item-controls">
                <label for="quantity-${item.name}">Menge:</label>
                <input type="number" id="quantity-${item.name}" data-name="${item.name}" value="${item.quantity}" min="1" class="item-quantity-input">
                <button class="remove-item-btn" data-name="${item.name}">Entfernen</button>
                <p class="item-subtotal">Gesamt: ${totalItemPrice.toFixed(2)}€</p>
            </div>
        `;
        cartList.appendChild(listItem);
        
        emailBody += `- ${item.quantity}x ${item.name} (${item.description})\n`;
    });
    
    // Gesamtsumme und Artikelanzahl aktualisieren
    if (totalPriceElement) {
        totalPriceElement.textContent = `${totalSum.toFixed(2)}€`;
    }
    if (totalItemsElement) {
        const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        totalItemsElement.textContent = totalItemsCount;
    }

    // Mail-Body für den Bestell-Button erstellen
    emailBody += "\nBitte lasst mich wissen, wie die Verfügbarkeit, die Zahlungsmodalitäten und die Gesamtkosten (inkl. Versand) aussehen.\n\nVielen Dank!";
    
    // WICHTIG: Die ID muss 'order-request-btn' sein
    const orderButton = document.getElementById('order-request-btn');
    if (orderButton) {
        const mailtoLink = `mailto:coloniadellafuria1972@gmail.com?subject=Bestell-Anfrage%20über%20Webseite&body=${encodeURIComponent(emailBody)}`;
        orderButton.onclick = () => { window.location.href = mailtoLink; };
    }

    setupQuantityListeners();
}

/**
 * Richtet Listener für Mengenänderungen und Entfernen ein.
 */
function setupQuantityListeners() {
    document.querySelectorAll('.item-quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productName = e.target.getAttribute('data-name');
            const newQuantity = parseInt(e.target.value);
            
            if (newQuantity < 1 || isNaN(newQuantity)) {
                e.target.value = 1; 
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

// =================================================================
// INITIALISIERUNG
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Zähler beim initialen Laden der Seite aktualisieren
    updateCartCount(); 

    // 2. Event Listener für Buttons auf Produktseiten
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', handleAddToCartClick);
    });
    
    // 3. Warenkorb-Seite initialisieren
    if (document.getElementById('cart-section')) {
        renderCart(); // STARTET DIE ANZEIGE DES WARENKORBS
        document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);
    }
});