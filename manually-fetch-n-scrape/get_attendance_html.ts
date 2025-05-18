/**
 * Fetches attendance data from the Amrita student portal
 * @param PHPSESSID - The PHP session ID for authentication
 * @returns Promise that resolves to the HTML response as a string
 */
export async function getAttendance(PHPSESSID: string): Promise<string> {
    if(PHPSESSID === ""){throw new Error("PHPSESSID cannot be empty");}
    
    const response = await fetch('https://students.amrita.edu/client/class-attendance', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Connection': 'keep-alive',
            'Referer': 'https://students.amrita.edu/client/index',
            'Cookie': 'PHPSESSID=' + PHPSESSID,
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'DNT': '1',
            'Sec-GPC': '1',
            'Priority': 'u=0, i'
        }
    });
    
    // Ensure the request was successful
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.text();
    return data;
}

// Also provide the default export for backward compatibility
export default getAttendance;