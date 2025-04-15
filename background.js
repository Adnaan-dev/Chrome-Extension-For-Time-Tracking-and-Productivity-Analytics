let activeTab = null;
let startTime = null;
const SERVER_URL = "http://localhost:3000";

// Listen for tab switching or updating
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabSwitch(tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        handleTabSwitch(tab.url);
    }
});

// Track the active tab and time spent on it
function handleTabSwitch(url) {
    if (activeTab) {
        let totalTime = (Date.now() - startTime) / 1000;  // Calculate time spent on previous tab
        sendDataToServer(activeTab, totalTime);  // Send data to backend
    }

    activeTab = new URL(url).hostname;  // Update the active tab URL (hostname)
    startTime = Date.now();  // Reset the timer
}

// Send time tracking data to backend server
function sendDataToServer(website, timeSpent) {
    console.log(`Sending Data: ${website} - ${timeSpent}s`);  // Debugging log

    fetch(`${SERVER_URL}/save-data`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ website, time: timeSpent }),
    })
    .then((res) => res.json())
    .then((data) => console.log("Server Response:", data))
    .catch((err) => console.error("Error sending data:", err));
}

// Fetch data from the server (for background task or UI)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getData") {
        fetch(`${SERVER_URL}/get-data`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched Data in Background.js:", data);  // Debugging log
                sendResponse(data);
            })
            .catch((err) => console.error("Error fetching data:", err));
        return true;  // Keep the response asynchronous
    }
});
