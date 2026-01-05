import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Admin, UserRole, Staff, StaffRole } from '@/types';
import { verifyStaffLogin } from '@/lib/staffAuth';

type AuthType = 'admin' | 'staff' | null;

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  staff: Staff | null;
  authType: AuthType;
  loading: boolean;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signInStaff: (email: string, staffId: string, role: StaffRole) => Promise<Staff>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasStaffRole: (roles: StaffRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [authType, setAuthType] = useState<AuthType>(null);
  const [loading, setLoading] = useState(true);
  const hasStaffSessionRef = useRef(false);

  useEffect(() => {
    // Check for staff session in localStorage
    const storedStaff = localStorage.getItem('staff_session');
    if (storedStaff) {
      try {
        const parsedStaff = JSON.parse(storedStaff);
        setStaff(parsedStaff);
        setAuthType('staff');
        hasStaffSessionRef.current = true;

        // Ensure Firestore can read under "authenticated-only" rules
        if (!auth.currentUser) {
          signInAnonymously(auth).catch((e) => {
            console.warn('Anonymous auth failed (staff session will have limited access):', e);
          });
        }
      } catch (e) {
        localStorage.removeItem('staff_session');
        hasStaffSessionRef.current = false;
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch admin data from Firestore
        getDoc(doc(db, 'admins', firebaseUser.uid))
          .then((adminDoc) => {
            if (adminDoc.exists()) {
              setAdmin(adminDoc.data() as Admin);
              setAuthType('admin');
            } else {
              setAdmin(null);
            }
          })
          .catch((error) => {
            console.error('Error fetching admin data:', error);
            setAdmin(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setAdmin(null);
        if (!hasStaffSessionRef.current) {
          setAuthType(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAdmin = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if admin document exists, if not create one for super admin
    const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
    if (!adminDoc.exists()) {
      // Create admin document for this user
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        role: 'super_admin',
        createdAt: new Date(),
      });
      
      setAdmin({
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        role: 'super_admin',
        createdAt: new Date(),
      });
      setAuthType('admin');
    }
  };

  const signInStaff = async (email: string, staffId: string, role: StaffRole): Promise<Staff> => {
    const verifiedStaff = await verifyStaffLogin(email, staffId);

    if (!verifiedStaff) {
      throw new Error('Invalid email or staff ID. Please ensure a staff account has been created for you by an admin.');
    }

    if (verifiedStaff.role !== role) {
      throw new Error(`This account is registered as ${verifiedStaff.role === 'registrar' ? 'Registrar' : 'Cafe Service'}, not ${role === 'registrar' ? 'Registrar' : 'Cafe Service'}.`);
    }

    // Ensure Firestore can read under "authenticated-only" rules
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (e: any) {
        // If anonymous auth is disabled in Firebase console, staff can still log in but data may not load
        if (e?.code === 'auth/operation-not-allowed') {
          throw new Error('Staff login works, but data access is blocked. Enable Anonymous Authentication in Firebase console (Authentication → Sign-in method).');
        }
      }
    }

    // Store in localStorage for persistence
    localStorage.setItem('staff_session', JSON.stringify(verifiedStaff));
    hasStaffSessionRef.current = true;
    setStaff(verifiedStaff);
    setAuthType('staff');

    return verifiedStaff;
  };

  const signOut = async () => {
    // Sign out Firebase user (admin or anonymous)
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }

    localStorage.removeItem('staff_session');
    hasStaffSessionRef.current = false;

    setAdmin(null);
    setStaff(null);
    setAuthType(null);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!admin) return false;
    return roles.includes(admin.role);
  };

  const hasStaffRole = (roles: StaffRole[]): boolean => {
    if (!staff) return false;
    return roles.includes(staff.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      admin, 
      staff,
      authType,
      loading, 
      signInAdmin,
      signInStaff,
      signOut, 
      hasRole,
      hasStaffRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
