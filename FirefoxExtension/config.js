// Global configuration for the Amrita Attendance Fetcher extension

/**
 * Configuration object containing all extension settings
 */
const CONFIG = {
  // Target website where attendance data will be sent
//   TARGET_WEBSITE: "http://192.168.0.125:3000",
  // Alternative production URL (uncomment to use)
  TARGET_WEBSITE: "https://sad.nithitsuki.com",
  
  // Amrita University portal settings
  AMRITA_PORTAL: {
    BASE_URL: "https://students.amrita.edu",
    ATTENDANCE_PATH: "/client/class-attendance",
    TABLE_ID: "home_tab"
  },
  
  // UI Settings
  UI: {
    BUTTON_COLOR: "#AF0C3E",
    BUTTON_COLOR_HOVER: "#8b0a32",
    SUCCESS_COLOR: "#28a745",
    ERROR_COLOR: "#dc3545"
  },
  
  // Extension behavior settings
  BEHAVIOR: {
    BUTTON_RESET_DELAY: 2000, // 2 seconds
    ERROR_RESET_DELAY: 3000,  // 3 seconds
    HYDRATION_DELAY: 1000     // 1 second for Next.js hydration
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Make available globally for content scripts and popup
if (typeof window !== 'undefined') {
  window.EXTENSION_CONFIG = CONFIG;
}
