/**
 * App Settings Management Module
 * 
 * This module handles all operations related to the website's app settings,
 * including reading from and writing to localStorage, and managing default values.
 * 
 * @fileoverview Centralized management of app settings that control website behavior.
 * The settings are stored in localStorage and are used to customize the user interface.
 */

import { AppSettings, DEFAULT_APP_SETTINGS, STORAGE_KEYS } from './types';
import { ATTENDANCE_SCHEMA_VERSION, needsSchemaUpgrade, migrateAttendanceData, validateAttendanceData } from '../../utils/attendance-extractor';
import * as logger from '../../utils/logger';

/**
 * Retrieves existing app settings from localStorage
 * 
 * This function safely reads and parses app settings from localStorage.
 * If no settings exist or parsing fails, it returns sensible default values.
 * 
 * @returns {AppSettings} The current app settings or defaults if none exist
 * 
 * @example
 * ```typescript
 * const settings = getExistingAppSettings();
 * if (settings.showAddSubjects) {
 *   // Show the add subjects button
 * }
 * ```
 */
export function getExistingAppSettings(): AppSettings {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings) as AppSettings;
      
      // Validate that parsed settings have expected structure
      if (typeof parsedSettings === 'object' && parsedSettings !== null) {
        return parsedSettings;
      }
    }
  } catch (error) {
    logger.warn('Error parsing existing app settings from localStorage:', error);
  }

  // Return default settings if none exist or parsing fails
  logger.log('Using default app settings');
  return { ...DEFAULT_APP_SETTINGS };
}

/**
 * Saves app settings to localStorage
 * 
 * This function safely serializes and stores app settings in localStorage.
 * It includes error handling to gracefully handle storage failures.
 * 
 * @param {AppSettings} settings - The settings object to save
 * @returns {boolean} True if save was successful, false otherwise
 * 
 * @example
 * ```typescript
 * const newSettings = {
 *   showAddSubjects: false,
 *   titlePayload: "Custom Title"
 * };
 * 
 * if (saveAppSettings(newSettings)) {
 *   console.log('Settings saved successfully');
 * }
 * ```
 */
export function saveAppSettings(settings: AppSettings): boolean {
  try {
    const serializedSettings = JSON.stringify(settings);
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, serializedSettings);
    
    logger.log('App settings saved to localStorage:', settings);
    return true;
  } catch (error) {
    logger.error('Error saving app settings to localStorage:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      logger.error('localStorage quota exceeded. Consider clearing old data.');
    }
    
    return false;
  }
}

/**
 * Updates specific app setting values
 * 
 * This function merges new settings with existing ones, preserving
 * values that aren't being updated.
 * 
 * @param {Partial<AppSettings>} updates - The setting updates to apply
 * @returns {AppSettings} The resulting merged settings
 * 
 * @example
 * ```typescript
 * // Only update the title, keep other settings unchanged
 * const updatedSettings = updateAppSettings({
 *   titlePayload: "New Welcome Message"
 * });
 * ```
 */
export function updateAppSettings(updates: Partial<AppSettings>): AppSettings {
  const existingSettings = getExistingAppSettings();
  const mergedSettings = { ...existingSettings, ...updates };
  
  const saveSuccess = saveAppSettings(mergedSettings);
  if (!saveSuccess) {
    logger.warn('Failed to save updated settings, returning merged settings anyway');
  }
  
  return mergedSettings;
}

/**
 * Resets app settings to their default values
 * 
 * This function clears any custom settings and restores the defaults.
 * Useful for troubleshooting or user preference resets.
 * 
 * @returns {AppSettings} The default settings that were applied
 * 
 * @example
 * ```typescript
 * const defaultSettings = resetAppSettings();
 * console.log('Settings reset to defaults:', defaultSettings);
 * ```
 */
export function resetAppSettings(): AppSettings {
  const defaultSettings = { ...DEFAULT_APP_SETTINGS };
  saveAppSettings(defaultSettings);
  
  logger.log('App settings reset to defaults');
  return defaultSettings;
}

/**
 * Validates app settings structure
 * 
 * This function checks if a given object has the correct structure
 * for app settings, useful for validating data before saving.
 * 
 * @param {any} settings - The object to validate
 * @returns {boolean} True if the object is a valid AppSettings structure
 * 
 * @example
 * ```typescript
 * const userInput = JSON.parse(someJsonString);
 * if (validateAppSettings(userInput)) {
 *   saveAppSettings(userInput);
 * }
 * ```
 */
export function validateAppSettings(settings: any): settings is AppSettings {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }

  // Check that optional properties have correct types when present
  if (settings.abbreviateNames !== undefined && typeof settings.abbreviateNames !== 'boolean') {
    return false;
  }
  
  if (settings.showAddSubjects !== undefined && typeof settings.showAddSubjects !== 'boolean') {
    return false;
  }
  
  if (settings.titlePayload !== undefined && typeof settings.titlePayload !== 'string') {
    return false;
  }

  return true;
}

/**
 * Validates and migrates subjects data in localStorage
 * 
 * This function checks if the subjects data stored in localStorage needs schema migration
 * and performs the migration or cleanup as needed.
 * 
 * @returns {boolean} True if data is valid or successfully migrated, false if cleanup was needed
 * 
 * @example
 * ```typescript
 * const dataValid = validateAndMigrateSubjectsData();
 * if (!dataValid) {
 *   console.log('Old subjects data was cleared due to schema changes');
 * }
 * ```
 */
export function validateAndMigrateSubjectsData(): boolean {
  try {
    const subjectsDataString = localStorage.getItem(STORAGE_KEYS.SUBJECTS_DATA);
    
    if (!subjectsDataString) {
      // No existing data, nothing to migrate
      return true;
    }

    const subjectsData = JSON.parse(subjectsDataString);
    
    // Check if current data is already valid for current schema
    if (validateAttendanceData(subjectsData)) {
      logger.log('✅ Subjects data is valid for current schema version');
      return true;
    }

    // Check if data needs schema upgrade
    if (needsSchemaUpgrade(subjectsData)) {
      logger.log('Migrating subjects data to new schema version...');
      
      const migratedData = migrateAttendanceData(subjectsData);
      
      if (migratedData && validateAttendanceData(migratedData)) {
        // Save migrated data
        localStorage.setItem(STORAGE_KEYS.SUBJECTS_DATA, JSON.stringify(migratedData));
        
        // Log migration success
        logger.log(`✅ Successfully migrated subjects data to schema v${ATTENDANCE_SCHEMA_VERSION}`);
        
        // Store migration info
        localStorage.setItem('schemaMigration', JSON.stringify({
          from: 1, // Assume v1 if no version info
          to: ATTENDANCE_SCHEMA_VERSION,
          timestamp: Date.now(),
          recordCount: migratedData.length
        }));
        
        return true;
      }
    }

    // If we reach here, data is incompatible and needs to be cleared
    logger.warn('⚠️ Subjects data is incompatible with current schema. Clearing old data.');
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS_DATA);
    
    // Store cleanup info
    localStorage.setItem('schemaCleanup', JSON.stringify({
      reason: 'incompatible_schema',
      timestamp: Date.now(),
      clearedVersion: 'unknown'
    }));
    
    return false;
    
  } catch (error) {
    logger.error('❌ Error validating/migrating subjects data:', error);
    
    // Clear potentially corrupted data
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS_DATA);
    return false;
  }
}

/**
 * Gets schema migration status information
 * 
 * This function checks if a recent schema migration or cleanup occurred
 * and returns information about it for user notification purposes.
 * 
 * @returns {Object|null} Migration info object or null if no recent migration
 */
export function getSchemaMigrationInfo(): { type: 'migration' | 'cleanup', details: any } | null {
  try {
    // Check for migration info
    const migrationString = localStorage.getItem('schemaMigration');
    if (migrationString) {
      const migrationInfo = JSON.parse(migrationString);
      
      // Only return if migration happened recently (within 24 hours)
      if (Date.now() - migrationInfo.timestamp < 24 * 60 * 60 * 1000) {
        return {
          type: 'migration',
          details: migrationInfo
        };
      }
    }

    // Check for cleanup info
    const cleanupString = localStorage.getItem('schemaCleanup');
    if (cleanupString) {
      const cleanupInfo = JSON.parse(cleanupString);
      
      // Only return if cleanup happened recently (within 24 hours)
      if (Date.now() - cleanupInfo.timestamp < 24 * 60 * 60 * 1000) {
        return {
          type: 'cleanup',
          details: cleanupInfo
        };
      }
    }

    return null;
  } catch (error) {
    logger.error('Error getting schema migration info:', error);
    return null;
  }
}
