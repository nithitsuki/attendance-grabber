/**
 * User Utilities Module
 * 
 * This module provides utility functions for handling user-related operations,
 * including username formatting, retrieval from localStorage, and display formatting.
 * 
 * @fileoverview User-centric utility functions that handle username operations
 * and user data formatting for display in the website interface.
 */

import { STORAGE_KEYS } from './types';

/**
 * Default username used when no username is found in localStorage
 */
const DEFAULT_USERNAME = 'Default User';

/**
 * Retrieves the username from localStorage
 * 
 * This function safely retrieves the stored username, with fallback
 * to a default value if no username is found.
 * 
 * @returns {string} The stored username or default if not found
 * 
 * @example
 * ```typescript
 * const username = getRawUsername();
 * console.log(`Raw username: ${username}`);
 * ```
 */
export function getRawUsername(): string {
  try {
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    return username || DEFAULT_USERNAME;
  } catch (error) {
    console.warn('Error retrieving username from localStorage:', error);
    return DEFAULT_USERNAME;
  }
}

/**
 * Formats username with proper capitalization
 * 
 * This function takes a raw username and applies proper title case formatting,
 * capitalizing the first letter of each word and making the rest lowercase.
 * 
 * @param {string} [rawUsername] - The username to format. If not provided, retrieves from localStorage
 * @returns {string} The formatted username with proper capitalization
 * 
 * @example
 * ```typescript
 * const formatted = formatUsername('john doe');
 * console.log(formatted); // "John Doe"
 * 
 * const fromStorage = formatUsername(); // Uses username from localStorage
 * ```
 */
export function formatUsername(rawUsername?: string): string {
  const username = rawUsername || getRawUsername();
  
  // Format username with proper capitalization using title case
  return username.replace(/\w\S*/g, (word) => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

/**
 * Gets and formats username from localStorage
 * 
 * This is a convenience function that combines username retrieval and formatting
 * in a single operation. This is the most commonly used function for displaying usernames.
 * 
 * @returns {string} The formatted username ready for display
 * 
 * @example
 * ```typescript
 * const displayName = getFormattedUsername();
 * document.getElementById('welcome').textContent = `Welcome ${displayName}!`;
 * ```
 */
export function getFormattedUsername(): string {
  return formatUsername();
}

/**
 * Saves username to localStorage
 * 
 * This function stores a username in localStorage with proper error handling.
 * It can be used when the extension receives updated user information.
 * 
 * @param {string} username - The username to save
 * @returns {boolean} True if save was successful, false otherwise
 * 
 * @example
 * ```typescript
 * if (saveUsername('john.doe')) {
 *   console.log('Username saved successfully');
 * }
 * ```
 */
export function saveUsername(username: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    console.log('Username saved to localStorage:', username);
    return true;
  } catch (error) {
    console.error('Error saving username to localStorage:', error);
    return false;
  }
}

/**
 * Creates a personalized welcome message HTML
 * 
 * This function generates an HTML string for a personalized welcome message
 * that includes a clickable username button for attendance updates.
 * 
 * @param {string} [customUsername] - Optional custom username to use instead of stored one
 * @returns {string} HTML string for the welcome message
 * 
 * @example
 * ```typescript
 * const welcomeHtml = createWelcomeMessageHtml();
 * document.getElementById('header').innerHTML = welcomeHtml;
 * ```
 */
export function createWelcomeMessageHtml(customUsername?: string): string {
  const username = customUsername || getFormattedUsername();
  
  return `
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1 class="pb-0 pt-1">
        Welcome 
        <button 
          id="username-btn" 
          data-attendance-update="true"
          style="color: rgb(234, 22, 85); cursor: pointer; background: none; border: none; text-decoration: none; font-size: inherit; font-family: inherit; padding: 0;"
          title="Click to update your attendance data"
        >
          ${username}
        </button>!
      </h1>
      <span style="text-align: center;">
        Click on your name to update your attendance.
      </span>
  </div>`;
}

/**
 * Sets up click handler for the username button
 * 
 * This function adds the click event listener for the username button
 * using event delegation to ensure it works even when the content is dynamically loaded.
 */
export function setupUsernameButtonClickHandler(): void {
  console.log('🎯 Setting up username button click handler...');
  
  // Use event delegation to handle clicks on the username button
  document.addEventListener('click', async (event: Event) => {
    const target = event.target as HTMLElement;
    
    // Check if the clicked element is our username button
    if (target && (
      target.id === 'username-btn' || 
      target.hasAttribute('data-attendance-update')
    )) {
      console.log('👤 Username button clicked!');
      event.preventDefault();
      event.stopPropagation();
      
      try {
        // Check if the global function exists
        if (typeof (window as any).extensionHandleAttendanceUpdate === 'function') {
          console.log('✅ Calling attendance update function...');
          await (window as any).extensionHandleAttendanceUpdate();
        } else {
          console.error('❌ Attendance update function not found on window object');
          console.log('Available window properties:', Object.keys(window).filter(k => k.includes('extension')));
          alert('Extension functionality not ready yet. Please try again in a few seconds.');
        }
      } catch (error) {
        console.error('💥 Error calling attendance update:', error);
        alert('Error updating attendance. Please try using the browser extension popup instead.');
      }
    }
  });
  
  console.log('✅ Username button click handler set up successfully');
}

/**
 * Validates username format
 * 
 * This function checks if a given string is a valid username format.
 * It ensures the username is not empty and doesn't contain invalid characters.
 * 
 * @param {string} username - The username to validate
 * @returns {boolean} True if the username is valid
 * 
 * @example
 * ```typescript
 * if (validateUsername(userInput)) {
 *   saveUsername(userInput);
 * } else {
 *   console.error('Invalid username format');
 * }
 * ```
 */
export function validateUsername(username: string): boolean {
  if (typeof username !== 'string' || username.trim().length === 0) {
    return false;
  }
  
  // Check for reasonable length (adjust as needed)
  if (username.length > 100) {
    return false;
  }
  
  // Allow letters, numbers, spaces, dots, hyphens, underscores
  const validUsernameRegex = /^[a-zA-Z0-9\s._-]+$/;
  return validUsernameRegex.test(username.trim());
}

/**
 * Gets username initials for display
 * 
 * This function extracts the first letter of each word in the username
 * to create initials, useful for profile pictures or compact displays.
 * 
 * @param {string} [customUsername] - Optional custom username to use
 * @returns {string} The initials (e.g., "John Doe" → "JD")
 * 
 * @example
 * ```typescript
 * const initials = getUserInitials();
 * document.getElementById('profile-pic').textContent = initials;
 * ```
 */
export function getUserInitials(customUsername?: string): string {
  const username = customUsername || getFormattedUsername();
  
  return username
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3); // Limit to 3 characters maximum
}
