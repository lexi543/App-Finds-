import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile as authUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  bio: string;
  avatar: string; // Emoji representing avatar
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, phone: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AVATARS = ['🦁', '🐆', '🐘', '🦏', '🦅', '🦓', '🦒', '🦒', '🦩', '🦊', '🐻', '🐼', '🐨'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create user profile in Firestore
  const fetchProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial profile if it doesn't exist
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          phone: '',
          bio: 'Ticketing user on TIKETI ● KE',
          avatar: randomAvatar,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, phone: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update firebase display name
      await authUpdateProfile(firebaseUser, { displayName });
      
      // Create user profile in Firestore
      const docRef = doc(db, 'users', firebaseUser.uid);
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        phone,
        bio: 'Ticketing user on TIKETI ● KE',
        avatar: randomAvatar,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => {
    if (!user) throw new Error('Not authenticated');
    
    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, data);
    
    if (data.displayName) {
      await authUpdateProfile(user, { displayName: data.displayName });
    }
    
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      logIn,
      logOut,
      resetPassword,
      updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
