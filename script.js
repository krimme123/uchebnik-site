// script.js - общие функции для всех страниц

// Конфигурация Google Sheets
const GOOGLE_SHEET_ID = '1MJgYwSVGXQ8HquceWa4yxxTxrPytiDmRm5gaZ0ssGCc'; // Заменить на реальный ID

// Глобальная переменная для кэширования данных
let worksData = [];

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

// ========== ЗАГРУЗКА ИЗ GOOGLE SHEETS (БЕЗ API KEY) ==========

async function loadWorksFromGoogleSheets() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json`;
        
        console.log('🔄 Загрузка данных из Google Sheets...');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        if (json.table && json.table.rows) {
            // Получаем заголовки из первой строки
            const headers = json.table.cols.map(col => col.label);
            worksData = json.table.rows.map((row, rowIndex) => {
                const work = {};
                row.c.forEach((cell, index) => {
                    const header = headers[index]?.toLowerCase() || `column_${index}`;
                    work[header] = cell?.v || '';
                });
                return work;
            }).filter(work => work.title && work.title.trim() !== ''); // Фильтруем пустые строки
            
            console.log('✅ Данные загружены из Google Sheets:', worksData.length, 'работ');
            return worksData;
        } else {
            throw new Error('Нет данных в таблице');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки из Google Sheets:', error);
        worksData = []; // Пустой массив вместо запасных данных
        return worksData;
    }
}

// Поиск по данным из Google Sheets
function searchWorks(query, limit = 10) {
    if (!query || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return worksData.filter(work => {
        const inTitle = work.title?.toLowerCase().includes(searchTerm) || false;
        const inDescription = work.description?.toLowerCase().includes(searchTerm) || false;
        const inCategory = work.category?.toLowerCase().includes(searchTerm) || false;
        const inClass = work.class?.toLowerCase().includes(searchTerm) || false;
        const inTags = work.tags?.toLowerCase().includes(searchTerm) || false;
        
        return inTitle || inDescription || inCategory || inClass || inTags;
    }).slice(0, limit);
}

// ========== ОБНОВЛЕННЫЙ ПОИСК ==========

async function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput) return;
    
    // Загружаем данные при инициализации
    await loadWorksFromGoogleSheets();
    
    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            if (searchResults) {
                searchResults.classList.remove('active');
            }
            return;
        }

        const results = searchWorks(query);
        
        if (searchResults) {
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <h3>Ничего не найдено</h3>
                        <p>По запросу "${query}" ничего не найдено. Попробуйте изменить запрос.</p>
                    </div>
                `;
            } else {
                searchResults.innerHTML = results.map(work => `
                    <div class="search-result-item">
                        <div class="search-result-icon">${work.icon || '📄'}</div>
                        <div class="search-result-content">
                            <span class="search-result-category">${work.category || 'Без категории'}</span>
                            ${work.class ? `<span class="search-result-class">${work.class}</span>` : ''}
                            <h3 class="search-result-title">${work.title || 'Без названия'}</h3>
                            <p class="search-result-description">${work.description || 'Описание отсутствует'}</p>
                        </div>
                    </div>
                `).join('');
            }
            searchResults.classList.add('active');
        }
    }

    // Обработчики событий для поиска
    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            if (searchResults) {
                searchResults.classList.remove('active');
            }
        } else if (e.key === 'Enter') {
            performSearch(this.value);
        }
    });

    // Закрытие результатов при клике вне поиска
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-section')) {
            if (searchResults) {
                searchResults.classList.remove('active');
            }
        }
    });
    
    // Обновление карточек на основе данных из Google Sheets
    updateCardsFromGoogleSheets();
}

// Обновление карточек на странице из Google Sheets
async function updateCardsFromGoogleSheets() {
    const cardsContainer = document.querySelector('.cards');
    if (!cardsContainer) return;
    
    // Очищаем существующие карточки
    cardsContainer.innerHTML = '';
    
    if (worksData.length === 0) {
        cardsContainer.innerHTML = `
            <div class="no-cards-message">
                <div class="no-cards-icon">📚</div>
                <h3>Работы не найдены</h3>
                <p>Добавьте работы в Google Sheets таблицу или проверьте подключение</p>
            </div>
        `;
        return;
    }
    
    // Создаем карточки из данных Google Sheets
    worksData.forEach(work => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-icon">${work.icon || '📄'}</div>
            <h3>${work.title || 'Новая работа'}</h3>
            <p>${work.description || 'Описание работы'}</p>
            <div class="card-meta" style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
                <span style="color: var(--accent); font-weight: 600;">${work.category || 'Категория'}</span>
                ${work.class ? `<span style="color: var(--muted); font-size: 0.9rem; margin-left: 12px;">${work.class}</span>` : ''}
            </div>
            <a href="${work.url || '#'}" class="card-link">
                Смотреть работы
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
            </a>
        `;
        cardsContainer.appendChild(card);
    });
    
    console.log('✅ Карточки обновлены из Google Sheets:', worksData.length, 'работ');
}

// ========== СУЩЕСТВУЮЩИЕ ФУНКЦИИ ==========

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
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎉 Инициализация приложения...');
    
    // Сначала инициализируем базовые функции
    initMobileNavigation();
    initBackToTop();
    updateCartCount();
    updateCardsVisibility();
    
    // Затем инициализируем поиск (он загрузит данные из Google Sheets)
    await initSearch();
    
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
    loadWorksFromGoogleSheets,
    searchWorks,
    updateCardsFromGoogleSheets
};
