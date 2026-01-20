import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBUFe4YUtt0iBxsjXVkENLfqq8u3hypYyk",
  authDomain: "hu-student-meal-card.firebaseapp.com",
  projectId: "hu-student-meal-card",
  storageBucket: "hu-student-meal-card.firebasestorage.app",
  messagingSenderId: "900355275984",
  appId: "1:900355275984:web:bca56fac771b2061ae72d5",
  measurementId: "G-XSR1E808ML"
};

const app = initializeApp(firebaseConfig);

// Secondary app for creating users without affecting the current session
const secondaryApp = initializeApp(firebaseConfig, "secondary");

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
