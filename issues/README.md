# Issue Tracking Workflow

Issues are tracked on [GitHub Issues](https://github.com/jgathogo/Tizi-Tracker/issues).
This folder stores local markdown files used for posting implementation comments and close summaries.

## Working with Issues (CLI — works for private repos too)

The `gh` CLI authenticates with your GitHub account, so it works regardless of whether the repo is public or private. No browser needed.

### Viewing issues

```bash
# List all open issues
gh issue list

# List open bugs only
gh issue list --label bug

# List open feature requests
gh issue list --label enhancement

# View a specific issue
gh issue view 35

# Open an issue in the browser
gh issue view 35 --web
```

### Creating issues

```bash
# Interactive creation (prompts for title, body, labels)
gh issue create

# One-liner
gh issue create --title "[BUG] Button not clickable" --label bug

# From a markdown file
gh issue create --title "[BUG] Button overlap" --body-file issues/my_issue.md --label bug
```

### Commenting on issues

```bash
# Post a close/implementation comment from a local file
gh issue comment 35 --body-file issues/ISSUE_35_CLOSE_COMMENT.md

# Quick inline comment
gh issue comment 35 --body "Fixed in commit abc123"
```

### Closing issues

```bash
# Close with a comment
gh issue close 35 --comment "Fixed in PR #42"

# Close via commit message (auto-closes when merged)
git commit -m "Fix button overlap. Fixes #35"
```

## Workflow: Issue to Fix to Close

```
1. Issue created on GitHub (or via `gh issue create`)
       ↓
2. Create a branch:      git checkout -b fix/35-button-overlap
       ↓
3. Make code changes
       ↓
4. Commit referencing issue:  git commit -m "Fix button covered by nav. Fixes #35"
       ↓
5. Push & create PR:     git push -u origin HEAD && gh pr create
       ↓
6. (Optional) Write close comment:  issues/ISSUE_35_CLOSE_COMMENT.md
       ↓
7. Merge PR → Issue #35 auto-closes
```

## File Naming Convention

| File Pattern | Purpose |
|---|---|
| `ISSUE_N_CLOSE_COMMENT.md` | Summary posted when closing an issue |
| `ISSUE_N_IMPLEMENTATION_COMMENT.md` | Technical details of the implementation |
| `ISSUE_N_UPDATE.md` | Progress update or follow-up |
| `ISSUE_N_FIX_COMMENT.md` | Description of a bug fix |

## Why Keep Local Files?

- **Offline reference**: Browse past solutions without needing GitHub access
- **Reusable patterns**: Copy resolution approaches from similar past issues
- **AI-friendly**: Cursor/Codex can read these files to understand past decisions
- **Private repo safe**: Works even when you can't share the GitHub URL
