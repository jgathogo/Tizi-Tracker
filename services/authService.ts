/**
 * Authentication Service
 * 
 * Handles user authentication using Firebase Auth.
 * Supports Google Sign-In and Email/Password authentication.
 */

import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User,
  Auth
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebaseConfig';

/**
 * Check if Firebase is configured and available
 */
export const isAuthAvailable = (): boolean => {
  return isFirebaseConfigured() && auth !== null;
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  if (!isAuthAvailable() || !auth) {
    throw new Error('Firebase Auth is not configured');
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Signed in with Google:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('❌ Google sign-in error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  if (!isAuthAvailable() || !auth) {
    throw new Error('Firebase Auth is not configured');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed in with email:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('❌ Email sign-in error:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
  if (!isAuthAvailable() || !auth) {
    throw new Error('Firebase Auth is not configured');
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed up with email:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('❌ Email sign-up error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  if (!isAuthAvailable() || !auth) {
    throw new Error('Firebase Auth is not configured');
  }

  try {
    await firebaseSignOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign-out error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  if (!isAuthAvailable() || !auth) {
    return null;
  }
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 * 
 * Args:
 *   callback: Function to call when auth state changes
 * 
 * Returns:
 *   Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  if (!isAuthAvailable() || !auth) {
    // Return no-op unsubscribe if auth not available
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

