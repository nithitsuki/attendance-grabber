/**
 * Utilities for transferring attendance data to external websites
 * Handles navigation, data storage, and synchronization with target websites
 * Refactored to use WXT API patterns
 */

import { AttendanceRecord } from './attendance-extractor';

interface StorageData {
  subjectsData?: string;
  username?: string;
}

/**
 * Default timeout values for various operations
 */
const TIMEOUTS = {
  PAGE_LOAD: 30000, // 30 seconds
  STORAGE_OPERATION: 5000, // 5 seconds
  SCRIPT_INJECTION: 10000, // 10 seconds
  RELOAD_DELAY: 1000 // 1 second
} as const;

/**
 * Transfers attendance data to the target website
 * @param tabId The ID of the current tab
 * @param targetWebsite URL of the target website
 * @param attendanceData Serialized attendance data
 * @param username User's name
 */
export async function transferDataToWebsite(
    tabId: number,
    targetWebsite: string, 
    attendanceData: string,
    username: string
): Promise<void> {
    console.log(`Transferring data to ${targetWebsite}...`);
    
    try {
        await saveDataToStorage(attendanceData, username);
        await navigateToTargetSite(tabId, targetWebsite);
        await waitForPageLoad(tabId, targetWebsite);
        await injectDataToLocalStorage(tabId);
        await forcePageReload(tabId);
    } catch (error) {
        console.error('Data transfer failed:', error);
        throw error;
    }
}

/**
 * Saves attendance data to extension storage temporarily
 * @param attendanceData Serialized attendance data
 * @param username User's name
 */
async function saveDataToStorage(attendanceData: string, username: string): Promise<void> {
    console.log('Saving data to extension storage...');
    
    try {
        await browser.storage.local.set({
            'subjectsData': attendanceData,
            'username': username
        });
        console.log('Data saved to extension storage successfully');
    } catch (error) {
        console.error('Failed to save data to extension storage:', error);
        throw error;
    }
}

/**
 * Navigates the current tab to the target website
 * @param tabId Current tab ID
 * @param targetWebsite Target URL
 */
async function navigateToTargetSite(tabId: number, targetWebsite: string): Promise<void> {
    console.log(`Navigating to ${targetWebsite}...`);
    
    try {
        await browser.tabs.update(tabId, { url: targetWebsite });
        console.log('Navigation initiated successfully');
    } catch (error) {
        console.error('Failed to navigate to target website:', error);
        throw error;
    }
}

/**
 * Waits for the target page to fully load
 * @param tabId Current tab ID
 * @param expectedUrl Expected URL pattern
 */
async function waitForPageLoad(tabId: number, expectedUrl: string): Promise<void> {
    console.log('Waiting for page to load...');
    
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            browser.tabs.onUpdated.removeListener(listener);
            reject(new Error('Page load timeout'));
        }, TIMEOUTS.PAGE_LOAD); // 30 second timeout

        const listener = (updatedTabId: number, changeInfo: any, updatedTab: any) => {
            if (updatedTabId === tabId && 
                    changeInfo.status === 'complete' && 
                    updatedTab.url && 
                    updatedTab.url.startsWith(expectedUrl)) {
                clearTimeout(timeout);
                browser.tabs.onUpdated.removeListener(listener);
                console.log('Page loaded successfully');
                resolve();
            }
        };

        browser.tabs.onUpdated.addListener(listener);
    });
}

/**
 * Injects script to transfer data from extension storage to localStorage
 * @param tabId Current tab ID
 */
async function injectDataToLocalStorage(tabId: number): Promise<void> {
    console.log('Injecting data to localStorage...');
    
    try {
        // First, get the data from extension storage
        const storageData = await browser.storage.local.get(['subjectsData', 'username']);
        
        // Then inject the data into the page
        await browser.scripting.executeScript({
            target: { tabId: tabId },
            func: (data: StorageData) => {
                try {
                    if (data.subjectsData) {
                        localStorage.setItem('subjectsData', data.subjectsData);
                        console.log('Subjects data saved to localStorage');
                    }
                    if (data.username) {
                        localStorage.setItem('username', data.username);
                        console.log('Username saved to localStorage');
                    }
                } catch (error) {
                    console.error('Failed to set localStorage:', error);
                }
            },
            args: [storageData as StorageData]
        });
        console.log('Data injection completed');
    } catch (error) {
        console.error('Failed to inject data to localStorage:', error);
        throw error;
    }
}

/**
 * Forces a hard reload of the current page
 * @param tabId Current tab ID
 */
async function forcePageReload(tabId: number): Promise<void> {
    console.log('Forcing page reload...');
    
    try {
        // Wait a moment for localStorage to be set
        await new Promise(resolve => setTimeout(resolve, TIMEOUTS.RELOAD_DELAY));
        
        await browser.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                window.location.reload();
            }
        });
        console.log('Page reload initiated');
    } catch (error) {
        console.error('Failed to reload page:', error);
        throw error;
    }
}

/**
 * Waits for tab to load with specific URL pattern
 * @param tabId Tab to monitor
 * @param expectedUrl URL pattern to match
 * @returns Promise that resolves when tab loads the expected URL
 */
export function waitForTabLoad(tabId: number, expectedUrl: string): Promise<void> {
    console.log(`Waiting for tab ${tabId} to load ${expectedUrl}...`);
    
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            browser.tabs.onUpdated.removeListener(listener);
            reject(new Error('Tab load timeout'));
        }, TIMEOUTS.PAGE_LOAD); // 30 second timeout

        const listener = (updatedTabId: number, changeInfo: any, updatedTab: any) => {
            if (updatedTabId === tabId && 
                    changeInfo.status === 'complete' && 
                    updatedTab.url && 
                    updatedTab.url.startsWith(expectedUrl)) {
                clearTimeout(timeout);
                browser.tabs.onUpdated.removeListener(listener);
                console.log(`Tab ${tabId} loaded ${expectedUrl} successfully`);
                resolve();
            }
        };

        browser.tabs.onUpdated.addListener(listener);
    });
}
