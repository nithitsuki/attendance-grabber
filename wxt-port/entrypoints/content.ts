/**
 * Main content script entry point
 * Routes to appropriate content script based on URL
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
    console.log('Main content script loaded for:', window.location.href);
    
    // Route to appropriate content script based on URL
    if (window.location.href.includes('students.amrita.edu/client/class-attendance')) {
      // Handle attendance page
      console.log('Attendance page detected - initializing attendance features');
      initializeAttendancePage();
    } else {
      // Handle target website modifications
      console.log('Target website detected - initializing website modifier');
      initializeWebsiteModifier();
    }
  }
});

/**
 * Dynamically imports and initializes the attendance page features
 */
async function initializeAttendancePage() {
  try {
    // Import the attendance page module
    const { initializeAttendanceButton } = await import('./content/attendance-page');
    
    // Wait for DOM to be ready, then add button
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initializeAttendanceButton());
    } else {
      initializeAttendanceButton();
    }
  } catch (error) {
    console.error('Failed to load attendance page module:', error);
  }
}

/**
 * Dynamically imports and initializes the website modifier
 */
async function initializeWebsiteModifier() {
  try {
    // Import the website modifier module
    const { initializeWebsiteModifications } = await import('./content/website-modifier');
    
    // Initialize the website modifications
    initializeWebsiteModifications();
  } catch (error) {
    console.error('Failed to load website modifier:', error);
  }
}
