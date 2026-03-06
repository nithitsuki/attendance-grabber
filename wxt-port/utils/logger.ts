/**
 * Debug Logger Utility
 * 
 * Provides conditional logging that is disabled by default.
 * Can be enabled via the "Debug Logging" toggle in God Mode (popup).
 * 
 * Logs only go to the browser console when explicitly enabled,
 * keeping the user's console clean during normal usage.
 */

import { browser } from 'wxt/browser';

let _enabled = false;
let _initialized = false;

/**
 * Initializes the logger by loading the debug preference from extension storage.
 * Should be called once at content script startup.
 */
export async function initLogger(): Promise<void> {
  try {
    const result = await browser.storage.local.get(['debugLogging']);
    _enabled = result.debugLogging === true;
    _initialized = true;
  } catch {
    _enabled = false;
    _initialized = true;
  }

  // Listen for changes so toggling in the popup takes effect immediately
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.debugLogging != null) {
      _enabled = changes.debugLogging.newValue === true;
    }
  });
}

/**
 * Conditional console.log – only prints when debug logging is enabled.
 */
export function log(...args: any[]): void {
  if (_enabled) console.log(...args);
}

/**
 * Conditional console.warn – only prints when debug logging is enabled.
 */
export function warn(...args: any[]): void {
  if (_enabled) console.warn(...args);
}

/**
 * Conditional console.error – only prints when debug logging is enabled.
 */
export function error(...args: any[]): void {
  if (_enabled) console.error(...args);
}

/** Check whether the logger has been initialised. */
export function isInitialized(): boolean {
  return _initialized;
}
