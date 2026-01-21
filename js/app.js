let cart = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initializeSaleBanner();
    renderProducts();
    initializeFilters();
    loadCart();
    updateCartUI();
});

function initializeSaleBanner() {
    const banner = document.getElementById('saleBanner');
    if (!banner) return;

    const saleMessage = document.getElementById('saleMessage');
    const saleCode = document.getElementById('saleCode');
    const salePercent = document.getElementById('salePercent');

    if (!CONFIG.sale.enabled) {
        banner.classList.add('hidden');
        return;
    }

    if (saleCode) saleCode.textContent = CONFIG.sale.code;
    if (salePercent) salePercent.textContent = CONFIG.sale.percent + '%';

    if (CONFIG.sale.message && saleMessage) {
        saleMessage.innerHTML = `${CONFIG.sale.message} Use code <strong>${CONFIG.sale.code}</strong> for <strong>${CONFIG.sale.percent}%</strong> OFF`;
    }
}

function closeSaleBanner() {
    const banner = document.getElementById('saleBanner');
    if (banner) banner.classList.add('hidden');
    sessionStorage.setItem('saleBannerClosed', 'true');
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filteredProducts = CONFIG.products.filter(product => {
        if (currentFilter === 'all') return true;
        return product.category === currentFilter;
    });

    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => goToProduct(product.id);

    const isOnSale = product.originalPrice !== null;
    const priceHTML = isOnSale
        ? `<span class="price-current">${CONFIG.store.currency}${product.price.toFixed(2)}</span>
           <span class="price-original">${CONFIG.store.currency}${product.originalPrice.toFixed(2)}</span>`
        : `<span class="price-current">${CONFIG.store.currency}${product.price.toFixed(2)}</span>`;

    const tagsHTML = product.tags && product.tags.length > 0
        ? product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')
        : '';

    card.innerHTML = `
        <div class="product-image">
            ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="product-placeholder"></div>'}
            ${product.badge ? `<span class="product-badge ${isOnSale ? 'sale' : ''}">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-tags">${tagsHTML}</div>
            <div class="product-footer">
                <div class="product-price">
                    ${priceHTML}
                </div>
            </div>
        </div>
    `;

    return card;
}

function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderProducts();
        });
    });
}

function loadCart() {
    const savedCart = localStorage.getItem('lunorCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('lunorCart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = CONFIG.products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        showNotification(`${product.name} is already in your cart`);
        return;
    }

    cart.push({
        id: product.id,
        name: product.name,
        price: product.price
    });

    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to cart`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cartCount) cartCount.textContent = cart.length;

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image"></div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${CONFIG.store.currency}${item.price.toFixed(2)}</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">×</button>
                </div>
            `).join('');
        }
    }

    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = `${CONFIG.store.currency}${total.toFixed(2)}`;
    }
}

function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    const sidebar = document.getElementById('cartSidebar');

    if (overlay) overlay.classList.toggle('active');
    if (sidebar) sidebar.classList.toggle('active');

    if (sidebar && sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }

    showNotification('Checkout coming soon! Sellauth integration pending.');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            toggleCart();
        }
    }
});
