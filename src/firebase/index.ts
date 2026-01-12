
'use client';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import { firebaseConfig } from './config';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

// Providers
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';

// Hooks
export { useUser, useCollection, useDoc };

function initializeFirebase(config: FirebaseOptions) {
  if (getApps().length) {
    return getApp();
  }

  const app = initializeApp(config);

  if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
    
    try {
      const firestore = getFirestore(app);
      connectFirestoreEmulator(firestore, host, 8080);
    } catch (e) {
      console.error('Could not connect to firestore emulator');
    }
    
    try {
      const auth = getAuth(app);
      connectAuthEmulator(auth, `http://${host}:9099`);
    } catch (e) {
      console.error('Could not connect to auth emulator');
    }
  }

  return app;
}

export function getFirebase() {
  const app = initializeFirebase(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
