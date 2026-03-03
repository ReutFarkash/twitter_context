# Twitter Context Manager 🐦‍⬛

A lightweight "Person Relationship Manager" to catalog and surface context for Twitter users directly in your Obsidian vault.

## 🎯 Vision
Improve interaction quality by remembering why you know someone. Whether they've been exceptionally helpful ("Team") or problematic ("Red-Flag"), this tool ensures you have that context one click away.

## 🏗️ Architecture
- **Browser Extension:** (Chrome/Brave) Injects capture buttons into the Twitter DOM.
- **Background Relay:** Bypasses CORS restrictions to communicate with local services.
- **Node.js Bridge:** A local Express server that manages file I/O to your Obsidian vault.
- **Obsidian Vault:** Stores person profiles as Markdown files with Dataview-compatible metadata.

## 🚀 Startup & Maintenance

### **Regular Startup**
To manually start the bridge server (must be running for the extension to save data):
```bash
cd bridge
npm start
```
*The bridge runs at `http://localhost:3000`.*

### **New Version / Update**
When pulling changes or updating the extension:
1.  **Bridge:** Restart the Node server if `server.js` changed (`Ctrl+C` then `npm start`).
2.  **Extension:** 
    -   Go to `chrome://extensions`.
    -   Find **Twitter Context Manager**.
    -   Click the **Update/Refresh** icon 🔄.
    -   Reload your Twitter/X tabs.

---

## 🛠️ Always-On Workflow (macOS)
To have the bridge server start automatically on login:

### **Option 1: macOS Login Items (Simplest)**
1.  Open **System Settings** > **General** > **Login Items**.
2.  Click the **+** button.
3.  Navigate to `/Users/reut/Code/twitter_context/bridge/start_bridge.sh` and add it.
    *   *Note: This will open a Terminal window on boot. You can close it, but the server must remain running.*

### **Option 2: Launchd (Hidden Background)**
For a "silent" background process that restarts if it crashes:
1.  Create a file at `~/Library/LaunchAgents/com.user.twitter-context-bridge.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.twitter-context-bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/reut/Code/twitter_context/bridge/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/twitter-bridge.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/twitter-bridge.err</string>
</dict>
</plist>
```
2.  Load the agent: `launchctl load ~/Library/LaunchAgents/com.user.twitter-context-bridge.plist`

---

## 🛠️ Tech Stack
- Manifest v3 (Vanilla JS)
- Express.js (Node)
- Obsidian / Markdown

## 🛡️ Privacy
This project is designed for **personal use**. Data is stored locally in your vault. No data is sent to external servers unless you explicitly configure a remote sync.
