let windowId = null;

console.log("Extension service worker started");

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

    const targetUrl = 'https://students.amrita.edu/client/class-attendance';
    
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
      await transferDataToWebsite(tab.id, targetWebsite, JSON.stringify(attendanceData, null, 2));
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
  }, 1000);
}

async function openLoginPopup() {
  console.log("openLoginPopup called");

  try {
    const win = await chrome.windows.create({
      url: 'https://students.amrita.edu',
      type: 'popup',
      width: 400,
      height: 600
    });

    windowId = win.id;
    const tabId = win.tabs?.[0]?.id;

    if (!tabId) {
      throw new Error("No tab created in popup window");
    }

    const navListener = async (details) => {
      if (details.tabId === tabId && 
          details.url.startsWith('https://my.amrita.edu/index/index')) {
        
        chrome.webNavigation.onCompleted.removeListener(navListener);

        try {
          const cookie = await chrome.cookies.get({
            url: 'https://students.amrita.edu',
            name: 'PHPSESSID'
          });

          if (cookie) {
            console.log("Got PHPSESSID:", cookie.value);
            setTimeout(() => {
              if (windowId) {
                chrome.windows.remove(windowId);
                windowId = null;
              }
            }, 2000);
          } else {
            console.warn("PHPSESSID not found");
          }
        } catch (error) {
          console.error("Error getting cookie:", error);
        }
      }
    };

    chrome.webNavigation.onCompleted.addListener(navListener, {
      url: [{urlPrefix: 'https://my.amrita.edu/index/index'}]
    });

  } catch (error) {
    console.error("Error creating window:", error);
  }
}