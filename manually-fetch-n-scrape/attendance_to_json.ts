import * as cheerio from 'cheerio';

interface AttendanceRecord {
    Sl_No: string;
    Course: string;
    faculty: string;
    total: string;
    present: string;
    dutyLeave: string;
    absent: string;
    percentage: string;
    medical: string;
}

function convert_attendance_to_json(attendanceData: string): AttendanceRecord[] | string[] {
    const $ = cheerio.load(attendanceData);
    const attendanceTable = $('#home_tab');

    // Check if table exists
    if (!attendanceTable.length) {
        return ["No attendance data found"];
    }

    // Look for rows - try both thead and tbody
    let rows = attendanceTable.find('thead tr');
    if (!rows.length) {
        rows = attendanceTable.find('tr');
    }

    const attendanceArray: AttendanceRecord[] = [];
    let headerFound = false;

    rows.each((index: number, row) => {
        const columns = $(row).find('th, td');

        // Skip rows that don't have enough columns
        if (columns.length < 9) return;

        // Check if this is a header row
        if (!headerFound && $(columns[0]).text().trim() === 'Sl No') {
            headerFound = true;
            return;
        }

        const Sl_No = $(columns[0]).text().trim();
        const Class_Name = $(columns[1]).text().trim();
        const courseText = $(columns[2]).text().trim();
        const Course = courseText.replace(/\n/g, ' ').replace(/\r/g, '');
        const faculty = $(columns[3]).text().trim();
        const total = $(columns[4]).text().trim();
        const present = $(columns[5]).text().trim();
        const dutyLeave = $(columns[6]).text().trim();
        const absent = $(columns[7]).text().trim();
        const percentage = $(columns[8]).text().trim();
        const medical = $(columns[9]).text().trim();
        
        const data: AttendanceRecord = {
            Sl_No,
            Course,
            faculty,
            total,
            present,
            dutyLeave,
            absent,
            percentage,
            medical
        };

        attendanceArray.push(data);
    });

    return attendanceArray;
}

export default convert_attendance_to_json;