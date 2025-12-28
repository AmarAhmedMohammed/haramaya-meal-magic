import { useState, useEffect } from "react";
import {
  getAllStudents,
  getAllCafeterias,
  getMealSettings,
  getMealLogs,
  subscribeToStudents,
  subscribeToCafeterias,
  subscribeToMealSettings,
  createStudent,
  updateStudent,
  deleteStudent,
  updateMealSettings as updateSettingsFirestore,
  createMealLog,
} from "@/lib/firestore";
import type { Student, Cafeteria, SystemSettings, MealLog } from "@/types";

// =============================================
// STUDENTS HOOK
// =============================================

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addStudent = async (
    studentData: Omit<Student, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await createStudent(studentData);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const editStudent = async (studentId: string, updates: Partial<Student>) => {
    try {
      await updateStudent(studentId, updates);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    addStudent,
    editStudent,
    removeStudent,
  };
}

// =============================================
// CAFETERIAS HOOK
// =============================================

export function useCafeterias() {
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToCafeterias((updatedCafeterias) => {
      setCafeterias(updatedCafeterias);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    cafeterias,
    loading,
    error,
  };
}

// =============================================
// MEAL SETTINGS HOOK
// =============================================

export function useMealSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMealSettings((updatedSettings) => {
      setSettings(updatedSettings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      await updateSettingsFirestore(updates);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}

// =============================================
// MEAL LOGS HOOK
// =============================================

export function useMealLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  studentId?: string;
  cafeteriaId?: string;
  limit?: number;
}) {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const fetchedLogs = await getMealLogs(filters);
        if (isMounted) {
          setLogs(fetchedLogs);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [
    filters?.startDate,
    filters?.endDate,
    filters?.studentId,
    filters?.cafeteriaId,
    filters?.limit,
  ]);

  const addLog = async (logData: Omit<MealLog, "id">) => {
    try {
      await createMealLog(logData);
      // Refresh logs after adding
      const updatedLogs = await getMealLogs(filters);
      setLogs(updatedLogs);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    addLog,
  };
}
