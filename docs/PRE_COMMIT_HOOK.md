# Pre-Commit Hook

## Overview

A pre-commit Git hook has been set up to automatically run tests before each commit. This ensures that broken code cannot be committed to the repository.

## How It Works

When you run `git commit`, the hook will:

1. **Automatically run tests** using `npm run test:run`
2. **Block the commit** if any tests fail
3. **Allow the commit** if all tests pass

## What Happens

### ✅ If Tests Pass
```
🧪 Running tests before commit...

✓ All tests passed! Proceeding with commit...
```

The commit proceeds normally.

### ❌ If Tests Fail
```
🧪 Running tests before commit...

❌ Tests failed! Commit aborted.

Please fix the failing tests before committing.
You can run 'npm test' to see detailed output in watch mode.
```

The commit is blocked, and you'll need to fix the failing tests before committing.

## Bypassing the Hook (Not Recommended)

If you absolutely need to commit without running tests (e.g., for a WIP commit), you can bypass the hook:

```bash
git commit --no-verify -m "Your commit message"
```

**Warning**: Only use `--no-verify` when absolutely necessary. It defeats the purpose of the hook and can allow broken code into the repository.

## Running Tests Manually

You can always run tests manually:

```bash
# Watch mode (runs on file changes)
npm test

# One-time run
npm run test:run

# With coverage
npm run test:coverage

# With UI
npm run test:ui
```

## Troubleshooting

### Hook Not Running

If the hook doesn't run when you commit:

1. **Check if it's executable:**
   ```bash
   ls -l .git/hooks/pre-commit
   ```
   Should show `-rwxr-xr-x` (executable)

2. **Make it executable:**
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

### Tests Taking Too Long

If tests are taking too long and you want to commit quickly:

1. **Fix the slow tests** - Consider optimizing them
2. **Use `--no-verify`** - Only as a last resort for WIP commits
3. **Run tests in watch mode** - Use `npm test` in a separate terminal to catch issues early

## Customization

To modify the hook, edit `.git/hooks/pre-commit`. You can:

- Add linting: `npm run lint`
- Add type checking: `npm run type-check`
- Add formatting checks: `npm run format:check`
- Change test command: Modify `npm run test:run` to your preferred command

## Benefits

✅ **Prevents broken code** from being committed  
✅ **Catches issues early** before they reach the repository  
✅ **Maintains code quality** automatically  
✅ **No manual steps** - runs automatically on every commit  

---

**Note**: The hook is stored in `.git/hooks/` which is not tracked by Git. If you clone the repository, you'll need to set up the hook again. Consider using a tool like [Husky](https://typicode.github.io/husky/) if you want hooks to be version-controlled.
