/**
 * User Utilities Module
 * Handles username operations: fetching, formatting, storage, and display.
 */

import { STORAGE_KEYS } from './types';
import { updateAppSettings } from './app-settings';
import * as logger from '../../utils/logger';

const UNKNOWN_USER = 'Unknown User';
const AMRITA_PORTAL_URL = 'https://students.amrita.edu/client/index';
const USERNAME_STORAGE_KEY = 'username';

/**
 * Retrieves username from browser.storage (cross-domain)
 */
export async function getRawUsername(): Promise<string> {
  try {
    const result = await browser.storage.local.get(USERNAME_STORAGE_KEY);
    return result[USERNAME_STORAGE_KEY] || UNKNOWN_USER;
  } catch {
    return UNKNOWN_USER;
  }
}

/**
 * Retrieves username from localStorage (legacy, domain-specific)
 * Used as fallback for same-domain operations
 */
function getRawUsernameSync(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || UNKNOWN_USER;
  } catch {
    return UNKNOWN_USER;
  }
}

/**
 * Fetches username from Amrita student portal.
 * If on portal: parses DOM directly.
 * If on another site: asks background script to fetch (cross-origin).
 */
export async function fetchUsernameFromAmritaPortal(): Promise<string | null> {
  try {
    // If on the Amrita portal, extract directly from DOM
    if (window.location.hostname.includes('students.amrita.edu')) {
      // Try to get username from .user-info element
      const usernameElement = document.querySelector('.user-info');
      if (usernameElement) {
        const usernameText = usernameElement.textContent?.trim() || '';
        const username = usernameText.split(' ')[0];
        if (username && username !== 'Unknown') {
          logger.log('Username extracted from DOM:', username);
          return username;
        }
      }
      
      // Fallback: fetch the index page
      const response = await fetch(AMRITA_PORTAL_URL, { credentials: 'include' });
      if (response.ok) {
        const html = await response.text();
        const match = html.match(/Welcome!\s*([^(]+)\s*\(/i);
        if (match?.[1]) {
          return match[1].trim();
        }
      }
      
      return null;
    }
    
    // Not on portal - ask background script to fetch cross-origin
    logger.log('Requesting username from background script...');
    const response = await browser.runtime.sendMessage({ action: 'fetchUsernameFromPortal' });
    
    if (response?.success && response.data) {
      logger.log('Username received from background:', response.data);
      return response.data;
    }
    
    logger.warn('Background script could not fetch username');
    return null;
  } catch (error) {
    logger.error('Error fetching username:', error);
    return null;
  }
}

/**
 * Resolves username - fetches from portal if currently "Unknown User"
 */
export async function resolveUsername(): Promise<string> {
  const currentUsername = await getRawUsername();
  
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
  const username = rawUsername || getRawUsernameSync();
  const firstName = username.split(/\s+/)[0];
  
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

/**
 * Gets formatted username from localStorage (sync, for display)
 */
export function getFormattedUsername(): string {
  return formatUsername();
}

/**
 * Gets formatted username from storage (async, cross-domain)
 */
export async function getFormattedUsernameFromStorage(): Promise<string> {
  const username = await getRawUsername();
  return formatUsername(username);
}

/**
 * Gets formatted username, resolving from portal if needed
 */
export async function getFormattedUsernameAsync(): Promise<string> {
  const resolved = await resolveUsername();
  return formatUsername(resolved);
}

/**
 * Saves username to browser.storage (cross-domain) and localStorage
 * Does NOT save "Unknown User" if we already have a valid username
 */
export async function saveUsername(username: string): Promise<boolean> {
  // Don't overwrite a valid username with "Unknown User"
  if (username === UNKNOWN_USER) {
    const currentUsername = await getRawUsername();
    if (currentUsername !== UNKNOWN_USER) {
      return false; // Keep the existing valid username
    }
  }
  
  try {
    // Save to browser.storage (cross-domain)
    await browser.storage.local.set({ [USERNAME_STORAGE_KEY]: username });
    
    // Also save to localStorage for legacy compatibility
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    
    // Update titlePayload so the page displays the new username
    const newTitlePayload = createWelcomeMessageHtml(username);
    updateAppSettings({ titlePayload: newTitlePayload });
    
    logger.log('Username saved to storage:', username);
    return true;
  } catch (error) {
    logger.error('Error saving username:', error);
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
  const username = customUsername || getRawUsernameSync();
  
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
  (window as any).debugCheckUsername = async () => ({
    raw: await getRawUsername(),
    isUnknown: (await getRawUsername()) === UNKNOWN_USER
  });
}
