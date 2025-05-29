// Simple script to remove the add-button when extension is installed
// Delays removal to avoid Next.js hydration issues
// Define the server URL from global config
const TargetWebsite = window.EXTENSION_CONFIG?.TARGET_WEBSITE || "http://localhost:3000";


function removeAddButton() {
  const addButton = document.getElementById('add-button');
  if (addButton) {
    addButton.remove();
  }
}

function showPayload() {
  const payload = document.getElementById('main_content');
if (payload) {
    // Apply styles using style properties instead of cssText
    Object.assign(payload.style, {
        display: 'flex',
        gap: '0rem',
        alignItems: 'center',
        justifyContent: 'center'
    });

    // Get and format username
    const username = localStorage.getItem('username') || 'default user';
    const formattedUsername = username.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );

    // Create welcome message with styled username
    payload.innerHTML = `
        <span style="text-align: center;">
            Welcome <button id="username" style="color: rgb(234, 22, 85); cursor: pointer">${formattedUsername}</button>!<br>
            Click on your name to update your attendance.
        </span>
    `;

    const handleAttendanceUpdate = async () => {
        try {
            // Send message to background script to handle attendance extraction
            const response = await chrome.runtime.sendMessage({ 
                action: "getAttendance",
                targetWebsite: TargetWebsite
            });
        } catch (error) {
            console.error("Error processing attendance data:", error);
        }
    };

    const usernameElement = document.getElementById("username");
    if (usernameElement) {
        usernameElement.addEventListener('click', handleAttendanceUpdate);
    }
}
}

function waitForHydrationAndRemove() {
  setTimeout(() => {
    removeAddButton();
    showPayload();
    // Also set up a brief observer in case the button is re-rendered
    const observer = new MutationObserver(() => {
      removeAddButton();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Stop observing after 2 seconds
    setTimeout(() => observer.disconnect(), 2000);
  }, 500);
}

// Wait for DOM and then delay removal
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForHydrationAndRemove);
} else {
  waitForHydrationAndRemove();
  
}
