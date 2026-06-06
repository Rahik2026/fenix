"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && db) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          const p: UserProfile = {
            uid: u.uid,
            email: u.email || "",
            name: u.displayName || "",
            wishlist: [],
            createdAt: new Date().toISOString(),
          };
          await setDoc(ref, p);
          setProfile(p);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured.");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (!auth || !db) throw new Error("Firebase not configured.");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const p: UserProfile = {
        uid: cred.user.uid,
        email,
        name,
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", cred.user.uid), p);
      setProfile(p);
    },
    []
  );

  const signOut = useCallback(async () => {
    if (auth) await fbSignOut(auth);
  }, []);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user || !db || !profile) return;
      const next = profile.wishlist.includes(productId)
        ? profile.wishlist.filter((id) => id !== productId)
        : [...profile.wishlist, productId];
      setProfile({ ...profile, wishlist: next });
      await updateDoc(doc(db, "users", user.uid), { wishlist: next });
    },
    [user, profile]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: isAdminEmail(user?.email),
        loading,
        configured: isFirebaseConfigured,
        signIn,
        signUp,
        signOut,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
