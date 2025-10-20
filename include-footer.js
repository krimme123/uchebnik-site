// Система include для футера
class FooterLoader {
    constructor() {
        this.footerFile = 'footer.html';
    }

    async loadFooter() {
        try {
            const response = await fetch(this.footerFile);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            
            // Находим или создаем контейнер для футера
            let footerContainer = document.querySelector('[data-include-footer]');
            if (!footerContainer) {
                footerContainer = document.createElement('div');
                footerContainer.setAttribute('data-include-footer', '');
                document.body.appendChild(footerContainer);
            }
            
            footerContainer.innerHTML = html;
            console.log('Футер успешно загружен');
            
        } catch (error) {
            console.error('Ошибка загрузки футера:', error);
            this.loadFallbackFooter();
        }
    }

    loadFallbackFooter() {
        const footerContainer = document.querySelector('[data-include-footer]') || document.createElement('div');
        footerContainer.innerHTML = `
            <footer class="site-footer">
                <div class="footer-inner">
                    <p>© 2025 Uchebnik — Все права защищены!</p>
                    <nav class="footer-nav">
                        <a href="index.html">Главная</a>
                        <a href="works.html">Работы</a>
                        <a href="reviews.html">Отзывы</a>
                        <a href="news.html">Новости</a>
                        <a href="contacts.html">Контакты</a>
                        <a href="privacy.html">Политика конфиденциальности</a>
                        <a href="terms.html">Пользовательское соглашение</a>
                    </nav>
                </div>
            </footer>
        `;
        
        if (!footerContainer.hasAttribute('data-include-footer')) {
            footerContainer.setAttribute('data-include-footer', '');
            document.body.appendChild(footerContainer);
        }
    }
}

// Загрузка футера при готовности DOM
document.addEventListener('DOMContentLoaded', function() {
    const footerLoader = new FooterLoader();
    footerLoader.loadFooter();
});
