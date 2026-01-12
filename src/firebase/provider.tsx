'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

type FirebaseProviderProps = {
  children: React.ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function FirebaseProvider({
  children,
  app,
  auth,
  firestore,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }

  return context;
};

export const useFirebaseApp = () => {
  const context = useFirebase();

  if (!context?.app) {
    throw new Error('Firebase app not available in context');
  }

  return context.app;
};

export const useAuth = () => {
  const context = useFirebase();

  if (!context?.auth) {
    throw new Error('Firebase Auth not available in context');
  }

  return context.auth;
};

export const useFirestore = () => {
  const context = useFirebase();

  if (!context?.firestore) {
    throw new Error('Firestore not available in context');
  }

  return context.firestore;
};
