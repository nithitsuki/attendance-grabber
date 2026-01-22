/**
 * Attendance Handler Module
 * Manages attendance updates and communication with the background script.
 */

import { browser } from 'wxt/browser';
import { AttendanceUpdateRequest, AttendanceUpdateResponse, ExtensionEvents } from './types';
import { dispatchExtensionEvent } from './event-dispatcher';
import { resolveUsername } from './user-utils';

/**
 * Get target website URL based on user preferences
 */
async function getTargetWebsite(): Promise<string> {
  try {
    const result = await browser.storage.local.get(['localhostOverride', 'customUrl']);
    
    if (result.localhostOverride) {
      return result.customUrl || 'http://localhost:3000/dashboard';
    }
    return 'https://sad.nithitsuki.com/dashboard';
  } catch {
    return 'https://sad.nithitsuki.com/dashboard';
  }
}

/**
 * Main attendance update handler
 */
export async function handleAttendanceUpdate(): Promise<void> {
  // Try to resolve username if unknown
  try {
    await resolveUsername();
  } catch {
    // Continue even if username resolution fails
  }

  dispatchExtensionEvent('attendanceUpdateStarted', {
    source: 'extension',
    message: 'Fetching attendance data...'
  });

  try {
    const targetWebsite = await getTargetWebsite();
    
    const response = await browser.runtime.sendMessage({
      action: 'getAttendance',
      targetWebsite
    });

    if (response?.success) {
      dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_SUCCESS, {
        source: 'extension',
        message: 'Attendance data updated successfully!'
      });
      
      setTimeout(() => {
        if (confirm('Attendance updated! Refresh page to see changes?')) {
          window.location.reload();
        }
      }, 1000);
    } else {
      const error = response?.error || 'Update failed';
      dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_ERROR, {
        source: 'extension',
        error
      });
      alert(`Attendance update failed: ${error}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_ERROR, {
      source: 'extension',
      error: message
    });
    alert(`Error: ${message}\n\nTry using the extension popup instead.`);
  }
}

/**
 * Exposes attendance update function globally for website access
 */
export function exposeAttendanceUpdateFunction(): void {
  (window as any).extensionHandleAttendanceUpdate = handleAttendanceUpdate;
  (window as any).extensionHandleAttendanceUpdateAsync = handleAttendanceUpdate;
  
  dispatchExtensionEvent('attendanceHandlerReady', {
    source: 'extension',
    message: 'Attendance handler ready'
  });
}

let updateInProgress = false;

/**
 * Check if update is in progress
 */
export function isAttendanceUpdateInProgress(): boolean {
  return updateInProgress;
}

/**
 * Attendance update with progress tracking to prevent duplicates
 */
export async function handleAttendanceUpdateWithProgress(): Promise<boolean> {
  if (updateInProgress) return false;

  updateInProgress = true;
  try {
    await handleAttendanceUpdate();
    return true;
  } catch {
    return false;
  } finally {
    updateInProgress = false;
  }
}

/**
 * Validates attendance update request structure
 */
export function validateAttendanceUpdateRequest(request: any): request is AttendanceUpdateRequest {
  return (
    request?.action === 'getAttendance' &&
    typeof request?.targetWebsite === 'string' &&
    request.targetWebsite.length > 0
  );
}

/**
 * Creates custom attendance update trigger for specific target
 */
export function createCustomAttendanceUpdateTrigger(targetWebsite: string) {
  return async (): Promise<void> => {
    try {
      const response: AttendanceUpdateResponse = await browser.runtime.sendMessage({
        action: 'getAttendance',
        targetWebsite
      });
      
      if (response?.success) {
        dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_SUCCESS, {
          source: 'extension',
          message: `Updated for ${targetWebsite}`
        });
      } else {
        throw new Error(response?.error || 'Update failed');
      }
    } catch (error) {
      dispatchExtensionEvent(ExtensionEvents.ATTENDANCE_UPDATE_ERROR, {
        source: 'extension',
        error: error instanceof Error ? error.message : 'Update failed'
      });
    }
  };
}
