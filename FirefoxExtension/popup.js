// Define the server URL as a constant
// const TargetWebsite = "https://sad.nithitsuki.com";
const TargetWebsite = "http://localhost:3000";

document.getElementById("dump").addEventListener("click", async () => {
    const output = document.getElementById("output");
    
    // Function to update output text
    const updateOutput = (text) => {
        if (text.startsWith('\n')) {
            output.textContent += text;
        } else {
            output.textContent = text;
        }
    };

    try {
        // Send message to background script to handle attendance extraction
        const response = await chrome.runtime.sendMessage({ 
            action: "getAttendance",
            targetWebsite: TargetWebsite
        });
        
        if (response.success) {
            updateOutput("Attendance data extracted successfully!");
            updateOutput(`\nData: ${JSON.stringify(response.data, null, 2)}`);
        } else {
            updateOutput(`Error: ${response.error}`);
        }
    } catch (error) {
        console.error("Error processing attendance data:", error);
        updateOutput(`Error: ${error.message}`);
    }
});
