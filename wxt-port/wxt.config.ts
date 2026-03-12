import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: (env) => {
    const hostPermissions = [
      "https://students.amrita.edu/*",
      "https://sad.nithitsuki.com/*",
    ];

    // Include localhost permissions only during development
    if (env.mode === 'development') {
      hostPermissions.push(
        "*://localhost/*",
        "http://127.0.0.1/*",
        "https://127.0.0.1/*",
      );
    }

    return {
      name: "Amrita Attendance Fetcher",
      description: "Capture attendance data from Amrita University's student portal.",
      version: "6.0",
      permissions: [
        "activeTab",
        "scripting",
        "storage"
      ],
      host_permissions: hostPermissions,
      action: {
        default_title: "Amrita Attendance Fetcher"
      },
      icons: {
        16: "/icon/16.png",
        32: "/icon/32.png",
        48: "/icon/48.png",
        128: "/icon/128.png"
      },
      browser_specific_settings: {
        gecko: {
          id: "sad@nithitsuki.com",
          data_collection_permissions: {
            required: ["none"]
          }
        }
      }
    };
  }
});
