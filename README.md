# Twitter Context Manager 🐦‍⬛

A lightweight "Person Relationship Manager" to catalog and surface context for Twitter users directly in your Obsidian vault.

## 🎯 Vision
Improve interaction quality by remembering why you know someone. Whether they've been exceptionally helpful ("Team") or problematic ("Red-Flag"), this tool ensures you have that context one click away.

## 🏗️ Architecture
- **Browser Extension:** (Chrome/Brave) Injects capture buttons into the Twitter DOM.
- **Background Relay:** Bypasses CORS restrictions to communicate with local services.
- **Node.js Bridge:** A local Express server that manages file I/O to your Obsidian vault.
- **Obsidian Vault:** Stores person profiles as Markdown files with Dataview-compatible metadata.

## 🚀 Setup

### 1. The Bridge
The bridge handles writing to your vault.
```bash
cd bridge
npm install
npm start
```
*Note: Ensure `VAULT_PATH` in `server.js` points to your actual Obsidian vault.*

### 2. The Extension
- Open `chrome://extensions`.
- Enable **Developer mode**.
- Click **Load unpacked**.
- Select the `extension/` directory.

## 🛠️ Tech Stack
- Manifest v3 (Vanilla JS)
- Express.js (Node)
- Obsidian / Markdown

## 🛡️ Privacy
This project is designed for **personal use**. Data is stored locally in your vault. No data is sent to external servers unless you explicitly configure a remote sync.
