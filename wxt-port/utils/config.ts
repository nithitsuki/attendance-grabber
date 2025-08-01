/**
 * Global configuration for the Amrita Attendance Fetcher extension
 * This file contains all the configuration constants used across the extension
 */

export interface ExtensionConfig {
  TARGET_WEBSITE: string;
  AMRITA_PORTAL: {
    BASE_URL: string;
    ATTENDANCE_PATH: string;
    TABLE_ID: string;
  };
  UI: {
    BUTTON_COLOR: string;
    BUTTON_COLOR_HOVER: string;
    SUCCESS_COLOR: string;
    ERROR_COLOR: string;
  };
  BEHAVIOR: {
    PAGE_LOAD_TIMEOUT: number;
    BUTTON_RESET_DELAY: number;
    ERROR_RESET_DELAY: number;
    HYDRATION_DELAY: number;
  };
}

function getCurrentTermId(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed (0 = January, 5 = June, 11 = December)
  const day = now.getDate();
  const year = now.getFullYear();
  let currentTerm = 11; // Default term as of September 2025 (2025 oddsem)
  currentTerm += (year - 2025) * 2; // Increment by 2 for each year after 2024
  if(month > 5){currentTerm += 1;}
  return currentTerm;

}
export const CONFIG: ExtensionConfig = {
  // Target website where attendance data will be sent
  // Toggle between local development and production
  TARGET_WEBSITE: "https://sad.nithitsuki.com",
  // TARGET_WEBSITE: "http://localhost:3000", // Uncomment for local development

  // Amrita University portal settings
  AMRITA_PORTAL: {
    BASE_URL: "https://students.amrita.edu",
    ATTENDANCE_PATH: `/client/class-attendance?academic_term_id=${getCurrentTermId()}`,
    TABLE_ID: "home_tab"
  },


  // UI theme settings
  UI: {
    BUTTON_COLOR: "#AF0C3E",
    BUTTON_COLOR_HOVER: "#8b0a32",
    SUCCESS_COLOR: "#28a745",
    ERROR_COLOR: "#dc3545"
  },

  // Extension behavior timings
  BEHAVIOR: {
    PAGE_LOAD_TIMEOUT: 1000, // 1 seconds
    BUTTON_RESET_DELAY: 2000, // 2 seconds
    ERROR_RESET_DELAY: 3000,  // 3 seconds
    HYDRATION_DELAY: 400     // 500 milliseconds for Next.js hydration
  }
};
