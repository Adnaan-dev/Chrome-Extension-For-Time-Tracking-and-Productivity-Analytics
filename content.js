// Listen for when the page has finished loading
window.addEventListener('load', () => {
    // Send a message to background.js to indicate that the page has loaded
    chrome.runtime.sendMessage({
        action: 'pageLoaded', // Action indicating page load
        url: window.location.hostname // Send the hostname of the page
    });
});
