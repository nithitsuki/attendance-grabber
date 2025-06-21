/**
 * Popup script for Amrita Attendance Fetcher
 * Handles user interactions in the extension popup
 */

import { CONFIG } from '../../utils/config.js';
import { extractAttendanceData, extractUsername } from '../../utils/attendance-extractor.js';
import { transferDataToWebsite } from '../../utils/data-transfer';

// Handle navigation to Amrita student portal
document.addEventListener('DOMContentLoaded', function () {
  const dumpButton = document.getElementById('dump');
  const output = document.getElementById('output');
  const portalUrl = String(CONFIG.AMRITA_PORTAL.BASE_URL + CONFIG.AMRITA_PORTAL.ATTENDANCE_PATH);

  // Attendance extraction button handler
  if (dumpButton) {
    dumpButton.addEventListener('click', async function () {
      try {
        // Get the active tab
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        // Check if current tab is on the portal URL
        if (tab.url && tab.url.includes(portalUrl)) {
          // Execute the extraction function in the context of the active tab
          const [result] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractAttendanceData
          });
          let [username] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractUsername
          });
          username = username.result || { error: 'Unknown' };
          updateOutput("clear");
          updateOutput("username: " + JSON.stringify(username, null, 2) + "\n");
          updateOutput("subjectsData: " + JSON.stringify(result.result.data, null, 2));

          transferDataToWebsite(tab.id, CONFIG.TARGET_WEBSITE, JSON.stringify(result.result.data, null, 2), username);

        } else {
          // Navigate to the portal URL
          await browser.tabs.update(tab.id, { url: portalUrl });
          
          // Wait for the tab to actually load
          await new Promise((resolve) => {
        const checkLoaded = () => {
          browser.tabs.get(tab.id).then((updatedTab) => {
            if (updatedTab.status === 'complete') {
          resolve();
            } else {
          setTimeout(checkLoaded, 100);
            }
          });
        };
        checkLoaded();
          });

          // Get updated tab info after navigation
          let [updatedTab] = await browser.tabs.query({ active: true, currentWindow: true });

          // Check if we're at the login page
          if (!updatedTab.url.includes(portalUrl)) {
        // Click the submit button
        await browser.scripting.executeScript({
          target: { tabId: updatedTab.id },
          func: () => {
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
          submitBtn.click();
            }
          }
        });
        updateOutput('Login Page Detected, Clicking Submit...');
          }

          updateOutput('clear');
          updateOutput('Please complete the login process and navigate to the attendance page.');
          
          // Wait for user to reach the portal URL
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
        const finalTab = await waitForPortalUrl();
        const [result] = await browser.scripting.executeScript({
          target: { tabId: finalTab.id },
          func: extractAttendanceData
        });
        let [username] = await browser.scripting.executeScript({
          target: { tabId: finalTab.id },
          func: extractUsername
        });
        username = username.result || { error: 'Unknown' };
        updateOutput("clear");
        updateOutput("username: " + JSON.stringify(username, null, 2) + "\n");
        updateOutput("subjectsData: " + JSON.stringify(result.result.data, null, 2));

        transferDataToWebsite(finalTab.id, CONFIG.TARGET_WEBSITE, JSON.stringify(result.result.data, null, 2), username);

          } catch (error) {
        updateOutput('Error extracting attendance: ' + error.message);
          }
        }
      } catch (error) {
        updateOutput('Error: ' + error.message);
      }
    });
  }

  /**
   * Updates the output display in the popup
   * @param {string} text Text to display
   */
  function updateOutput(text) {
    if (output) {
      text === "clear" ? output.textContent = '' : output.textContent += String(text);
    }
  }
});