# 🗺️ Planning: Twitter Context

## 🚀 Phase 1: Local Proof of Concept (The "One-Click" Capture)
Goal: A browser extension that can send tweet data to a local endpoint which creates/updates a Markdown file.

### 🧩 Components
1.  **Content Script:** Injects a "Save Context" button into the Twitter tweet actions menu or next to the username.
2.  **Background Script/Service Worker:** Handles communication with the local bridge.
3.  **Local Bridge (Python or Node):** A simple HTTP server that receives JSON and writes to `/Users/reut/Code/assistant/data_vault/03/Twitter_Context/`.

### 🛠️ Research Items
- [ ] **Twitter DOM Analysis:** Find reliable selectors for username, handle, and tweet text.
- [ ] **Vault Integration:** Best way to append to a Markdown list via script.
- [ ] **Chrome Extension Permissions:** `nativeMessaging` vs. `fetch` to localhost.

## 🚀 Phase 2: Visual Indicators
Goal: Surface saved context back onto Twitter.
- Inject an emoji next to handles that have an existing file in the vault.
- Color-code handles based on `category`.

## 🚀 Phase 3: Cloud & Sync (Future)
- Transition local bridge to a serverless function/database.
- Mobile browser support (Kiwi/Orion) or shortcuts integration.
