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

app.post('/save', (appRequest, appResponse) => {
  const data = appRequest.body;
  const filename = `${data.handle.replace('@', '')}.md`;
  const filePath = path.join(VAULT_PATH, filename);
  
  const content = `---
display_name: ${data.displayName}
twitter_handle: ${data.handle}
category: Neutral
tags:
  - twitter-context
date_created: ${data.timestamp.split('T')[0]}
---

# ${data.displayName} (${data.handle})

## 📋 Context Timeline
- [date:: [[${data.timestamp.split('T')[0]}]]] [event:: Captured Tweet] [link:: ${data.url}] #twitter-context
  > ${data.text.replace(/\n/g, '\n  > ')}

`;

  if (fs.existsSync(filePath)) {
    // Append to existing file
    const appendContent = `- [date:: [[${data.timestamp.split('T')[0]}]]] [event:: Captured Tweet] [link:: ${data.url}] #twitter-context
  > ${data.text.replace(/\n/g, '\n  > ')}\n`;
    
    fs.appendFileSync(filePath, appendContent);
    appResponse.json({ status: 'Updated existing context.' });
  } else {
    // Create new file
    fs.writeFileSync(filePath, content);
    appResponse.json({ status: 'Created new person context.' });
  }
});

app.listen(PORT, () => {
  console.log(`Twitter Context Bridge running at http://localhost:${PORT}`);
});
