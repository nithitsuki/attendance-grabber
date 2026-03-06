/**
 * Website Modifier Module
 * Entry point for content script that modifies the target website.
 */

import { CONFIG } from '../../utils/config';
import * as logger from '../../utils/logger';
import { updateAppSettings, validateAndMigrateSubjectsData, getSchemaMigrationInfo, getExistingAppSettings } from './app-settings';
import { createWelcomeMessageHtml, setupUsernameButtonClickHandler, exposeDebugFunctions, getRawUsername, resolveUsername } from './user-utils';
import { exposeAttendanceUpdateFunction } from './attendance-handler';
import { triggerSettingsUpdate, setupWebsiteIntegrationListeners } from './event-dispatcher';

/**
 * Main initialization function for website modifications
 */
export function initializeWebsiteModifications(): void {
  // Wait for hydration delay to avoid framework conflicts
  setTimeout(async () => {
    try {
      validateAndMigrateSubjectsData();
      await updateWebsiteSettings();
      exposeAttendanceUpdateFunction();
      setupUsernameButtonClickHandler();
      setupWebsiteIntegrationListeners();
      exposeDebugFunctions();
    } catch (error) {
      logger.error('Error during website initialization:', error);
    }
  }, CONFIG.BEHAVIOR.HYDRATION_DELAY);
}

/**
 * Updates website settings via localStorage
 * Resolves username from Amrita portal if currently "Unknown User"
 */
async function updateWebsiteSettings(): Promise<void> {
  try {
    // Always try to resolve username if it's unknown
    const currentUsername = await resolveUsername();
    const customTitleHtml = createWelcomeMessageHtml(currentUsername);
    
    updateAppSettings({
      showAddSubjects: false,
      titlePayload: customTitleHtml
    });
    
    triggerSettingsUpdate();
  } catch (error) {
    logger.error('Error updating website settings:', error);
  }
}


