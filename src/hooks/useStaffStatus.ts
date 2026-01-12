import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Staff } from '@/types';

interface UseStaffStatusResult {
  isActive: boolean;
  loading: boolean;
  staff: Staff | null;
  error: Error | null;
  refresh: () => void;
}

export function useStaffStatus(staffId: string | undefined): UseStaffStatusResult {
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!staffId) {
      setLoading(false);
      setIsActive(true);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates for this staff member
    const staffDocRef = doc(db, 'staff', staffId);
    
    const unsubscribe = onSnapshot(
      staffDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const staffData: Staff = {
            id: snapshot.id,
            staffId: data.staffId || snapshot.id,
            email: data.email,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            role: data.role,
            cafeteriaType: data.cafeteriaType,
            isActive: data.isActive ?? true,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
          setStaff(staffData);
          setIsActive(staffData.isActive);
        } else {
          // Staff document deleted
          setIsActive(false);
          setStaff(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Staff status listener error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [staffId, refreshKey]);

  return { isActive, loading, staff, error, refresh };
}
