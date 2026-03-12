/**
 * Main content script entry point
 * Routes to appropriate handler based on URL
 */

import { initLogger } from '../utils/logger';

export default defineContentScript({
  matches: [
    'https://students.amrita.edu/*',
    'https://sad.nithitsuki.com/*'
  ],
  async main() {
    await initLogger();
    setupMessageListener();
    
    // Auto-fetch username on Amrita portal if needed
    if (window.location.hostname.includes('students.amrita.edu')) {
      autoFetchUsername();
    }
    
    if (window.location.href.includes('students.amrita.edu/client/class-attendance')) {
      initializeAttendancePage();
    } else {
      initializeWebsiteModifier();
    }
  }
});

async function initializeAttendancePage() {
  try {
    const { initializeAttendanceButton } = await import('./content/attendance-page');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initializeAttendanceButton());
    } else {
      initializeAttendanceButton();
    }
  } catch (error) {
    (await import('../utils/logger')).error('Failed to load attendance page module:', error);
  }
}

async function initializeWebsiteModifier() {
  try {
    const { initializeWebsiteModifications } = await import('./content/website-modifier');
    initializeWebsiteModifications();
  } catch (error) {
    (await import('../utils/logger')).error('Failed to load website modifier:', error);
  }
}

/**
 * Automatically fetch and save username from portal if not already set
 */
async function autoFetchUsername() {
  try {
    const { getRawUsername, resolveUsername } = await import('./content/user-utils');
    const currentUsername = await getRawUsername();
    
    // Only auto-fetch if username is unknown or unset
    if (currentUsername === 'Unknown User' || !currentUsername) {
      const logger = await import('../utils/logger');
      logger.log('Auto-fetching username from portal...');
      await resolveUsername(); // This will fetch and save automatically
    }
  } catch (error) {
    (await import('../utils/logger')).error('Failed to auto-fetch username:', error);
  }
}

/**
 * Message listener for debug commands from popup
 */
function setupMessageListener() {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle async operations properly for Chrome compatibility
    (async () => {
      try {
        const { getRawUsername, fetchUsernameFromAmritaPortal, resolveUsername, saveUsername } = 
          await import('./content/user-utils');
        
        switch (message.action) {
          case 'debugCheckUsername':
            const raw = await getRawUsername();
            sendResponse({ raw, isUnknown: raw === 'Unknown User' });
            break;
          
          case 'debugFetchUsername':
            const fetchResult = await fetchUsernameFromAmritaPortal();
            if (fetchResult) {
              await saveUsername(fetchResult);
            }
            sendResponse({ result: fetchResult });
            break;
          
          case 'debugResolveUsername':
            const resolvedUsername = await resolveUsername();
            sendResponse({ result: resolvedUsername });
            break;
          
          case 'debugClearUsername':
            await saveUsername('Unknown User');
            const clearedUsername = await getRawUsername();
            sendResponse({ result: clearedUsername });
            break;
          
          default:
            sendResponse(undefined);
        }
      } catch (error) {
        sendResponse({ error: error.message });
      }
    })();
    
    // Return true to indicate async response
    return true;
  });
}
