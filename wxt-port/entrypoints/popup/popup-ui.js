/**
 * UI-specific functionality for the popup
 * Handles override mode, Konami code, and localhost forwarding
 */

// Konami code sequence
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiCodePosition = 0;

/**
 * Load localhost override preference from storage
 */
async function loadLocalhostPreference() {
  try {
    const result = await browser.storage.local.get(['localhostOverride']);
    const checkbox = document.getElementById('localhostOverride');
    if (checkbox) {
      checkbox.checked = result.localhostOverride || false;
    }
  } catch (error) {
    console.error('Error loading localhost preference:', error);
  }
}

/**
 * Save localhost override preference to storage
 * @param {boolean} enabled - Whether localhost override is enabled
 */
async function saveLocalhostPreference(enabled) {
  try {
    await browser.storage.local.set({ localhostOverride: enabled });
    console.log('Localhost override preference saved:', enabled);
  } catch (error) {
    console.error('Error saving localhost preference:', error);
  }
}

/**
 * Get the target website URL based on localhost override setting
 * @returns {Promise<string>} The target website URL
 */
async function getTargetWebsite() {
  try {
    const result = await browser.storage.local.get(['localhostOverride']);
    const useLocalhost = result.localhostOverride || false;
    
    if (useLocalhost) {
      return "http://localhost:3000";
    } else {
      return "https://sad.nithitsuki.com";
    }
  } catch (error) {
    console.error('Error getting target website:', error);
    return "https://sad.nithitsuki.com"; // fallback to default
  }
}

/**
 * Setup the override button functionality
 */
function setupOverrideButton() {
  const overrideButton = document.getElementById('override');
  const overrideOptions = document.getElementById('overrideOptions');
  
  if (overrideButton && overrideOptions) {
    overrideButton.addEventListener('click', function () {
      this.style.display = 'none';
      overrideOptions.style.display = 'block';
    });
  }
}

/**
 * Setup Konami code listener
 */
function setupKonamiCode() {
  document.addEventListener('keydown', function (e) {
    if (e.code === konamiCode[konamiCodePosition]) {
      konamiCodePosition++;
      if (konamiCodePosition === konamiCode.length) {
        activateOverride();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  });
}

/**
 * Activate the override mode
 */
function activateOverride() {
  const overrideButton = document.getElementById('override');
  if (overrideButton) {
    overrideButton.style.display = 'block';
  }
}

/**
 * Setup localhost override functionality
 */
function setupLocalhostOverride() {
  const localhostCheckbox = document.getElementById('localhostOverride');
  
  if (localhostCheckbox) {
    // Load saved preference
    loadLocalhostPreference();
    
    // Save preference when changed
    localhostCheckbox.addEventListener('change', function () {
      saveLocalhostPreference(this.checked);
    });
  }
}

/**
 * Initialize all popup UI functionality
 */
function initializePopupUI() {
  setupOverrideButton();
  setupKonamiCode();
  setupLocalhostOverride();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePopupUI);

// Export functions for use in other modules as both module exports and global
export { getTargetWebsite, saveLocalhostPreference, loadLocalhostPreference };

// Also make available globally for non-module access
window.popupUI = {
  getTargetWebsite,
  saveLocalhostPreference,
  loadLocalhostPreference
};
