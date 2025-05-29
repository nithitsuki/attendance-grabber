# Amrita Attendance Fetcher

An extension that enhances the attendance tracking experience for Amrita University students.


## Features

- Automatically fetches attendance data from the [university portal](https://students.amrita.edu/client/index)
- Redirects to a comprehensive attendance dashboard
- Provides improved visualization of attendance metrics (sad.nithitsuki.com)
- Helps students track their attendance requirements easily

## Installation
As of now, the extension is not available on the Chrome Web Store. You can install it manually by following these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/nithitsuki/attendance-grabber.git
   ```

### For Chromium based browsers (Chrome, Edge, etc.)
1. Open the browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click on "Load unpacked" and select the cloned repository folder and select the `ChromeExtension` folder
4. The extension should now be installed and active

### For Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click on "Load Temporary Add-on"
3. Select the `manifest.json` file from the cloned repositories `FirefoxExtension` folder
4. The extension should now be installed and active



## Usage

1. Pin the extension to your browser toolbar (one time setup)
2. Click on the extension icon to open the popup
3. Click on the "Fetch Attendance" button
3. You'll be redirected to the university portal to log in
4. After logging in, the extension will automatically fetch your attendance data
5. You will be redirected to the attendance dashboard (if not, click on the extension icon again)
6. View detailed attendance statistics and visualizations

## Screenshots

TBD
<!-- ![Dashboard Overview](screenshots/dashboard.png)
![Attendance Analytics](screenshots/analytics.png) -->

## Privacy

- Your attendance data remains private and is not shared with anyone
- The extension does not collect any personal data or browsing history
- All processing happens locally in your browser
- I cannot guarantee that the extension is secure, so use it at your own risk
- The extension is open-source, so you can review the code and verify its functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.