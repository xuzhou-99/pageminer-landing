// ===== PageMiner 主页面 JavaScript =====

class PageMiner {
    constructor() {
        this.init();
    }

    init() {
        this.initSmoothScrolling();
        this.initMobileMenu();
        this.initAnimations();
        this.initCarousel(); // 新增轮播图初始化
    }

    // 初始化轮播图
    initCarousel() {
        const carousel = document.querySelector('.screenshots-carousel');
        if (!carousel) return;

        this.currentSlide = 0;
        this.slides = carousel.querySelectorAll('.carousel-slide');
        this.indicators = carousel.querySelectorAll('.indicator');
        this.prevBtn = carousel.querySelector('.carousel-prev');
        this.nextBtn = carousel.querySelector('.carousel-next');
        this.totalSlides = this.slides.length;

        if (this.totalSlides === 0) return;

        // 绑定事件
        this.bindCarouselEvents();
        
        // 自动播放
        this.startAutoPlay();
        
        // 触摸滑动支持
        this.initTouchSupport();
    }

    // 绑定轮播图事件
    bindCarouselEvents() {
        // 上一张/下一张按钮
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // 指示器点击
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // 鼠标悬停暂停自动播放
        const carousel = document.querySelector('.screenshots-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
            carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }

    // 切换到指定幻灯片
    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;

        // 移除当前活动状态
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');

        // 设置新的活动状态
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');

        // 更新指示器状态
        this.updateIndicators();
    }

    // 下一张幻灯片
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }

    // 上一张幻灯片
    prevSlide() {
        const prevIndex = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    // 更新指示器状态
    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    // 开始自动播放
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // 5秒切换一次
    }

    // 暂停自动播放
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // 初始化触摸支持
    initTouchSupport() {
        const carousel = document.querySelector('.screenshots-carousel');
        if (!carousel) return;

        let startX = 0;
        let endX = 0;
        let isDragging = false;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.pauseAutoPlay();
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            const threshold = 50; // 最小滑动距离

            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.nextSlide(); // 向左滑动，下一张
                } else {
                    this.prevSlide(); // 向右滑动，上一张
                }
            }

            isDragging = false;
            this.startAutoPlay();
        });
    }

    // 初始化平滑滚动
    initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // 考虑导航栏高度
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // 初始化移动端菜单
    initMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // 点击菜单项后关闭菜单
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    // 初始化动画效果
    initAnimations() {
        // 浮动卡片动画
        this.initFloatingCards();
        
        // 滚动触发动画
        this.initScrollAnimations();
    }

    // 浮动卡片动画
    initFloatingCards() {
        const cards = document.querySelectorAll('.floating-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
        });
    }

    // 滚动触发动画
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // 观察需要动画的元素
        const animatedElements = document.querySelectorAll('.feature-card, .step, .screenshot-item, .use-case-card, .pricing-card');
        animatedElements.forEach(el => observer.observe(el));
    }

    // 设置事件监听器
    setupEventListeners() {
        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // 导航栏滚动效果
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // 移动端菜单切换
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // 价格卡片悬停效果
        this.setupPricingCards();

        // 截图悬停效果
        this.setupScreenshotEffects();

        // 统计数字动画
        this.setupStatsAnimation();
    }

    // 设置动画效果
    setupAnimations() {
        // 添加进入动画类
        const animatedElements = document.querySelectorAll('.feature-card, .step-item, .screenshot-item, .use-case-card, .pricing-card');
        
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });

        // 浮动卡片动画
        this.setupFloatingCards();
    }

    // 设置移动端菜单
    setupMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (!navMenu || !navToggle) return;

        // 点击导航链接时关闭菜单
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // 切换移动端菜单
    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (!navMenu || !navToggle) return;

        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');

        // 添加汉堡菜单动画
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }

    // 处理滚动事件
    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }

    // 设置价格卡片效果
    setupPricingCards() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('featured')) {
                    card.style.transform = 'translateY(-10px) scale(1.02)';
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('featured')) {
                    card.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

    // 设置截图效果
    setupScreenshotEffects() {
        const screenshotItems = document.querySelectorAll('.screenshot-item');
        
        screenshotItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const overlay = item.querySelector('.screenshot-overlay');
                if (overlay) {
                    overlay.style.transform = 'translateY(0)';
                }
            });

            item.addEventListener('mouseleave', () => {
                const overlay = item.querySelector('.screenshot-overlay');
                if (overlay) {
                    overlay.style.transform = 'translateY(100%)';
                }
            });
        });
    }

    // 设置浮动卡片
    setupFloatingCards() {
        const floatingCards = document.querySelectorAll('.floating-card');
        
        floatingCards.forEach((card, index) => {
            // 添加鼠标悬停暂停动画
            card.addEventListener('mouseenter', () => {
                card.style.animationPlayState = 'paused';
            });

            card.addEventListener('mouseleave', () => {
                card.style.animationPlayState = 'running';
            });

            // 添加点击效果
            card.addEventListener('click', () => {
                card.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            });
        });
    }

    // 设置统计数字动画
    setupStatsAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const animateNumber = (element, target, duration = 2000) => {
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current).toLocaleString() + '+';
            }, 16);
        };

        // 使用 Intersection Observer 触发动画
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const number = entry.target.textContent;
                    const target = parseInt(number.replace(/[^\d]/g, ''));
                    animateNumber(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    // 设置滚动效果
    setupScrollEffects() {
        // 视差滚动效果
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero::before');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // 设置交叉观察器
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // 观察所有需要动画的元素
        const animatedElements = document.querySelectorAll('.feature-card, .step-item, .screenshot-item, .use-case-card, .pricing-card');
        animatedElements.forEach(el => observer.observe(el));
    }

    // 添加加载动画
    addLoadingAnimation() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);

        // 页面加载完成后移除
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(loadingOverlay);
                }, 300);
            }, 500);
        });
    }

    // 添加返回顶部按钮
    addBackToTop() {
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '↑';
        backToTop.setAttribute('aria-label', '返回顶部');
        document.body.appendChild(backToTop);

        // 显示/隐藏逻辑
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // 点击返回顶部
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 添加键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: 搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }

            // ESC: 关闭移动端菜单
            if (e.key === 'Escape') {
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    this.toggleMobileMenu();
                }
            }

            // 数字键导航
            if (e.key >= '1' && e.key <= '6') {
                const sections = ['#features', '#how-it-works', '#screenshots', '#pricing', '#download'];
                const index = parseInt(e.key) - 1;
                if (sections[index]) {
                    e.preventDefault();
                    document.querySelector(sections[index])?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    // 聚焦搜索框
    focusSearch() {
        // 这里可以添加搜索功能
        console.log('搜索功能待实现');
    }

    // 添加性能监控
    setupPerformanceMonitoring() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('页面加载时间:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
            }, 0);
        });

        // 监控滚动性能
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                // 滚动停止后的处理
            }, 100);
        });
    }

    // 添加错误处理
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('页面错误:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('未处理的Promise拒绝:', e.reason);
        });
    }

    // 添加分析追踪
    setupAnalytics() {
        // 页面浏览追踪
        const trackPageView = () => {
            if (typeof gtag !== 'undefined') {
                gtag('config', 'GA_MEASUREMENT_ID', {
                    page_title: document.title,
                    page_location: window.location.href
                });
            }
        };

        // 按钮点击追踪
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-primary, .download-btn, .pricing-btn')) {
                this.trackEvent('button_click', {
                    button_text: e.target.textContent.trim(),
                    button_location: e.target.closest('section')?.id || 'unknown'
                });
            }
        });

        // 初始化追踪
        trackPageView();
    }

    // 追踪事件
    trackEvent(action, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, parameters);
        }
        console.log('事件追踪:', action, parameters);
    }

    // 添加主题切换功能
    setupThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('aria-label', '切换主题');
        themeToggle.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-lg);
        `;

        document.body.appendChild(themeToggle);

        // 主题切换逻辑
        let isDark = false;
        themeToggle.addEventListener('click', () => {
            isDark = !isDark;
            document.documentElement.classList.toggle('dark-theme', isDark);
            themeToggle.innerHTML = isDark ? '☀️' : '🌙';
            
            // 保存主题偏好
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // 恢复主题偏好
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            isDark = true;
            document.documentElement.classList.add('dark-theme');
            themeToggle.innerHTML = '☀️';
        }
    }

    // 添加通知系统
    setupNotifications() {
        // 检查通知权限
        if ('Notification' in window && Notification.permission === 'granted') {
            this.showNotification('欢迎使用PageMiner！', '开始您的数据提取之旅');
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('通知已启用', '您将收到重要更新提醒');
                }
            });
        }
    }

    // 显示通知
    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/images/favicon.ico',
                badge: '/images/favicon.ico'
            });
        }
    }
}

// ===== 页面加载完成后初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    const pageMiner = new PageMiner();
    
    // 添加加载动画
    pageMiner.addLoadingAnimation();
    
    // 添加返回顶部按钮
    pageMiner.addBackToTop();
    
    // 设置键盘快捷键
    pageMiner.setupKeyboardShortcuts();
    
    // 设置性能监控
    pageMiner.setupPerformanceMonitoring();
    
    // 设置错误处理
    pageMiner.setupErrorHandling();
    
    // 设置分析追踪
    pageMiner.setupAnalytics();
    
    // 设置主题切换
    pageMiner.setupThemeToggle();
    
    // 设置通知系统
    pageMiner.setupNotifications();
    
    // 将实例暴露到全局作用域（用于调试）
    window.pageMiner = pageMiner;
});

// ===== 工具函数 =====

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 格式化数字
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// 获取元素位置
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        width: rect.width,
        height: rect.height
    };
}

// 检查元素是否在视口中
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 平滑滚动到元素
function smoothScrollTo(element, offset = 0) {
    const elementPosition = getElementPosition(element);
    const offsetPosition = elementPosition.top - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// 添加CSS样式
function addStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// 添加额外的CSS样式
addStyles(`
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.3s ease;
    }

    .loading-spinner {
        text-align: center;
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid var(--border-light);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
    }

    .back-to-top.visible {
        opacity: 1;
        visibility: visible;
    }

    .back-to-top:hover {
        background: var(--primary-dark);
        transform: translateY(-3px);
        box-shadow: var(--shadow-xl);
    }

    .dark-theme {
        --bg-primary: #1f2937;
        --bg-secondary: #374151;
        --bg-tertiary: #4b5563;
        --text-primary: #f9fafb;
        --text-secondary: #d1d5db;
        --text-muted: #9ca3af;
        --border-color: #4b5563;
        --border-light: #374151;
    }

    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        border-top: 1px solid var(--border-light);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-lg);
    }

    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
        
        .nav-menu.active {
            display: flex;
        }
    }
`);

console.log('PageMiner 主页面已加载完成！🚀');
