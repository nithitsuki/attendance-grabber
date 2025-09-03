/**
 * Attendance Handler Module
 * 
 * This module manages all attendance-related functionality, including
 * triggering attendance updates, handling responses, and communicating
 * with the background script.
 * 
 * @fileoverview Handles attendance update operations and communication
 * between the content script and the extension's background script.
 */

import { browser } from 'wxt/browser';
import { AttendanceUpdateRequest, AttendanceUpdateResponse, ExtensionEvents, ExtensionEventDetail } from './types';
import { dispatchExtensionEvent } from './event-dispatcher';

/**
 * Get the target website URL based on localhost override setting
 * @returns {Promise<string>} The target website URL
 */
async function getTargetWebsite(): Promise<string> {
  try {
    const result = await browser.storage.local.get(['localhostOverride']);
    const useLocalhost = result.localhostOverride || false;
    
    if (useLocalhost) {
      return "http://localhost:3000/dashboard";
    } else {
      return "https://sad.nithitsuki.com/dashboard";
    }
  } catch (error) {
    console.error('Error getting target website preference:', error);
    // Default to production if there's an error
    return "https://sad.nithitsuki.com/dashboard";
  }
}

/**
 * Handles attendance update functionality
 * 
 * This function provides the same comprehensive attendance update functionality
 * as the popup dump button by communicating with the background script to perform
 * the complete flow: navigation, data extraction, and transfer.
 * 
 * @returns {Promise<void>} A promise that resolves when the update attempt is complete
 * 
 * @example
 * ```typescript
 * // Call this function when user clicks update button
 * await handleAttendanceUpdate();
 * ```
 */
export async function handleAttendanceUpdate(): Promise<void> {
  console.log('🎯 Starting attendance update (same as popup dump button)...');

  // Show loading state by dispatching an event
  dispatchExtensionEvent('attendanceUpdateStarted', {
    source: 'extension',
    message: 'Fetching attendance data...'
  });

  try {
    // Get the target website based on localhost override setting
    const targetWebsite = await getTargetWebsite();
    console.log('🌐 Target website determined:', targetWebsite);
    
    // Send message to background script with the same request as popup
    const request = {
      action: "getAttendance",
      targetWebsite: targetWebsite
    };

    console.log('📡 Requesting attendance data via background script:', request);

    // This will trigger the background script to:
    // 1. Get active tab
    // 2. Navigate to attendance portal if needed
    // 3. Handle login flow
    // 4. Extract attendance data and username
    // 5. Transfer data to target website
    const response = await browser.runtime.sendMessage(request);

    // Handle the response
    if (response && response.success) {
      console.log('✅ Attendance update completed successfully!');
      
      // Dispatch success event for the website to handle
      dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_SUCCESS, {
        source: 'extension',
        message: 'Attendance data updated successfully! The page should refresh with new data.'
      });
      
      // Optionally trigger a page reload to show updated data
      setTimeout(() => {
        if (confirm('Attendance data has been updated! Would you like to refresh the page to see the changes?')) {
          window.location.reload();
        }
      }, 1000);
      
    } else {
      const errorMessage = response?.error || 'Failed to update attendance data';
      console.error('❌ Attendance update failed:', errorMessage);
      
      // Dispatch error event for the website to handle
      dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_ERROR, {
        source: 'extension',
        error: errorMessage
      });
      
      // Show user-friendly error message
      alert(`Attendance update failed: ${errorMessage}\n\nPlease try again or use the browser extension popup.`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network or extension error';
    console.error('💥 Error during attendance update:', error);
    
    // Dispatch error event for network/extension failures
    dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_ERROR, {
      source: 'extension',
      error: errorMessage
    });
    
    // Show user-friendly error message
    alert(`An error occurred: ${errorMessage}\n\nPlease try using the browser extension popup instead.`);
  }
}

/**
 * Exposes the attendance update function globally
 * 
 * This function makes the attendance update functionality available
 * to the website's JavaScript, allowing the website to trigger
 * attendance updates programmatically.
 * 
 * @example
 * ```typescript
 * exposeAttendanceUpdateFunction();
 * // Now the website can call: window.extensionHandleAttendanceUpdate()
 * ```
 */
export function exposeAttendanceUpdateFunction(): void {
  console.log('🔧 Exposing attendance update function globally...');
  
  // Make the function available on the global window object
  (window as any).extensionHandleAttendanceUpdate = handleAttendanceUpdate;
  
  // Verify the function is properly attached
  if (typeof (window as any).extensionHandleAttendanceUpdate === 'function') {
    console.log('✅ Attendance update function exposed globally as window.extensionHandleAttendanceUpdate');
  } else {
    console.error('❌ Failed to expose attendance update function');
  }
  
  // Also expose a promise-based version for more advanced usage
  (window as any).extensionHandleAttendanceUpdateAsync = handleAttendanceUpdate;
  
  // Test if the function can be called
  console.log('🧪 Testing function exposure...');
  console.log('Function type:', typeof (window as any).extensionHandleAttendanceUpdate);
  
  // Dispatch an event to notify the website that the function is available
  dispatchExtensionEvent('attendanceHandlerReady', {
    source: 'extension',
    message: 'Attendance update handler is ready'
  });
}

/**
 * Checks if attendance update is currently in progress
 * 
 * This function provides a way to check if an attendance update
 * is currently being processed, useful for preventing duplicate requests.
 * 
 * @returns {boolean} True if an update is in progress
 */
let attendanceUpdateInProgress = false;

export function isAttendanceUpdateInProgress(): boolean {
  return attendanceUpdateInProgress;
}

/**
 * Enhanced attendance update handler with progress tracking
 * 
 * This version includes progress tracking to prevent multiple simultaneous
 * update attempts and provides better user experience.
 * 
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 */
export async function handleAttendanceUpdateWithProgress(): Promise<boolean> {
  // Prevent multiple simultaneous updates
  if (attendanceUpdateInProgress) {
    console.warn('Attendance update already in progress, skipping request');
    
    dispatchExtensionEvent('attendanceUpdateSkipped', {
      source: 'extension',
      message: 'Update already in progress'
    });
    
    return false;
  }

  attendanceUpdateInProgress = true;
  
  try {
    await handleAttendanceUpdate();
    return true;
  } catch (error) {
    console.error('Attendance update failed:', error);
    return false;
  } finally {
    attendanceUpdateInProgress = false;
  }
}

/**
 * Validates attendance update request
 * 
 * This function validates that all required parameters are present
 * for an attendance update request.
 * 
 * @param {any} request - The request object to validate
 * @returns {boolean} True if the request is valid
 */
export function validateAttendanceUpdateRequest(request: any): request is AttendanceUpdateRequest {
  return (
    typeof request === 'object' &&
    request !== null &&
    request.action === 'getAttendance' &&
    typeof request.targetWebsite === 'string' &&
    request.targetWebsite.length > 0
  );
}

/**
 * Creates a manual attendance update trigger
 * 
 * This function creates and returns a function that can be used
 * to manually trigger attendance updates with custom parameters.
 * 
 * @param {string} customTargetWebsite - Custom target website URL
 * @returns {() => Promise<void>} Function to trigger the update
 */
export function createCustomAttendanceUpdateTrigger(customTargetWebsite: string) {
  return async (): Promise<void> => {
    console.log(`Custom attendance update for: ${customTargetWebsite}`);
    
    try {
      const request: AttendanceUpdateRequest = {
        action: "getAttendance",
        targetWebsite: customTargetWebsite
      };

      const response: AttendanceUpdateResponse = await browser.runtime.sendMessage(request);
      
      if (response && response.success) {
        console.log('Custom attendance update successful');
        dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_SUCCESS, {
          source: 'extension',
          message: `Attendance updated for ${customTargetWebsite}`
        });
      } else {
        throw new Error(response?.error || 'Custom attendance update failed');
      }
      
    } catch (error) {
      console.error('Custom attendance update error:', error);
      dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_ERROR, {
        source: 'extension',
        error: error instanceof Error ? error.message : 'Custom update failed'
      });
    }
  };
}
