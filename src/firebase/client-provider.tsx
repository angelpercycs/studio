'use client';

import { getFirebase } from '.';
import { FirebaseProvider } from './provider';

// This provider is used to initialize Firebase on the client side
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, firestore } = getFirebase();

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
