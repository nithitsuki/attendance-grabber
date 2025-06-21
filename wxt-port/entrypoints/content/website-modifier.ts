/**
 * Website modifier module for target website (dashboard/localhost)
 * Modifies the target website to integrate with extension data
 */

import { CONFIG } from '../../utils/config';
import { browser } from 'wxt/browser';

/**
 * Main initialization function for website modifications
 */
export function initializeWebsiteModifications(): void {
  console.log('Target website content script loaded');
  
  // Wait for hydration delay to avoid Next.js conflicts
  setTimeout(() => {
    removeAddButton();
    removeTitle()
    showWelcomePayload();
    // setupDynamicObserver();
  }, CONFIG.BEHAVIOR.HYDRATION_DELAY);
}

/**
 * Removes the default add-button from the target website
 */
function removeAddButton(): void {
  const addButton = document.getElementById('add-button');
  if (addButton) {
    addButton.remove();
    console.log('Add button removed from target website');
  }
}

function removeTitle(): void {
  const titleElement = document.getElementById('Heading Title');
  if (titleElement) {
    titleElement.remove();
    console.log('Title removed from target website');
  }
}

/**
 * Shows welcome payload with user information and attendance update functionality
 */
function showWelcomePayload(): void {
  const mainContent = document.getElementById('main_content');
  if (!mainContent) {
    console.warn('Main content element not found');
    return;
  }
  
  // Style the main content container
  Object.assign(mainContent.style, {
    display: 'flex',
    gap: '0rem',
    alignItems: 'center',
    justifyContent: 'center'
  });
  
  const username = getFormattedUsername();
  
  // Create welcome message
  mainContent.innerHTML = `
    <span style="text-align: center;">
      <h1 class="pb-0 pt-1" >Welcome <button id="username-btn" style="color: rgb(234, 22, 85); cursor: pointer">${username}</button>!<br></h1>
      Click on your name to update your attendance.
    </span>
  `;
  
  // Add click handler for username button
  const usernameButton = document.getElementById('username-btn');
  if (usernameButton) {
    usernameButton.addEventListener('click', handleAttendanceUpdate);
  }
}

/**
 * Gets and formats username from localStorage
 * @returns Formatted username string
 */
function getFormattedUsername(): string {
  const username = localStorage.getItem('username') || 'Default User';
  
  // Format username with proper capitalization
  return username.replace(/\w\S*/g, (word) => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

/**
 * Handles attendance update when username is clicked
 */
async function handleAttendanceUpdate(): Promise<void> {
  console.log('Triggering attendance update...');
  
  // TODO: Show loading states during processing
  // TODO: Show success feedback to user
  // TODO: Show error feedback to user
  
  try {
    const response = await browser.runtime.sendMessage({
      action: "getAttendance",
      targetWebsite: CONFIG.TARGET_WEBSITE
    });
    
    if (response.success) {
      console.log('Attendance updated successfully');
      // TODO: Show success feedback to user
    } else {
      console.error('Attendance update failed:', response.error);
      // TODO: Show error feedback to user
    }
  } catch (error) {
    console.error('Error during attendance update:', error);
  }
}

/**
 * Sets up mutation observer for dynamic content changes
 * Helps handle cases where content is re-rendered by frameworks like Next.js
 */
function setupDynamicObserver(): void {
  const observer = new MutationObserver((mutations) => {
    let shouldReapplyModifications = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if add-button was re-added
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element && 
              (node.id === 'add-button' || node.querySelector('#add-button'))) {
            shouldReapplyModifications = true;
          }
        });
      }
    });
    
    if (shouldReapplyModifications) {
      console.log('Re-applying website modifications due to DOM changes');
      removeAddButton();
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Stop observing after 2 seconds to avoid performance issues
  setTimeout(() => {
    observer.disconnect();
    console.log('Dynamic observer disconnected');
  }, 2000);
}
