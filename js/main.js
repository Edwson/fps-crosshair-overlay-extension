// js/main.js
(async () => {
    // --- Configuration & State ---
    const DEFAULT_SETTINGS = {
        size: 20,
        thickness: 2,
        color: '#FFFFFF', // White
        opacity: 0.8, // 80%
        style: 'default',
        language: 'en',
        locked: true
    };
    let currentSettings = { ...DEFAULT_SETTINGS };

    let crosshairElement, settingsPanel, lockButton;
    let horizontalLine, verticalLine, dotElement, circleElement; // Crosshair parts

    // --- Initialization ---
    async function init() {
        // Load HTML and CSS
        await loadAssets();

        // Get DOM elements
        crosshairElement = document.getElementById('crosshair-main');
        settingsPanel = document.getElementById('settings-panel');
        lockButton = document.getElementById('lock-button');
        // Ensure crosshair parts are queryable after HTML is loaded
        // Note: The HTML structure in overlay.html should be consistent with these IDs/classes
        // For dynamic crosshair part creation, this would be handled differently.

        // Load settings
        await loadSettings();

        // Apply initial settings and translations
        applyAllSettings();
        setupEventListeners();
        updateLockButton();
        updatePanelVisibility();
        applyLanguage(currentSettings.language); // Apply language first
    }

    async function loadAssets() {
        // Inject CSS
        const cssUrl = chrome.runtime.getURL('css/overlay.css');
        if (!document.getElementById('crosshair-overlay-styles')) {
            const link = document.createElement('link');
            link.id = 'crosshair-overlay-styles';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssUrl;
            document.head.appendChild(link);
        }

        // Inject HTML
        if (!document.getElementById('crosshair-overlay-container')) {
            const htmlUrl = chrome.runtime.getURL('html/overlay.html');
            const response = await fetch(htmlUrl);
            const htmlText = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;
            document.body.appendChild(tempDiv.firstChild);
        }
    }

    // --- Settings Management ---
    async function loadSettings() {
        const savedSettings = await chrome.storage.local.get(['crosshairSettings']);
        if (savedSettings.crosshairSettings) {
            currentSettings = { ...DEFAULT_SETTINGS, ...savedSettings.crosshairSettings };
        } else {
            currentSettings = { ...DEFAULT_SETTINGS }; // Fallback to defaults
        }
    }

    async function saveSettings() {
        await chrome.storage.local.set({ crosshairSettings: currentSettings });
    }

    function resetSettings() {
        currentSettings = { ...DEFAULT_SETTINGS, language: currentSettings.language }; // Keep current language
        applyAllSettings();
        saveSettings();
        updatePanelVisibility();
        updateLockButton();
        // Re-populate form fields with default values
        document.getElementById('crosshair-size').value = currentSettings.size;
        document.getElementById('size-value').textContent = `${currentSettings.size}px`;
        document.getElementById('crosshair-thickness').value = currentSettings.thickness;
        document.getElementById('thickness-value').textContent = `${currentSettings.thickness}px`;
        document.getElementById('crosshair-color').value = currentSettings.color;
        document.getElementById('crosshair-opacity').value = currentSettings.opacity * 100;
        document.getElementById('opacity-value').textContent = `${currentSettings.opacity * 100}%`;
        document.getElementById('crosshair-style').value = currentSettings.style;
    }


    // --- UI Updates & Event Listeners ---
    function setupEventListeners() {
        // Settings Panel Controls
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
            applyCrosshairStyle(); // This will handle predefined styles
            saveSettings();
        });
        
        document.getElementById('language-select').addEventListener('change', (e) => {
            currentSettings.language = e.target.value;
            applyLanguage(currentSettings.language);
            saveSettings();
        });

        document.getElementById('reset-settings-button').addEventListener('click', resetSettings);

        // Lock Button
        lockButton.addEventListener('click', () => {
            currentSettings.locked = !currentSettings.locked;
            updateLockButton();
            updatePanelVisibility();
            saveSettings();
        });
    }

    function applyAllSettings() {
        // Apply to form fields
        document.getElementById('crosshair-size').value = currentSettings.size;
        document.getElementById('size-value').textContent = `${currentSettings.size}px`;
        document.getElementById('crosshair-thickness').value = currentSettings.thickness;
        document.getElementById('thickness-value').textContent = `${currentSettings.thickness}px`;
        document.getElementById('crosshair-color').value = currentSettings.color;
        document.getElementById('crosshair-opacity').value = currentSettings.opacity * 100;
        document.getElementById('opacity-value').textContent = `${currentSettings.opacity * 100}%`;
        document.getElementById('crosshair-style').value = currentSettings.style;
        document.getElementById('language-select').value = currentSettings.language;
        
        applyCrosshairStyle(); // Initial draw
    }

    function updateLockButton() {
        const lockSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>';
        const unlockSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.65 1.35-3 3-3s3 1.35 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>';
        
        if (currentSettings.locked) {
            lockButton.innerHTML = lockSVG;
            lockButton.title = getMessage('unlockTooltip'); // Use i18n for tooltips
        } else {
            lockButton.innerHTML = unlockSVG;
            lockButton.title = getMessage('lockTooltip');
        }
    }

    function updatePanelVisibility() {
        if (currentSettings.locked) {
            settingsPanel.classList.remove('visible');
        } else {
            settingsPanel.classList.add('visible');
        }
    }

    // --- Crosshair Drawing Logic ---
    function applyCrosshairStyle() {
        if (!crosshairElement) return;
        
        // Clear previous dynamic elements if any
        crosshairElement.innerHTML = ''; // Clear previous shapes

        // Apply general opacity
        crosshairElement.style.opacity = currentSettings.opacity;

        // Predefined styles
        let size = currentSettings.size;
        let thickness = currentSettings.thickness;
        let color = currentSettings.color;

        switch (currentSettings.style) {
            case 'sniper': // Fine Cross
                thickness = 1;
                // Size remains user-defined or slightly adjusted
                drawCross(size, thickness, color);
                break;
            case 'shotgun': // Circle
                drawCircle(size * 1.5, thickness, color); // Example: circle size related to main size
                drawDot(Math.max(2, thickness / 2), color); // Small dot in center
                break;
            case 'assault': // Standard cross, use user settings
                drawCross(size, thickness, color);
                break;
            case 'smg': // Small Cross
                drawCross(Math.max(10, size * 0.75), Math.max(1, thickness * 0.8), color);
                break;
            case 'lmg': // Bold Cross
                drawCross(size, Math.min(10, thickness * 1.5), color);
                break;
            case 'pistol': // Dot
                drawDot(Math.max(3, thickness * 1.5), color); // Dot size related to thickness
                break;
            case 'default':
            default:
                drawCross(size, thickness, color);
                break;
        }
    }

    function drawCross(size, thickness, color) {
        const horz = document.createElement('div');
        horz.className = 'crosshair-line horizontal';
        horz.style.width = `${size}px`;
        horz.style.height = `${thickness}px`;
        horz.style.backgroundColor = color;
        horz.style.left = '50%'; horz.style.top = '50%'; horz.style.transform = 'translate(-50%, -50%)';


        const vert = document.createElement('div');
        vert.className = 'crosshair-line vertical';
        vert.style.height = `${size}px`;
        vert.style.width = `${thickness}px`;
        vert.style.backgroundColor = color;
        vert.style.left = '50%'; vert.style.top = '50%'; vert.style.transform = 'translate(-50%, -50%)';
        
        crosshairElement.appendChild(horz);
        crosshairElement.appendChild(vert);
    }

    function drawDot(size, color) {
        const dot = document.createElement('div');
        dot.id = 'crosshair-dot'; // Use ID if styles are specific in CSS
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.backgroundColor = color;
        dot.style.borderRadius = '50%';
        dot.style.position = 'absolute';
        dot.style.top = '50%'; dot.style.left = '50%'; dot.style.transform = 'translate(-50%, -50%)';
        crosshairElement.appendChild(dot);
    }
    
    function drawCircle(diameter, borderWidth, color) {
        const circle = document.createElement('div');
        circle.id = 'crosshair-circle'; // Use ID if styles are specific in CSS
        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.border = `${borderWidth}px solid ${color}`;
        circle.style.borderRadius = '50%';
        circle.style.position = 'absolute';
        circle.style.top = '50%'; circle.style.left = '50%'; circle.style.transform = 'translate(-50%, -50%)';
        circle.style.boxSizing = 'border-box';
        crosshairElement.appendChild(circle);
    }


    // --- Language & Localization ---
    function applyLanguage(lang) {
        // The chrome.i18n.getMessage uses the browser's UI language by default
        // or the one set in the extension if `chrome.i18n.setLanguage()` was a thing (it's not directly).
        // For content scripts, message substitution in HTML via data-i18n attributes is often best.
        // We simulate language change by re-applying i18n attributes.
        // The actual language used by `getMessage` is tied to `_locales/{lang}/messages.json` structure.
        // This function re-populates text content using the selected language's strings.
        
        // Forcing the locale for `getMessage` is tricky in content scripts.
        // Instead, we'll re-run `localizePage` which relies on `chrome.i18n.getMessage`.
        // The `language-select` value is saved, but `chrome.i18n` itself will use the extension's effective locale.
        // A more robust solution would involve fetching the specific lang JSON and applying strings manually.
        // For this example, we rely on chrome.i18n and its standard behavior.
        // The `localizePage` function (from i18n.js) should be called to update texts.
        if (typeof localizePage === "function") {
            localizePage(); // This will use the messages from the manifest's default_locale or browser's locale.
                            // True dynamic language switching without page reload for all i18n messages from manifest is complex.
                            // For simplicity, we assume `localizePage` will grab the most current messages.
                            // Let's update specific elements that are easy to change:
        }
        document.querySelector('#settings-panel h3').textContent = getMessage('settingsTitle');
        document.querySelector('label[for="language-select"]').textContent = getMessage('languageLabel');
        document.querySelector('label[for="crosshair-style"]').textContent = getMessage('styleLabel');
        document.querySelector('label[for="crosshair-size"]').textContent = getMessage('sizeLabel');
        // ... and so on for all labels and buttons.
        // Update tooltips
        updateLockButton();
        // Update option texts (more involved, would require mapping keys to options)
        const styleSelect = document.getElementById('crosshair-style');
        styleSelect.querySelector('option[value="default"]').textContent = getMessage('styleDefault');
        styleSelect.querySelector('option[value="shotgun"]').textContent = getMessage('styleShotgun');
        // ...etc. for all styles

        document.getElementById('reset-settings-button').textContent = getMessage('resetButton');

    }

    // --- Start ---
    // Ensure this script doesn't run multiple times if injected again by mistake
    if (!document.getElementById('crosshair-overlay-container')) {
        init();
    }
})();