# Project Tasks & Tasks

## 🎯 Sprint 1: Environment & Scaffolding
- [x] Initialize Git repository.
- [x] Create `meta/` directory structure.
- [x] Define `GEMINI.md` vision.
- [x] Set up `SESSION_CONFIG.md`.
- [x] **Create Extension Scaffold:**
    - [x] `manifest.json` (v3).
    - [x] `content.js`.
    - [x] `background.js`.
- [x] **Create Local Bridge Scaffold:**
    - [x] Simple Express server.

## 🎯 Sprint 2: Capture Loop
- [x] Identify tweet container selectors.
- [x] Extract username, handle, and text via script.
- [x] Implement button injection logic.
- [x] Bypass CORS via background relay.

## 🎯 Sprint 3: Visual Indicators
- [x] Implement `GET /check/:handle` in bridge.
- [x] Implement handle scanning in extension.
- [x] Inject emoji badges (🔴🟢🟡) next to usernames.

## 💡 Ideas
- [ ] Use `nativeMessaging` for more robust local file access from the extension.
- [ ] Integration with Raycast for quick lookup.
- [ ] "Red Flag" list sharing (opt-in).
