#!/bin/bash

# Script to post research comment to GitHub Issue #1 and close it

echo "📝 Posting research comment to GitHub Issue #1..."
echo ""

# Check if authenticated
if ! gh auth status &>/dev/null; then
    echo "⚠️  GitHub CLI not authenticated."
    echo ""
    echo "Please run: gh auth login"
    echo "Then run this script again."
    echo ""
    echo "Alternatively, you can manually:"
    echo "1. Go to: https://github.com/jgathogo/Tizi-Tracker/issues/1"
    echo "2. Copy the content from GITHUB_COMMENT.md"
    echo "3. Paste it as a comment"
    echo "4. Close the issue"
    exit 1
fi

# Post comment
echo "Posting comment..."
gh issue comment 1 --body-file GITHUB_COMMENT.md

if [ $? -eq 0 ]; then
    echo "✅ Comment posted successfully!"
    echo ""
    echo "Closing issue..."
    gh issue close 1 --comment "Closing for now. Will reopen when we convert to hybrid app (React Native/Flutter). See comment above for full research and plan."
    
    if [ $? -eq 0 ]; then
        echo "✅ Issue closed successfully!"
        echo ""
        echo "View issue: https://github.com/jgathogo/Tizi-Tracker/issues/1"
    else
        echo "⚠️  Failed to close issue. You may need to close it manually."
    fi
else
    echo "❌ Failed to post comment. Please post manually."
    echo ""
    echo "Content is in: GITHUB_COMMENT.md"
fi

