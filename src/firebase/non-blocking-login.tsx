'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate social media sign-in (non-blocking). */
export async function initiateSocialSignIn(authInstance: Auth, providerId: 'google.com') {
  let provider;
  switch (providerId) {
    case 'google.com':
      provider = new GoogleAuthProvider();
      break;
    default:
      throw new Error('Unsupported social provider');
  }
  return signInWithPopup(authInstance, provider);
}
