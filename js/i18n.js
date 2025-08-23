/**
 * PageMiner 国际化配置文件
 * 支持多语言切换和SEO优化
 */

class I18nManager {
    constructor() {
        this.currentLang = 'zh-CN';
        this.fallbackLang = 'en';
        this.supportedLangs = ['zh-CN', 'en', 'ja', 'ko', 'es', 'fr', 'de'];
        this.translations = {};
        this.init();
    }

    async init() {
        // 检测用户语言偏好
        this.detectUserLanguage();
        
        // 加载语言文件
        await this.loadTranslations();
        
        // 应用当前语言
        this.applyLanguage();
        
        // 设置语言切换事件
        this.setupLanguageSwitcher();
    }

    detectUserLanguage() {
        // 从URL参数获取语言
        const urlParams = new URLSearchParams(window.location.search);
        const langFromUrl = urlParams.get('lang');
        
        if (langFromUrl && this.supportedLangs.includes(langFromUrl)) {
            this.currentLang = langFromUrl;
        } else {
            // 从浏览器语言检测
            const browserLang = navigator.language || navigator.userLanguage;
            const detectedLang = this.supportedLangs.find(lang => 
                browserLang.startsWith(lang) || browserLang.startsWith(lang.split('-')[0])
            );
            
            if (detectedLang) {
                this.currentLang = detectedLang;
            }
        }

        // 保存到localStorage
        localStorage.setItem('pageminer-lang', this.currentLang);
    }

    async loadTranslations() {
        try {
            // 加载所有支持的语言文件
            for (const lang of this.supportedLangs) {
                const response = await fetch(`locales/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                }
            }
        } catch (error) {
            console.warn('Failed to load translations:', error);
        }
    }

    getText(key, lang = null) {
        const targetLang = lang || this.currentLang;
        const fallback = this.translations[this.fallbackLang] || {};
        const target = this.translations[targetLang] || {};
        
        return target[key] || fallback[key] || key;
    }

    applyLanguage() {
        // 更新HTML lang属性
        document.documentElement.lang = this.currentLang;
        
        // 更新所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.getText(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        });

        // 更新meta标签
        this.updateMetaTags();
        
        // 更新页面标题
        this.updatePageTitle();
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }

    updateMetaTags() {
        const metaDescription = document.querySelector('meta[name="description"]');
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        
        if (metaDescription) {
            metaDescription.content = this.getText('meta.description');
        }
        
        if (metaKeywords) {
            metaKeywords.content = this.getText('meta.keywords');
        }

        // 更新Open Graph标签
        this.updateOpenGraphTags();
        
        // 更新Twitter Card标签
        this.updateTwitterCardTags();
    }

    updateOpenGraphTags() {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        
        if (ogTitle) ogTitle.content = this.getText('meta.og.title');
        if (ogDescription) ogDescription.content = this.getText('meta.og.description');
        if (ogLocale) ogLocale.content = this.currentLang.replace('-', '_');
    }

    updateTwitterCardTags() {
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        
        if (twitterTitle) twitterTitle.content = this.getText('meta.twitter.title');
        if (twitterDescription) twitterDescription.content = this.getText('meta.twitter.description');
    }

    updatePageTitle() {
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = this.getText('meta.title');
        }
    }

    switchLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('pageminer-lang', lang);
        
        // 更新URL参数
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        
        // 应用新语言
        this.applyLanguage();
    }

    setupLanguageSwitcher() {
        // 创建语言切换器
        const languageSwitcher = document.createElement('div');
        languageSwitcher.className = 'language-switcher';
        languageSwitcher.innerHTML = `
            <div class="lang-current">
                <span class="lang-flag">${this.getLanguageFlag(this.currentLang)}</span>
                <span class="lang-name">${this.getLanguageName(this.currentLang)}</span>
                <span class="lang-arrow">▼</span>
            </div>
            <div class="lang-dropdown">
                ${this.supportedLangs.map(lang => `
                    <div class="lang-option ${lang === this.currentLang ? 'active' : ''}" 
                         data-lang="${lang}">
                        <span class="lang-flag">${this.getLanguageFlag(lang)}</span>
                        <span class="lang-name">${this.getLanguageName(lang)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // 插入到导航栏
        const navbar = document.querySelector('.navbar .container');
        if (navbar) {
            navbar.appendChild(languageSwitcher);
        }

        // 绑定事件
        this.bindLanguageSwitcherEvents(languageSwitcher);
    }

    bindLanguageSwitcherEvents(switcher) {
        const current = switcher.querySelector('.lang-current');
        const dropdown = switcher.querySelector('.lang-dropdown');
        const options = switcher.querySelectorAll('.lang-option');

        // 切换下拉菜单
        current.addEventListener('click', () => {
            dropdown.classList.toggle('show');
        });

        // 选择语言
        options.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                this.switchLanguage(lang);
                
                // 更新UI
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // 更新当前显示
                const flag = switcher.querySelector('.lang-flag');
                const name = switcher.querySelector('.lang-name');
                flag.textContent = this.getLanguageFlag(lang);
                name.textContent = this.getLanguageName(lang);
                
                // 隐藏下拉菜单
                dropdown.classList.remove('show');
            });
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    getLanguageFlag(lang) {
        const flags = {
            'zh-CN': '🇨🇳',
            'en': '🇺🇸',
            'ja': '🇯🇵',
            'ko': '🇰🇷',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪'
        };
        return flags[lang] || '🌐';
    }

    getLanguageName(lang) {
        const names = {
            'zh-CN': '中文',
            'en': 'English',
            'ja': '日本語',
            'ko': '한국어',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch'
        };
        return names[lang] || lang;
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 获取支持的语言列表
    getSupportedLanguages() {
        return this.supportedLangs;
    }

    // 检查是否支持某语言
    isLanguageSupported(lang) {
        return this.supportedLangs.includes(lang);
    }
}

// 创建全局实例
window.i18n = new I18nManager();

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
