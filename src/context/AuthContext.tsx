"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "admin" | "user" | null;

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  mobile?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isUser: boolean;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  registerUser: (name: string, email: string, pass: string, mobile?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
  isUser: false,
  token: null,
  loading: true,
  login: async () => ({ success: false }),
  registerUser: async () => ({ success: false }),
  logout: async () => {},
  refreshToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine user role from custom claim or Firestore user profile
  const fetchUserRole = async (currentUser: User): Promise<UserRole> => {
    try {
      // 1. Check custom claim on ID Token
      const tokenResult = await getIdTokenResult(currentUser, true);
      setToken(tokenResult.token);

      if (tokenResult.claims.admin === true || tokenResult.claims.role === "admin") {
        return "admin";
      }

      // Check if email matches configured admin email
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@itacademy.com";
      const allowedAdmins = [adminEmail.toLowerCase(), "admin@itacademy.com", "ansarisaifuddin732@gmail.com"];
      if (currentUser.email && allowedAdmins.includes(currentUser.email.toLowerCase())) {
        return "admin";
      }

      // 2. Check Firestore /admins or /users collection
      try {
        const adminDocRef = doc(db, "admins", currentUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists() && adminDoc.data()?.active !== false) {
          return "admin";
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userRole = userDoc.data()?.role;
          if (userRole === "admin") return "admin";
          return "user";
        }
      } catch (fsErr) {
        console.warn("Firestore role lookup skipped/restricted:", fsErr);
      }

      // Default to "user" for authenticated accounts
      return "user";
    } catch (err) {
      console.error("Error determining user role:", err);
      return "user";
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRole(null);
        setToken(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      const resolvedRole = await fetchUserRole(currentUser);
      setRole(resolvedRole);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const userRole = await fetchUserRole(credential.user);

      setUser(credential.user);
      setRole(userRole);

      return { success: true, role: userRole };
    } catch (err: any) {
      console.error("[Login Error]", err);
      let errMsg = "Invalid email or password.";
      if (err.code === "auth/user-not-found") errMsg = "No account found with this email.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") errMsg = "Incorrect credentials.";
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, pass: string, mobile?: string) => {
    try {
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);

      // Set display name in Firebase Auth
      await updateProfile(credential.user, {
        displayName: name,
      });

      // Save user record in Firestore
      try {
        await setDoc(doc(db, "users", credential.user.uid), {
          uid: credential.user.uid,
          fullName: name,
          email: email.trim(),
          mobile: mobile || "",
          role: "user",
          createdAt: serverTimestamp(),
        });
      } catch (fsErr) {
        console.warn("Firestore user record save warning:", fsErr);
      }

      const userRole: UserRole = "user";
      setUser(credential.user);
      setRole(userRole);

      const t = await credential.user.getIdToken(true);
      setToken(t);

      return { success: true };
    } catch (err: any) {
      console.error("[Register Error]", err);
      let errMsg = "Registration failed.";
      if (err.code === "auth/email-already-in-use") errMsg = "This email is already registered. Please sign in.";
      if (err.code === "auth/weak-password") errMsg = "Password should be at least 6 characters.";
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const refreshToken = async () => {
    if (auth.currentUser) {
      const t = await auth.currentUser.getIdToken(true);
      setToken(t);
      return t;
    }
    return null;
  };

  const isAdmin = role === "admin";
  const isUser = role === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isUser,
        token,
        loading,
        login,
        registerUser,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
