# Privacy Policy — Amrita Attendance Fetcher

**Last updated: March 12, 2026**
**Extension version: 6.0**

---

## 1. Overview

Amrita Attendance Fetcher is a browser extension that reads attendance data from the Amrita University student portal (`students.amrita.edu`) and transfers it to the companion dashboard at `sad.nithitsuki.com`. This policy explains exactly what data is accessed, how it is stored, where it goes, and what is never collected.

---

## 2. Data Accessed

When you trigger the attendance fetch, the extension reads the following information directly from the Amrita portal page inside your browser:

| Data | Source | Purpose |
|---|---|---|
| **Username** | `.user-info` element or the "Welcome! NAME" heading on the portal | Personalise the dashboard greeting |
| **Course code** | Attendance table (`home_tab`) | Identify each subject |
| **Course name** | Attendance table | Display subject name |
| **Faculty name(s)** | Attendance table | Display teaching staff |
| **Attendance counts** — total, present, absent, duty leave, medical leave | Attendance table | Calculate and display attendance statistics |
| **Attendance percentage** | Attendance table | Display and threshold comparisons |

No other page content, form data, cookies, passwords, or personal identifiers are read.

---

## 3. How Data Is Stored

### 3.1 Extension Storage (`browser.storage.local`)

The extension temporarily writes `subjectsData` (serialised JSON of attendance records) and `username` to the browser's built-in extension storage. This is used only as an intermediate buffer during the data-transfer flow and is not persisted beyond the transfer operation.

### 3.2 Dashboard `localStorage` (`sad.nithitsuki.com`)

After navigating to the dashboard, the extension injects the following keys into the page's `localStorage`:

| Key | Contents |
|---|---|
| `subjectsData` | JSON array of `AttendanceRecord` objects |
| `username` | First name extracted from the portal |
| `appSettings` | UI preferences (`showAddSubjects`, `titlePayload`, `abbreviateNames`) |
| `schemaMigration` | Schema version migration metadata (version numbers and timestamp) |

`localStorage` is scoped entirely to `sad.nithitsuki.com` in your browser. The dashboard ([github.com/nithitsuki/sad.nithitsuki.com](https://github.com/nithitsuki/sad.nithitsuki.com)) is developed by the same author as this extension, reads data only from `localStorage` for display purposes, and does not transmit it anywhere.

---

## 4. Data Transmission

- Attendance data is **not sent to any remote server** by the extension itself via network requests.
- The transfer mechanism is: the extension saves data to browser storage, navigates your tab to `https://sad.nithitsuki.com/dashboard`, then injects the data into that page's `localStorage` using the browser scripting API.
- The background script makes **one fetch request** to `https://students.amrita.edu/client/index` (using your existing browser session/cookies) solely to extract your username. No data is uploaded in this request.
- No analytics services, crash reporters, or telemetry endpoints are contacted by the extension.

---

## 5. Permissions Explained

| Permission | Why it is needed |
|---|---|
| `activeTab` | Read the URL and content of the currently active tab to detect the attendance page |
| `scripting` | Run the attendance-extraction and localStorage-injection functions inside the portal and dashboard pages |
| `storage` | Temporarily buffer attendance data in `browser.storage.local` during transfer |
| Host permission: `https://students.amrita.edu/*` | Access the Amrita portal to extract attendance |
| Host permission: `https://sad.nithitsuki.com/*` | Inject attendance data into the dashboard's localStorage |

The extension does **not** request broad host permissions (no `<all_urls>` or `http://*/*`).

---

## 6. Data Retention

- **`browser.storage.local`**: Data written during a transfer is overwritten on the next transfer. No intentional long-term retention occurs in extension storage.
- **`localStorage` on `sad.nithitsuki.com`**: Data persists in your browser's localStorage until you clear it manually, clear site data for that origin, or uninstall the browser profile. The dashboard merges new records with existing ones rather than replacing them.

---

## 7. Data Sharing

Attendance data and your username are **not shared with any third party**. The only destination is the `sad.nithitsuki.com` dashboard, which is developed and operated by the same author as this extension. That site collects no personal information, stores nothing server-side, and is hosted on Vercel.

---

## 8. Data That Is Never Collected

- Passwords or login credentials
- Student roll numbers or registration numbers (these are not extracted from the page)
- Grades or academic marks
- Personal contact information (email, phone number, address)
- Device identifiers, IP addresses, or browser fingerprints
- Browsing history outside of `students.amrita.edu`

---

## 9. Companion Dashboard (`sad.nithitsuki.com`)

The companion dashboard is a fully open-source project ([github.com/nithitsuki/sad.nithitsuki.com](https://github.com/nithitsuki/sad.nithitsuki.com)) built and maintained by the same developer as this extension. It:

- Reads attendance data solely from the browser's own `localStorage` for rendering
- Does **not** collect, upload, or store any personal information on any server
- Is hosted on **Vercel** (static/serverless deployment with no custom backend database)

Vercel's own infrastructure privacy policy applies to the hosting layer: [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy).

---

## 10. Children's Privacy

This extension is intended for use by university students (adults). It does not knowingly collect data from minors.

---

## 11. Changes to This Policy

If this policy is updated, the "Last updated" date at the top will change. Significant changes will be noted in the [CHANGELOG](CHANGELOG.md).

---

## 12. Contact

For questions about this privacy policy or the extension's data handling, open an issue at [github.com/nithitsuki/attendance-grabber](https://github.com/nithitsuki/attendance-grabber).
