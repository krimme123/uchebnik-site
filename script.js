// Бургер меню
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
    });
    
    // Закрытие меню при клике на ссылку
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        });
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
    });
}

// Переключение темы
const themeBtn = document.getElementById('themeBtn');
const themeIcon = themeBtn?.querySelector('.theme-icon');

if (themeBtn) {
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    });
}

// Капча
const overlay = document.getElementById('overlay');
const checkBox = document.getElementById('check');
const statusText = document.getElementById('status');

// Проверяем, прошла ли уже капча
if (localStorage.getItem('captchaPassed') === 'true') {
    overlay.style.display = 'none';
}

if (checkBox) {
    checkBox.addEventListener('click', () => {
        if (checkBox.classList.contains('checked')) return;
        
        checkBox.classList.add('checked');
        statusText.style.display = 'block';
        
        setTimeout(() => {
            statusText.textContent = 'Подтверждено!';
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    localStorage.setItem('captchaPassed', 'true');
                }, 300);
            }, 1000);
        }, 2000);
    });
}

// Закрытие меню при изменении размера окна (на случай поворота устройства)
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mainNav) {
        mainNav.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
    }
});
