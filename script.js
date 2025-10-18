// script.js - общие функции для всех страниц

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

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    // Показывать/скрывать кнопку при прокрутке
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });

    // Плавная прокрутка вверх при клике
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-scroll');
    
    animatedElements.forEach(el => {
        if (el.classList.contains('card')) {
            el.classList.add('visible');
        }
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(el => observer.observe(el));
}

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
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function updateCardsVisibility() {
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards');
    
    if (!cardsContainer) return;
    
    cards.forEach(card => {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.display = 'flex';
        card.style.transform = 'none';
        card.classList.add('visible');
    });
    
    if (cards.length === 0) {
        const noCardsMessage = cardsContainer.querySelector('.no-cards-message');
        if (!noCardsMessage) {
            cardsContainer.innerHTML = `
                <div class="no-cards-message">
                    <div class="no-cards-icon">📚</div>
                    <h3>Карточки не найдены</h3>
                    <p>Добавьте работы через таблицу для отображения карточек</p>
                </div>
            `;
        }
    }
}

function addWorkToCard(workData) {
    const cardsContainer = document.querySelector('.cards');
    
    if (!cardsContainer) {
        console.error('❌ Контейнер .cards не найден');
        return;
    }
    
    const noCardsMessage = cardsContainer.querySelector('.no-cards-message');
    if (noCardsMessage) {
        noCardsMessage.remove();
    }
    
    const card = document.createElement('article');
    card.className = 'card fade-in-scroll visible';
    card.innerHTML = `
        <div class="card-icon">${workData.icon || '📄'}</div>
        <h3>${workData.title || 'Новая работа'}</h3>
        <p>${workData.description || 'Описание работы'}</p>
        <div class="card-meta" style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
            <span style="color: var(--accent); font-weight: 600;">${workData.category || 'Категория'}</span>
            ${workData.class ? `<span style="color: var(--muted); font-size: 0.9rem; margin-left: 12px;">${workData.class}</span>` : ''}
        </div>
        <a href="${workData.url || '#'}" class="card-link">
            Смотреть работы
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
        </a>
    `;
    
    cardsContainer.appendChild(card);
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.classList.add('visible');
    }, 50);
    
    console.log('✅ Карточка добавлена:', workData.title);
}

function simulateTableWorkAdd(workData) {
    addWorkToCard(workData);
    updateCardsVisibility();
}

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

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Инициализация приложения...');
    
    initMobileNavigation();
    initBackToTop();
    initScrollAnimations();
    initSearch();
    updateCartCount();
    updateCardsVisibility();
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    console.log('✅ Инициализация завершена');
});

window.app = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    clearCart,
    showNotification,
    addWorkToCard
};
