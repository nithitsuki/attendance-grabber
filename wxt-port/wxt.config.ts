import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Amrita Attendance Fetcher",
    description: "Capture attendance data from Amrita University's student portal.",
    version: "3.5.0",
    permissions: [
      "tabs",
      "cookies", 
      "webNavigation",
      "scripting",
      "storage"
    ],
    host_permissions: [
      "https://students.amrita.edu/*",
      "https://sad.nithitsuki.com/*",
      "*://localhost/*",
      "http://127.0.0.1/*",
      "https://127.0.0.1/*",
      "http://*/*",
      "https://*/*"
    ],
    action: {
      default_title: "Amrita Attendance Fetcher"
    },
    icons: {
      16: "/icon/16.png",
      32: "/icon/32.png", 
      48: "/icon/48.png",
      128: "/icon/128.png"
    }
  }
});
