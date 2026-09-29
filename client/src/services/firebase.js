import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB30D8ONcxWZSWseDbnBGvhIUZeIRSjvgY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vkdryclean-bdc28.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vkdryclean-bdc28',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vkdryclean-bdc28.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '716068283161',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:716068283161:web:8854dc710de93005269b88',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

const app = isFirebaseConfigured
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]
  : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

export const firebaseLogin = async (email, password) => {
  if (!auth) throw new Error('Firebase is not configured yet in .env');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const firebaseSignup = async (email, password) => {
  if (!auth) throw new Error('Firebase is not configured yet in .env');
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const firebaseGoogleLogin = async () => {
  if (!auth) throw new Error('Firebase is not configured yet in .env');
  return await signInWithPopup(auth, googleProvider);
};

export const firebaseLogout = async () => {
  if (auth) await signOut(auth);
};

export const firebaseResetPassword = async (email) => {
  if (!auth) throw new Error('Firebase is not configured yet in .env');
  return await sendPasswordResetEmail(auth, email);
};
