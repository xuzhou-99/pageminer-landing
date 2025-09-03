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

            // 创建语言切换器
            this.createLanguageSwitcher();

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
                let response;
                try {
                    console.log(`🌐 尝试加载语言文件: ${lang}`);

                    // 尝试从相对路径加载（本地开发）
                    response = await fetch(`./locales/${lang}.json`);
                    console.log(`🌐 相对路径加载结果: ${lang}, 状态: ${response.status}`);
                } catch (error) {
                    console.warn(`⚠️ 加载语言文件出错: ${lang}`, error);
                }

                try {
                    // 如果失败，尝试从GitHub Pages加载
                    if (!response || !response.ok) {
                        console.log(`🌐 尝试从GitHub Pages加载: ${lang}`);
                        response = await fetch(`https://xuzhou-99.github.io/pageminer-landing/locales/${lang}.json`);
                        console.log(`🌐 GitHub Pages加载结果: ${lang}, 状态: ${response.status}`);
                    }

                    if (response.ok) {
                        this.translations[lang] = await response.json();
                        console.log(`✅ 加载语言文件成功: ${lang}, 翻译键数量: ${Object.keys(this.translations[lang]).length}`);
                    } else {
                        console.warn(`⚠️ 加载语言文件失败: ${lang}, 状态: ${response.status}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ 加载语言文件出错: ${lang}`, error);
                }
            }

            console.log('🌐 语言文件加载完成，已加载:', Object.keys(this.translations));
            console.log('🌐 翻译内容预览:', this.translations);

        } catch (error) {
            console.error('❌ 加载语言文件时发生错误:', error);
        }
    }

    getText(key, defaultText = '', lang = null) {
        const targetLang = lang || this.currentLang;
        const fallback = this.translations[this.fallbackLang] || {};
        const target = this.translations[targetLang] || {};

        const result = this._deepGet(target, key) || this._deepGet(fallback, key) || key;

        // 调试信息
        if (result === key) {
            console.warn(`⚠️ 未找到翻译键: ${key}, 语言: ${targetLang}`);
            return defaultText || result;
        }

        return result;
    }

    /**
    * 深度获取嵌套对象属性
    * @param {Object} obj - 目标对象
    * @param {string|Array} path - 路径（如 "a.b.c" 或 ["a", "b", "c"]）
    * @returns {*} 找到的值或 undefined
    */
    _deepGet(obj, path) {
        if (!obj || !path) return undefined;

        // 如果 path 是字符串，按点号分割成数组
        const keys = Array.isArray(path) ? path : path.split('.');

        // 递归查找
        return keys.reduce((current, key) => {
            if (current && current[key] !== undefined) {
                return current[key];
            }
            return undefined;
        }, obj);
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
            const defaultText = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' ? element.placeholder : element.textContent;
            const text = this.getText(key, defaultText);

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
                const defaultText = descMeta.getAttribute('content');
                if (descKey) {
                    descMeta.setAttribute('content', this.getText(descKey, defaultText));
                }
            }

            // 更新keywords
            const keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (keywordsMeta) {
                const keywordsKey = keywordsMeta.getAttribute('data-i18n');
                const defaultText = keywordsMeta.getAttribute('content');
                if (keywordsKey) {
                    keywordsMeta.setAttribute('content', this.getText(keywordsKey, defaultText));
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
                const defaultText = ogTitle.getAttribute('content');
                if (titleKey) {
                    ogTitle.setAttribute('content', this.getText(titleKey, defaultText));
                }
            }

            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) {
                const descKey = ogDesc.getAttribute('data-i18n');
                const defaultText = ogDesc.getAttribute('content');
                if (descKey) {
                    ogDesc.setAttribute('content', this.getText(descKey, defaultText));
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
                const defaultText = twitterTitle.getAttribute('content');
                if (titleKey) {
                    twitterTitle.setAttribute('content', this.getText(titleKey, defaultText));
                }
            }

            const twitterDesc = document.querySelector('meta[property="twitter:description"]');
            if (twitterDesc) {
                const descKey = twitterDesc.getAttribute('data-i18n');
                const defaultText = twitterDesc.getAttribute('content');
                if (descKey) {
                    twitterDesc.setAttribute('content', this.getText(descKey, defaultText));
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
                const defaultText = document.title;
                if (titleKey) {
                    document.title = this.getText(titleKey, defaultText);
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

        // 更新语言切换器显示
        this.updateLanguageSwitcherDisplay();

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));

        console.log(`✅ 语言切换完成: ${lang}`);
    }

    setupLanguageSwitcher() {
        try {
            // 查找现有的语言切换器
            const switcher = document.querySelector('.language-switcher');

            if (switcher) {
                this.bindLanguageSwitcherEvents(switcher);
                this.updateLanguageSwitcherDisplay();
                console.log('✅ 语言切换器设置完成');
            } else {
                console.warn('⚠️ 未找到语言切换器元素');
            }

        } catch (error) {
            console.warn('⚠️ 设置语言切换器时出错:', error);
        }
    }

    createLanguageSwitcher() {

        const switcher = document.querySelector('.language-switcher');
        if (!switcher) {
           return
        } else {
            switcher.innerHTML = '';
        }
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
            // if (lang !== this.currentLang) {
                const langItem = document.createElement('div');
                langItem.className = 'lang-option';
                langItem.setAttribute('data-lang', lang);
                langItem.innerHTML = `
                    <span class="lang-flag">${this.getLanguageFlag(lang)}</span>
                    <span class="lang-name">${this.getLanguageName(lang)}</span>
                `;
                dropdown.appendChild(langItem);
            // }
        });

        switcher.appendChild(currentLang);
        switcher.appendChild(dropdown);

        return switcher;
    }

    bindLanguageSwitcherEvents(switcher) {
        const currentLang = switcher.querySelector('.lang-current');
        const dropdown = switcher.querySelector('.lang-dropdown');

        if (!currentLang || !dropdown) {
            console.warn('⚠️ 语言切换器元素不完整');
            return;
        }

        // 移除可能存在的旧事件监听器
        currentLang.removeEventListener('click', this.toggleDropdown);
        dropdown.removeEventListener('click', this.handleLanguageSelect);

        // 绑定新的事件监听器
        this.toggleDropdown = () => {
            dropdown.classList.toggle('show');
        };

        this.handleLanguageSelect = (e) => {
            const langItem = e.target.closest('.lang-option');
            if (langItem) {
                const lang = langItem.getAttribute('data-lang');
                console.log('🌐 用户选择语言:', lang);
                this.switchLanguage(lang);
                dropdown.classList.remove('show');
            }
        };

        currentLang.addEventListener('click', this.toggleDropdown);
        dropdown.addEventListener('click', this.handleLanguageSelect);

        // 点击外部关闭下拉菜单
        document.removeEventListener('click', this.handleOutsideClick);
        this.handleOutsideClick = (e) => {
            if (!switcher.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        };
        document.addEventListener('click', this.handleOutsideClick);

        console.log('✅ 语言切换器事件绑定完成');
    }

    getLanguageFlag(lang) {
        const flags = {
            'zh-CN': '🇨🇳',
            'en': '🇺🇸'
        };
        return flags[lang] || '🌐';
    }

    getLanguageName(lang) {
        const names = {
            'zh-CN': '中文',
            'en': 'English'
        };
        return names[lang] || lang;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    updateLanguageSwitcherDisplay() {
        const switcher = document.querySelector('.language-switcher');
        if (!switcher) return;

        const currentLangElement = switcher.querySelector('.lang-current .lang-name');
        const currentFlagElement = switcher.querySelector('.lang-current .lang-flag');

        if (currentLangElement) {
            currentLangElement.textContent = this.getLanguageName(this.currentLang);
        }
        if (currentFlagElement) {
            currentFlagElement.textContent = this.getLanguageFlag(this.currentLang);
        }

        console.log('✅ 语言切换器显示已更新');
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
        window.i18n.init().then(() => {
            console.log('✅ 国际化系统初始化完成');
        }).catch(error => {
            console.error('❌ 国际化系统初始化失败:', error);
        });
    });
} else {
    console.log('🌐 DOM已加载，立即初始化国际化系统...');
    window.i18n = new I18nManager();
    window.i18n.init().then(() => {
        console.log('✅ 国际化系统初始化完成');
    }).catch(error => {
        console.error('❌ 国际化系统初始化失败:', error);
    });
}

// 导出到全局作用域
window.I18nManager = I18nManager;
