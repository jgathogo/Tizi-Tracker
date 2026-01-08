/**
 * Firebase Configuration
 * 
 * This file initializes Firebase services for authentication and Firestore.
 * 
 * To set up Firebase:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Google Sign-In and Email/Password)
 * 3. Create a Firestore database
 * 4. Copy your config from Project Settings → General → Your apps
 * 5. Add the config values to your environment variables or replace the placeholder values below
 * 
 * For production, use environment variables:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
// IMPORTANT: Use environment variables - never commit real credentials to version control!
// Create a .env file in the project root with your Firebase config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
  // Note: measurementId is for Analytics, which we don't need for cloud sync
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Check if Firebase config is valid (all required values are present)
const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.storageBucket && 
         firebaseConfig.messagingSenderId && 
         firebaseConfig.appId);
};

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Cloud sync will be disabled.');
  console.warn('   To enable cloud sync, configure Firebase in services/firebaseConfig.ts');
}

export { app, auth, db, isFirebaseConfigured };

