const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const VAULT_PATH = '/Users/reut/Code/assistant/data_vault/03/Twitter_Context';

app.use(cors());
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Twitter Context Bridge is RUNNING. Send POST requests to /save');
});

app.get('/check/:handle', (req, res) => {
  const handle = req.params.handle.replace('@', '');
  const filePath = path.join(VAULT_PATH, `${handle}.md`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple regex to find category in YAML
    const categoryMatch = content.match(/category:\s*([^\n\r]+)/);
    const category = categoryMatch ? categoryMatch[1].trim() : 'Neutral';
    
    res.json({ exists: true, category });
  } else {
    res.json({ exists: false });
  }
});

const CONFIG_FILE = path.join(VAULT_PATH, '_CONFIG.md');

// Helper to read config
function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return ['Tech', 'Cute Bookmark', 'News', 'Racist', 'Personal', 'Sexist', 'Douchebag'];
  const content = fs.readFileSync(CONFIG_FILE, 'utf8');
  const match = content.match(/tags:\s*\n((?:\s*-\s*.*?\n)+)/);
  if (!match) return [];
  return match[1].split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
}

// Helper to update config
function updateConfig(tags) {
  let content = fs.readFileSync(CONFIG_FILE, 'utf8');
  const yamlTags = tags.map(t => `  - ${t}`).join('\n');
  const newContent = content.replace(/(tags:\s*\n)(?:\s*-\s*.*?\n)+/, `$1${yamlTags}\n`);
  fs.writeFileSync(CONFIG_FILE, newContent);
}

app.get('/config', (req, res) => {
  res.json({ tags: readConfig() });
});

app.post('/config', (req, res) => {
  const { tag } = req.body;
  const tags = readConfig();
  if (tag && !tags.includes(tag)) {
    tags.push(tag);
    updateConfig(tags);
  }
  res.json({ success: true, tags });
});

app.get('/history/:handle', (req, res) => {
  const handle = req.params.handle.replace('@', '');
  const filePath = path.join(VAULT_PATH, `${handle}.md`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Extract timeline entries
    const entries = [];
    const lines = content.split('\n');
    let currentEntry = null;

    lines.forEach(line => {
      const entryMatch = line.match(/^- \[date:: \[\[(.*?)\]\]\] \[event:: (.*?)\] (?:\[category:: (.*?)\] )?\[link:: (.*?)\]/);
      if (entryMatch) {
        if (currentEntry) entries.push(currentEntry);
        currentEntry = {
          date: entryMatch[1],
          event: entryMatch[2],
          category: entryMatch[3] || 'Neutral',
          link: entryMatch[4],
          text: ""
        };
      } else if (currentEntry && line.trim().startsWith('>')) {
        currentEntry.text += line.trim().substring(1).trim() + "\n";
      }
    });
    if (currentEntry) entries.push(currentEntry);

    res.json({ success: true, handle, entries });
  } else {
    res.json({ success: false, error: "No history found." });
  }
});

app.post('/save', (appRequest, appResponse) => {
  try {
    const data = appRequest.body;
    let category = data.category || 'Neutral';
    if (Array.isArray(category)) category = category.join(', ');
    
    console.log("Saving context for:", data.displayName, data.handle, "Categories:", category);
    
    if (!data.handle) {
      throw new Error("Missing user handle in request body.");
    }
    
    // Ensure the vault directory exists
    if (!fs.existsSync(VAULT_PATH)) {
      fs.mkdirSync(VAULT_PATH, { recursive: true });
    }

    const filename = `${data.handle.replace('@', '')}.md`;
    const filePath = path.join(VAULT_PATH, filename);
    const dateStr = data.timestamp.split('T')[0];
    
    const content = `---
display_name: ${data.displayName}
twitter_handle: ${data.handle}
category: ${category}
tags:
  - twitter-context
date_created: ${dateStr}
---

# ${data.displayName} (${data.handle})

## 📋 Context Timeline
- [date:: [[${dateStr}]]] [event:: Captured Tweet] [category:: ${category}] [link:: ${data.url}] #twitter-context
  > ${data.text.replace(/\n/g, '\n  > ')}

`;

    if (fs.existsSync(filePath)) {
      // Append to existing file
      const appendContent = `- [date:: [[${dateStr}]]] [event:: Captured Tweet] [category:: ${category}] [link:: ${data.url}] #twitter-context
  > ${data.text.replace(/\n/g, '\n  > ')}\n`;
      
      fs.appendFileSync(filePath, appendContent);

      console.log("Updated context file:", filePath);
      appResponse.json({ status: `Updated context with [${category}].` });
    } else {
      // Create new file
      fs.writeFileSync(filePath, content);
      console.log("Created new context file:", filePath);
      appResponse.json({ status: `Created context with [${category}].` });
    }
  } catch (error) {
    console.error("Bridge POST Error:", error);
    appResponse.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Twitter Context Bridge running at http://localhost:${PORT}`);
});
