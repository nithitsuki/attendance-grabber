/**
 * Website Modifier Main Module
 * 
 * This is the main orchestrator module that coordinates all website modification functionality.
 * It serves as the entry point for the content script and delegates specific tasks to
 * specialized modules for better maintainability and organization.
 * 
 * @fileoverview Main entry point for website modifications. This module initializes
 * all the website modification functionality by coordinating between specialized modules.
 */

import { CONFIG } from '../../utils/config';
import { updateAppSettings, validateAndMigrateSubjectsData, getSchemaMigrationInfo } from './app-settings';
import { createWelcomeMessageHtml, setupUsernameButtonClickHandler } from './user-utils';
import { exposeAttendanceUpdateFunction } from './attendance-handler';
import { triggerSettingsUpdate, setupWebsiteIntegrationListeners } from './event-dispatcher';

/**
 * Main initialization function for website modifications
 * 
 * This function serves as the primary entry point for all website modifications.
 * It coordinates the initialization of various subsystems and ensures they work
 * together properly to provide the complete extension functionality.
 * 
 * The function waits for the configured hydration delay to avoid conflicts
 * with Next.js or other framework hydration processes.
 * 
 * @example
 * ```typescript
 * // Called from the content script
 * initializeWebsiteModifications();
 * ```
 */
export function initializeWebsiteModifications(): void {
  console.log('🚀 Website modifier content script loaded and initializing...');

  // Wait for hydration delay to avoid Next.js conflicts
  setTimeout(() => {
    console.log('⚙️ Starting website modification process...');
    
    try {
      // Step 1: Validate and migrate subjects data schema
      const schemaValid = validateAndMigrateSubjectsData();
      
      // Check for migration/cleanup notifications
      const migrationInfo = getSchemaMigrationInfo();
      if (migrationInfo) {
        if (migrationInfo.type === 'migration') {
          console.log('📋 Schema migrated:', migrationInfo.details);
        } else if (migrationInfo.type === 'cleanup') {
          console.log('🗑️ Old data cleaned up:', migrationInfo.details);
        }
      }
      
      // Step 2: Update website settings via localStorage
      updateWebsiteSettings();
      
      // Step 3: Set up attendance update functionality
      exposeAttendanceUpdateFunction();
      
      // Step 4: Set up username button click handler
      setupUsernameButtonClickHandler();
      
      // Step 5: Set up two-way communication with the website
      setupWebsiteIntegrationListeners();
      
      console.log('✅ Website modification initialization completed successfully');
      
    } catch (error) {
      console.error('❌ Error during website modification initialization:', error);
    }
    
  }, CONFIG.BEHAVIOR.HYDRATION_DELAY);
}

/**
 * Updates the website settings via localStorage
 * 
 * This function is responsible for updating the website's configuration
 * through its localStorage-based settings system. It creates a personalized
 * experience by setting custom titles and controlling UI elements.
 * 
 * @private
 */
function updateWebsiteSettings(): void {
  console.log('📝 Updating website settings via localStorage...');

  try {
    // Generate personalized welcome message HTML
    const customTitleHtml = createWelcomeMessageHtml();
    
    // Update app settings with extension-specific values
    const updatedSettings = updateAppSettings({
      showAddSubjects: false,     // Hide the "Add Subjects" button
      titlePayload: customTitleHtml // Set custom welcome message
    });
    
    console.log('📄 Website settings updated successfully:', updatedSettings);
    
    // Notify the website that settings have been updated
    triggerSettingsUpdate();
    
  } catch (error) {
    console.error('❌ Error updating website settings:', error);
  }
}


