import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { UserProfile } from "../types";
import { deduplicateProfiles } from "../data/defaultProfiles";

const USERS_COLLECTION = "users";

/**
 * Fetch all user profiles stored in Firestore.
 * Requires an authenticated Firebase user per security rules.
 */
export async function fetchUsersFromFirestore(): Promise<UserProfile[]> {
  if (!auth.currentUser) {
    return [];
  }
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: UserProfile[] = [];
    querySnapshot.forEach((document) => {
      const data = document.data() as UserProfile;
      if (data && data.id) {
        users.push({ ...data, id: document.id });
      }
    });
    return deduplicateProfiles(users);
  } catch (error) {
    console.warn("Could not fetch users from Firestore (falling back to local cache):", error);
    try {
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    } catch {
      // Return empty array to fall back to local profiles
    }
    return [];
  }
}

/**
 * Save or update a user profile in Firestore.
 * Only attempts remote synchronization when an authenticated Firebase session is active.
 */
export async function saveUserToFirestore(user: UserProfile): Promise<boolean> {
  if (!auth.currentUser) {
    // Unauthenticated: Keep data safely in local storage without triggering permission errors
    return false;
  }
  const path = `${USERS_COLLECTION}/${user.id}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    // Sanitize payload to avoid undefined values which Firestore disallows
    const cleanUser = JSON.parse(JSON.stringify(user));
    await setDoc(userRef, cleanUser, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to save user ${user.id} to Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Allow caller to proceed with local state if network or auth error occurs
    }
    return false;
  }
}

/**
 * Delete a user profile from Firestore.
 */
export async function deleteUserFromFirestore(userId: string): Promise<boolean> {
  if (!auth.currentUser) {
    return false;
  }
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.error(`Failed to delete user ${userId} from Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch {
      // Allow caller to proceed with local state
    }
    return false;
  }
}

/**
 * Seed default user profiles into Firestore if the database collection is empty.
 * Requires an active authenticated user with admin privileges.
 */
export async function seedInitialUsersIfEmpty(defaultProfiles: UserProfile[]): Promise<void> {
  if (!auth.currentUser) {
    // Seeding is deferred until an authorized user is signed in
    return;
  }
  try {
    const existing = await fetchUsersFromFirestore();
    if (existing.length === 0 && defaultProfiles.length > 0) {
      console.log("Seeding initial user database in Firestore for authorized user...");
      for (const profile of defaultProfiles) {
        await saveUserToFirestore(profile);
      }
      console.log("Initial user database seeded successfully.");
    }
  } catch (error) {
    console.warn("Seeding user database deferred or encountered error:", error);
  }
}

/**
 * Real-time listener for user updates from Firestore.
 * Strictly adheres to rule: only attach onSnapshot if user is authenticated.
 */
export function subscribeToUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data && data.id) {
          users.push({ ...data, id: docSnap.id });
        }
      });
      if (users.length > 0) {
        onUpdate(deduplicateProfiles(users));
      }
    },
    (error) => {
      console.warn("Firestore user subscription notice:", error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
      } catch {
        // Handled
      }
    }
  );
}
