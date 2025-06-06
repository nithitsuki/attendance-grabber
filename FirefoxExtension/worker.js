let windowId = null;

console.log("Extension service worker started");

// Import configuration - since this is a background script, CONFIG should be available globally
const config = (typeof CONFIG !== 'undefined') ? CONFIG : {
  TARGET_WEBSITE: "http://localhost:3000",
  AMRITA_PORTAL: {
    BASE_URL: "https://students.amrita.edu",
    ATTENDANCE_PATH: "/client/class-attendance"
  }
};

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAttendance") {
    handleGetAttendance(request.targetWebsite)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

async function handleGetAttendance(targetWebsite) {
  console.log("Getting attendance data...");
  
  try {
    // Get the current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    if (!tab.id || !tab.url) {
      throw new Error("Cannot access tab details. Please ensure a page is active and try again.");
    }

    const targetUrl = config.AMRITA_PORTAL.BASE_URL + config.AMRITA_PORTAL.ATTENDANCE_PATH;
    
    // Check if we need to navigate to the attendance page
    if (!tab.url.startsWith(targetUrl)) {
      await chrome.tabs.update(tab.id, { url: targetUrl });
      // Wait for navigation to complete
      await waitForTabLoad(tab.id, targetUrl);
    }

    // Extract attendance data from the page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractAttendanceDataFromPage
    });
    try {
      const usernameResponse = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractUsername
      });
      username = usernameResponse[0]?.result || "Unknown User";
    } catch (error) {
      console.error('Failed to extract username:', error);
      username = "Unknown User";
    }

    if (!results || !results[0] || !results[0].result) {
      throw new Error("Could not extract attendance data. No results from script.");
    }

    const result = results[0].result;
    
    if (result.error) {
      throw new Error(`Extraction Error: ${result.error}`);
    }
    
    if (result.warning) {
      console.warn(`Extraction Warning: ${result.warning}`);
    }

    const attendanceData = result.data || result;
    
    // Transfer data to target website if specified
    if (targetWebsite) {
      await transferDataToWebsite(tab.id, targetWebsite, JSON.stringify(attendanceData, null, 2), username);
    }
    
    return attendanceData;
  } catch (error) {
    console.error("Error in handleGetAttendance:", error);
    throw error;
  }
}

// Function to wait for tab to load a specific URL
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

// Function to extract attendance data (will be injected into the page)
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
  const userInfoElement = document.querySelector('.user-info');
  if (!userInfoElement) {
    return "Could not find user info element on the page.";
  }

  const userInfoText = userInfoElement.textContent.trim();
  // Extract name by removing icons and extra whitespace
  const nameMatch = userInfoText.match(/[A-Z][A-Z\s]+$/);
  if (!nameMatch) {
    return "Could not extract username from user info.";
  }

  return nameMatch[0].trim();
}

async function transferDataToWebsite(tabId, targetWebsite, attendanceData, username) {
  // Save the attendance data first
  await chrome.storage.local.set({ 'subjectsData': attendanceData, 'username': username });
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
      chrome.storage.local.get(['username'], function(result) {
        if (result.username) {
          localStorage.setItem('username', result.username);
          console.log('Username saved to localStorage');
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
  }, 1000);
}
