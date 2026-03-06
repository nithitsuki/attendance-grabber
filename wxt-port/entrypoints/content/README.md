# Website Modifier Module Structure

This directory contains the modular website modification system for the Attendance Grabber extension. The original monolithic `website-modifier.ts` file has been split into specialized, well-documented modules for better maintainability.

## Module Structure

### `types.ts`
**Core type definitions and interfaces**
- `AppSettings` interface for website settings
- `AttendanceUpdateRequest` and `AttendanceUpdateResponse` interfaces
- `ExtensionEventDetail` interface for custom events
- `ExtensionEvents` enum for event type constants
- `STORAGE_KEYS` constants for localStorage keys

### ⚙️ `app-settings.ts`
**App settings management**
- `getExistingAppSettings()` - Retrieve settings from localStorage
- `saveAppSettings()` - Save settings to localStorage
- `updateAppSettings()` - Merge and update specific settings
- `resetAppSettings()` - Reset to default values
- `validateAppSettings()` - Validate settings structure

### `user-utils.ts`
**User-related utilities**
- `getRawUsername()` - Get username from localStorage
- `formatUsername()` - Format username with proper capitalization
- `getFormattedUsername()` - Get formatted username (most commonly used)
- `saveUsername()` - Save username to localStorage
- `createWelcomeMessageHtml()` - Generate personalized welcome HTML
- `validateUsername()` - Validate username format
- `getUserInitials()` - Extract user initials for display

### `attendance-handler.ts`
**Attendance update functionality**
- `handleAttendanceUpdate()` - Main attendance update function
- `exposeAttendanceUpdateFunction()` - Make functions globally available
- `isAttendanceUpdateInProgress()` - Check update status
- `handleAttendanceUpdateWithProgress()` - Enhanced version with progress tracking
- `validateAttendanceUpdateRequest()` - Validate update requests
- `createCustomAttendanceUpdateTrigger()` - Create custom triggers

### `event-dispatcher.ts`
**Event handling and React integration**
- `dispatchExtensionEvent()` - Dispatch custom events
- `dispatchAppSettingsUpdateEvent()` - Settings update events
- `triggerReactStateUpdate()` - Trigger React component re-renders
- `triggerSettingsUpdate()` - Comprehensive settings update
- `isReactDetected()` - Detect React presence on page
- `setupWebsiteIntegrationListeners()` - Two-way communication setup
- `dispatchAttendanceUpdateSuccess/Error()` - Convenience functions

### `website-modifier.ts`
**Main orchestrator (simplified)**
- `initializeWebsiteModifications()` - Main entry point
- `updateWebsiteSettings()` - Private settings update coordinator

## Usage

### Basic Initialization
```typescript
import { initializeWebsiteModifications } from './website-modifier';

// Initialize all website modifications
initializeWebsiteModifications();
```

### Working with Settings
```typescript
import { updateAppSettings, getExistingAppSettings } from './app-settings';

// Update specific settings
const newSettings = updateAppSettings({
  showAddSubjects: false,
  titlePayload: "Custom Title"
});

// Get current settings
const currentSettings = getExistingAppSettings();
```

### User Operations
```typescript
import { getFormattedUsername, createWelcomeMessageHtml } from './user-utils';

// Get formatted username for display
const displayName = getFormattedUsername();

// Create welcome message HTML
const welcomeHtml = createWelcomeMessageHtml();
```

### Attendance Updates
```typescript
import { handleAttendanceUpdate, exposeAttendanceUpdateFunction } from './attendance-handler';

// Make attendance update available to website
exposeAttendanceUpdateFunction();

// Manually trigger attendance update
await handleAttendanceUpdate();
```

### Event Management
```typescript
import { triggerSettingsUpdate, setupWebsiteIntegrationListeners } from './event-dispatcher';

// Set up two-way communication
setupWebsiteIntegrationListeners();

// Trigger comprehensive settings update
triggerSettingsUpdate();
```

## Benefits of Modular Structure

1. **Better Maintainability**: Each module has a single responsibility
2. **Improved Documentation**: Each function is thoroughly documented
3. **Easier Testing**: Modules can be tested in isolation
4. **Reusability**: Functions can be reused across different contexts
5. **Better Type Safety**: Centralized type definitions prevent inconsistencies
6. **Easier Debugging**: Issues can be traced to specific modules
7. **Team Development**: Different team members can work on different modules

## File Size Comparison

- **Before**: 1 large file (~200+ lines)
- **After**: 6 focused modules (~50-80 lines each)
- **Total Documentation**: ~400+ lines of comments and JSDoc

## Integration with Website

The modular system maintains the same external interface:
- Settings are still stored in `localStorage.appSettings`
- Global function `window.extensionHandleAttendanceUpdate()` is still available
- All events (`appSettingsUpdated`, `attendanceUpdateSuccess`, etc.) are still dispatched
- React integration still works through storage events

The website integration remains unchanged while the internal structure is much cleaner and more maintainable.
