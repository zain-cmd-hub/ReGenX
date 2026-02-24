import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6I6ixbviQwK0o-_q1gAJOBAykSHdmndo",
  authDomain: "tscem-bdaaa.firebaseapp.com",
  projectId: "tscem-bdaaa",
  storageBucket: "tscem-bdaaa.firebasestorage.app",
  messagingSenderId: "762520161822",
  appId: "1:762520161822:web:6d4cd3d6bb7f6ef6f3280f",
  measurementId: "G-Y19P4Y13LP",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, googleProvider, db };
