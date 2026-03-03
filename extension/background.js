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
    
    return true; 
  }

  if (request.action === "checkHandle") {
    fetch(`http://localhost:3000/check/${request.handle}`)
    .then(res => res.json())
    .then(res => sendResponse(res))
    .catch(err => {
      console.error("Background Check Error:", err);
      sendResponse({ exists: false, error: err.message });
    });
    return true;
  }

  if (request.action === "getHistory") {
    fetch(`http://localhost:3000/history/${request.handle}`)
    .then(res => res.json())
    .then(res => sendResponse(res))
    .catch(err => {
      console.error("Background History Error:", err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (request.action === "getConfig") {
    fetch(`http://localhost:3000/config`)
    .then(res => res.json())
    .then(res => sendResponse(res))
    .catch(err => {
      console.error("Background Config Error:", err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (request.action === "updateConfig") {
    fetch(`http://localhost:3000/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: request.tag })
    })
    .then(res => res.json())
    .then(res => sendResponse(res))
    .catch(err => {
      console.error("Background Config Update Error:", err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});
