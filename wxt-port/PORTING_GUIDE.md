# Firefox Extension to WXT Port - Implementation Guide

This document outlines the steps to complete the port of your vanilla Firefox extension to WXT framework.

## 🏗️ Architecture Overview

The WXT port has been structured with the following components:

### Core Files
- **`wxt.config.ts`** - Main configuration with permissions and manifest settings
- **`utils/config.ts`** - Shared configuration constants
- **`utils/attendance-extractor.ts`** - Data extraction utilities
- **`utils/data-transfer.ts`** - Data transfer and storage utilities

### Entry Points
- **`entrypoints/background.ts`** - Background script (replaces worker.js)
- **`entrypoints/content.ts`** - Main content script router
- **`entrypoints/content/attendance-page.ts`** - Attendance page content script
- **`entrypoints/content/website-modifier.ts`** - Target website modifier
- **`entrypoints/popup/`** - Popup interface

## 🔧 Implementation Tasks

### 1. Complete Attendance Data Extraction (`utils/attendance-extractor.ts`)

```typescript
export function extractAttendanceData(): ExtractionResult {
  // TODO: Port logic from original content-script.js
  // - Find table with ID 'home_tab'
  // - Parse attendance rows
  // - Calculate totals including duty/medical leave
  // - Generate course abbreviations
  // - Return structured data
}
```

**Original Reference:** `FirefoxExtension/worker.js` lines 107-151

### 2. Complete Username Extraction (`utils/attendance-extractor.ts`)

```typescript
export function extractUsername(): string {
  // TODO: Port logic from original worker.js
  // - Find .user-info element
  // - Extract and clean username text
  // - Handle missing elements gracefully
}
```

**Original Reference:** `FirefoxExtension/worker.js` lines 153-166

### 3. Complete Data Transfer Logic (`utils/data-transfer.ts`)

```typescript
export async function transferDataToWebsite(...) {
  // TODO: Port logic from original worker.js
  // - Save data to extension storage
  // - Navigate to target website
  // - Wait for page load
  // - Inject data to localStorage
  // - Force page reload
}
```

**Original Reference:** `FirefoxExtension/worker.js` lines 168-225

### 4. Complete Background Script Functions (`entrypoints/background.ts`)

Replace all TODO comments with actual implementations:
- `getCurrentActiveTab()` - Get active tab
- `ensureOnAttendancePage()` - Navigate if needed
- `extractAttendanceFromPage()` - Execute extraction script
- `extractUsernameFromPage()` - Execute username extraction

### 5. Complete Content Scripts

#### Attendance Page (`entrypoints/content/attendance-page.ts`)
- `createAttendanceButton()` - Create styled button
- `handleAttendanceButtonClick()` - Handle button clicks
- `injectButtonIntoPage()` - Find and inject button

#### Website Modifier (`entrypoints/content/website-modifier.ts`)
- `removeAddButton()` - Remove existing button
- `showWelcomePayload()` - Create welcome interface
- `handleAttendanceUpdate()` - Handle username clicks
- `setupDynamicObserver()` - Watch for DOM changes

### 6. Fix API Compatibility

Replace browser API calls with appropriate cross-browser methods:
- `browser.runtime.sendMessage()` ✅
- `browser.tabs.query()` ✅
- `browser.scripting.executeScript()` ✅
- `browser.storage.local` (needs implementation)

## 🚀 Development Workflow

1. **Build the extension:**
   ```bash
   cd wxt-port
   npm run build
   ```

2. **Development mode:**
   ```bash
   npm run dev
   ```

3. **Test in browser:**
   - Load unpacked extension from `.output` directory
   - Test on https://students.amrita.edu/client/class-attendance
   - Test with target website (localhost:3000 or sad.nithitsuki.com)

## 🔄 Migration Checklist

- [ ] Port attendance extraction logic
- [ ] Port username extraction logic  
- [ ] Port data transfer functionality
- [ ] Complete background script handlers
- [ ] Complete content script button injection
- [ ] Complete website modification logic
- [ ] Test cross-browser compatibility
- [ ] Verify all permissions are correct
- [ ] Test data flow end-to-end

## 📝 Key Differences from Original

1. **File Structure:** WXT uses entry points instead of individual script files
2. **TypeScript:** Strong typing for better maintainability
3. **Module System:** ES modules with proper imports/exports
4. **Configuration:** Centralized config management
5. **Cross-browser:** Uses browser API for better compatibility

## 🎯 Next Steps

1. Start with `utils/attendance-extractor.ts` - port the core extraction logic
2. Move to `utils/data-transfer.ts` - implement data transfer
3. Complete the background script message handling
4. Test each component individually
5. Integration testing with full workflow

The abstracted structure provides a clean separation of concerns and makes the codebase more maintainable than the original vanilla implementation.
