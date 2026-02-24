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

## 🚀 Phase 2: Visual Indicators & Interaction
Goal: Surface saved context back onto Twitter with minimal interface.
- [x] Inject an emoji next to handles that have an existing file in the vault.
- [x] Color-code handles based on `category`.
- [ ] **Minimal Interface (Bookmark Style):**
    - [ ] Add a "Quick Menu" or +/- buttons directly in the tweet UI.
    - [ ] **Category Buttons:** Simple buttons for [Funny/Sweet, Racist, Tech, Useful].
    - [ ] **Aggregation:** Implement logic to derive a "Minimal Representation" (e.g., a specific emoji combination) based on the sum of these interactions.
    - [ ] **Manual Override:** Ensure categories can still be manually changed.

## 🚀 Phase 3: Mobile & Cloud (Future)
- Transition local bridge to a serverless function/database.
- **Phone Integration:** Research ways to run this on mobile browsers (Kiwi/Orion) or via a share sheet shortcut.
