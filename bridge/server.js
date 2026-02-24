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
    const categoryMatch = content.match(/category:\s*(\w+)/);
    const category = categoryMatch ? categoryMatch[1] : 'Neutral';
    
    res.json({ exists: true, category });
  } else {
    res.json({ exists: false });
  }
});

app.post('/save', (appRequest, appResponse) => {
  try {
    const data = appRequest.body;
    console.log("Saving context for:", data.displayName, data.handle);
    
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
category: Neutral
tags:
  - twitter-context
date_created: ${dateStr}
---

# ${data.displayName} (${data.handle})

## 📋 Context Timeline
- [date:: [[${dateStr}]]] [event:: Captured Tweet] [link:: ${data.url}] #twitter-context
  > ${data.text.replace(/\n/g, '\n  > ')}

`;

    if (fs.existsSync(filePath)) {
      // Append to existing file
      const appendContent = `- [date:: [[${dateStr}]]] [event:: Captured Tweet] [link:: ${data.url}] #twitter-context
  > ${data.text.replace(/\n/g, '\n  > ')}\n`;
      
      fs.appendFileSync(filePath, appendContent);
      console.log("Updated context file:", filePath);
      appResponse.json({ status: 'Updated existing context.' });
    } else {
      // Create new file
      fs.writeFileSync(filePath, content);
      console.log("Created new context file:", filePath);
      appResponse.json({ status: 'Created new person context.' });
    }
  } catch (error) {
    console.error("Bridge POST Error:", error);
    appResponse.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Twitter Context Bridge running at http://localhost:${PORT}`);
});
