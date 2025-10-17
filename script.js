// script.js - общие функции для всех страниц

// Функции для работы с корзиной
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
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
    const existingWork = cart.find(item => 
        item.title === work.title && 
        item.category === work.category && 
        item.class === work.class
    );
    
    if (!existingWork) {
        work.id = Date.now();
        work.addedAt = new Date().toISOString();
        cart.push(work);
        saveCart(cart);
        return true;
    }
    return false;
}

// Мобильная навигация
function initMobileNavigation() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('mainNav');
    
    if (!burger || !nav) return;

    const navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);

    function toggleMobileMenu() {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    }

    burger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    navOverlay.addEventListener('click', () => {
        toggleMobileMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 720 && nav.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
}

// Кнопка "Наверх"
function initBackToTop() {
    let backToTop = document.getElementById('backToTop');
    
    if (!backToTop) {
        backToTop = document.createElement('button');
        backToTop.id = 'backToTop';
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTop.setAttribute('aria-label', 'Вернуться наверх');
        backToTop.setAttribute('title', 'Вернуться наверх');
        
        let floatingButtons = document.querySelector('.floating-buttons');
        if (!floatingButtons) {
            floatingButtons = document.createElement('div');
            floatingButtons.className = 'floating-buttons';
            document.body.appendChild(floatingButtons);
        }
        floatingButtons.appendChild(backToTop);
    }

    function toggleBackToTop() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    toggleBackToTop();
    
    window.addEventListener('scroll', toggleBackToTop);
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Анимации при скролле
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Уведомления
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
    
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => { notification.remove(); }, 300);
    }, 5000);
}

// Видимость карточек
function updateCardsVisibility() {
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards');
    
    if (cards.length === 0 && cardsContainer) {
        cardsContainer.innerHTML = `
            <div class="no-cards-message">
                <div class="no-cards-icon">📚</div>
                <h3>Карточки не найдены</h3>
                <p>Добавьте работы через таблицу для отображения карточек</p>
            </div>
        `;
    } else {
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.display = 'flex';
            card.style.transform = 'none';
        });
    }
}

// Добавление карточек
function addWorkToCard(workData) {
    const cardsContainer = document.querySelector('.cards');
    if (!cardsContainer) return;
    
    const noCardsMessage = cardsContainer.querySelector('.no-cards-message');
    if (noCardsMessage) noCardsMessage.remove();
    
    const card = document.createElement('div');
    card.className = 'card fade-in-scroll';
    card.innerHTML = `
        <div class="card-icon">📄</div>
        <h3>${workData.title || 'Новая работа'}</h3>
        <p>${workData.description || 'Описание работы'}</p>
        <div class="card-meta" style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
            <span style="color: var(--accent); font-weight: 600;">${workData.category || 'Категория'}</span>
            <span style="color: var(--muted); font-size: 0.9rem; margin-left: 12px;">${workData.class || 'Класс'}</span>
        </div>
    `;
    
    cardsContainer.appendChild(card);
    setTimeout(() => { card.classList.add('visible'); }, 100);
    showNotification('Работа успешно добавлена в карточки', 'success');
}

// Инициализация поиска
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                searchResults.classList.remove('active');
            } else {
                searchResults.classList.add('active');
            }
        });
        
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                searchResults.classList.remove('active');
            }
        });
    }
}

// Основная инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация приложения...');
    
    initMobileNavigation();
    initBackToTop();
    initScrollAnimations();
    initSearch();
    updateCartCount();
    updateCardsVisibility();

    // ФИКС: карточки видимы сразу
    document.querySelectorAll('.fade-in-scroll').forEach(el => {
        el.classList.add('visible');
    });
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    console.log('Инициализация завершена');
});
