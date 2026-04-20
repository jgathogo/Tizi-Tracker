/**
 * Sign in / sign up against the self-hosted Tizi API (email + password).
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  isAuthAvailable,
} from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  if (!isAuthAvailable()) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
        <div className="bg-base-200 rounded-2xl w-full max-w-md p-6 border border-base-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-base-content">Cloud sync not configured</h2>
            <button
              onClick={onClose}
              className="text-base-content/60 hover:text-base-content transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-base-content/80 mb-4">
            Set <code className="bg-base-300 px-2 py-1 rounded">VITE_TIZI_API_URL</code> when building
            (for example <code className="bg-base-300 px-2 py-1 rounded">https://tizi.gathogo.co.ke/api/v1</code>).
          </p>
          <button
            onClick={onClose}
            className="w-full btn btn-primary py-2 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleEmailAuth = async () => {
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onAuthSuccess();
      onClose();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-base-200 rounded-2xl w-full max-w-md p-6 border border-base-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-base-content">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            className="text-base-content/60 hover:text-base-content transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-error/15 border border-error/40 text-error px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content/80 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2 bg-base-300/50 border border-base-300 rounded-lg text-base-content placeholder-base-content/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content/80 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-base-300/50 border border-base-300 rounded-lg text-base-content placeholder-base-content/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-base-content/80 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-base-300/50 border border-base-300 rounded-lg text-base-content placeholder-base-content/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full btn btn-primary py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-content border-t-transparent rounded-full animate-spin"></div>
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              <>
                <UserIcon size={18} />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-sm text-info hover:text-info/80 underline-offset-2 hover:underline transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-base-300">
          <p className="text-xs text-base-content/60 text-center">
            Workout data is stored on your Tizi server when you are signed in. This device keeps a
            session token in the browser.
          </p>
        </div>
      </div>
    </div>
  );
};
