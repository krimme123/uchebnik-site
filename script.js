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
    // Проверяем, нет ли уже такой работы в корзине
    const existingWork = cart.find(item => 
        item.title === work.title && 
        item.category === work.category && 
        item.class === work.class
    );
    
    if (!existingWork) {
        work.id = Date.now(); // Добавляем уникальный ID
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

    // Создаем оверлей для мобильного меню
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

    // Закрытие меню при клике на ссылку
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Закрытие меню при клике на оверлей
    navOverlay.addEventListener('click', () => {
        toggleMobileMenu();
    });

    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Закрытие меню при изменении размера окна (на десктоп)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 720 && nav.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
}

// Кнопка "Наверх" - ПРОСТАЯ И РАБОЧАЯ ВЕРСИЯ
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) {
        console.error('Кнопка "Наверх" не найдена в DOM');
        return;
    }

    function toggleBackToTop() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    // Сразу проверяем позицию
    toggleBackToTop();
    
    // Слушаем скролл
    window.addEventListener('scroll', toggleBackToTop);
    
    // Клик по кнопке
    backToTop.addEventListener('click', () => {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
    });
    
    console.log('Стрелка "Наверх" инициализирована');
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

// Функция для показа уведомлений
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
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// ФИКС: Функция для обновления видимости карточек
function updateCardsVisibility() {
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards');
    
    if (cards.length === 0 && cardsContainer) {
        // Если карточек нет, показываем сообщение
        cardsContainer.innerHTML = `
            <div class="no-cards-message">
                <div class="no-cards-icon">📚</div>
                <h3>Карточки не найдены</h3>
                <p>Добавьте работы через таблицу для отображения карточек</p>
            </div>
        `;
    } else {
        // Гарантируем, что все карточки видны
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.display = 'flex';
            card.style.transform = 'none';
        });
    }
}

// ФИКС: Функция для добавления работы в карточки
function addWorkToCard(workData) {
    const cardsContainer = document.querySelector('.cards');
    
    if (!cardsContainer) return;
    
    // Убираем сообщение об отсутствии карточек
    const noCardsMessage = cardsContainer.querySelector('.no-cards-message');
    if (noCardsMessage) {
        noCardsMessage.remove();
    }
    
    // Создаем новую карточку
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
    
    // Добавляем карточку в контейнер
    cardsContainer.appendChild(card);
    
    // Инициализируем анимацию для новой карточки
    setTimeout(() => {
        card.classList.add('visible');
    }, 100);
    
    // Показываем уведомление
    showNotification('Работа успешно добавлена в карточки', 'success');
}

// ФИКС: Функция для симуляции добавления работы через таблицу (для тестирования)
function simulateTableWorkAdd(workData) {
    addWorkToCard(workData);
    updateCardsVisibility();
}

// ФИКС: Функция для управления поиском
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
        
        // Очистка поиска при нажатии Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                searchResults.classList.remove('active');
            }
        });
    }
}

// Инициализация при загрузке страницы - ОБНОВЛЕННАЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация приложения...');
    
    initMobileNavigation();
    initBackToTop(); // Должна создавать кнопку если ее нет
    initScrollAnimations();
    initSearch(); // Инициализация поиска
    updateCartCount();
    updateCardsVisibility();
    
    // Добавляем класс для текущей страницы в навигации
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Тестовая функция для проверки работы
    window.testBackToTop = function() {
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            backToTop.classList.toggle('visible');
            console.log('Кнопка "Наверх" найдена, состояние переключено');
        } else {
            console.log('Кнопка "Наверх" не найдена в DOM');
        }
    };
    
    console.log('Инициализация завершена');
});

// ФИКС: Гарантируем что кнопка будет работать даже при динамической загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
    initBackToTop();
}
