/**
 * Type definitions for website modification functionality
 * Contains interfaces and types used across the website modifier modules
 * 
 * @fileoverview This file centralizes all type definitions to ensure type safety
 * and consistency across the website modification system.
 */

/**
 * Interface representing the website's app settings structure
 * These settings are stored in localStorage and control various UI behaviors
 * 
 * @interface AppSettings
 * @property {boolean} [abbreviateNames] - Whether to abbreviate subject names in the UI
 * @property {boolean} [showAddSubjects] - Whether to show the "Add Subjects" button
 * @property {string} [titlePayload] - Custom HTML content for the page title/header
 */
export interface AppSettings {
  /** Controls whether subject names should be abbreviated in displays */
  abbreviateNames?: boolean;
  /** Controls visibility of the "Add Subjects" button */
  showAddSubjects?: boolean;
  /** Custom HTML content for the page title/header area */
  titlePayload?: string;
}

/**
 * Default values for app settings
 * These are used when no existing settings are found in localStorage
 */
export const DEFAULT_APP_SETTINGS: Required<AppSettings> = {
  abbreviateNames: true,
  showAddSubjects: true,
  titlePayload: ''
};

/**
 * Interface for attendance update response from the background script
 * 
 * @interface AttendanceUpdateResponse
 * @property {boolean} success - Whether the attendance update was successful
 * @property {string} [error] - Error message if the update failed
 * @property {any} [data] - Additional data from the update process
 */
export interface AttendanceUpdateResponse {
  /** Indicates if the attendance update operation was successful */
  success: boolean;
  /** Error message when success is false */
  error?: string;
  /** Additional data returned from the update process */
  data?: any;
}

/**
 * Interface for attendance update request to the background script
 * 
 * @interface AttendanceUpdateRequest
 * @property {string} action - The action type ("getAttendance")
 * @property {string} targetWebsite - The website URL where attendance should be updated
 */
export interface AttendanceUpdateRequest {
  /** The action to perform (always "getAttendance" for attendance updates) */
  action: "getAttendance";
  /** The target website URL where the attendance data should be sent */
  targetWebsite: string;
}

/**
 * Interface for custom events dispatched by the extension
 * 
 * @interface ExtensionEventDetail
 * @property {string} source - The source of the event ("extension")
 * @property {string} [message] - Optional message for the event
 * @property {string} [error] - Optional error message for error events
 */
export interface ExtensionEventDetail {
  /** Identifies the source of the event */
  source: string;
  /** Success or informational message */
  message?: string;
  /** Error message for failure events */
  error?: string;
}

/**
 * Enum for custom event types dispatched by the extension
 * These events can be listened to by the website for integration
 */
export enum ExtensionEvents {
  /** Fired when app settings are updated */
  APP_SETTINGS_UPDATED = 'appSettingsUpdated',
  /** Fired when attendance update succeeds */
  ATTENDANCE_UPDATE_SUCCESS = 'attendanceUpdateSuccess',
  /** Fired when attendance update fails */
  ATTENDANCE_UPDATE_ERROR = 'attendanceUpdateError'
}

/**
 * localStorage keys used by the extension
 * Centralizes all localStorage key names to prevent typos and ensure consistency
 */
export const STORAGE_KEYS = {
  /** Key for app settings in localStorage */
  APP_SETTINGS: 'appSettings',
  /** Key for username in localStorage */
  USERNAME: 'username',
  /** Key for subjects data in localStorage */
  SUBJECTS_DATA: 'subjectsData'
} as const;

/**
 * Type for localStorage keys to ensure type safety
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
