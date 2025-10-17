// script.js - общие функции для всех страниц

// -------------------- Корзина --------------------
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = getCart().length;
    }
}

function removeFromCart(workId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== workId);
    saveCart(updatedCart);
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function addToCart(work) {
    const cart = getCart();
    const existing = cart.find(item => 
        item.title === work.title &&
        item.category === work.category &&
        item.class === work.class
    );
    if (!existing) {
        work.id = Date.now();
        work.addedAt = new Date().toISOString();
        cart.push(work);
        saveCart(cart);
        return true;
    }
    return false;
}

// -------------------- Мобильная навигация --------------------
function initMobileNavigation() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('mainNav');
    if (!burger || !nav) return;

    let navOverlay = document.querySelector('.nav-overlay');
    if (!navOverlay) {
        navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);
    }

    function toggleMenu() {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        burger.setAttribute('aria-expanded', nav.classList.contains('active'));
    }

    burger.addEventListener('click', e => {
        e.stopPropagation();
        toggleMenu();
    });

    // Закрытие при клике на ссылки
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) toggleMenu();
        });
    });

    // Закрытие при клике на оверлей
    navOverlay.addEventListener('click', toggleMenu);

    // Закрытие при Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('active')) toggleMenu();
    });

    // Закрытие при изменении размера окна
    window.addEventListener('resize', () => {
        if (window.innerWidth > 720 && nav.classList.contains('active')) toggleMenu();
    });
}

// -------------------- Кнопка "Наверх" --------------------
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    function toggleVisibility() {
        if (window.pageYOffset > 300) btn.classList.add('visible');
        else btn.classList.remove('visible');
    }

    window.addEventListener('scroll', toggleVisibility);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// -------------------- Анимации при скролле --------------------
function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));
}

// -------------------- Уведомления --------------------
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// -------------------- Инициализация --------------------
document.addEventListener('DOMContentLoaded', () => {
    initMobileNavigation();
    initBackToTop();
    initScrollAnimations();
    updateCartCount();

    // Подсветка текущей страницы
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Обработка формы отзывов
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Спасибо за ваш отзыв! После модерации он будет опубликован.');
            reviewForm.reset();
        });
    }
});
