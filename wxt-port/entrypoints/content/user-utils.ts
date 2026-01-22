/**
 * User Utilities Module
 * Handles username operations: fetching, formatting, storage, and display.
 */

import { STORAGE_KEYS } from './types';
import { updateAppSettings } from './app-settings';

const UNKNOWN_USER = 'Unknown User';
const AMRITA_PORTAL_URL = 'https://students.amrita.edu/client/index';

/**
 * Retrieves username from localStorage
 */
export function getRawUsername(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || UNKNOWN_USER;
  } catch {
    return UNKNOWN_USER;
  }
}

/**
 * Fetches username from Amrita student portal by parsing the welcome message
 */
export async function fetchUsernameFromAmritaPortal(): Promise<string | null> {
  try {
    const response = await fetch(AMRITA_PORTAL_URL, { credentials: 'include' });
    
    if (!response.ok) {
      console.warn('Failed to fetch Amrita portal:', response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Pattern: Welcome! NAME( ROLL_NUMBER )
    const match = html.match(/Welcome!\s*([^(]+)\s*\(/i);
    
    if (match?.[1]) {
      return match[1].trim();
    }
    
    console.warn('Username not found in portal HTML');
    return null;
  } catch (error) {
    console.error('Error fetching username:', error);
    return null;
  }
}

/**
 * Resolves username - fetches from portal if currently "Unknown User"
 */
export async function resolveUsername(): Promise<string> {
  const currentUsername = getRawUsername();
  
  if (currentUsername !== UNKNOWN_USER) {
    return currentUsername;
  }
  
  const fetchedUsername = await fetchUsernameFromAmritaPortal();
  
  if (fetchedUsername) {
    saveUsername(fetchedUsername);
    return fetchedUsername;
  }
  
  return currentUsername;
}

/**
 * Formats username: returns first name with proper capitalization
 */
export function formatUsername(rawUsername?: string): string {
  const username = rawUsername || getRawUsername();
  const firstName = username.split(/\s+/)[0];
  
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

/**
 * Gets formatted username from localStorage
 */
export function getFormattedUsername(): string {
  return formatUsername();
}

/**
 * Gets formatted username, resolving from portal if needed
 */
export async function getFormattedUsernameAsync(): Promise<string> {
  const resolved = await resolveUsername();
  return formatUsername(resolved);
}

/**
 * Saves username to localStorage and updates the display titlePayload
 * Does NOT save "Unknown User" if we already have a valid username
 */
export function saveUsername(username: string): boolean {
  // Don't overwrite a valid username with "Unknown User"
  if (username === UNKNOWN_USER) {
    const currentUsername = getRawUsername();
    if (currentUsername !== UNKNOWN_USER) {
      return false; // Keep the existing valid username
    }
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    
    // Update titlePayload so the page displays the new username
    const newTitlePayload = createWelcomeMessageHtml(username);
    updateAppSettings({ titlePayload: newTitlePayload });
    
    return true;
  } catch (error) {
    console.error('Error saving username:', error);
    return false;
  }
}

/**
 * Creates welcome message HTML with clickable username button
 */
export function createWelcomeMessageHtml(customUsername?: string): string {
  const username = formatUsername(customUsername);
  
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
 * Sets up click handler for username button using event delegation
 */
export function setupUsernameButtonClickHandler(): void {
  document.addEventListener('click', async (event: Event) => {
    const target = event.target as HTMLElement;
    
    if (target?.id === 'username-btn' || target?.hasAttribute('data-attendance-update')) {
      event.preventDefault();
      event.stopPropagation();
      
      const handler = (window as any).extensionHandleAttendanceUpdate;
      
      if (typeof handler === 'function') {
        await handler();
      } else {
        alert('Extension not ready. Please try again.');
      }
    }
  });
}

/**
 * Validates username format
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  if (username.trim().length === 0 || username.length > 100) return false;
  
  return /^[a-zA-Z0-9\s._-]+$/.test(username.trim());
}

/**
 * Gets username initials (max 3 characters)
 */
export function getUserInitials(customUsername?: string): string {
  const username = customUsername || getRawUsername();
  
  return username
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
}

/**
 * Exposes debug functions on window for console testing
 */
export function exposeDebugFunctions(): void {
  (window as any).debugFetchUsername = fetchUsernameFromAmritaPortal;
  (window as any).debugResolveUsername = resolveUsername;
  (window as any).debugCheckUsername = () => ({
    raw: getRawUsername(),
    isUnknown: getRawUsername() === UNKNOWN_USER
  });
}
