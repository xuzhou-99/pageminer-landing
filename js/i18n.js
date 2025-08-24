/**
 * PageMiner 国际化配置文件
 * 支持多语言切换和SEO优化
 */

class I18nManager {
    constructor() {
        this.currentLang = 'zh-CN';
        this.fallbackLang = 'en';
        this.supportedLangs = ['zh-CN', 'en'];
        this.translations = {};
        this.isInitialized = false;
        console.log('🌐 I18nManager 初始化开始');
    }

    async init() {
        try {
            console.log('🌐 开始初始化国际化系统...');
            
            // 检测用户语言偏好
            this.detectUserLanguage();
            console.log('🌐 检测到语言:', this.currentLang);
            
            // 加载语言文件
            await this.loadTranslations();
            console.log('🌐 语言文件加载完成');
            
            // 应用当前语言
            this.applyLanguage();
            console.log('🌐 语言应用完成');
            
            // 设置语言切换事件
            this.setupLanguageSwitcher();
            console.log('🌐 语言切换器设置完成');
            
            this.isInitialized = true;
            console.log('✅ 国际化系统初始化完成');
            
        } catch (error) {
            console.error('❌ 国际化系统初始化失败:', error);
        }
    }

    detectUserLanguage() {
        // 从URL参数获取语言
        const urlParams = new URLSearchParams(window.location.search);
        const langFromUrl = urlParams.get('lang');
        
        if (langFromUrl && this.supportedLangs.includes(langFromUrl)) {
            this.currentLang = langFromUrl;
            console.log('🌐 从URL参数设置语言:', this.currentLang);
        } else {
            // 从localStorage获取
            const savedLang = localStorage.getItem('pageminer-lang');
            if (savedLang && this.supportedLangs.includes(savedLang)) {
                this.currentLang = savedLang;
                console.log('🌐 从localStorage恢复语言:', this.currentLang);
            } else {
                // 从浏览器语言检测
                const browserLang = navigator.language || navigator.userLanguage;
                const detectedLang = this.supportedLangs.find(lang => 
                    browserLang.startsWith(lang) || browserLang.startsWith(lang.split('-')[0])
                );
                
                if (detectedLang) {
                    this.currentLang = detectedLang;
                    console.log('🌐 从浏览器检测语言:', this.currentLang);
                }
            }
        }

        // 保存到localStorage
        localStorage.setItem('pageminer-lang', this.currentLang);
    }

    async loadTranslations() {
        try {
            console.log('🌐 开始加载语言文件...');
            
            // 加载所有支持的语言文件
            for (const lang of this.supportedLangs) {
                try {
                    const response = await fetch(`https://xuzhou-99.github.io/pageminer-landing/locales/${lang}.json`);
                    if (response.ok) {
                        this.translations[lang] = await response.json();
                        console.log(`✅ 加载语言文件成功: ${lang}`);
                    } else {
                        console.warn(`⚠️ 加载语言文件失败: ${lang}, 状态: ${response.status}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ 加载语言文件出错: ${lang}`, error);
                }
            }
            
            console.log('🌐 语言文件加载完成，已加载:', Object.keys(this.translations));
            
        } catch (error) {
            console.error('❌ 加载语言文件时发生错误:', error);
        }
    }

    getText(key, lang = null) {
        const targetLang = lang || this.currentLang;
        const fallback = this.translations[this.fallbackLang] || {};
        const target = this.translations[targetLang] || {};
        
        const result = target[key] || fallback[key] || key;
        
        // 调试信息
        if (result === key) {
            console.warn(`⚠️ 未找到翻译键: ${key}, 语言: ${targetLang}`);
        }
        
        return result;
    }

    applyLanguage() {
        console.log('🌐 开始应用语言:', this.currentLang);
        
        // 更新HTML lang属性
        document.documentElement.lang = this.currentLang;
        
        // 更新所有带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`🌐 找到 ${elements.length} 个需要翻译的元素`);
        
        elements.forEach((element, index) => {
            const key = element.getAttribute('data-i18n');
            const text = this.getText(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
            
            if (index < 5) { // 只显示前5个的调试信息
                console.log(`🌐 翻译元素 ${index + 1}: ${key} -> ${text}`);
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
        
        console.log('✅ 语言应用完成');
    }

    updateMetaTags() {
        try {
            // 更新description
            const descMeta = document.querySelector('meta[name="description"]');
            if (descMeta) {
                const descKey = descMeta.getAttribute('data-i18n');
                if (descKey) {
                    descMeta.setAttribute('content', this.getText(descKey));
                }
            }

            // 更新keywords
            const keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (keywordsMeta) {
                const keywordsKey = keywordsMeta.getAttribute('data-i18n');
                if (keywordsKey) {
                    keywordsMeta.setAttribute('content', this.getText(keywordsKey));
                }
            }

            // 更新Open Graph标签
            this.updateOpenGraphTags();
            
            // 更新Twitter Card标签
            this.updateTwitterCardTags();
            
        } catch (error) {
            console.warn('⚠️ 更新meta标签时出错:', error);
        }
    }

    updateOpenGraphTags() {
        try {
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
                const titleKey = ogTitle.getAttribute('data-i18n');
                if (titleKey) {
                    ogTitle.setAttribute('content', this.getText(titleKey));
                }
            }

            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) {
                const descKey = ogDesc.getAttribute('data-i18n');
                if (descKey) {
                    ogDesc.setAttribute('content', this.getText(descKey));
                }
            }
        } catch (error) {
            console.warn('⚠️ 更新Open Graph标签时出错:', error);
        }
    }

    updateTwitterCardTags() {
        try {
            const twitterTitle = document.querySelector('meta[property="twitter:title"]');
            if (twitterTitle) {
                const titleKey = twitterTitle.getAttribute('data-i18n');
                if (titleKey) {
                    twitterTitle.setAttribute('content', this.getText(titleKey));
                }
            }

            const twitterDesc = document.querySelector('meta[property="twitter:description"]');
            if (twitterDesc) {
                const descKey = twitterDesc.getAttribute('data-i18n');
                if (descKey) {
                    twitterDesc.setAttribute('content', this.getText(descKey));
                }
            }
        } catch (error) {
            console.warn('⚠️ 更新Twitter Card标签时出错:', error);
        }
    }

    updatePageTitle() {
        try {
            const titleElement = document.querySelector('title[data-i18n]');
            if (titleElement) {
                const titleKey = titleElement.getAttribute('data-i18n');
                if (titleKey) {
                    document.title = this.getText(titleKey);
                }
            }
        } catch (error) {
            console.warn('⚠️ 更新页面标题时出错:', error);
        }
    }

    switchLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`⚠️ 不支持的语言: ${lang}`);
            return;
        }

        console.log(`🌐 切换语言: ${this.currentLang} -> ${lang}`);
        
        this.currentLang = lang;
        localStorage.setItem('pageminer-lang', lang);
        
        // 更新URL参数
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        
        // 重新应用语言
        this.applyLanguage();
    }

    setupLanguageSwitcher() {
        try {
            // 查找或创建语言切换器
            let switcher = document.querySelector('.language-switcher');
            
            if (!switcher) {
                switcher = this.createLanguageSwitcher();
            }
            
            this.bindLanguageSwitcherEvents(switcher);
            console.log('✅ 语言切换器设置完成');
            
        } catch (error) {
            console.warn('⚠️ 设置语言切换器时出错:', error);
        }
    }

    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        
        const currentLang = document.createElement('div');
        currentLang.className = 'lang-current';
        currentLang.innerHTML = `
            <span class="lang-flag">${this.getLanguageFlag(this.currentLang)}</span>
            <span class="lang-name">${this.getLanguageName(this.currentLang)}</span>
            <span class="lang-arrow">▼</span>
        `;
        
        const dropdown = document.createElement('div');
        dropdown.className = 'lang-dropdown';
        
        this.supportedLangs.forEach(lang => {
            if (lang !== this.currentLang) {
                const langItem = document.createElement('div');
                langItem.className = 'lang-item';
                langItem.setAttribute('data-lang', lang);
                langItem.innerHTML = `
                    <span class="lang-flag">${this.getLanguageFlag(lang)}</span>
                    <span class="lang-name">${this.getLanguageName(lang)}</span>
                `;
                dropdown.appendChild(langItem);
            }
        });
        
        switcher.appendChild(currentLang);
        switcher.appendChild(dropdown);
        
        // 插入到导航栏
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.appendChild(switcher);
        }
        
        return switcher;
    }

    bindLanguageSwitcherEvents(switcher) {
        const currentLang = switcher.querySelector('.lang-current');
        const dropdown = switcher.querySelector('.lang-dropdown');
        
        // 切换下拉菜单
        currentLang.addEventListener('click', () => {
            dropdown.classList.toggle('show');
        });
        
        // 选择语言
        dropdown.addEventListener('click', (e) => {
            const langItem = e.target.closest('.lang-item');
            if (langItem) {
                const lang = langItem.getAttribute('data-lang');
                this.switchLanguage(lang);
                dropdown.classList.remove('show');
            }
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
            'ja': '🇯🇵'
        };
        return flags[lang] || '🌐';
    }

    getLanguageName(lang) {
        const names = {
            'zh-CN': '中文',
            'en': 'English',
            'ja': '日本語'
        };
        return names[lang] || lang;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getSupportedLanguages() {
        return this.supportedLangs;
    }

    isLanguageSupported(lang) {
        return this.supportedLangs.includes(lang);
    }
}

// 等待DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🌐 DOM加载完成，初始化国际化系统...');
        window.i18n = new I18nManager();
    });
} else {
    console.log('🌐 DOM已加载，立即初始化国际化系统...');
    window.i18n = new I18nManager();
}

// 导出到全局作用域
window.I18nManager = I18nManager;
