console.log("Content script loaded for attendance page.");

function addButton() {
  // Check if button already exists
  if (document.getElementById('dumpy')) {
    return;
  }

  const button = document.createElement('button');
  button.textContent = 'Go to Dashboard!';
  button.id = 'dumpy';
  
  // Style the button to match your extension's theme
  button.style.cssText = `
    z-index: 9999;
    background-color: #AF0C3E;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0px 12px;
    height: 2.7rem;
    font-size: 1rem;
    margin-left: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#8b0a32';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#AF0C3E';
  });

  button.addEventListener('click', async () => {
    button.textContent = 'Getting Attendance...';
    button.disabled = true;

    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({ 
        action: "getAttendance",
        targetWebsite: window.EXTENSION_CONFIG?.TARGET_WEBSITE || "http://localhost:3000"
      });
      
      if (response.success) {
        // Show success feedback
        button.textContent = 'Attendance Retrieved!';
        button.style.backgroundColor = '#28a745';
        
        // Reset button after 2 seconds
        setTimeout(() => {
          button.textContent = 'Get Attendance';
          button.style.backgroundColor = '#AF0C3E';
          button.disabled = false;
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to get attendance');
      }
    } catch (error) {
      console.error('Error getting attendance:', error);
      button.textContent = 'Error - Try Again';
      button.style.backgroundColor = '#dc3545';
      
      // Reset button after 3 seconds
      setTimeout(() => {
        button.textContent = 'Get Attendance';
        button.style.backgroundColor = '#AF0C3E';
        button.disabled = false;
      }, 3000);
    }
  });

  place = document.querySelector('#home_view form > div');
  if (!place) {
    console.warn("Could not find the target element to append the button.");
    return;
  }else{
    place.appendChild(button);
  }
  console.log("Attendance button added to the page.");
}

// Ensure the DOM is fully loaded before trying to add the button
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addButton);
} else {
  addButton();
}
