'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export async function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return await firebaseSignInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return await firebaseCreateUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return await firebaseSignInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in using a popup. */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(authInstance, provider);
}

    