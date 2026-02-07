import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Derived for backward compatibility (ProtectedRoute, etc.)
  const userRole = userProfile?.role ?? null;

  // Sign up new user with role
  async function signup(email, password, role, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role,
      username: username,
      points: 0,
      complaintsRaised: 0,
      createdAt: new Date().toISOString()
    });

    return user;
  }

  // Sign in: return immediately after Firebase Auth (no Firestore await)
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setProfileLoading(false);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(false);
      setProfileLoading(true);

      // Background sync: fetch profile without blocking auth
      getDoc(doc(db, 'users', user.uid))
        .then((snap) => {
          if (snap.exists()) {
            setUserProfile({ id: snap.id, ...snap.data() });
          } else {
            setUserProfile(null);
          }
        })
        .catch(() => setUserProfile(null))
        .finally(() => setProfileLoading(false));
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userProfile,
    authLoading,
    profileLoading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
}
