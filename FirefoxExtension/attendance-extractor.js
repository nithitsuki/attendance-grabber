// Attendance extraction utility functions
// This file contains reusable functions for extracting attendance data from the Amrita student portal

/**
 * Configuration constants
 * Uses global config if available, otherwise falls back to hardcoded values
 */
const ATTENDANCE_CONFIG = {
    TARGET_URL: (typeof CONFIG !== 'undefined' && CONFIG.AMRITA_PORTAL) 
        ? CONFIG.AMRITA_PORTAL.BASE_URL + CONFIG.AMRITA_PORTAL.ATTENDANCE_PATH
        : 'https://students.amrita.edu/client/class-attendance',
    TABLE_ID: (typeof CONFIG !== 'undefined' && CONFIG.AMRITA_PORTAL?.TABLE_ID) 
        ? CONFIG.AMRITA_PORTAL.TABLE_ID 
        : 'home_tab',
    MIN_ATTENDANCE_PERCENTAGE: 75
};

/**
 * Extracts attendance data from the current page
 * This function will be injected into the target page and cannot use any external variables
 * @returns {Object} The extracted attendance data or error information
 */
function extractAttendanceDataFromPage() {
    const attendanceTable = document.getElementById('home_tab');
    if (!attendanceTable) {
        return { error: "Attendance table with ID 'home_tab' not found on the page." };
    }

    const records = [];
    let headerFound = false;
    const rows = attendanceTable.querySelectorAll('tr');

    rows.forEach(row => {
        const columns = row.querySelectorAll('th, td');

        if (columns.length > 0 && columns[0].textContent.trim() === 'Sl No') {
            headerFound = true;
            return; // Skip header row itself
        }

        if (!headerFound) {
            return; // Skip any rows before the header
        }

        // Expect at least 9 columns for a valid data row
        if (columns.length < 9) {
            return;
        }

        let dutyLeave = parseInt(columns[6].textContent.trim()) || 0;
        let medicalLeave = parseInt(columns[9] ? columns[9].textContent.trim() : 0) || 0;
        let totalPresent = parseInt(columns[5].textContent.trim()) + dutyLeave + medicalLeave;
        let CourseCleaned = columns[2].innerHTML.replace(/.*<br>/, '');
        let CourseAbbreviation = CourseCleaned.split(' ')
            .filter(word => /^[a-zA-Z]/.test(word) && !['to', 'and', 'of'].includes(word.toLowerCase()))
            .map(word => word[0].toUpperCase())
            .join('.');

        const record = {
            Sl_No: columns[0].textContent.trim(),
            Course: CourseCleaned,
            CourseAbbreviation: CourseAbbreviation,
            // faculty: columns[3].textContent.trim(),
            total: parseInt(columns[4].textContent.trim()) || 0,
            present: totalPresent,
            absent: parseInt(columns[7].textContent.trim()) || 0,
            percentage: parseFloat(columns[8].textContent.trim()) || 0,
            MinAttendancePercentage: 75,
        };
        records.push(record);
    });

    if (records.length === 0 && headerFound) {
        return { warning: "Header found, but no data rows extracted.", data: [] };
    }
    if (records.length === 0 && !headerFound) {
        return { error: "Attendance table found, but header row ('Sl No') not found or no data rows." };
    }

    return records;
}

function extractUsername() {
    const usernameElement = document.querySelector('.user-info');
    if(!usernameElement) {
        console.error("Username element not found on the page.");
        return null;
    }else {
        console.log("Username element found:", usernameElement);
        const usernameText = usernameElement.textContent.trim();
        const username = usernameText.split(' ')[0]; // Assuming the username is the first part of the text
        console.log("Extracted username:", username);
        return username;
    }
}

/**
 * Utility function to wait for tab to load a specific URL
 * @param {number} tabId - The ID of the tab to monitor
 * @param {string} expectedUrl - The URL to wait for
 * @returns {Promise} Promise that resolves when the tab loads the expected URL
 */
function waitForTabLoad(tabId, expectedUrl) {
    return new Promise((resolve) => {
        const listener = (updatedTabId, changeInfo, updatedTab) => {
            if (updatedTabId === tabId && 
                changeInfo.status === 'complete' && 
                updatedTab.url.startsWith(expectedUrl)) {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

/**
 * Transfers attendance data to the target website
 * @param {number} tabId - The ID of the tab
 * @param {string} targetWebsite - The target website URL
 * @param {string} attendanceData - The JSON string of attendance data
 */
async function transferDataToWebsite(tabId, targetWebsite, attendanceData) {
    // Save the attendance data first
    await chrome.storage.local.set({ 'subjectsData': attendanceData });
    console.log('Attendance data saved temporarily');
    
    // Navigate to the target website
    await chrome.tabs.update(tabId, { url: targetWebsite });
    
    // Wait for the page to load
    await waitForTabLoad(tabId, targetWebsite);
    
    // Execute script to save data in localStorage
    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
            // Retrieve the saved data
            chrome.storage.local.get(['subjectsData'], function(result) {
                if (result.subjectsData) {
                    localStorage.setItem('subjectsData', result.subjectsData);
                    console.log('Subjects data saved to localStorage');
                }
            });
        }
    });

    // Wait a moment for localStorage to be set, then force a hard reload
    setTimeout(async () => {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // Force a hard reload of the page to ensure it uses localStorage data
                window.location.reload(true);
            }
        });
    }, 1000); // 1 second delay to ensure storage is set first
}

// Export functions for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ATTENDANCE_CONFIG,
        extractAttendanceDataFromPage,
        waitForTabLoad,
        extractUsername,
        transferDataToWebsite
    };
}
