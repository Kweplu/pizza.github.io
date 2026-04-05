// Cart State
let cart = [];

// DOM Elements
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElement = document.querySelector('.cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');

const floatingCart = document.getElementById('floating-cart');
const floatingCartCount = document.querySelector('.floating-cart-count');

// Toggle Cart Sidebar
function toggleCart() {
    cartOverlay.classList.toggle('active');
}

cartBtn.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', (e) => {
    if(e.target === cartOverlay) toggleCart();
});

// Cart Visibility helper
function checkFloatingCartVisibility() {
    if (!floatingCart) return;
    if (cart.length > 0 && window.scrollY > 100) {
        floatingCart.classList.add('visible');
    } else {
        floatingCart.classList.remove('visible');
    }
}

// Cart Functions
function addToCart(id, name, price, img) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }
    updateCartUI();
    
    // Add visual feedback (small animation)
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Added!";
    btn.style.backgroundColor = "#fff";
    btn.style.color = "#121212";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
        btn.style.color = "";
    }, 1000);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function changeQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: grey; text-align: center; margin-top: 50px;">Your cart is empty.</p>';
    }

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <i class="fas fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
        `;
        cartItemsContainer.appendChild(el);
    });

    cartCountElement.innerText = count;
    cartTotalPrice.innerText = `$${total.toFixed(2)}`;
    
    if (floatingCartCount) {
        floatingCartCount.innerText = count;
    }
    
    checkFloatingCartVisibility();
}

// WhatsApp Checkout Function
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    let message = "🍕 *New Order from La Strada* 🍕%0A%0A";
    let total = 0;
    
    cart.forEach(item => {
        message += `▪ ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}%0A`;
        total += item.price * item.quantity;
    });
    
    message += `%0A*Total: $${total.toFixed(2)}*%0A%0APlease confirm my order!`;
    
    // Replace with the restaurant's phone number
    const phoneNumber = "1234567890";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after checkout
    cart = [];
    updateCartUI();
    toggleCart();
}

// Initialization and Animations
window.addEventListener('load', () => {
    // Initial UI state
    updateCartUI();
    checkFloatingCartVisibility();

    if (typeof gsap !== 'undefined') {
        const loader = document.getElementById('loader');
        let delayOffset = 0;
        
        if (loader) {
            delayOffset = 1.2;
            const tl = gsap.timeline();
            tl.to('.loader-brand', { opacity: 1, duration: 0.5 })
              .to(loader, { opacity: 0, duration: 0.5, delay: 0.5, onComplete: () => loader.style.display = 'none' });
        }

        // Hero Animations
        gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, ease: 'power3.out', delay: delayOffset });
        gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: delayOffset + 0.2 });
        gsap.from('.btn-primary', { opacity: 0, scale: 0.9, duration: 0.5, delay: delayOffset + 0.4 });
        gsap.from('.navbar', { opacity: 0, y: -50, duration: 1, delay: delayOffset + 0.5 });

        // Native Scroll Animations for products using IntersectionObserver
        const menuObserver = new IntersectionObserver((entries) => {
            let delayTime = 0;
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const timer = setTimeout(() => {
                        entry.target.classList.remove('animate-on-scroll');
                    }, delayTime);
                    entry.target.dataset.timer = timer;
                    delayTime += 100; // stagger effect
                } else {
                    if (entry.target.dataset.timer) {
                        clearTimeout(entry.target.dataset.timer);
                    }
                    // Re-apply the class when scrolling out of view to hide it again
                    entry.target.classList.add('animate-on-scroll');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.menu-card').forEach(card => {
            card.classList.add('animate-on-scroll');
            menuObserver.observe(card);
        });
    }
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    checkFloatingCartVisibility();
});

// Menu Search Filter
const searchInput = document.getElementById('menu-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.menu-card');
        
        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            
            if (title.includes(term) || desc.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}
