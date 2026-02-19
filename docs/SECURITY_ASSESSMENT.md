# Security Assessment – Public GitHub Repository

**Date:** February 19, 2026  
**Scope:** Tizi-Tracker public repo (secrets, PII/PHI, and safe practices).

---

## Summary

| Severity | Finding | Status |
|----------|---------|--------|
| **Critical** | Personal health data (CSV) tracked in git | Fixed – untracked + .gitignore |
| **Critical** | PII/CV dump (ChromaDB export) tracked in git | Fixed – untracked + .gitignore |
| **OK** | `.env` / API keys not in repo or history | No change needed |
| **OK** | No hardcoded secrets in source | No change needed |
| **Recommendation** | Harden .gitignore for future data exports | Done |

---

## 1. Critical: Sensitive files tracked in git

### 1.1 Personal health data (PHI)

- **File:** `Blood pressure readings for James - 2026.csv`
- **Risk:** Blood pressure, pulse, dates, and notes are personal health information. In a public repo this can be used to identify and profile you and is sensitive under privacy norms (and in some jurisdictions, health regulations).
- **Action taken:** File removed from git tracking (still on disk). `*.csv` and a comment added to `.gitignore` so future exports are not committed.

### 1.2 PII / CV dump (ChromaDB export)

- **File:** `agra_chroma_dump_20260218_113010.md`
- **Risk:** Contains full PII: full name, email, phone number, LinkedIn URL, detailed CV, employers, project history, and other people’s emails. Ideal for identity/social engineering if left public.
- **Action taken:** File removed from git tracking (still on disk). Pattern for chroma dumps added to `.gitignore`.

---

## 2. What’s already safe

- **`.env`** – Listed in `.gitignore` and **not** tracked. No `.env` in git history. Your Firebase and Gemini/Google API keys exist only in your local `.env` and are not in the public repo.
- **No API keys in source** – Firebase config uses `import.meta.env.VITE_*`; Gemini uses `process.env` via Vite `define` from env. No hardcoded keys in committed code.
- **No secrets in git history** – Search for key patterns in history found no matches.
- **`dist/`** – Ignored; build output is not committed.
- **Scripts** – `run-dev.sh`, `post_issue_comment.sh` do not contain secrets; they reference env or `gh` auth.

---

## 3. Recommendations

1. **Rotate API keys if you’re unsure**  
   If `.env` was ever committed in the past (e.g. before it was in `.gitignore`), rotate:
   - Firebase project: Project settings → regenerate/check API key and config.
   - Google Cloud: APIs & Services → Credentials → regenerate any key used for Gemini/this app.

2. **Keep `.env` out of commits**  
   `.env` is ignored; avoid `git add -f .env` or committing it from another branch.

3. **Production builds**  
   Vite inlines `process.env.GEMINI_API_KEY` at build time. Never upload build artifacts that were built with real keys to public storage; use CI secrets and build in a private environment.

4. **Personal data**  
   Don’t commit:
   - Health exports (CSV, etc.)
   - Database/dump exports that contain PII (e.g. `*chroma*dump*.md`)

5. **Optional: pre-commit check**  
   You already have a pre-commit hook; consider adding a check that blocks committing filenames like `*chroma*dump*` or `*blood*pressure*.csv` if you generate them in-repo.

---

## 4. Changes made in this assessment

- **`.gitignore`**  
  - Ignore `*.csv` (to avoid committing health or other data exports).  
  - Ignore `*chroma*dump*.md` (and similar) so ChromaDB exports stay local.
- **Git**  
  - `git rm --cached` for:
    - `Blood pressure readings for James - 2026.csv`
    - `agra_chroma_dump_20260218_113010.md`  
  So they are no longer tracked; files remain on your machine.

After you commit and push these changes, the sensitive files will no longer be in the public repo. They will still exist in past commits (history). If you need to purge them from history, use `git filter-repo` or BFG and then force-push; that rewrites history and anyone with a clone would need to re-clone.
