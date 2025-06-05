# FPS Crosshair Overlay Extension

This browser extension displays a customizable virtual crosshair on web pages, primarily intended for use with browser-based FPS games.

**Important Note:** This extension works by overlaying content *within your browser tab*. It **cannot** overlay on top of standalone desktop PC games or other desktop applications.

## Features

* Customizable crosshair: size, thickness, color, and opacity.
* Predefined crosshair styles for common weapon types.
* Settings panel to adjust the crosshair in real-time.
* Lockable panel: Hide settings and fix the crosshair during "gameplay" (on the web page).
* Multi-language support: English, Japanese, Simplified Chinese, Traditional Chinese, Russian, Korean.
* Settings are saved locally and persist between sessions.
* Reset to default settings.

## Installation

1.  Download the extension files (or clone the repository).
2.  Open your Chromium-based browser (e.g., Google Chrome, Edge).
3.  Go to the extensions page:
    * Chrome: `chrome://extensions`
    * Edge: `edge://extensions`
4.  Enable "Developer mode" (usually a toggle in the top-right corner).
5.  Click on "Load unpacked".
6.  Select the directory where you saved/cloned the `crosshair-extension` files.
7.  The extension should now be installed and visible in your extensions list.

## How to Use

1.  **Activate the Overlay**: Click the extension's icon in your browser's toolbar. This will toggle the crosshair overlay on the current active tab. An "ON" badge will appear on the icon when active for that tab. Clicking again will remove it.
2.  **Unlock Settings**:
    * The crosshair will appear with a lock button in the bottom-right corner of the screen.
    * Click the lock button. The icon will change to "unlocked," and the settings panel will appear in the top-left.
3.  **Customize Crosshair**:
    * **Language**: Choose your preferred language from the dropdown.
    * **Style**: Select a predefined crosshair style.
    * **Size**: Adjust the slider for crosshair length/diameter.
    * **Thickness**: Adjust the slider for line thickness.
    * **Color**: Pick a color using the color picker.
    * **Opacity**: Adjust the slider for crosshair transparency.
    * Changes are applied in real-time.
4.  **Lock Settings**:
    * Once you're satisfied with your settings, click the "unlocked" button (which now acts as a lock button).
    * The settings panel will hide, and the crosshair will remain fixed. The overlay is designed to be click-through, so it shouldn't interfere with interactions on the web page (e.g., a browser game).
5.  **Saving Settings**: All changes to settings (including language, crosshair properties, and lock state) are saved automatically and will be applied when you next activate the overlay.
6.  **Reset Settings**: In the unlocked settings panel, click the "Reset Settings" button to restore all crosshair properties to their defaults (language preference will be retained).

## Safety and Limitations

* **Visual Aid Only**: This tool is purely a visual overlay. It does **not** interact with any game's memory, files, or processes. It does not inject code into games or automate inputs.
* **Browser-Only**: It functions only within the browser tab it's activated on. It cannot display over desktop applications or games running outside the browser.
* **Performance**: The overlay is lightweight (HTML/CSS/JS) and should not significantly impact browser performance.
* **Anti-Cheat**: Since it doesn't interact with game processes or memory, it's designed to be safe from detection by anti-cheat systems for *browser-based games*. However, the use of any overlay is subject to the terms of service of the specific game or platform.

## Files Overview

* `manifest.json`: Extension configuration.
* `icons/`: Extension icons.
* `html/overlay.html`: The HTML structure for the crosshair and settings panel.
* `css/overlay.css`: Styles for the overlay.
* `js/main.js`: Core JavaScript logic for functionality, DOM manipulation, and settings.
* `js/background.js`: Handles the extension toolbar icon click.
* `js/i18n.js`: Helper for internationalization.
* `_locales/`: Contains JSON files for language translations.
* `README.md`: This file.