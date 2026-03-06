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
    
    if (request.action === "fetchUsernameFromPortal") {
      fetchUsernameViaBackground()
        .then(username => sendResponse({ success: true, data: username }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      
      return true;
    }
  });

  /**
   * Fetches username from the Amrita portal page (background can make cross-origin requests)
   */
  async function fetchUsernameViaBackground(): Promise<string | null> {
    try {
      const portalUrl = 'https://students.amrita.edu/client/index';
      const response = await fetch(portalUrl, { credentials: 'include' });
      
      if (!response.ok) {
        console.log('Portal fetch failed:', response.status);
        return null;
      }
      
      const html = await response.text();
      
      // Try: Welcome! NAME( ROLL )
      const match = html.match(/Welcome!\s*([^(]+)\s*\(/i);
      if (match?.[1]) {
        return match[1].trim();
      }
      
      // Try: .user-info content in HTML
      const userInfoMatch = html.match(/<[^>]*class="[^"]*user-info[^"]*"[^>]*>([^<]+)</i);
      if (userInfoMatch?.[1]) {
        return userInfoMatch[1].trim();
      }
      
      return null;
    } catch (error) {
      console.error('Background username fetch failed:', error);
      return null;
    }
  }

  /**
   * Main handler for attendance extraction requests
   * Implements the exact same logic as the popup dump button
   * @param targetWebsite Optional target website URL for data transfer
   * @returns Promise resolving to attendance data
   */
  async function handleGetAttendance(targetWebsite?: string) {
    console.log("Processing attendance extraction request (popup dump button logic)...");
    
    try {
      // Step 1: Get the active tab (same as popup)
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id || !tab.url) {
        throw new Error("Cannot access current tab. Please ensure a page is active.");
      }

      const portalUrl = String(CONFIG.AMRITA_PORTAL.BASE_URL + CONFIG.AMRITA_PORTAL.ATTENDANCE_PATH);
      console.log("Portal URL:", portalUrl);
      console.log("Current tab URL:", tab.url);

      // Step 2: Check if current tab is on the portal URL (same as popup)
      if (tab.url && tab.url.includes(portalUrl)) {
        console.log("✅ Already on attendance page, extracting data...");
        
        const [result] = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractAttendanceData
        });
        
        const [usernameResult] = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractUsername
        });
        
        const username = usernameResult?.result || 'Unknown';
        const attendanceData = result?.result?.data || [];
        
        console.log("Username:", username);
        console.log("Subjects data:", JSON.stringify(attendanceData, null, 2));

        // Transfer data to target website if specified
        if (targetWebsite) {
          await transferDataToWebsite(tab.id, targetWebsite, JSON.stringify(attendanceData, null, 2), username);
        }

        return {
          attendanceData: attendanceData,
          username: username,
          message: 'Data extracted successfully from attendance page'
        };
        
      } else {
        console.log("Not on attendance page, navigating...");
        
        // Navigate to the portal URL (same as popup)
        await browser.tabs.update(tab.id, { url: portalUrl });
        
        // Wait for the tab to actually load (same as popup)
        await new Promise((resolve) => {
          const checkLoaded = () => {
            if (tab.id) {
              browser.tabs.get(tab.id).then((updatedTab) => {
                if (updatedTab.status === 'complete') {
                  resolve(undefined);
                } else {
                  setTimeout(checkLoaded, 100);
                }
              });
            }
          };
          checkLoaded();
        });

        // Get updated tab info after navigation
        const [updatedTab] = await browser.tabs.query({ active: true, currentWindow: true });

        // Check if we're at the login page (same as popup)
        if (updatedTab && updatedTab.url && !updatedTab.url.includes(portalUrl)) {
          // Click the submit button
          if (updatedTab.id) {
            await browser.scripting.executeScript({
              target: { tabId: updatedTab.id },
              func: () => {
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                  submitBtn.click();
                }
              }
            });
            console.log('Login page detected, clicked submit button');
          }
        }

        console.log('⏳ Waiting for user to complete login and navigate to attendance page...');
        
        // Wait for user to reach the portal URL (same as popup)
        const waitForPortalUrl = () => {
          return new Promise((resolve) => {
            const checkUrl = async () => {
              try {
                const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
                if (currentTab.url && currentTab.url.includes(portalUrl)) {
                  resolve(currentTab);
                } else {
                  setTimeout(checkUrl, 1000); // Check every second
                }
              } catch (error) {
                setTimeout(checkUrl, 1000);
              }
            };
            checkUrl();
          });
        };

        try {
          const finalTab: any = await waitForPortalUrl();
          
          // Extract data from the final page
          const [result] = await browser.scripting.executeScript({
            target: { tabId: finalTab.id },
            func: extractAttendanceData
          });
          
          const [usernameResult] = await browser.scripting.executeScript({
            target: { tabId: finalTab.id },
            func: extractUsername
          });
          
          const username = usernameResult?.result || 'Unknown';
          const attendanceData = result?.result?.data || [];
          
          console.log("Username:", username);
          console.log("Subjects data:", JSON.stringify(attendanceData, null, 2));

          // Transfer data to target website if specified
          if (targetWebsite) {
            await transferDataToWebsite(finalTab.id, targetWebsite, JSON.stringify(attendanceData, null, 2), username);
          }

          return {
            attendanceData: attendanceData,
            username: username,
            message: 'Data extracted successfully after navigation and login'
          };
          
        } catch (error: any) {
          throw new Error('Failed to extract attendance after navigation: ' + (error?.message || 'Unknown error'));
        }
      }
      
    } catch (error) {
      console.error("❌ Error in handleGetAttendance:", error);
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
