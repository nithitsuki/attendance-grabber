/**
 * Background script for Amrita Attendance Fetcher
 * Handles communication between popup/content scripts and coordinates data extraction
 */

import { CONFIG } from '../utils/config';
import { extractAttendanceData, extractUsername } from '../utils/attendance-extractor';
import { transferDataToWebsite, waitForTabLoad } from '../utils/data-transfer';

interface ExtensionMessage {
  action: string;
  targetWebsite?: string;
}

interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default defineBackground(() => {
  console.log('Amrita Attendance Fetcher background script loaded');

  // Handle messages from popup and content scripts
  browser.runtime.onMessage.addListener((
    request: ExtensionMessage, 
    sender: any, 
    sendResponse: (response: ExtensionResponse) => void
  ) => {
    if (request.action === "getAttendance") {
      handleGetAttendance(request.targetWebsite)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      
      return true; // Indicates we'll send response asynchronously
    }
  });

  /**
   * Main handler for attendance extraction requests
   * Coordinates the entire process from extraction to data transfer
   * @param targetWebsite Optional target website URL for data transfer
   * @returns Promise resolving to attendance data
   */
  async function handleGetAttendance(targetWebsite?: string) {
    console.log("Processing attendance extraction request...");
    
    try {
      // TODO: Implement complete attendance extraction flow
      // 1. Get current active tab
      // 2. Check if we're on the attendance page, navigate if needed
      // 3. Extract attendance data from the page
      // 4. Extract username from the page
      // 5. Transfer data to target website if specified
      // 6. Return processed attendance data
      
      const tabs = await getCurrentActiveTab();
      const currentTab = tabs[0];
      
      if (!currentTab?.id || !currentTab.url) {
        throw new Error("Cannot access current tab. Please ensure a page is active.");
      }

      await ensureOnAttendancePage(currentTab.id, currentTab.url);
      const attendanceData = await extractAttendanceFromPage(currentTab.id);
      const username = await extractUsernameFromPage(currentTab.id);
      
      if (targetWebsite) {
        await transferDataToWebsite(
          currentTab.id, 
          targetWebsite, 
          JSON.stringify(attendanceData, null, 2), 
          username
        );
      }
      
      return attendanceData;
      
    } catch (error) {
      console.error("Error in handleGetAttendance:", error);
      throw error;
    }
  }

  /**
   * Gets the current active tab
   * @returns Promise resolving to active tab info
   */
  async function getCurrentActiveTab() {
    // TODO: Use browser.tabs.query to get active tab
    // Return current active tab in current window
    return browser.tabs.query({ active: true, currentWindow: true });
  }

  /**
   * Ensures we're on the attendance page, navigates if needed
   * @param tabId Current tab ID
   * @param currentUrl Current tab URL
   */
  async function ensureOnAttendancePage(tabId: number, currentUrl: string): Promise<void> {
    // TODO: Check if current URL matches attendance page
    // If not, navigate to attendance page and wait for load
    const targetUrl = CONFIG.AMRITA_PORTAL.BASE_URL + CONFIG.AMRITA_PORTAL.ATTENDANCE_PATH;
    
    if (!currentUrl.startsWith(targetUrl)) {
      console.log("Navigating to attendance page...");
      await browser.tabs.update(tabId, { url: targetUrl });
      await waitForTabLoad(tabId, targetUrl);
    }
  }

  /**
   * Extracts attendance data from the current page
   * @param tabId Current tab ID
   * @returns Promise resolving to attendance data
   */
  async function extractAttendanceFromPage(tabId: number) {
    // TODO: Use browser.scripting.executeScript to run extraction
    // 1. Inject attendance extraction function
    // 2. Handle extraction results and errors
    // 3. Validate returned data
    
    console.log("Extracting attendance data from page...");
    
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: extractAttendanceData
    });

    const result = results[0]?.result;
    
    if (!result) {
      throw new Error("No results from attendance extraction script");
    }
    
    if (!result.success) {
      throw new Error(`Extraction failed: ${result.error}`);
    }
    
    if (result.warning) {
      console.warn(`Extraction warning: ${result.warning}`);
    }
    
    return result.data || [];
  }

  /**
   * Extracts username from the current page
   * @param tabId Current tab ID
   * @returns Promise resolving to username
   */
  async function extractUsernameFromPage(tabId: number): Promise<string> {
    // TODO: Use browser.scripting.executeScript to extract username
    // Handle extraction errors gracefully
    
    try {
      const results = await browser.scripting.executeScript({
        target: { tabId },
        func: extractUsername
      });
      
      return results[0]?.result || "Unknown User";
    } catch (error) {
      console.error('Failed to extract username:', error);
      return "Unknown User";
    }
  }
});
