import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAY9ePS60M8CJAbv6-Q1u7Xid6bPoyVMqU",
  authDomain: "lado-b-2ae0d.firebaseapp.com",
  projectId: "lado-b-2ae0d",
  storageBucket: "lado-b-2ae0d.firebasestorage.app",
  messagingSenderId: "703715001403",
  appId: "1:703715001403:web:5e45ba2fad6395cbc8881e",
  measurementId: "G-WE70ZC09W3",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
