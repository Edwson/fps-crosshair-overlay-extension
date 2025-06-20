// js/main.js (Relevant i18n parts)
// Ensure i18next is available (e.g. via a global from a script tag, or if this becomes a module)
// For this subtask, assume i18next is loaded globally perhaps by adding <script src="../node_modules/i18next/dist/umd/i18next.min.js"></script> to index.html
// The subtask should add this script tag to index.html.

// Global i18next instance
let i18nInstance;

(async () => {
    // --- Configuration & State ---
    const DEFAULT_SETTINGS = {
        size: 20,
        thickness: 2,
        color: '#FFFFFF',
        opacity: 0.8,
        style: 'default',
        language: 'en',
        locked: true
    }; // Ensure language is in defaults
    let currentSettings = { ...DEFAULT_SETTINGS };
    let crosshairElement, settingsPanel, lockButton;

    // --- i18next Initialization Function ---
    async function initI18next(initialLang) {
        if (!window.i18next) {
            console.error('i18next is not loaded. Skipping i18n initialization.');
            return;
        }
        const resources = await window.electronAPI.getI18nResources();
        if (!resources || Object.keys(resources).length === 0) {
            console.error('No i18n resources loaded from main process. Skipping i18n initialization.');
            return;
        }

        i18nInstance = window.i18next.createInstance(); // Create a new instance
        await i18nInstance.init({
            lng: initialLang, // Load with current language
            fallbackLng: 'en',
            resources: resources,
            debug: true // Enable debug output
        });
        console.log('i18next initialized with resources and language:', initialLang);
    }

    // --- Localization Update Function ---
    function updateLocalizedTexts() {
        if (!i18nInstance || !i18nInstance.isInitialized) {
            console.warn("i18n instance not ready for updating texts.");
            return;
        }
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = i18nInstance.t(key);
        });
        // Update specific elements like tooltips if needed
        if (lockButton) { // Ensure lockButton is defined
             lockButton.title = currentSettings.locked ? i18nInstance.t('unlockTooltip', 'Unlock Settings') : i18nInstance.t('lockTooltip', 'Lock Settings');
        }
        // Update select options if they are localized
        document.getElementById('crosshair-style').querySelector('option[value="default"]').textContent = i18nInstance.t('styleDefault');
        document.getElementById('crosshair-style').querySelector('option[value="shotgun"]').textContent = i18nInstance.t('styleShotgun');
        // ... and for other styles: sniper, assault, smg, lmg, pistol
        document.getElementById('crosshair-style').querySelector('option[value="sniper"]').textContent = i18nInstance.t('styleSniper');
        document.getElementById('crosshair-style').querySelector('option[value="assault"]').textContent = i18nInstance.t('styleAssault');
        document.getElementById('crosshair-style').querySelector('option[value="smg"]').textContent = i18nInstance.t('styleSMG');
        document.getElementById('crosshair-style').querySelector('option[value="lmg"]').textContent = i18nInstance.t('styleLMG');
        document.getElementById('crosshair-style').querySelector('option[value="pistol"]').textContent = i18nInstance.t('stylePistol');

        console.log("UI texts updated with current language.");
    }

    // --- Initialization ---
    async function init() {
        // ... (get DOM elements: crosshairElement, settingsPanel, lockButton)
        crosshairElement = document.getElementById('crosshair-main');
        settingsPanel = document.getElementById('settings-panel');
        lockButton = document.getElementById('lock-button');

        await loadSettings(); // Loads language preference too

        // Initialize i18next BEFORE applying settings that might depend on translations
        await initI18next(currentSettings.language);

        applyAllSettings(); // Applies visual settings
        updateLocalizedTexts(); // Apply initial translations
        setupEventListeners();
        updateLockButton(); // Updates lock button icon and tooltip
        // updatePanelVisibility(); // Called by updateLockButton
    }

    // --- Settings Management ---
    async function loadSettings() {
        console.log("loadSettings: Attempting to load from electron-store via IPC.");
        if (window.electronAPI && typeof window.electronAPI.storeGet === 'function') {
            const savedSettings = await window.electronAPI.storeGet('crosshairSettings');
            if (savedSettings) {
                currentSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
            } else {
                currentSettings = { ...DEFAULT_SETTINGS };
            }
        } else {
            console.error("electronAPI.storeGet is not available. Using default settings.");
            currentSettings = { ...DEFAULT_SETTINGS };
        }
    }
    async function saveSettings() {
        if (window.electronAPI && typeof window.electronAPI.storeSet === 'function') {
            window.electronAPI.storeSet('crosshairSettings', currentSettings);
        } else {
            console.error("electronAPI.storeSet is not available.");
        }
    }

    function resetSettings() {
        // Preserve language preference on reset, or reset it too if desired
        const langToKeep = currentSettings.language;
        currentSettings = { ...DEFAULT_SETTINGS, language: langToKeep }; // Keep current language
        // Or if language should also reset: currentSettings = { ...DEFAULT_SETTINGS };

        if (i18nInstance && i18nInstance.language !== currentSettings.language) {
            i18nInstance.changeLanguage(currentSettings.language, (err, t) => {
                if (err) return console.error('Error changing language on reset:', err);
                updateLocalizedTexts();
            });
        }
        applyAllSettings(); // This should also call updateLocalizedTexts if needed after styles apply
        saveSettings();
        updatePanelVisibility();
        updateLockButton(); // This will also call updateLocalizedTexts for tooltip

        // Re-populate form fields with current (possibly reset) settings
        document.getElementById('crosshair-size').value = currentSettings.size;
        document.getElementById('size-value').textContent = `${currentSettings.size}px`;
        document.getElementById('crosshair-thickness').value = currentSettings.thickness;
        document.getElementById('thickness-value').textContent = `${currentSettings.thickness}px`;
        document.getElementById('crosshair-color').value = currentSettings.color;
        document.getElementById('crosshair-opacity').value = currentSettings.opacity * 100;
        document.getElementById('opacity-value').textContent = `${currentSettings.opacity * 100}%`;
        document.getElementById('crosshair-style').value = currentSettings.style;
        document.getElementById('language-select').value = currentSettings.language;
    }

    // --- UI Updates & Event Listeners ---
    function setupEventListeners() {
        document.getElementById('crosshair-size').addEventListener('input', (e) => {
            currentSettings.size = parseInt(e.target.value);
            document.getElementById('size-value').textContent = `${currentSettings.size}px`;
            applyCrosshairStyle();
            saveSettings();
        });

        document.getElementById('crosshair-thickness').addEventListener('input', (e) => {
            currentSettings.thickness = parseInt(e.target.value);
            document.getElementById('thickness-value').textContent = `${currentSettings.thickness}px`;
            applyCrosshairStyle();
            saveSettings();
        });

        document.getElementById('crosshair-color').addEventListener('input', (e) => {
            currentSettings.color = e.target.value;
            applyCrosshairStyle();
            saveSettings();
        });

        document.getElementById('crosshair-opacity').addEventListener('input', (e) => {
            currentSettings.opacity = parseInt(e.target.value) / 100;
            document.getElementById('opacity-value').textContent = `${e.target.value}%`;
            applyCrosshairStyle();
            saveSettings();
        });

        document.getElementById('crosshair-style').addEventListener('change', (e) => {
            currentSettings.style = e.target.value;
            applyCrosshairStyle();
            saveSettings();
        });
        
        document.getElementById('language-select').addEventListener('change', async (e) => {
            const newLang = e.target.value;
            currentSettings.language = newLang;
            if (i18nInstance) {
                await i18nInstance.changeLanguage(newLang);
                updateLocalizedTexts();
            }
            saveSettings();
        });

        document.getElementById('reset-settings-button').addEventListener('click', resetSettings);

        lockButton.addEventListener('click', () => {
            currentSettings.locked = !currentSettings.locked;
            updateLockButton();
            saveSettings(); // Save lock state
        });
    }

    function applyAllSettings() {
        document.getElementById('crosshair-size').value = currentSettings.size;
        document.getElementById('size-value').textContent = `${currentSettings.size}px`;
        document.getElementById('crosshair-thickness').value = currentSettings.thickness;
        document.getElementById('thickness-value').textContent = `${currentSettings.thickness}px`;
        document.getElementById('crosshair-color').value = currentSettings.color;
        document.getElementById('crosshair-opacity').value = currentSettings.opacity * 100;
        document.getElementById('opacity-value').textContent = `${currentSettings.opacity * 100}%`;
        document.getElementById('crosshair-style').value = currentSettings.style;
        document.getElementById('language-select').value = currentSettings.language;
        applyCrosshairStyle();
        // updateLocalizedTexts(); // Call after all settings are applied, if any text depends on them.
    }

    function updateLockButton() {
        const lockSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>';
        const unlockSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.65 1.35-3 3-3s3 1.35 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>';
        
        if (currentSettings.locked) {
            lockButton.innerHTML = lockSVG;
        } else {
            lockButton.innerHTML = unlockSVG;
        }
        // Tooltip is updated in updateLocalizedTexts after language change
        if (i18nInstance && i18nInstance.isInitialized) {
             lockButton.title = currentSettings.locked ? i18nInstance.t('unlockTooltip', 'Unlock Settings') : i18nInstance.t('lockTooltip', 'Lock Settings');
        }
        updatePanelVisibility();
    }

    function updatePanelVisibility() {
        if (!settingsPanel) return;
        if (currentSettings.locked) {
            settingsPanel.classList.remove('visible');
            if (window.electronAPI && typeof window.electronAPI.setIgnoreMouseEvents === 'function') {
                window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
            } else { console.error("electronAPI.setIgnoreMouseEvents is not available!");}
        } else {
            settingsPanel.classList.add('visible');
            if (window.electronAPI && typeof window.electronAPI.setIgnoreMouseEvents === 'function') {
                window.electronAPI.setIgnoreMouseEvents(false);
            } else { console.error("electronAPI.setIgnoreMouseEvents is not available!");}
        }
    }

    // --- Crosshair Drawing Logic (Unchanged) ---
    function applyCrosshairStyle() {
        if (!crosshairElement) return;
        crosshairElement.innerHTML = '';
        crosshairElement.style.opacity = currentSettings.opacity;
        let size = currentSettings.size;
        let thickness = currentSettings.thickness;
        let color = currentSettings.color;

        switch (currentSettings.style) {
            case 'sniper': drawCross(size, 1, color); break;
            case 'shotgun': drawCircle(size * 1.5, thickness, color); drawDot(Math.max(2, thickness / 2), color); break;
            case 'assault': drawCross(size, thickness, color); break;
            case 'smg': drawCross(Math.max(10, size * 0.75), Math.max(1, thickness * 0.8), color); break;
            case 'lmg': drawCross(size, Math.min(10, thickness * 1.5), color); break;
            case 'pistol': drawDot(Math.max(3, thickness * 1.5), color); break;
            case 'default': default: drawCross(size, thickness, color); break;
        }
    }

    function drawCross(size, thickness, color) {
        const horz = document.createElement('div');
        horz.className = 'crosshair-line horizontal';
        horz.style.width = `${size}px`; horz.style.height = `${thickness}px`;
        horz.style.backgroundColor = color;
        horz.style.left = '50%'; horz.style.top = '50%'; horz.style.transform = 'translate(-50%, -50%)';
        const vert = document.createElement('div');
        vert.className = 'crosshair-line vertical';
        vert.style.height = `${size}px`; vert.style.width = `${thickness}px`;
        vert.style.backgroundColor = color;
        vert.style.left = '50%'; vert.style.top = '50%'; vert.style.transform = 'translate(-50%, -50%)';
        crosshairElement.appendChild(horz);
        crosshairElement.appendChild(vert);
    }

    function drawDot(size, color) {
        const dot = document.createElement('div');
        dot.style.width = `${size}px`; dot.style.height = `${size}px`;
        dot.style.backgroundColor = color;
        dot.style.borderRadius = '50%';
        dot.style.position = 'absolute';
        dot.style.top = '50%'; dot.style.left = '50%'; dot.style.transform = 'translate(-50%, -50%)';
        crosshairElement.appendChild(dot);
    }
    
    function drawCircle(diameter, borderWidth, color) {
        const circle = document.createElement('div');
        circle.style.width = `${diameter}px`; circle.style.height = `${diameter}px`;
        circle.style.border = `${borderWidth}px solid ${color}`;
        circle.style.borderRadius = '50%';
        circle.style.position = 'absolute';
        circle.style.top = '50%'; circle.style.left = '50%'; circle.style.transform = 'translate(-50%, -50%)';
        circle.style.boxSizing = 'border-box';
        crosshairElement.appendChild(circle);
    }

    // --- Start ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();