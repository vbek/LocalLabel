// LocalLabel service worker: its only job is opening the app page.
// No network access, no content scripts, no data collection.

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('app.html') });
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('app.html') });
  }
});
