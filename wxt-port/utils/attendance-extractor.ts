/**
 * Utility functions for extracting and processing attendance data
 * These functions handle the core logic of parsing attendance tables and user information
 */

/**
 * Current schema version for attendance records
 * Increment this when making breaking changes to the AttendanceRecord structure
 */
export const ATTENDANCE_SCHEMA_VERSION = 3;

export interface AttendanceRecord {
    Sl_No: string;
    courseCode: string;
    Course: string;
    CourseAbbreviation: string;
    faculty: string[];
    total: number;
    present: number;
    absent: number;
    dutyLeave: number;
    medicalLeave: number;
    percentage: number;
    MinAttendancePercentage: number;
    schemaVersion: number;
}

export interface ExtractionResult {
    success: boolean;
    data?: AttendanceRecord[];
    error?: string;
    warning?: string;
    schemaVersion?: number;
}

/**
 * Extracts attendance data from the Amrita portal page
 * This function runs in the context of the attendance page
 * @returns ExtractionResult containing attendance records or error information
 */
export function extractAttendanceData(): ExtractionResult {
    // Define schema version inside the function for page context execution
    const CURRENT_SCHEMA_VERSION = 3;
    
    try {
        console.log("Extracting attendance data from page...");
        console.log("Current page URL:", window.location.href);
        console.log("Page title:", document.title);

        const attendanceTable = document.getElementById('home_tab');
        if (!attendanceTable) {
            // Try to find other potential table elements for debugging
            const allTables = document.querySelectorAll('table');
            const allDivs = document.querySelectorAll('div[id]');
            
            console.error("Available tables:", allTables.length);
            console.error("Available divs with IDs:", Array.from(allDivs).map(div => div.id));
            
            return {
                success: false,
                error: `Attendance table with ID 'home_tab' not found on the page. Found ${allTables.length} tables and ${allDivs.length} divs with IDs. Current URL: ${window.location.href}`
            };
        }

        console.log("Found attendance table:", attendanceTable);

        const records: AttendanceRecord[] = [];
        let headerFound = false;
        const rows = attendanceTable.querySelectorAll('tr');
        
        console.log(`Found ${rows.length} rows in attendance table`);

        rows.forEach((row, index) => {
            const columns = row.querySelectorAll('th, td');
            console.log(`Row ${index}: ${columns.length} columns, first column text: "${columns[0]?.textContent?.trim()}"`);

            if (columns.length > 0 && columns[0].textContent?.trim() === 'Sl No') {
                headerFound = true;
                console.log(`Header found at row ${index}`);
                return; // Skip header row itself
            }

            if (!headerFound) {
                console.log(`Row ${index}: Skipping because header not found yet`);
                return; // Skip any rows before the header
            }

            // Expect at least 10 columns for a valid data row (columns[9] for medical leave)
            if (columns.length < 10) {
                console.log(`Row ${index} skipped: only ${columns.length} columns (need 10)`);
                return;
            }

            console.log(`Processing data row ${index} with ${columns.length} columns`);

            try {
                // Safely extract course name and code with null checking
                const courseElement = columns[2];
                if (!courseElement) {
                    console.error(`Row ${index}: Column 2 (course) is null`);
                    return;
                }
                
                // Course column contains "CODE<br>Course Name"
                const courseHtml = courseElement.innerHTML || '';
                const courseParts = courseHtml.split(/<br\s*\/?>/i);
                const courseCode = courseParts[0]?.trim() || '';
                const courseCleaned = courseParts.length > 1 
                    ? courseParts.slice(1).join(' ').trim() 
                    : courseElement.textContent?.trim() || '';
                
                console.log(`Row ${index}: Course code: "${courseCode}", name: "${courseCleaned}"`);
                
                const courseAbbreviation = courseCleaned.toLowerCase().includes('iot') ? 'I.O.T'
                    : courseCleaned.split(' ')
                        .filter(word => /^[a-zA-Z]/.test(word) && !['to', 'and', 'of'].includes(word.toLowerCase()))
                        .map(word => word[0].toUpperCase())
                        .join('.');

                // Faculty column contains names separated by <br> tags
                const facultyElement = columns[3];
                const facultyHtml = facultyElement?.innerHTML || '';
                const faculty = facultyHtml
                    .split(/<br\s*\/?>/i)
                    .map(name => name.trim())
                    .filter(name => name.length > 0);
                
                console.log(`Row ${index}: Faculty: [${faculty.join(', ')}]`);

                const record: AttendanceRecord = {
                    Sl_No: columns[0]?.textContent?.trim() || '',
                    courseCode: courseCode,
                    Course: courseCleaned,
                    CourseAbbreviation: courseAbbreviation,
                    faculty: faculty,
                    total: parseInt(columns[4]?.textContent?.trim() || '0') || 0,
                    present: parseInt(columns[5]?.textContent?.trim() || '0') || 0,
                    absent: parseInt(columns[7]?.textContent?.trim() || '0') || 0,
                    dutyLeave: parseInt(columns[6]?.textContent?.trim() || '0') || 0,
                    medicalLeave: parseInt(columns[9]?.textContent?.trim() || '0') || 0,
                    percentage: parseFloat(columns[8]?.textContent?.trim() || '0') || 0,
                    MinAttendancePercentage: 75,
                    schemaVersion: CURRENT_SCHEMA_VERSION,
                };
                records.push(record);
                console.log(`Added record ${records.length}:`, record.Course);
                
            } catch (recordError) {
                console.error(`Error processing row ${index}:`, recordError);
                console.log(`Row ${index} columns:`, Array.from(columns).map((col, i) => `${i}: "${col?.textContent?.trim()}"`));
            }
        });

        console.log(`Final results: ${records.length} records extracted, headerFound: ${headerFound}`);

        if (records.length === 0 && headerFound) {
            return {
                success: true,
                data: [],
                warning: "Header found, but no data rows extracted."
            };
        }

        if (records.length === 0 && !headerFound) {
            return {
                success: false,
                error: "Attendance table found, but header row ('Sl No') not found or no data rows."
            };
        }

        console.log("Extraction successful, returning data");
        return {
            success: true,
            data: records,
            schemaVersion: CURRENT_SCHEMA_VERSION
        };
    } catch (error) {
        return {
            success: false,
            error: `Error extracting attendance data: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Extracts username from the Amrita portal page
 * @returns string containing the user's name or error message
 */
export function extractUsername(): string {
    console.log("Extracting username from page...");

    const usernameElement = document.querySelector('.user-info');
    if (!usernameElement) {
        console.error("Username element not found on the page.");
        return "Unknown User";
    }

    console.log("Username element found:", usernameElement);
    const usernameText = usernameElement.textContent?.trim() || '';
    const username = usernameText.split(' ')[0]; // Assuming the username is the first part of the text
    console.log("Extracted username:", username);

    return username || "Unknown User";
}

/**
 * Validates attendance data structure
 * @param data Raw attendance data to validate
 * @returns boolean indicating if data is valid
 */
export function validateAttendanceData(data: any): data is AttendanceRecord[] {
    if (!Array.isArray(data)) {
        return false;
    }

    // Check if all records have the required fields for the current schema version
    return data.every(record => {
        return (
            typeof record === 'object' &&
            record !== null &&
            typeof record.Sl_No === 'string' &&
            typeof record.Course === 'string' &&
            typeof record.CourseAbbreviation === 'string' &&
            typeof record.courseCode === 'string' &&
            Array.isArray(record.faculty) &&
            typeof record.total === 'number' &&
            typeof record.present === 'number' &&
            typeof record.absent === 'number' &&
            typeof record.dutyLeave === 'number' &&
            typeof record.medicalLeave === 'number' &&
            typeof record.percentage === 'number' &&
            typeof record.MinAttendancePercentage === 'number' &&
            typeof record.schemaVersion === 'number' &&
            record.percentage >= 0 && record.percentage <= 100 &&
            record.schemaVersion === ATTENDANCE_SCHEMA_VERSION
        );
    });
}

/**
 * Checks if stored attendance data needs schema migration
 * @param data Raw attendance data from storage
 * @returns boolean indicating if migration is needed
 */
export function needsSchemaUpgrade(data: any): boolean {
    if (!Array.isArray(data) || data.length === 0) {
        return false;
    }

    const firstRecord = data[0];
    const storedSchemaVersion = firstRecord?.schemaVersion || 1;

    return storedSchemaVersion < ATTENDANCE_SCHEMA_VERSION;
}

/**
 * Migrates old attendance data to current schema version
 * @param data Raw attendance data to migrate
 * @returns Migrated attendance data or null if migration fails
 */
export function migrateAttendanceData(data: any): AttendanceRecord[] | null {
    if (!Array.isArray(data)) {
        return null;
    }

    try {
        return data.map(record => {
            let migrated = { ...record };

            // Migration from schema v1 to v2: separate dutyLeave and medicalLeave
            if (!migrated.schemaVersion || migrated.schemaVersion < 2) {
                migrated.dutyLeave = migrated.dutyLeave ?? 0;
                migrated.medicalLeave = migrated.medicalLeave ?? 0;
            }

            // Migration from schema v2 to v3: add courseCode and faculty
            if (!migrated.schemaVersion || migrated.schemaVersion < 3) {
                migrated.courseCode = migrated.courseCode ?? '';
                migrated.faculty = migrated.faculty ?? [];
            }

            migrated.schemaVersion = ATTENDANCE_SCHEMA_VERSION;
            return migrated;
        });
    } catch (error) {
        console.error('Error migrating attendance data:', error);
        return null;
    }
}