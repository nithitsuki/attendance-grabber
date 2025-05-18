let windowId = null;

console.log("Extension service worker started");

async function openLoginPopup() {
  console.log("openLoginPopup called");

  try {
    const win = await chrome.windows.create({
      url: 'https://students.amrita.edu',
      type: 'popup',
      width: 400,
      height: 600
    });

    windowId = win.id;
    const tabId = win.tabs?.[0]?.id;

    if (!tabId) {
      throw new Error("No tab created in popup window");
    }

    const navListener = async (details) => {
      if (details.tabId === tabId && 
          details.url.startsWith('https://my.amrita.edu/index/index')) {
        
        chrome.webNavigation.onCompleted.removeListener(navListener);

        try {
          const cookie = await chrome.cookies.get({
            url: 'https://students.amrita.edu',
            name: 'PHPSESSID'
          });

          if (cookie) {
            console.log("Got PHPSESSID:", cookie.value);
            setTimeout(() => {
              if (windowId) {
                chrome.windows.remove(windowId);
                windowId = null;
              }
            }, 2000);
          } else {
            console.warn("PHPSESSID not found");
          }
        } catch (error) {
          console.error("Error getting cookie:", error);
        }
      }
    };

    chrome.webNavigation.onCompleted.addListener(navListener, {
      url: [{urlPrefix: 'https://my.amrita.edu/index/index'}]
    });

  } catch (error) {
    console.error("Error creating window:", error);
  }
}

// For testing during development
openLoginPopup();