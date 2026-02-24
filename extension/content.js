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
  btn.style.cssText = 'background: #1DA1F2; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 8px; position: relative; z-index: 1000;';
  btn.classList.add('save-context-btn');
  btn.onclick = (e) => {
    console.log("Twitter Context: Button clicked!");
    e.preventDefault();
    e.stopPropagation();
    const tweet = e.target.closest(SELECTORS.tweetContainer);
    if (tweet) {
      console.log("Twitter Context: Tweet container found.");
      const data = extractTweetData(tweet);
      console.log("Twitter Context: Extracted Data:", data);
      if (data) {
        sendToBridge(data);
      } else {
        console.error("Twitter Context: Data extraction failed.");
      }
    } else {
      console.error("Twitter Context: Could not find tweet container.");
    }
  };
  return btn;
}

function extractTweetData(tweet) {
  const userEl = tweet.querySelector(SELECTORS.userName);
  const textEl = tweet.querySelector(SELECTORS.tweetText);
  
  if (!userEl) {
    console.error("Twitter Context: User-Name not found in tweet element.");
    return null;
  }
  
  // Twitter's User-Name block contains multiple children. We want display name and handle.
  const names = userEl.innerText.split('\n'); // [DisplayName, @Handle, ·, Timestamp]
  const displayName = names[0] || "Unknown";
  const handle = (names[1] || "@unknown").replace('@', ''); // Remove @ for filename
  
  return {
    displayName,
    handle,
    text: textEl ? textEl.innerText : '(No text)',
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
}

function sendToBridge(data) {
  if (!data) return;
  console.log("Twitter Context: Sending to background for relay...", data);
  
  chrome.runtime.sendMessage({ action: "saveToBridge", data: data }, (res) => {
    if (chrome.runtime.lastError) {
      console.error("Twitter Context: Extension Error:", chrome.runtime.lastError);
      alert(`❌ Extension Error: ${chrome.runtime.lastError.message}`);
      return;
    }

    if (res && res.success) {
      console.log("Twitter Context: Save success:", res);
      alert(`✅ Context Saved: ${res.status}`);
    } else {
      console.error("Twitter Context: Bridge Error:", res ? res.error : "Unknown error");
      alert(`❌ Save Failed: ${res ? res.error : "Unknown error"}\n\nCheck if the bridge is running at http://localhost:3000`);
    }
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

  const names = document.querySelectorAll(SELECTORS.userName);
  names.forEach(nameBlock => {
    if (!nameBlock.querySelector('.person-badge')) {
      const handleBlock = nameBlock.innerText.split('\n')[1];
      if (handleBlock) {
        const handle = handleBlock.replace('@', '');
        chrome.runtime.sendMessage({ action: "checkHandle", handle: handle }, (res) => {
          if (res && res.exists && !nameBlock.querySelector('.person-badge')) {
            const badge = document.createElement('span');
            badge.classList.add('person-badge');
            
            // Map categories to emojis
            const emojiMap = {
              'Team': '🟢',
              'Red-Flag': '🔴',
              'Neutral': '🟡'
            };
            badge.innerText = ` ${emojiMap[res.category] || '🟡'}`;
            badge.title = `Context Saved: ${res.category}`;
            
            // Twitter's name block is often nested, find the actual display name span
            const nameEl = nameBlock.querySelector('span');
            if (nameEl) nameEl.appendChild(badge);
          }
        });
      }
    }
  });
}, 2000);
