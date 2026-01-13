'use client';

import { useFirebase } from '@/firebase/provider';
import { Auth, FirebaseApp, Firestore, User } from 'firebase/app';


/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebaseServices = (): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
} => {
  const { firebaseApp, firestore, auth, user, isUserLoading, userError } = useFirebase();
  return { firebaseApp, firestore, auth, user, isUserLoading, userError };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): {
    user: User | null;
    isUserLoading: boolean;
    userError: Error | null;
} => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
