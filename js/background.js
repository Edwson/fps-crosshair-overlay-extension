// js/background.js
let overlayActive = {}; // Keep track of active overlays per tab

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  if (overlayActive[tab.id]) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: removeOverlay,
    }).then(() => {
      overlayActive[tab.id] = false;
      chrome.action.setBadgeText({ tabId: tab.id, text: "" });
    }).catch(err => console.error("Failed to remove overlay:", err));
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['js/i18n.js', 'js/main.js']
    }).then(() => {
      overlayActive[tab.id] = true;
      chrome.action.setBadgeText({ tabId: tab.id, text: "ON" });
      chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#4CAF50" });
    }).catch(err => console.error("Failed to inject overlay:", err));
  }
});

// Function to be injected to remove the overlay
function removeOverlay() {
  const overlay = document.getElementById('crosshair-overlay-container');
  if (overlay) {
    overlay.remove();
  }
  const styleSheet = document.getElementById('crosshair-overlay-styles');
  if (styleSheet) {
    styleSheet.remove();
  }
}