# Changelog

All notable changes to the Amrita Attendance Fetcher extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.0] - 2026-03-06

### Added
- **Schema v3 Upgrade**: Attendance records now include additional fields:
  - `courseCode`: Course code extracted from attendance table (e.g., "23MAT216")
  - `faculty`: Array of faculty names teaching each course
- **Debug Logging System**: 
  - Disabled by default to keep user console clean
  - Can be enabled via "Enable debug logging" toggle in God Mode
  - All content script logs are now conditional
  - Logger automatically syncs state when toggled in popup

### Changed
- Migration system now handles v1→v2→v3 schema upgrades incrementally
- God Mode settings labels shortened for compactness
- Debug output styled with black background and gold text in God Mode
- All content script console calls replaced with conditional logger

### Technical
- Created new `utils/logger.ts` module for centralized logging
- Logger initialized at content script startup
- Uses `browser.storage.local` for debug preference persistence
- Logger listens to storage changes for live toggle updates

## [5.0] - 2024-XX-XX

Previous version before changelog introduction.

