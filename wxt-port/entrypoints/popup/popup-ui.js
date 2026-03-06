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
    const result = await browser.storage.local.get(['localhostOverride', 'customUrl']);
    const checkbox = document.getElementById('localhostOverride');
    const urlInput = document.getElementById('customUrl');
    
    if (checkbox) {
      checkbox.checked = result.localhostOverride || false;
    }
    if (urlInput) {
      urlInput.value = result.customUrl || 'http://localhost:3000/dashboard';
      urlInput.disabled = !result.localhostOverride;
    }
  } catch (error) {
    console.error('Error loading localhost preference:', error);
  }
}

/**
 * Load god mode auto-enable preference from storage
 */
async function loadGodModePreference() {
  try {
    const result = await browser.storage.local.get(['godModeAutoEnable']);
    const checkbox = document.getElementById('godModeAutoEnable');
    if (checkbox) {
      checkbox.checked = result.godModeAutoEnable || false;
    }
    return result.godModeAutoEnable || false;
  } catch (error) {
    console.error('Error loading god mode preference:', error);
    return false;
  }
}

/**
 * Save god mode auto-enable preference to storage
 * @param {boolean} enabled - Whether god mode auto-enable is enabled
 */
async function saveGodModePreference(enabled) {
  try {
    await browser.storage.local.set({ godModeAutoEnable: enabled });
    console.log('God mode auto-enable preference saved:', enabled);
  } catch (error) {
    console.error('Error saving god mode preference:', error);
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
    
    // Enable/disable the custom URL input
    const urlInput = document.getElementById('customUrl');
    if (urlInput) {
      urlInput.disabled = !enabled;
    }
  } catch (error) {
    console.error('Error saving localhost preference:', error);
  }
}

/**
 * Save custom URL preference to storage
 * @param {string} url - The custom URL
 */
async function saveCustomUrl(url) {
  try {
    await browser.storage.local.set({ customUrl: url });
    console.log('Custom URL saved:', url);
  } catch (error) {
    console.error('Error saving custom URL:', error);
  }
}

/**
 * Get the target website URL based on localhost override setting
 * @returns {Promise<string>} The target website URL
 */
async function getTargetWebsite() {
  try {
    const result = await browser.storage.local.get(['localhostOverride', 'customUrl']);
    const useLocalhost = result.localhostOverride || false;
    
    if (useLocalhost) {
      return result.customUrl || "http://localhost:3000/dashboard";
    } else {
      return "https://sad.nithitsuki.com/dashboard";
    }
  } catch (error) {
    console.error('Error getting target website:', error);
    return "https://sad.nithitsuki.com/dashboard"; // fallback to default
  }
}

/**
 * Setup the override button functionality
 */
function setupOverrideButton() {
  const overrideButton = document.getElementById('override');
  const overrideOptions = document.getElementById('overrideOptions');
  const exitButton = document.getElementById('exitGodMode');
  const body = document.getElementById('popupBody');
  const ritualText = document.getElementById('ritualText');
  
  if (overrideButton && overrideOptions) {
    overrideButton.addEventListener('click', function () {
      enterGodMode();
    });
  }

  if (exitButton) {
    exitButton.addEventListener('click', function () {
      exitGodMode();
    });
  }
}

/**
 * Enter God Mode
 */
function enterGodMode() {
  const overrideButton = document.getElementById('override');
  const overrideOptions = document.getElementById('overrideOptions');
  const body = document.getElementById('popupBody');
  const ritualText = document.getElementById('ritualText');

  if (overrideButton) overrideButton.style.display = 'none';
  if (overrideOptions) overrideOptions.style.display = 'block';
  if (body) body.classList.add('god-mode');
  if (ritualText) ritualText.style.display = 'none';
}

/**
 * Exit God Mode
 */
function exitGodMode() {
  const overrideButton = document.getElementById('override');
  const overrideOptions = document.getElementById('overrideOptions');
  const body = document.getElementById('popupBody');
  const ritualText = document.getElementById('ritualText');

  if (overrideOptions) overrideOptions.style.display = 'none';
  if (overrideButton) overrideButton.style.display = 'block';
  if (body) body.classList.remove('god-mode');
  if (ritualText) ritualText.style.display = 'block';
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
  const overrideOptions = document.getElementById('overrideOptions');
  
  if (overrideButton) {
    overrideButton.style.display = 'block';
  }
  
  // Mark that god mode has been unlocked at least once
  browser.storage.local.set({ godModeUnlocked: true });
}

/**
 * Check if god mode should be auto-enabled
 */
async function checkAutoEnableGodMode() {
  try {
    const result = await browser.storage.local.get(['godModeAutoEnable', 'godModeUnlocked']);
    if (result.godModeAutoEnable && result.godModeUnlocked) {
      const overrideButton = document.getElementById('override');
      const overrideOptions = document.getElementById('overrideOptions');
      
      if (overrideButton && overrideOptions) {
        overrideButton.style.display = 'block';
        // Auto-expand and apply god mode styling
        enterGodMode();
      }
    }
  } catch (error) {
    console.error('Error checking god mode auto-enable:', error);
  }
}

/**
 * Setup localhost override functionality
 */
function setupLocalhostOverride() {
  const localhostCheckbox = document.getElementById('localhostOverride');
  const urlInput = document.getElementById('customUrl');
  
  if (localhostCheckbox) {
    // Load saved preference
    loadLocalhostPreference();
    
    // Save preference when changed
    localhostCheckbox.addEventListener('change', function () {
      saveLocalhostPreference(this.checked);
    });
  }
  
  if (urlInput) {
    // Save URL when changed (with debounce)
    let timeout;
    urlInput.addEventListener('input', function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveCustomUrl(this.value);
      }, 500);
    });
  }
}

/**
 * Setup god mode auto-enable functionality
 */
function setupGodModeAutoEnable() {
  const godModeCheckbox = document.getElementById('godModeAutoEnable');
  
  if (godModeCheckbox) {
    // Load saved preference
    loadGodModePreference();
    
    // Save preference when changed
    godModeCheckbox.addEventListener('change', function () {
      saveGodModePreference(this.checked);
    });
  }
}

/**
 * Load debug logging preference from storage
 */
async function loadDebugLoggingPreference() {
  try {
    const result = await browser.storage.local.get(['debugLogging']);
    const checkbox = document.getElementById('debugLogging');
    if (checkbox) {
      checkbox.checked = result.debugLogging || false;
    }
  } catch (error) {
    console.error('Error loading debug logging preference:', error);
  }
}

/**
 * Save debug logging preference to storage
 * @param {boolean} enabled
 */
async function saveDebugLoggingPreference(enabled) {
  try {
    await browser.storage.local.set({ debugLogging: enabled });
    console.log('Debug logging preference saved:', enabled);
  } catch (error) {
    console.error('Error saving debug logging preference:', error);
  }
}

/**
 * Setup debug logging toggle
 */
function setupDebugLogging() {
  const checkbox = document.getElementById('debugLogging');
  if (checkbox) {
    loadDebugLoggingPreference();
    checkbox.addEventListener('change', function () {
      saveDebugLoggingPreference(this.checked);
    });
  }
}

/**
 * Setup debug buttons
 */
function setupDebugButtons() {
  const debugOutput = document.getElementById('debugOutput');
  
  const logToDebug = (message) => {
    if (debugOutput) {
      const timestamp = new Date().toLocaleTimeString();
      debugOutput.textContent += `[${timestamp}] ${message}\n`;
      debugOutput.scrollTop = debugOutput.scrollHeight;
    }
    console.log(message);
  };
  
  // Debug: Check Username
  const debugCheckBtn = document.getElementById('debugCheckUsername');
  if (debugCheckBtn) {
    debugCheckBtn.addEventListener('click', async () => {
      logToDebug('=== Checking Username ===');
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const response = await browser.tabs.sendMessage(tabs[0].id, { action: 'debugCheckUsername' });
        logToDebug(`Raw: ${response.raw}`);
        logToDebug(`Is Unknown: ${response.isUnknown}`);
      } catch (error) {
        logToDebug(`Error: ${error.message}`);
      }
    });
  }
  
  // Debug: Fetch Username
  const debugFetchBtn = document.getElementById('debugFetchUsername');
  if (debugFetchBtn) {
    debugFetchBtn.addEventListener('click', async () => {
      logToDebug('=== Fetching Username from Portal ===');
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const response = await browser.tabs.sendMessage(tabs[0].id, { action: 'debugFetchUsername' });
        logToDebug(`Result: ${response.result || 'null'}`);
      } catch (error) {
        logToDebug(`Error: ${error.message}`);
      }
    });
  }
  
  // Debug: Resolve Username
  const debugResolveBtn = document.getElementById('debugResolveUsername');
  if (debugResolveBtn) {
    debugResolveBtn.addEventListener('click', async () => {
      logToDebug('=== Resolving Username ===');
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const response = await browser.tabs.sendMessage(tabs[0].id, { action: 'debugResolveUsername' });
        logToDebug(`Resolved: ${response.result}`);
      } catch (error) {
        logToDebug(`Error: ${error.message}`);
      }
    });
  }
  
  // Debug: Clear Username
  const debugClearBtn = document.getElementById('debugClearUsername');
  if (debugClearBtn) {
    debugClearBtn.addEventListener('click', async () => {
      logToDebug('=== Resetting Username ===');
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const response = await browser.tabs.sendMessage(tabs[0].id, { action: 'debugClearUsername' });
        logToDebug(`Reset complete. Username is now: ${response.result}`);
      } catch (error) {
        logToDebug(`Error: ${error.message}`);
      }
    });
  }
}

/**
 * Initialize all popup UI functionality
 */
function initializePopupUI() {
  displayVersion();
  setupShareButton();
  setupOverrideButton();
  setupKonamiCode();
  setupLocalhostOverride();
  setupGodModeAutoEnable();
  setupDebugLogging();
  setupDebugButtons();
  checkAutoEnableGodMode();
}

/**
 * Display extension version from manifest
 */
function displayVersion() {
  const versionEl = document.getElementById('version');
  if (versionEl) {
    const manifest = browser.runtime.getManifest();
    versionEl.textContent = `v${manifest.version}`;
  }
}

/**
 * Setup share button with Web Share API or clipboard fallback
 */
function setupShareButton() {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const shareUrl = 'https://github.com/nithitsuki/attendance-grabber';
    const shareData = {
      title: 'Amrita Attendance Fetcher',
      text: 'Check out this browser extension for Amrita University students!',
      url: shareUrl
    };

    try {
      // Try Web Share API first (works on mobile and some desktop browsers)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        // Show info box notification
        showInfoBox('✓ Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Show error info box
      showInfoBox('❌ Failed to copy link', true);
    }
  });
}

/**
 * Show info box notification
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showInfoBox(message, isError = false) {
  const infoBox = document.getElementById('infoBox');
  const infoMessage = document.getElementById('infoMessage');
  
  if (!infoBox || !infoMessage) return;
  
  infoMessage.textContent = message;
  
  // Apply error styling if needed
  if (isError) {
    infoBox.style.background = '#dc3545';
  } else {
    infoBox.style.background = ''; // Reset to default
  }
  
  // Show the info box
  infoBox.style.display = 'block';
  
  // Hide after 2 seconds
  setTimeout(() => {
    infoBox.style.display = 'none';
  }, 2000);
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
