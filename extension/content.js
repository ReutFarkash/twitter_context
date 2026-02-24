console.log("Twitter Context: Content script loaded.");

// TODO: Implement DOM scraper logic.
// Target selectors for tweet extraction.
const SELECTORS = {
  tweetContainer: '[data-testid="tweet"]',
  userName: '[data-testid="User-Name"]',
  tweetText: '[data-testid="tweetText"]',
  actionGroup: '[role="group"]'
};

function createCaptureButton() {
  const btn = document.createElement('button');
  btn.innerText = '💾 Save Context';
  btn.style.cssText = 'background: #1DA1F2; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 8px;';
  btn.onclick = (e) => {
    e.stopPropagation();
    const tweet = e.target.closest(SELECTORS.tweetContainer);
    if (tweet) {
      const data = extractTweetData(tweet);
      sendToBridge(data);
    }
  };
  return btn;
}

function extractTweetData(tweet) {
  const userEl = tweet.querySelector(SELECTORS.userName);
  const textEl = tweet.querySelector(SELECTORS.tweetText);
  
  // Example extraction (selectors may vary)
  const names = userEl.innerText.split('\n'); // [DisplayName, @Handle, ·, Timestamp]
  
  return {
    displayName: names[0],
    handle: names[1],
    text: textEl ? textEl.innerText : '',
    url: window.location.href, // This might be the user profile or a thread
    timestamp: new Date().toISOString()
  };
}

function sendToBridge(data) {
  console.log("Sending to bridge:", data);
  fetch('http://localhost:3000/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => alert(`Context saved: ${res.status}`))
  .catch(err => {
    console.error("Bridge Error:", err);
    alert("Failed to reach local bridge. Is it running?");
  });
}

// Inject buttons periodically (or via observer)
setInterval(() => {
  const actions = document.querySelectorAll(SELECTORS.actionGroup);
  actions.forEach(group => {
    if (!group.querySelector('.save-context-btn')) {
      const btn = createCaptureButton();
      btn.classList.add('save-context-btn');
      group.appendChild(btn);
    }
  });
}, 2000);
