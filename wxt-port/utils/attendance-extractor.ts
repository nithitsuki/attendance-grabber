/**
 * Utility functions for extracting and processing attendance data
 * These functions handle the core logic of parsing attendance tables and user information
 */

export interface AttendanceRecord {
  Sl_No: string;
  Course: string;
  CourseAbbreviation: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
  MinAttendancePercentage: number;
}

export interface ExtractionResult {
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
  warning?: string;
}

/**
 * Extracts attendance data from the Amrita portal page
 * This function runs in the context of the attendance page
 * @returns ExtractionResult containing attendance records or error information
 */
export function extractAttendanceData(): ExtractionResult {
    try {
        console.log("Extracting attendance data from page...");
        
        const attendanceTable = document.getElementById('home_tab');
        if (!attendanceTable) {
            return {
                success: false,
                error: "Attendance table with ID 'home_tab' not found on the page."
            };
        }

        const records: AttendanceRecord[] = [];
        let headerFound = false;
        const rows = attendanceTable.querySelectorAll('tr');

        rows.forEach(row => {
            const columns = row.querySelectorAll('th, td');

            if (columns.length > 0 && columns[0].textContent?.trim() === 'Sl No') {
                headerFound = true;
                return; // Skip header row itself
            }

            if (!headerFound) {
                return; // Skip any rows before the header
            }

            // Expect at least 9 columns for a valid data row
            if (columns.length < 9) {
                return;
            }

            const dutyLeave = parseInt(columns[6].textContent?.trim() || '0') || 0;
            const medicalLeave = parseInt(columns[9]?.textContent?.trim() || '0') || 0;
            const presentCount = parseInt(columns[5].textContent?.trim() || '0') || 0;
            const totalPresent = presentCount + dutyLeave + medicalLeave;
            
            const courseCleaned = columns[2].innerHTML.replace(/.*<br>/, '');
            const courseAbbreviation = courseCleaned.toLowerCase().includes('iot') ? 'I.O.T'
                : courseCleaned.split(' ')
                    .filter(word => /^[a-zA-Z]/.test(word) && !['to', 'and', 'of'].includes(word.toLowerCase()))
                    .map(word => word[0].toUpperCase())
                    .join('.');

            const record: AttendanceRecord = {
                Sl_No: columns[0].textContent?.trim() || '',
                Course: courseCleaned,
                CourseAbbreviation: courseAbbreviation,
                total: parseInt(columns[4].textContent?.trim() || '0') || 0,
                present: totalPresent,
                absent: parseInt(columns[7].textContent?.trim() || '0') || 0,
                percentage: parseFloat(columns[8].textContent?.trim() || '0') || 0,
                MinAttendancePercentage: 75,
            };
            records.push(record);
        });

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

        return {
            success: true,
            data: records
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
  // TODO: Implement data validation logic
  // 1. Check if data is an array
  // 2. Validate each record has required fields
  // 3. Ensure numeric fields are valid numbers
  // 4. Check for reasonable percentage values
  
  return Array.isArray(data);
}