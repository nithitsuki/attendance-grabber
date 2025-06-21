/**
 * Attendance page module for Amrita attendance page
 * Injects the "Get Attendance" button and handles user interactions
 */

import { CONFIG } from '../../utils/config';

/**
 * Main initialization function for the attendance button
 */
export function initializeAttendanceButton(): void {
  console.log('Attendance page content script loaded');
  
  // TODO: Implement button creation and injection
  // 1. Check if button already exists (avoid duplicates)
  // 2. Create styled button element
  // 3. Add event listeners for interactions
  // 4. Find appropriate location in DOM
  // 5. Inject button into the page
  
  if (document.getElementById('attendance-fetcher-btn')) {
    console.log('Attendance button already exists');
    return;
  }
  
  const button = createAttendanceButton();
  injectButtonIntoPage(button);
}

/**
 * Creates the attendance extraction button with styling and behavior
 * @returns HTMLButtonElement configured attendance button
 */
function createAttendanceButton(): HTMLButtonElement {
  // TODO: Create and style the button
  // 1. Create button element with appropriate text
  // 2. Apply CSS styling to match extension theme
  // 3. Add hover effects
  // 4. Attach click event handler
  // 5. Return configured button
  
  const button = document.createElement('button');
  button.textContent = 'Go to Dashboard!';
  button.id = 'attendance-fetcher-btn';
  
  // Apply styling
  button.style.cssText = `
    z-index: 9999;
    background-color: ${CONFIG.UI.BUTTON_COLOR};
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0px 12px;
    height: 2.7rem;
    font-size: 1rem;
    margin-left: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  
  // Add hover effects
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = CONFIG.UI.BUTTON_COLOR_HOVER;
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = CONFIG.UI.BUTTON_COLOR;
  });
  
  // Add click handler
  button.addEventListener('click', handleAttendanceButtonClick);
  
  return button;
}

/**
 * Handles click events on the attendance button
 * Communicates with background script to extract attendance data
 */
async function handleAttendanceButtonClick(event: Event): Promise<void> {
  // TODO: Implement button click handling
  // 1. Disable button and show loading state
  // 2. Send message to background script
  // 3. Handle success/error responses
  // 4. Update button state based on response
  // 5. Reset button after delay
  
  const button = event.target as HTMLButtonElement;
  
  // Set loading state
  button.textContent = 'Getting Attendance...';
  button.disabled = true;
  
  try {
    // Send message to background script
    const response = await browser.runtime.sendMessage({
      action: "getAttendance",
      targetWebsite: CONFIG.TARGET_WEBSITE
    });
    
    if (response.success) {
      showSuccessState(button);
    } else {
      showErrorState(button, response.error);
    }
  } catch (error) {
    console.error('Error getting attendance:', error);
    showErrorState(button, 'Failed to get attendance');
  }
}

/**
 * Shows success state on the button
 * @param button Button element to update
 */
function showSuccessState(button: HTMLButtonElement): void {
  // TODO: Implement success state display
  // 1. Update button text and color
  // 2. Set timeout to reset button
  
  button.textContent = 'Attendance Retrieved!';
  button.style.backgroundColor = CONFIG.UI.SUCCESS_COLOR;
  
  setTimeout(() => {
    resetButton(button);
  }, CONFIG.BEHAVIOR.BUTTON_RESET_DELAY);
}

/**
 * Shows error state on the button
 * @param button Button element to update
 * @param errorMessage Error message to display
 */
function showErrorState(button: HTMLButtonElement, errorMessage: string): void {
  // TODO: Implement error state display
  // 1. Update button text and color
  // 2. Log error for debugging
  // 3. Set timeout to reset button
  
  console.error('Attendance extraction error:', errorMessage);
  button.textContent = 'Error - Try Again';
  button.style.backgroundColor = CONFIG.UI.ERROR_COLOR;
  
  setTimeout(() => {
    resetButton(button);
  }, CONFIG.BEHAVIOR.ERROR_RESET_DELAY);
}

/**
 * Resets button to original state
 * @param button Button element to reset
 */
function resetButton(button: HTMLButtonElement): void {
  button.textContent = 'Get Attendance';
  button.style.backgroundColor = CONFIG.UI.BUTTON_COLOR;
  button.disabled = false;
}

/**
 * Injects the button into the appropriate location on the page
 * @param button Button element to inject
 */
function injectButtonIntoPage(button: HTMLButtonElement): void {
  // TODO: Find appropriate location and inject button
  // 1. Look for target element (form div in home_view)
  // 2. Handle cases where target doesn't exist
  // 3. Append button to target location
  // 4. Log success/failure
  
  const targetElement = document.querySelector('#home_view form > div');
  
  if (!targetElement) {
    console.warn('Could not find target element for attendance button');
    return;
  }
  
  targetElement.appendChild(button);
  console.log('Attendance button added to page');
}
