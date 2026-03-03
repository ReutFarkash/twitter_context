console.log("Twitter Context: Content script loaded.");

// Target selectors for tweet extraction.
const SELECTORS = {
  tweetContainer: '[data-testid="tweet"]',
  userName: '[data-testid="User-Name"]',
  tweetText: '[data-testid="tweetText"]',
  actionGroup: '[role="group"]'
};

// Global memory for categories
let GLOBAL_CATEGORIES = [];

// Initialize categories from vault
function syncCategories() {
  chrome.runtime.sendMessage({ action: "getConfig" }, (res) => {
    if (res && res.tags) {
      GLOBAL_CATEGORIES = res.tags;
    }
  });
}
syncCategories();

function createCaptureButton() {
  const container = document.createElement('div');
  container.style.cssText = 'display: flex; align-items: center; gap: 4px; margin-left: 8px; position: relative; z-index: 1000;';
  container.classList.add('save-context-container');
  
  const toggleBtn = document.createElement('button');
  toggleBtn.innerText = 'Save...';
  toggleBtn.style.cssText = 'font-size: 10px; border-radius: 4px; border: 1px solid #e1e8ed; background: #f5f8fa; padding: 2px 6px; cursor: pointer; color: #657786; line-height: 1;';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Tag...';
  input.style.cssText = 'font-size: 10px; border-radius: 4px; border: 1px solid #e1e8ed; width: 45px; padding: 1px 4px; background: #f5f8fa; color: #14171a;';

  const handleSave = (category) => {
    const tweet = container.closest(SELECTORS.tweetContainer);
    if (tweet) {
      const data = extractTweetData(tweet);
      if (data) {
        data.category = category;
        sendToBridge(data);
      }
    }
  };

  // Shield: Prevent any interaction from reaching the underlying tweet
  const stopEvent = (e) => e.stopPropagation();
  container.addEventListener('click', stopEvent);
  container.addEventListener('mousedown', stopEvent);
  container.addEventListener('mouseup', stopEvent);

  toggleBtn.onclick = (e) => {
    e.preventDefault();
    showTagPicker(container, toggleBtn, handleSave);
  };

  input.onkeydown = (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      const newTag = input.value.trim();
      chrome.runtime.sendMessage({ action: "updateConfig", tag: newTag }, (res) => {
        if (res && res.success) syncCategories();
      });
      handleSave(newTag);
      input.value = ''; 
    }
  };

  container.appendChild(toggleBtn);
  container.appendChild(input);

  return container;
}

function showTagPicker(container, anchorEl, onSave) {
  let picker = document.getElementById('twitter-tag-picker');
  if (!picker) {
    picker = document.createElement('div');
    picker.id = 'twitter-tag-picker';
    picker.style.cssText = 'position: fixed; background: white; border: 1px solid #e1e8ed; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 30000; padding: 8px; font-family: -apple-system, sans-serif; display: none; min-width: 140px;';
    document.body.appendChild(picker);
  }

  const rect = anchorEl.getBoundingClientRect();
  picker.style.top = `${rect.bottom + 4}px`;
  picker.style.left = `${Math.min(rect.left, window.innerWidth - 160)}px`;
  picker.style.display = 'block';

  let selected = new Set();
  
  const render = () => {
    let html = `<div style="display: flex; flex-direction: column; gap: 4px;">`;
    
    // Quick Multi-Save Button
    if (selected.size > 0) {
      html += `<button id="save-selected" style="background: #1DA1F2; color: white; border: none; border-radius: 4px; padding: 4px; font-size: 10px; cursor: pointer; font-weight: bold; margin-bottom: 4px;">Save [${selected.size}] Selected</button>`;
    } else {
      html += `<div id="quick-neutral" style="padding: 4px; font-size: 11px; cursor: pointer; color: #1DA1F2; border-bottom: 1px solid #f5f8fa; margin-bottom: 4px;">Quick Save (Neutral)</div>`;
    }

    GLOBAL_CATEGORIES.forEach(tag => {
      html += `<div style="display: flex; align-items: center; gap: 6px; padding: 2px 4px; border-radius: 4px; transition: background 0.1s;" class="tag-row">
        <input type="checkbox" style="cursor: pointer;" data-tag="${tag}" ${selected.has(tag) ? 'checked' : ''}>
        <span style="font-size: 11px; cursor: pointer; color: #14171a; flex-grow: 1;" class="tag-label">${tag}</span>
      </div>`;
    });
    html += `</div>`;
    picker.innerHTML = html;

    // Listeners
    if (picker.querySelector('#save-selected')) {
      picker.querySelector('#save-selected').onclick = () => {
        onSave(Array.from(selected).join(', '));
        picker.style.display = 'none';
      };
    }
    if (picker.querySelector('#quick-neutral')) {
      picker.querySelector('#quick-neutral').onclick = () => {
        onSave('Neutral');
        picker.style.display = 'none';
      };
    }

    picker.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.onclick = (e) => {
        const tag = e.target.getAttribute('data-tag');
        if (e.target.checked) selected.add(tag);
        else selected.delete(tag);
        render();
      };
    });

    picker.querySelectorAll('.tag-label').forEach(label => {
      label.onclick = (e) => {
        const tag = e.target.innerText;
        onSave(tag);
        picker.style.display = 'none';
      };
    });
  };

  render();

  const outsideClick = (e) => {
    if (!picker.contains(e.target) && e.target !== anchorEl) {
      picker.style.display = 'none';
      document.removeEventListener('mousedown', outsideClick);
    }
  };
  document.addEventListener('mousedown', outsideClick);
}

function extractTweetData(tweet) {
  const userEl = tweet.querySelector(SELECTORS.userName);
  const textEl = tweet.querySelector(SELECTORS.tweetText);
  if (!userEl) return null;
  const names = userEl.innerText.split('\n');
  const displayName = names[0] || "Unknown";
  const handle = (names[1] || "@unknown").replace('@', '');
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
  chrome.runtime.sendMessage({ action: "saveToBridge", data: data }, (res) => {
    if (res && res.success) {
      console.log("Twitter Context: Save success:", res);
    } else {
      console.error("Twitter Context: Bridge Error:", res ? res.error : "Unknown error");
      alert(`❌ Save Failed: ${res ? res.error : "Unknown error"}`);
    }
  });
}

// Inject buttons periodically
setInterval(() => {
  const actions = document.querySelectorAll(SELECTORS.actionGroup);
  actions.forEach(group => {
    if (!group.querySelector('.save-context-container')) {
      group.appendChild(createCaptureButton());
    }
  });

  const names = document.querySelectorAll(SELECTORS.userName);
  names.forEach(nameBlock => {
    if (!nameBlock.querySelector('.person-badge') && !nameBlock.classList.contains('context-checked')) {
      const handleBlock = nameBlock.innerText.split('\n')[1];
      if (handleBlock) {
        const handle = handleBlock.replace('@', '');
        nameBlock.classList.add('context-checked'); 
        chrome.runtime.sendMessage({ action: "checkHandle", handle: handle }, (res) => {
          if (res && res.exists && !nameBlock.querySelector('.person-badge')) {
            const badge = document.createElement('span');
            badge.classList.add('person-badge');
            const emojiMap = {
              'Team': '🟢', 'Red-Flag': '🔴', 'Neutral': '🟡', 'Tech': '💻',
              'Cute Bookmark': '✨', 'News': '📰', 'Racist': '🚫', 'Personal': '👤',
              'Sexist': '🚫', 'Douchebag': '💩'
            };
            badge.innerText = ` ${emojiMap[res.category] || '🟡'}`;
            badge.title = `Context Saved: ${res.category}`;
            badge.style.cssText = 'margin-left: 4px; cursor: pointer; display: inline-block; vertical-align: middle; font-size: 14px;';
            badge.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              showContextCard(handle, badge);
            };
            const containers = nameBlock.querySelectorAll('div[dir="ltr"]');
            const targetContainer = containers[containers.length - 1] || nameBlock;
            targetContainer.appendChild(badge);
          }
        });
      }
    }
  });
}, 2000);

function showContextCard(handle, anchorEl) {
  let card = document.getElementById('twitter-context-card');
  if (!card) {
    card = document.createElement('div');
    card.id = 'twitter-context-card';
    card.style.cssText = 'position: fixed; background: white; border: 1px solid #e1e8ed; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 320px; max-height: 400px; overflow-y: auto; z-index: 20000; padding: 12px; font-family: -apple-system, sans-serif; display: none;';
    document.body.appendChild(card);
  }
  const closeHandler = (e) => {
    if (card.style.display === 'block' && !card.contains(e.target) && e.target !== anchorEl) {
      card.style.display = 'none';
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  document.addEventListener('mousedown', closeHandler);
  const rect = anchorEl.getBoundingClientRect();
  card.style.top = `${rect.bottom + 8}px`; 
  card.style.left = `${Math.min(rect.left, window.innerWidth - 340)}px`;
  card.style.display = 'block';
  card.innerHTML = `<div style="font-weight: bold; color: #1DA1F2; margin-bottom: 8px;">Loading Context for @${handle}...</div>`;
  chrome.runtime.sendMessage({ action: "getHistory", handle: handle }, (res) => {
    if (res && res.success && res.entries.length > 0) {
      let html = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f5f8fa; padding-bottom: 8px;">
        <span style="font-weight: bold; font-size: 14px; color: #14171a;">@${handle}</span>
        <button id="close-context-card" style="border: none; background: none; cursor: pointer; color: #657786; font-size: 16px;">✕</button>
      </div>`;
      res.entries.slice().reverse().forEach(entry => {
        html += `<div style="margin-bottom: 12px; font-size: 12px; line-height: 1.4; border-left: 2px solid #1DA1F2; padding-left: 8px;">
          <div style="color: #657786; font-size: 11px; margin-bottom: 2px;">
            ${entry.date} • <span style="color: #1DA1F2; font-weight: bold;">${entry.category}</span>
          </div>
          <div style="color: #14171a; margin-bottom: 4px;">${entry.text.replace(/\n/g, '<br>')}</div>
          <a href="${entry.link}" target="_blank" style="color: #1DA1F2; text-decoration: none; font-size: 10px;">🔗 View Tweet</a>
        </div>`;
      });
      card.innerHTML = html;
      card.querySelector('#close-context-card').onclick = (e) => { e.stopPropagation(); card.style.display = 'none'; };
    } else {
      card.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;"><span style="font-weight: bold; font-size: 14px;">@${handle}</span><button id="close-context-card" style="border: none; background: none; cursor: pointer; color: #657786; font-size: 16px;">✕</button></div><div style="color: #657786; font-size: 13px; text-align: center; padding: 20px;">No history found.</div>`;
      card.querySelector('#close-context-card').onclick = () => card.style.display = 'none';
    }
  });
}