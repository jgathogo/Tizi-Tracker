#!/bin/bash

# Script to post update comment to GitHub Issue #29

echo "📝 Posting update comment to GitHub Issue #29..."
echo ""

# Check if authenticated
if ! gh auth status &>/dev/null; then
    echo "⚠️  GitHub CLI not authenticated."
    echo ""
    echo "Please run: gh auth login"
    echo "Then run this script again."
    echo ""
    echo "Alternatively, you can manually:"
    echo "1. Go to: https://github.com/jgathogo/Tizi-Tracker/issues/29"
    echo "2. Copy the content from issues/ISSUE_29_UPDATE.md"
    echo "3. Paste it as a comment"
    echo "4. Keep the issue open (don't close it)"
    exit 1
fi

# Post comment
echo "Posting update comment..."
gh issue comment 29 --body-file issues/ISSUE_29_UPDATE.md

if [ $? -eq 0 ]; then
    echo "✅ Update comment posted successfully!"
    echo ""
    echo "Issue #29 remains open for incremental fixes."
    echo "View issue: https://github.com/jgathogo/Tizi-Tracker/issues/29"
else
    echo "❌ Failed to post comment. Please post manually."
    echo ""
    echo "Content is in: issues/ISSUE_29_UPDATE.md"
fi
