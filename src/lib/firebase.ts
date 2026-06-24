import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCF2pRgjGGcSHGT8UxAWhqhxdeK78TDGx0",
  authDomain: "impressive-oxygen-bqvh5.firebaseapp.com",
  projectId: "impressive-oxygen-bqvh5",
  storageBucket: "impressive-oxygen-bqvh5.firebasestorage.app",
  messagingSenderId: "130757806526",
  appId: "1:130757806526:web:e0da34820e10bd49e291ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
