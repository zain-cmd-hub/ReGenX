import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "users";

/**
 * Create a new user profile in Firestore.
 * Called once on signup (email/password or Google first-time).
 * Uses setDoc with merge:true so it's safe to call even if doc already exists.
 */
export async function createUserProfile(uid, { name, email, photo = "" }) {
  const ref = doc(db, COLLECTION, uid);
  await setDoc(
    ref,
    {
      uid,
      name: name || "",
      email: email || "",
      photo: photo || "",
      phone: "",
      address: "",
      about: "",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Fetch user profile document from Firestore.
 * Returns plain object or null if not found.
 */
export async function getUserProfile(uid) {
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Update specific fields of user profile in Firestore.
 * Also updates the updatedAt timestamp.
 */
export async function updateUserProfile(uid, data) {
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
