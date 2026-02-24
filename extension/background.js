chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveToBridge") {
    console.log("Background: Relaying to bridge...", request.data);
    
    fetch('http://localhost:3000/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.data)
    })
    .then(res => res.json())
    .then(res => sendResponse({ success: true, status: res.status }))
    .catch(err => {
      console.error("Background Bridge Error:", err);
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Keep channel open for async response
  }
});
