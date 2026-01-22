/**
 * Main content script entry point
 * Routes to appropriate handler based on URL
 */

export default defineContentScript({
  matches: [
    'https://students.amrita.edu/client/class-attendance*',
    'http://localhost:3000/*',
    'http://localhost/*', 
    'http://127.0.0.1:3000/*',
    'https://sad.nithitsuki.com/*'
  ],
  main() {
    setupMessageListener();
    
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
    console.error('Failed to load attendance page module:', error);
  }
}

async function initializeWebsiteModifier() {
  try {
    const { initializeWebsiteModifications } = await import('./content/website-modifier');
    initializeWebsiteModifications();
  } catch (error) {
    console.error('Failed to load website modifier:', error);
  }
}

/**
 * Message listener for debug commands from popup
 */
function setupMessageListener() {
  browser.runtime.onMessage.addListener(async (message) => {
    const { getRawUsername, fetchUsernameFromAmritaPortal, resolveUsername, saveUsername } = 
      await import('./content/user-utils');
    
    switch (message.action) {
      case 'debugCheckUsername':
        const raw = getRawUsername();
        return { raw, isUnknown: raw === 'Unknown User' };
      
      case 'debugFetchUsername':
        return { result: await fetchUsernameFromAmritaPortal() };
      
      case 'debugResolveUsername':
        return { result: await resolveUsername() };
      
      case 'debugClearUsername':
        saveUsername('Unknown User');
        return { result: getRawUsername() };
    }
  });
}
