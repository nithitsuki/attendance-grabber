// import dotenv from 'dotenv'; dotenv.config();
// import get_attendance from './get_attendance_html.ts';
// import convert_attendance_to_json from './attendance_to_json.ts';

// async function main() {
//     // user goes to students.amrita.edu, logins in with Microsoft oAuth
//     // Amrita gives back PHPSESSID to save it in cookies
//     // Find a way to get PHPSESSID painlessly, without going to the amrita site
    
//     const PHPSESSID: string = process.env.PHPSESSID || "";
//     const attendanceData: string = await get_attendance(PHPSESSID);
//     const jsonData: object = convert_attendance_to_json(attendanceData);
//     console.log(jsonData);
// }

// main();