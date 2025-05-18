// Define the server URL as a constant
const TargetWebsite = "https://sad.nithitsuki.com";
// const TargetWebsite = "http://localhost:3000";

// This function will be injected into the target page.
// It cannot use any variables or functions from the popup.js scope directly.
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

        const record = {
            Sl_No: columns[0].textContent.trim(),
            Course: columns[2].textContent.trim().replace(/\\n|\\r/g, ' ').trim(),
            faculty: columns[3].textContent.trim(),
            total: columns[4].textContent.trim(),
            present: columns[5].textContent.trim(),
            dutyLeave: columns[6].textContent.trim(),
            absent: columns[7].textContent.trim(),
            percentage: columns[8].textContent.trim(),
            medical: columns[9] ? columns[9].textContent.trim() : "" // Handle if medical column doesn't exist
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

document.getElementById("dump").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        if (!tab.id || !tab.url) {
            alert("Cannot access tab details. Please ensure a page is active and try again.");
            return;
        }

        const output = document.getElementById("output");
        const targetUrl = 'https://students.amrita.edu/client/class-attendance';

        const executeExtraction = (currentTabId) => {
            output.textContent = "Extracting attendance data from current page...";
            chrome.scripting.executeScript({
                target: { tabId: currentTabId },
                func: extractAttendanceDataFromPage // Use 'func' instead of 'function' for Firefox compatibility
            }, (injectionResults) => {
                if (chrome.runtime.lastError) {
                    console.error("Error injecting script:", chrome.runtime.lastError);
                    output.textContent += `\\nError injecting script: ${chrome.runtime.lastError.message}`;
                    return;
                }
                if (injectionResults && injectionResults[0] && injectionResults[0].result) {
                    const result = injectionResults[0].result;
                    if (result.error) {
                        output.textContent += `\\nExtraction Error: ${result.error}`;
                    } else if (result.warning) {
                        output.textContent += `\\nExtraction Warning: ${result.warning}`;
                        output.textContent += `\\nData: ${JSON.stringify(result.data, null, 2)}`;
                    }
                    else {
                        const AttendanceData = JSON.stringify(result, null, 2);
                        output.textContent += `\nAttendance data extracted successfully!`;
                        output.textContent += `\nData: ${AttendanceData}`;
                        // Send the attendance data to the target website
                        // Save the attendance data first
                        chrome.storage.local.set({ 'subjectsData': AttendanceData }, function() {
                            console.log('Attendance data saved temporarily');
                            
                            // Navigate to the target website in the same tab
                            chrome.tabs.update(tab.id, { url: TargetWebsite }, (updatedTab) => {
                                // Listen for the page to finish loading
                                chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                                    if (tabId === updatedTab.id && changeInfo.status === 'complete') {
                                        // Remove the listener once we've handled the event
                                        chrome.tabs.onUpdated.removeListener(listener);
                                        // Wait a moment for localStorage to be set, then force a hard reload
                                        setTimeout(() => {
                                            chrome.scripting.executeScript({
                                                target: { tabId: updatedTab.id },
                                                func: () => {
                                                    // Force a hard reload of the page to ensure it uses localStorage data
                                                    window.location.reload(true);
                                                }
                                            });
                                        }, 1000); // 1 second delay to ensure storage is set first
                                        // Execute script to save data in localStorage
                                        chrome.scripting.executeScript({
                                            target: { tabId: updatedTab.id },
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
                                    }
                                });
                            });
                        });
                    }
                } else {
                    output.textContent += `\\nCould not extract attendance data. No results from script.`;
                    if (injectionResults) console.log("Injection results:", injectionResults);
                }
            });
        };

        // Check if the tab is already on the target URL
        if (tab.url === targetUrl) {
            // Before executing, ensure the page is likely fully loaded, especially if it was just navigated to.
            // For simplicity here, if already on URL, assume it's ready.
            // A more robust solution might check document.readyState via a quick script injection first.
            if (tab.status === 'complete') {
                executeExtraction(tab.id);
            } else {
                // If not complete, listen for it to complete
                output.textContent = "Page is still loading. Waiting for completion...";
                const preloadedTabListener = (tabId, changeInfo) => {
                    if (tabId === tab.id && changeInfo.status === 'complete') {
                        chrome.tabs.onUpdated.removeListener(preloadedTabListener);
                        executeExtraction(tabId);
                    }
                };
                chrome.tabs.onUpdated.addListener(preloadedTabListener);
            }
        } else {
            // Navigate to the page and then extract
            output.textContent = "Navigating to attendance page...";
            const navigationListener = (tabId, changeInfo, updatedTab) => {
                // Ensure we're listening for the correct tab and it has finished loading the target URLz
                if (tabId === tab.id && changeInfo.status === 'complete' && updatedTab.url === targetUrl) {
                    chrome.tabs.onUpdated.removeListener(navigationListener); // Clean up listener
                    executeExtraction(tabId);
                }
            };
            chrome.tabs.onUpdated.addListener(navigationListener);
            chrome.tabs.update(tab.id, { url: targetUrl });
        }
    });
});
