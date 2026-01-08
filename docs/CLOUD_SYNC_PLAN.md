# Cloud Sync Implementation Plan

## Overview

This document outlines the plan for implementing optional cloud synchronization for Tizi Tracker, addressing Issue #17.

## Requirements

1. **Authentication**: Simple sign-in (Google Sign-In or Email/Password)
2. **Cloud Storage**: Sync `UserProfile` data to secure backend
3. **Offline-First**: Maintain current offline capabilities, sync when online
4. **Cost**: Start with free/cheap options

## Technology Choice: Firebase

**Selected: Firebase** (over Supabase)

### Why Firebase?

✅ **Free Tier**:
- 50,000 reads/day
- 20,000 writes/day
- 1GB storage
- Free authentication (unlimited users)

✅ **Easy Integration**:
- Well-documented React SDK
- Simple setup
- Built-in authentication providers
- Real-time sync capabilities

✅ **PWA-Friendly**:
- Works seamlessly with Progressive Web Apps
- Offline persistence built-in
- Background sync support

### Firebase Services Used

1. **Firebase Authentication**
   - Google Sign-In
   - Email/Password authentication
   - Anonymous auth (optional, for seamless experience)

2. **Cloud Firestore**
   - NoSQL database
   - Real-time sync
   - Offline persistence
   - Automatic conflict resolution

## Architecture

### Data Flow

```
┌─────────────────┐
│   User Action   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  localStorage   │ ◄─── Immediate save (offline-first)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sync Service   │ ◄─── Background sync when online
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │ ◄─── Cloud storage
└─────────────────┘
```

### Offline-First Strategy

1. **Always save to localStorage first** (immediate, works offline)
2. **Queue sync operations** when offline
3. **Sync to Firestore** when online (background)
4. **Merge conflicts** using timestamp (last write wins)

## Implementation Steps

### Phase 1: Setup & Configuration
- [x] Create Firebase project
- [ ] Install Firebase SDK
- [ ] Configure Firebase in app
- [ ] Set up environment variables

### Phase 2: Authentication
- [ ] Create Auth UI component
- [ ] Implement Google Sign-In
- [ ] Implement Email/Password auth
- [ ] Add sign-out functionality
- [ ] Handle auth state changes

### Phase 3: Cloud Sync Service
- [ ] Create sync service module
- [ ] Implement save to Firestore
- [ ] Implement load from Firestore
- [ ] Handle offline queue
- [ ] Conflict resolution logic

### Phase 4: Integration
- [ ] Integrate sync into data save/load flow
- [ ] Add sync status indicator
- [ ] Add manual sync button
- [ ] Handle first-time sync (merge local + cloud)

### Phase 5: UI/UX
- [ ] Add auth buttons to Settings
- [ ] Show sync status
- [ ] Add sync settings
- [ ] User onboarding for cloud sync

## Data Structure in Firestore

```
users/{userId}/
  └── profile: {
      currentWeights: {...},
      nextWorkout: 'A' | 'B',
      history: [...],
      unit: 'kg' | 'lb',
      schedule: {...},
      exerciseAttempts: {...},
      repeatCount: {...},
      weightIncrements: {...},
      name: string,
      dateOfBirth: string,
      height: number,
      lastSynced: timestamp
    }
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Cost Estimation

### Free Tier (Spark Plan)
- **50,000 reads/day** - ~1,500 reads/month per user (assuming 3 workouts/week)
- **20,000 writes/day** - ~600 writes/month per user
- **1GB storage** - ~1KB per user profile = 1M users
- **Authentication** - Unlimited users

**Verdict**: Free tier sufficient for thousands of users.

### Paid Tier (Blaze Plan - Pay as you go)
- $0.06 per 100K reads
- $0.18 per 100K writes
- $0.18 per GB storage

**Break-even**: ~10,000 active users before needing paid tier.

## Migration Strategy

### For Existing Users
1. User signs in
2. App detects existing localStorage data
3. Prompt: "Would you like to sync your existing data to the cloud?"
4. If yes: Upload localStorage data to Firestore
5. If no: Continue using localStorage only

### For New Users
1. User signs in (optional)
2. If signed in: Data automatically syncs to cloud
3. If not signed in: Data stored locally only (current behavior)

## Privacy & Security

- ✅ User data encrypted in transit (TLS)
- ✅ User data encrypted at rest (Firestore)
- ✅ Users can only access their own data
- ✅ Optional feature - users can choose not to use it
- ✅ Data can be exported/deleted at any time

## Future Enhancements

1. **Real-time sync** across devices
2. **Backup/restore** from cloud
3. **Data export** to cloud storage (Google Drive, etc.)
4. **Social features** (optional sharing, leaderboards)
5. **Analytics** (aggregated, anonymized)

## Implementation Notes

- Keep localStorage as primary storage (offline-first)
- Firestore as backup/sync layer
- Sync happens in background, doesn't block UI
- Show sync status indicator
- Handle network errors gracefully
- Merge conflicts using timestamps

## Next Steps

1. Set up Firebase project
2. Install dependencies
3. Create auth service
4. Create sync service
5. Integrate into app
6. Test thoroughly
7. Deploy

