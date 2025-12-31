import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  Timestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Staff, StaffRole, SupportTicket } from '@/types';

// Generate unique staff ID
export function generateStaffId(role: StaffRole): string {
  const prefix = role === 'registrar' ? 'REG' : 'CAF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Create new staff member
export async function createStaff(staffData: Omit<Staff, 'id' | 'staffId' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
  try {
    const staffId = generateStaffId(staffData.role);
    const staffRef = doc(db, 'staff', staffId);
    
    // Check if email already exists
    const existingStaff = await getStaffByEmail(staffData.email);
    if (existingStaff) {
      throw new Error('A staff member with this email already exists');
    }
    
    const newStaff: Omit<Staff, 'id'> = {
      ...staffData,
      staffId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(staffRef, {
      ...newStaff,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return { id: staffId, ...newStaff };
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
}

// Get staff by email
export async function getStaffByEmail(email: string): Promise<Staff | null> {
  try {
    const staffRef = collection(db, 'staff');
    const q = query(staffRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      staffId: data.staffId || doc.id,
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      role: data.role,
      cafeteriaType: data.cafeteriaType,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting staff by email:', error);
    throw error;
  }
}

// Verify staff login (email + staffId)
export async function verifyStaffLogin(email: string, staffId: string): Promise<Staff | null> {
  try {
    // First, try to get staff by email (case-insensitive)
    const staffRef = collection(db, 'staff');
    const q = query(staffRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Also try with original email case
      const q2 = query(staffRef, where('email', '==', email));
      const snapshot2 = await getDocs(q2);
      
      if (snapshot2.empty) {
        console.log('No staff found with email:', email);
        return null;
      }
      
      const doc = snapshot2.docs[0];
      const data = doc.data();
      
      // Verify staffId matches (case-insensitive)
      if (data.staffId?.toUpperCase() !== staffId.toUpperCase()) {
        console.log('Staff ID mismatch. Expected:', data.staffId, 'Got:', staffId);
        return null;
      }
      
      if (!data.isActive) {
        throw new Error('This account has been deactivated');
      }
      
      return {
        id: doc.id,
        staffId: data.staffId || doc.id,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        cafeteriaType: data.cafeteriaType,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    // Verify staffId matches (case-insensitive)
    if (data.staffId?.toUpperCase() !== staffId.toUpperCase()) {
      console.log('Staff ID mismatch. Expected:', data.staffId, 'Got:', staffId);
      return null;
    }
    
    if (!data.isActive) {
      throw new Error('This account has been deactivated');
    }
    
    return {
      id: doc.id,
      staffId: data.staffId || doc.id,
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      role: data.role,
      cafeteriaType: data.cafeteriaType,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error verifying staff login:', error);
    throw error;
  }
}

// Get all staff
export async function getAllStaff(): Promise<Staff[]> {
  try {
    const staffRef = collection(db, 'staff');
    const snapshot = await getDocs(staffRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        staffId: data.staffId || doc.id,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        cafeteriaType: data.cafeteriaType,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting all staff:', error);
    throw error;
  }
}

// Update staff
export async function updateStaff(staffId: string, updates: Partial<Staff>) {
  try {
    const staffRef = doc(db, 'staff', staffId);
    await updateDoc(staffRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
}

// Delete staff
export async function deleteStaff(staffId: string) {
  try {
    const staffRef = doc(db, 'staff', staffId);
    await deleteDoc(staffRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
}

// Subscribe to staff changes
export function subscribeToStaff(callback: (staff: Staff[]) => void) {
  const staffRef = collection(db, 'staff');
  
  return onSnapshot(staffRef, (snapshot) => {
    const staff = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        staffId: data.staffId || doc.id,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        cafeteriaType: data.cafeteriaType,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    callback(staff);
  });
}

// Support tickets
export async function createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const ticketRef = doc(collection(db, 'supportTickets'));
    await setDoc(ticketRef, {
      ...ticketData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true, id: ticketRef.id };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const ticketsRef = collection(db, 'supportTickets');
    const snapshot = await getDocs(ticketsRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        staffId: data.staffId,
        staffName: data.staffName,
        subject: data.subject,
        message: data.message,
        status: data.status || 'open',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting support tickets:', error);
    throw error;
  }
}

export function subscribeToSupportTickets(callback: (tickets: SupportTicket[]) => void) {
  const ticketsRef = collection(db, 'supportTickets');
  
  return onSnapshot(ticketsRef, (snapshot) => {
    const tickets = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        staffId: data.staffId,
        staffName: data.staffName,
        subject: data.subject,
        message: data.message,
        status: data.status || 'open',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    callback(tickets);
  });
}
