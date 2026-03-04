import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlMsTDl731iaAc-1ms_jS22d-TV_Ted1M",
  authDomain: "regenx-f1133.firebaseapp.com",
  projectId: "regenx-f1133",
  storageBucket: "regenx-f1133.firebasestorage.app",
  messagingSenderId: "1056638149366",
  appId: "1:1056638149366:web:d13902458cb050e47902d7",
  measurementId: "G-7HF2GN4DKC",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, googleProvider, db };
