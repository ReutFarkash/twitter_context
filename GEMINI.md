# Twitter Context: Person Relationship Manager

## 🎯 Vision
A lightweight tool to capture and surface context about individuals on Twitter (and later, the broader web) to improve memory and interaction quality. Focus on high-speed cataloging of "reasons to remember" (both positive and negative).

## 🏗️ Architecture
- **Frontend:** Browser Extension (Chrome/Firefox) for UI injection (buttons/emojis).
- **Storage:** Local file system (via a small local bridge/API) and Obsidian Vault integration.
- **Vault:** `data_vault/03/Twitter_Context/` for persistent person profiles.

## 🛡️ Privacy & Safety
- **Strictly Local:** Initial development is local-only. No data sent to external servers unless explicitly configured.
- **Entity Linking:** Uses WikiLinks `[[Person Name]]` to connect contexts within the Assistant vault.

## 🔄 Workflow
1.  **Capture:** Click a button/icon on a Twitter post.
2.  **Catalog:** Extract username, display name, tweet content, and timestamp.
3.  **Contextualize:** Create or update a note in the vault for that person.
4.  **Surface:** Show visual indicators (emojis) on future interactions with that user.

## 📜 Documentation
- **`meta/PROJECT_STATUS.md`**: Current state.
- **`meta/PROJECT_TODO.md`**: Tasks and ideas.
- **`meta/PLANNING.md`**: Technical architecture and research.
- **`meta/SESSION_FLIGHT_RECORDER.md`**: Turn-by-turn log.
