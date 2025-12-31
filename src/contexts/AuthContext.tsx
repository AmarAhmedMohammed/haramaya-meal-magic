import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
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

  useEffect(() => {
    // Check for staff session in localStorage
    const storedStaff = localStorage.getItem('staff_session');
    if (storedStaff) {
      try {
        const parsedStaff = JSON.parse(storedStaff);
        setStaff(parsedStaff);
        setAuthType('staff');
      } catch (e) {
        localStorage.removeItem('staff_session');
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
        if (!staff) {
          setAuthType(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAdmin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInStaff = async (email: string, staffId: string, role: StaffRole): Promise<Staff> => {
    const verifiedStaff = await verifyStaffLogin(email, staffId);
    
    if (!verifiedStaff) {
      throw new Error('Invalid email or staff ID');
    }
    
    if (verifiedStaff.role !== role) {
      throw new Error(`This account is not registered as ${role === 'registrar' ? 'a Registrar' : 'Cafe Service'}`);
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('staff_session', JSON.stringify(verifiedStaff));
    setStaff(verifiedStaff);
    setAuthType('staff');
    
    return verifiedStaff;
  };

  const signOut = async () => {
    if (authType === 'admin') {
      await firebaseSignOut(auth);
      setAdmin(null);
    }
    
    if (authType === 'staff' || staff) {
      localStorage.removeItem('staff_session');
      setStaff(null);
    }
    
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
