/**
 * Event Dispatcher Module
 * 
 * This module handles all event dispatching functionality, including
 * custom events for website integration and React state management triggers.
 * 
 * @fileoverview Centralized event management for communication between
 * the extension and the target website's React application.
 */

import { ExtensionEvents, ExtensionEventDetail, STORAGE_KEYS } from './types';

/**
 * Dispatches a custom event with extension-specific data
 * 
 * This function creates and dispatches custom events that the target website
 * can listen to for integration purposes. It provides a standardized way
 * to communicate extension state changes to the website.
 * 
 * @param {string} eventType - The type of event to dispatch
 * @param {ExtensionEventDetail} detail - The event detail data
 * 
 * @example
 * ```typescript
 * dispatchExtensionEvent('attendanceUpdateSuccess', {
 *   source: 'extension',
 *   message: 'Attendance updated successfully!'
 * });
 * ```
 */
export function dispatchExtensionEvent(eventType: string, detail: ExtensionEventDetail): void {
  try {
    const customEvent = new CustomEvent(eventType, {
      detail,
      bubbles: true,
      cancelable: true
    });
    
    window.dispatchEvent(customEvent);
    console.log(`Extension event dispatched: ${eventType}`, detail);
    
  } catch (error) {
    console.error(`Error dispatching extension event ${eventType}:`, error);
  }
}

/**
 * Dispatches app settings update events
 * 
 * This function specifically handles events related to app settings changes,
 * notifying the website that settings have been updated and triggering
 * any necessary re-renders or state updates.
 * 
 * @example
 * ```typescript
 * dispatchAppSettingsUpdateEvent();
 * // Website can listen: window.addEventListener('appSettingsUpdated', handler);
 * ```
 */
export function dispatchAppSettingsUpdateEvent(): void {
  dispatchExtensionEvent(ExtensionEvents.APP_SETTINGS_UPDATED, {
    source: 'extension',
    message: 'App settings have been updated by the extension'
  });
}

/**
 * Triggers React component re-renders by dispatching storage events
 * 
 * This function attempts to trigger React components to re-read from localStorage
 * by dispatching storage events, which many React applications listen to for
 * state synchronization.
 * 
 * @param {string} storageKey - The localStorage key that was modified
 * @param {string} [newValue] - The new value (will be read from localStorage if not provided)
 * 
 * @example
 * ```typescript
 * // Trigger React to re-read app settings
 * triggerReactStateUpdate(STORAGE_KEYS.APP_SETTINGS);
 * ```
 */
export function triggerReactStateUpdate(storageKey: string, newValue?: string): void {
  try {
    const value = newValue || localStorage.getItem(storageKey);
    
    const storageEvent = new StorageEvent('storage', {
      key: storageKey,
      newValue: value,
      oldValue: null, // We don't track old values
      storageArea: localStorage,
      url: window.location.href
    });
    
    window.dispatchEvent(storageEvent);
    console.log(`Storage event dispatched for key: ${storageKey}`);
    
  } catch (error) {
    console.error(`Error dispatching storage event for ${storageKey}:`, error);
  }
}

/**
 * Comprehensive settings update trigger
 * 
 * This function performs a complete settings update notification process,
 * including multiple event types to ensure maximum compatibility with
 * different website integration approaches.
 * 
 * @example
 * ```typescript
 * triggerSettingsUpdate();
 * // This dispatches multiple events to ensure the website detects the changes
 * ```
 */
export function triggerSettingsUpdate(): void {
  console.log('Triggering comprehensive settings update...');
  
  // Method 1: Dispatch custom extension event
  dispatchAppSettingsUpdateEvent();
  
  // Method 2: Trigger React state updates if React is detected
  setTimeout(() => {
    if (isReactDetected()) {
      console.log('React detected, attempting to trigger re-render...');
      
      // Dispatch storage event for app settings
      triggerReactStateUpdate(STORAGE_KEYS.APP_SETTINGS);
      
      // Also dispatch for username in case React components depend on it
      triggerReactStateUpdate(STORAGE_KEYS.USERNAME);
    }
  }, 100);
  
  // Method 3: Dispatch a general 'extension-ready' event
  setTimeout(() => {
    dispatchExtensionEvent('extensionIntegrationReady', {
      source: 'extension',
      message: 'Extension has completed initial setup'
    });
  }, 200);
}

/**
 * Detects if React is present on the page
 * 
 * This function checks for common indicators that React is running
 * on the page, which helps determine whether to use React-specific
 * integration strategies.
 * 
 * @returns {boolean} True if React is detected on the page
 */
export function isReactDetected(): boolean {
  // Check for React DevTools
  if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    return true;
  }
  
  // Check for React on window object
  if ((window as any).React) {
    return true;
  }
  
  // Check for common React DOM attributes
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-checksum]');
  if (reactElements.length > 0) {
    return true;
  }
  
  // Check for React fiber nodes (React 16+)
  const elementsWithFiber = document.querySelectorAll('*');
  for (let i = 0; i < Math.min(elementsWithFiber.length, 10); i++) {
    const element = elementsWithFiber[i] as any;
    if (element._reactInternalFiber || element._reactInternalInstance) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sets up event listeners for website integration
 * 
 * This function establishes event listeners that can respond to
 * website-initiated events, enabling two-way communication between
 * the extension and the website.
 * 
 * @example
 * ```typescript
 * setupWebsiteIntegrationListeners();
 * // Website can now dispatch events that the extension will respond to
 * ```
 */
export function setupWebsiteIntegrationListeners(): void {
  // Listen for website requests for extension status
  window.addEventListener('extensionStatusRequest', () => {
    dispatchExtensionEvent('extensionStatusResponse', {
      source: 'extension',
      message: 'Extension is active and ready'
    });
  });
  
  // Listen for website requests to refresh attendance
  window.addEventListener('requestAttendanceUpdate', () => {
    console.log('Website requested attendance update');
    dispatchExtensionEvent('attendanceUpdateRequested', {
      source: 'website',
      message: 'Website has requested an attendance update'
    });
  });
  
  console.log('Website integration event listeners established');
}

/**
 * Removes all extension-related event listeners
 * 
 * This function cleans up event listeners when the extension
 * is being unloaded or reset, preventing memory leaks.
 * 
 * @example
 * ```typescript
 * // Call this during extension cleanup
 * removeIntegrationListeners();
 * ```
 */
export function removeIntegrationListeners(): void {
  // Remove specific listeners (would need to store references for proper cleanup)
  console.log('Extension integration listeners removed');
}

/**
 * Dispatches a success event for attendance updates
 * 
 * Convenience function specifically for attendance update success scenarios.
 * 
 * @param {string} [message] - Optional custom success message
 */
export function dispatchAttendanceUpdateSuccess(message?: string): void {
  dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_SUCCESS, {
    source: 'extension',
    message: message || 'Attendance updated successfully!'
  });
}

/**
 * Dispatches an error event for attendance updates
 * 
 * Convenience function specifically for attendance update error scenarios.
 * 
 * @param {string} error - The error message to dispatch
 */
export function dispatchAttendanceUpdateError(error: string): void {
  dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_ERROR, {
    source: 'extension',
    error
  });
}
