// script.js - общие функции для всех страниц

// Глобальная переменная для хранения добавленных работ
let addedWorks = [];

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

// ========== НОВЫЕ ФУНКЦИИ ДЛЯ ПОИСКА ПО ДОБАВЛЕННЫМ РАБОТАМ ==========

// Получаем работы из карточек на странице
function getWorksFromCards() {
    const works = [];
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        const categoryElement = card.querySelector('.card-meta span');
        const category = categoryElement?.textContent || '';
        const classElement = card.querySelector('.card-meta span:nth-child(2)');
        const workClass = classElement?.textContent || '';
        const icon = card.querySelector('.card-icon')?.textContent || '📄';
        
        if (title && category) {
            works.push({
                id: Date.now() + Math.random(),
                title: title,
                description: description,
                category: category,
                class: workClass,
                icon: icon,
                tags: [category, workClass, title.split(' ')[0]]
            });
        }
    });
    
    return works;
}

// Поиск по добавленным работам
function searchWorks(query, limit = 10) {
    const works = getWorksFromCards();
    if (!query || query.length < 2 || works.length === 0) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return works.filter(work => {
        const inTitle = work.title.toLowerCase().includes(searchTerm);
        const inDescription = work.description.toLowerCase().includes(searchTerm);
        const inCategory = work.category.toLowerCase().includes(searchTerm);
        const inClass = work.class.toLowerCase().includes(searchTerm);
        const inTags = work.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        return inTitle || inDescription || inCategory || inClass || inTags;
    }).slice(0, limit);
}

// Получение подсказок для поиска
function getSearchSuggestions(query) {
    const results = searchWorks(query, 5);
    return results.map(work => ({
        text: work.title,
        category: work.category,
        class: work.class
    }));
}

// Инициализация поиска
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput) return;
    
    let currentFocus = -1;
    
    function hideSuggestions() {
        if (searchSuggestions) {
            searchSuggestions.classList.remove('show');
            searchSuggestions.innerHTML = '';
        }
        currentFocus = -1;
    }
    
    function hideResults() {
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }
    
    function showSuggestions(suggestions = []) {
        if (!searchSuggestions || suggestions.length === 0) {
            hideSuggestions();
            return;
        }
        
        searchSuggestions.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'search-suggestion';
            div.innerHTML = `
                <span>${suggestion.text}</span>
                <span class="suggestion-category">${suggestion.category}</span>
                ${suggestion.class ? `<span class="suggestion-class">${suggestion.class}</span>` : ''}
            `;
            div.addEventListener('click', () => {
                searchInput.value = suggestion.text;
                performSearch(suggestion.text);
                hideSuggestions();
            });
            searchSuggestions.appendChild(div);
        });
        
        searchSuggestions.classList.add('show');
        currentFocus = -1;
    }
    
    function performSearch(query) {
        const results = searchWorks(query);
        
        if (searchResults) {
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <h3>Ничего не найдено</h3>
                        <p>По запросу "${query}" ничего не найдено в добавленных работах.</p>
                    </div>
                `;
            } else {
                searchResults.innerHTML = results.map(result => `
                    <div class="search-result-item">
                        <div class="search-result-icon">${result.icon}</div>
                        <div class="search-result-content">
                            <span class="search-result-category">${result.category}</span>
                            ${result.class ? `<span class="search-result-class">${result.class}</span>` : ''}
                            <h3 class="search-result-title">${result.title}</h3>
                            <p class="search-result-description">${result.description}</p>
                        </div>
                    </div>
                `).join('');
            }
            searchResults.classList.add('active');
        }
        
        hideSuggestions();
    }
    
    // Обработчики событий
    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        
        if (value.length < 2) {
            hideSuggestions();
            hideResults();
            return;
        }
        
        const suggestions = getSearchSuggestions(value);
        showSuggestions(suggestions);
    });
    
    searchInput.addEventListener('keydown', function(e) {
        const suggestions = searchSuggestions?.querySelectorAll('.search-suggestion') || [];
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus = Math.min(currentFocus + 1, suggestions.length - 1);
            updateActiveSuggestion(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus = Math.max(currentFocus - 1, -1);
            updateActiveSuggestion(suggestions);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1 && suggestions[currentFocus]) {
                suggestions[currentFocus].click();
            } else {
                performSearch(this.value);
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
    
    function updateActiveSuggestion(suggestions) {
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('active', index === currentFocus);
        });
    }
    
    // Закрытие подсказок при клике вне поиска
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-form')) {
            hideSuggestions();
        }
    });
    
    // Старая логика для обратной совместимости
    if (searchResults) {
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                searchResults.classList.remove('active');
            }
        });
        
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                searchResults.classList.remove('active');
                hideSuggestions();
            }
        });
    }
}

// ========== СУЩЕСТВУЮЩИЕ ФУНКЦИИ (БЕЗ ИЗМЕНЕНИЙ) ==========

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
    if (!backToTop) {
        console.warn('❌ Кнопка "Наверх" не найдена');
        return;
    }
    
    console.log('✅ Кнопка "Наверх" найдена, инициализируем...');
    
    // Гарантируем, что кнопка всегда видна и кликабельна
    backToTop.style.display = 'flex';
    backToTop.style.opacity = '1';
    backToTop.style.visibility = 'visible';
    backToTop.style.zIndex = '10000';
    backToTop.style.cursor = 'pointer';
    
    // Удаляем все предыдущие обработчики
    const newBackToTop = backToTop.cloneNode(true);
    backToTop.parentNode.replaceChild(newBackToTop, backToTop);
    
    // Новый обработчик для кнопки
    document.getElementById('backToTop').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔼 Начинаем плавную прокрутку наверх...');
        
        // УНИВЕРСАЛЬНЫЙ МЕТОД ПРОКРУТКИ
        const scrollToTop = () => {
            const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
            
            if (currentPosition > 0) {
                // Плавное уменьшение позиции
                window.scrollTo(0, currentPosition - currentPosition / 8);
                requestAnimationFrame(scrollToTop);
            }
        };
        
        // Альтернативный метод для браузеров, поддерживающих smooth
        try {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (error) {
            console.log('Smooth scroll не поддерживается, используем анимацию');
            scrollToTop();
        }
        
        // Дополнительные методы на всякий случай
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    });
    
    console.log('✅ Кнопка "Наверх" полностью инициализирована');
}

function initScrollAnimations() {
    // Отключаем анимации для карточек
    const animatedElements = document.querySelectorAll('.fade-in-scroll');
    
    animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'translateY(0)';
    });
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
        // Принудительно делаем карточки видимыми
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.display = 'flex';
        card.style.transform = 'translateY(0)';
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
    // ТОЛЬКО базовый класс, без анимаций
    card.className = 'card';
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
    
    console.log('✅ Карточка добавлена:', workData.title);
}

function simulateTableWorkAdd(workData) {
    addWorkToCard(workData);
    updateCardsVisibility();
}

// Основная инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Инициализация приложения...');
    
    initMobileNavigation();
    initBackToTop();
    initSearch(); // Обновленная функция поиска
    updateCartCount();
    updateCardsVisibility();
    
    // Активная навигация
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

// Глобальный объект для доступа к функциям из консоли
window.app = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    clearCart,
    showNotification,
    addWorkToCard,
    initBackToTop,
    searchWorks, // Добавляем функцию поиска в глобальный объект
    getWorksFromCards // Добавляем функцию получения работ
};
