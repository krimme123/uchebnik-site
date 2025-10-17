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

// Кнопка "Наверх" - СУПЕР ПРОВЕРКИ В КОНСОЛИ
function initBackToTop() {
    console.log('🚀 ЗАПУСК initBackToTop()');
    
    // Удаляем старую кнопку если есть
    const oldBtn = document.getElementById('backToTop');
    if (oldBtn) {
        console.log('🗑️ Удаляем старую кнопку:', oldBtn);
        oldBtn.remove();
    }

    // Создаем новую кнопку
    const backToTop = document.createElement('button');
    backToTop.id = 'backToTop';
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Вернуться наверх');
    backToTop.setAttribute('title', 'Наверх');
    
    // Стили для кнопки - ВСЕГДА ВИДИМА
    backToTop.style.cssText = `
        position: fixed !important;
        bottom: 90px !important;
        right: 20px !important;
        width: 50px !important;
        height: 50px !important;
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 50% !important;
        font-size: 20px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 10000 !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
        opacity: 1 !important;
        visibility: visible !important;
        transition: all 0.3s ease !important;
    `;

    document.body.appendChild(backToTop);
    console.log('✅ Кнопка создана и добавлена в DOM:', backToTop);

    // ДЕТАЛЬНАЯ ПРОВЕРКА СТИЛЕЙ
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(backToTop);
        console.log('🔍 ПРОВЕРКА СТИЛЕЙ КНОПКИ:');
        console.log('- display:', computedStyle.display);
        console.log('- opacity:', computedStyle.opacity);
        console.log('- visibility:', computedStyle.visibility);
        console.log('- position:', computedStyle.position);
        console.log('- bottom:', computedStyle.bottom);
        console.log('- right:', computedStyle.right);
        console.log('- z-index:', computedStyle.zIndex);
    }, 100);

    // ПРОСТОЙ И РАБОЧИЙ КЛИК НАВЕРХ
    backToTop.addEventListener('click', function(e) {
        console.log('🎯 КЛИК ПО СТРЕЛКЕ!');
        console.log('- Event:', e);
        console.log('- Current scrollY:', window.scrollY);
        console.log('- Button visible:', this.offsetParent !== null);
        
        // Пробуем разные методы скролла
        console.log('🔄 Запускаем скролл наверх...');
        
        // Метод 1 - основной
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Метод 2 - backup
        setTimeout(() => {
            if (window.scrollY > 0) {
                console.log('🔄 Метод 1 не сработал, пробуем метод 2...');
                document.documentElement.scrollTop = 0;
            }
        }, 100);
        
        // Метод 3 - ultimate
        setTimeout(() => {
            if (window.scrollY > 0) {
                console.log('🔄 Метод 2 не сработал, пробуем метод 3...');
                document.body.scrollTop = 0;
            }
        }, 200);
        
        // Финальная проверка
        setTimeout(() => {
            console.log('📊 Результат скролла:', {
                'window.scrollY': window.scrollY,
                'document.documentElement.scrollTop': document.documentElement.scrollTop,
                'document.body.scrollTop': document.body.scrollTop
            });
        }, 500);
    });

    // Добавляем тестовые данные для отладки
    window.debugBackToTop = function() {
        console.log('🐛 DEBUG BACK TO TOP:');
        console.log('1. Элемент:', backToTop);
        console.log('2. В DOM?:', document.body.contains(backToTop));
        console.log('3. Стили:', backToTop.style.cssText);
        console.log('4. Computed стили:', window.getComputedStyle(backToTop));
        console.log('5. Слушатели:', backToTop.onclick);
        
        // Тестовый клик
        backToTop.click();
    };

    console.log('🎯 Стрелка создана - ВСЕГДА ВИДИМА! Проверь консоль для дебага.');
}

// Функция для анимаций при скролле
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-scroll');
    
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

// Функция для обновления видимости карточек
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

// Функция для добавления работы в карточки
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

// Функция для симуляции добавления работы через таблицу (для тестирования)
function simulateTableWorkAdd(workData) {
    addWorkToCard(workData);
    updateCardsVisibility();
}

// Функция для управления поиском
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Инициализация приложения...');
    console.log('📍 Текущая страница:', window.location.href);
    console.log('📏 Высота окна:', window.innerHeight);
    console.log('📐 Ширина окна:', window.innerWidth);
    
    initMobileNavigation();
    initBackToTop();
    initScrollAnimations();
    initSearch();
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
    
    console.log('✅ Инициализация завершена');
    
    // ДОБАВЛЯЕМ ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ДЕБАГА
    window.helpBackToTop = function() {
        console.log('🆘 ПОМОЩЬ ПО СТРЕЛКЕ:');
        console.log('1. debugBackToTop() - детальная информация о стрелке');
        console.log('2. testScroll() - тест скролла');
        console.log('3. forceShowArrow() - принудительно показать стрелку');
        console.log('4. checkArrowStyles() - проверить стили стрелки');
    };
    
    window.testScroll = function() {
        console.log('🧪 ТЕСТ СКРОЛЛА:');
        window.scrollTo({ top: 500, behavior: 'smooth' });
        setTimeout(() => {
            console.log('📊 После скролла вниз:', window.scrollY);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                console.log('📊 После скролла наверх:', window.scrollY);
            }, 500);
        }, 500);
    };
    
    window.forceShowArrow = function() {
        const arrow = document.getElementById('backToTop');
        if (arrow) {
            arrow.style.opacity = '1';
            arrow.style.visibility = 'visible';
            arrow.style.display = 'flex';
            console.log('🔧 Стрелка принудительно показана!');
        } else {
            console.log('❌ Стрелка не найдена!');
        }
    };
    
    window.checkArrowStyles = function() {
        const arrow = document.getElementById('backToTop');
        if (!arrow) {
            console.log('❌ Стрелка не найдена в DOM!');
            return;
        }
        
        const computed = window.getComputedStyle(arrow);
        console.log('🎨 СТИЛИ СТРЕЛКИ:');
        console.log('- display:', computed.display);
        console.log('- opacity:', computed.opacity);
        console.log('- visibility:', computed.visibility);
        console.log('- position:', computed.position);
        console.log('- bottom:', computed.bottom);
        console.log('- right:', computed.right);
        console.log('- z-index:', computed.zIndex);
        console.log('- width:', computed.width);
        console.log('- height:', computed.height);
        console.log('- В DOM?:', document.body.contains(arrow));
        console.log('- Видима?:', arrow.offsetParent !== null);
    };
    
    console.log('🔧 Глобальные функции дебага добавлены:');
    console.log('   helpBackToTop(), testScroll(), forceShowArrow(), checkArrowStyles()');
});

// Тестовая функция для принудительного показа кнопки
window.testBackToTop = function() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
        console.log('✅ Стрелка принудительно показана');
        return true;
    } else {
        console.log('❌ Стрелка не найдена');
        return false;
    }
};

// Функция для проверки стрелки
window.checkBackToTop = function() {
    const backToTop = document.getElementById('backToTop');
    console.log('🔍 Проверка стрелки:');
    console.log('- Элемент:', backToTop);
    console.log('- Стили:', backToTop ? {
        opacity: backToTop.style.opacity,
        visibility: backToTop.style.visibility,
        display: backToTop.style.display
    } : 'null');
    return backToTop;
};

// Экспорт функций для использования в других модулях
window.app = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    clearCart,
    showNotification,
    addWorkToCard
};
