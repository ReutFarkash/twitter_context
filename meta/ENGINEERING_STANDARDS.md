# 📜 Engineering Standards (Twitter Context)

*Inherits Assistant Core Standards.*

## 🏗️ 1. Technology Stack
- **Browser Extension:** Manifest v3, Vanilla JS/TS, CSS.
- **Local Bridge:** Node.js (Express) or Python (FastAPI) to write to the vault.
- **Vault Format:** Markdown files with YAML frontmatter.

## 🏷️ 2. Person Note Schema
- **Filename:** `data_vault/03/Twitter_Context/{{username}}.md`
- **Frontmatter:**
    - `display_name`: string
    - `twitter_handle`: string
    - `category`: [Team, Neutral, Red-Flag]
    - `tags`: []
- **Body:**
    - `## 📋 Context Timeline`
    - `- [date:: [[YYYY-MM-DD]]] [event:: text] [link:: url] #twitter-context`

## 🛡️ 3. Safety
- Do not store passwords or session tokens.
- Scrub sensitive metadata from captured HTML if necessary.
