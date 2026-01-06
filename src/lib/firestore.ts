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
  orderBy,
  Timestamp,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Student, Cafeteria, MealLog, SystemSettings } from "@/types";

// =============================================
// STUDENTS
// =============================================

export async function createStudent(
  studentData: Omit<Student, "id" | "createdAt" | "updatedAt">
) {
  try {
    const docId = studentData.studentId.replace(/\//g, "-");
    const studentRef = doc(db, "students", docId);
    const studentDoc = {
      ...studentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(studentRef, studentDoc);
    return { success: true, id: studentData.studentId };
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Student>
) {
  try {
    const docId = studentId.replace(/\//g, "-");
    const studentRef = doc(db, "students", docId);
    await updateDoc(studentRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const docId = studentId.replace(/\//g, "-");
    const studentRef = doc(db, "students", docId);
    await deleteDoc(studentRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}

export async function getStudent(studentId: string): Promise<Student | null> {
  try {
    const docId = studentId.replace(/\//g, "-");
    const studentRef = doc(db, "students", docId);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
      const data = studentSnap.data();
      return {
        id: studentSnap.id,
        studentId: data.studentId || studentSnap.id,
        fullName: data.fullName || "",
        fullNameAmharic: data.fullNameAmharic,
        department: data.department || "",
        year: data.year || 1,
        photoURL: data.photoURL,
        cafeStatus: data.cafeStatus || "none",
        cafeteriaType: data.cafeteriaType || "christian",
        hostelResident: data.hostelResident || false,
        monthlyQuota: data.monthlyQuota ?? null,
        usedQuota: data.usedQuota || 0,
        allowedCafeterias: data.allowedCafeterias,
        lastMeal: data.lastMeal
          ? {
              ...data.lastMeal,
              timestamp: data.lastMeal.timestamp?.toDate() || new Date(),
            }
          : undefined,
        notes: data.notes,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Student;
    }
    return null;
  } catch (error) {
    console.error("Error getting student:", error);
    throw error;
  }
}

export async function getAllStudents(): Promise<Student[]> {
  try {
    const studentsRef = collection(db, "students");
    const studentsSnap = await getDocs(studentsRef);

    return studentsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        studentId: data.studentId || doc.id,
        fullName: data.fullName || "",
        fullNameAmharic: data.fullNameAmharic,
        department: data.department || "",
        year: data.year || 1,
        photoURL: data.photoURL,
        cafeStatus: data.cafeStatus || "none",
        cafeteriaType: data.cafeteriaType || "christian",
        hostelResident: data.hostelResident || false,
        monthlyQuota: data.monthlyQuota ?? null,
        usedQuota: data.usedQuota || 0,
        allowedCafeterias: data.allowedCafeterias,
        lastMeal: data.lastMeal
          ? {
              ...data.lastMeal,
              timestamp: data.lastMeal.timestamp?.toDate() || new Date(),
            }
          : undefined,
        notes: data.notes,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Student;
    });
  } catch (error) {
    console.error("Error getting students:", error);
    throw error;
  }
}

export async function searchStudents(searchTerm: string): Promise<Student[]> {
  try {
    const studentsRef = collection(db, "students");
    const studentsSnap = await getDocs(studentsRef);

    const students = studentsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        studentId: data.studentId || doc.id,
        fullName: data.fullName || "",
        fullNameAmharic: data.fullNameAmharic,
        department: data.department || "",
        year: data.year || 1,
        photoURL: data.photoURL,
        cafeStatus: data.cafeStatus || "none",
        cafeteriaType: data.cafeteriaType || "christian",
        hostelResident: data.hostelResident || false,
        monthlyQuota: data.monthlyQuota ?? null,
        usedQuota: data.usedQuota || 0,
        allowedCafeterias: data.allowedCafeterias,
        notes: data.notes,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Student;
    });

    const searchLower = searchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.studentId.toLowerCase().includes(searchLower) ||
        student.fullName.toLowerCase().includes(searchLower) ||
        student.fullNameAmharic?.includes(searchTerm) ||
        student.department.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
}

// =============================================
// CAFETERIAS
// =============================================

export async function createCafeteria(cafeteriaData: Omit<Cafeteria, "id">) {
  try {
    const cafeteriaRef = doc(db, "cafeterias", cafeteriaData.cafeteriaId);
    const cafeteriaDoc = {
      ...cafeteriaData,
    };
    await setDoc(cafeteriaRef, cafeteriaDoc);
    return { success: true, id: cafeteriaData.cafeteriaId };
  } catch (error) {
    console.error("Error creating cafeteria:", error);
    throw error;
  }
}

export async function updateCafeteria(
  cafeteriaId: string,
  updates: Partial<Cafeteria>
) {
  try {
    const cafeteriaRef = doc(db, "cafeterias", cafeteriaId);
    await updateDoc(cafeteriaRef, {
      ...updates,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating cafeteria:", error);
    throw error;
  }
}

export async function getAllCafeterias(): Promise<Cafeteria[]> {
  try {
    const cafeteriasRef = collection(db, "cafeterias");
    const cafeteriasSnap = await getDocs(cafeteriasRef);

    return cafeteriasSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        cafeteriaId: data.cafeteriaId || doc.id,
        cafeteriaType: data.cafeteriaType || "christian",
        name: data.name || "",
        nameAmharic: data.nameAmharic,
        location: data.location || "",
        openHours: data.openHours || {
          breakfast: { start: "06:00", end: "09:00" },
          lunch: { start: "11:30", end: "14:00" },
          dinner: { start: "17:30", end: "20:00" },
        },
        isActive: data.isActive ?? true,
      } as Cafeteria;
    });
  } catch (error) {
    console.error("Error getting cafeterias:", error);
    throw error;
  }
}

// =============================================
// MEAL SETTINGS
// =============================================

export async function getMealSettings(): Promise<SystemSettings | null> {
  try {
    const settingsRef = doc(db, "settings", "mealSettings");
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        mealWindows: data.mealWindows || {
          breakfast: { start: "06:00", end: "09:00" },
          lunch: { start: "11:30", end: "14:00" },
          dinner: { start: "17:30", end: "20:00" },
        },
        lockDurationMinutes: data.lockDurationMinutes || 180,
        showEthiopianDate: data.showEthiopianDate ?? true,
        defaultLanguage: data.defaultLanguage || "en",
        scanningEnabled: data.scanningEnabled ?? true,
      } as SystemSettings;
    }
    return null;
  } catch (error) {
    console.error("Error getting meal settings:", error);
    throw error;
  }
}

export async function updateMealSettings(settings: Partial<SystemSettings>) {
  try {
    const settingsRef = doc(db, "settings", "mealSettings");
    await setDoc(
      settingsRef,
      {
        ...settings,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating meal settings:", error);
    throw error;
  }
}

// =============================================
// MEAL LOGS
// =============================================

export async function createMealLog(logData: Omit<MealLog, "id">) {
  try {
    const logRef = doc(collection(db, "mealLogs"));
    const logDoc = {
      ...logData,
      timestamp: Timestamp.now(),
    };
    await setDoc(logRef, logDoc);
    return { success: true, id: logRef.id };
  } catch (error) {
    console.error("Error creating meal log:", error);
    throw error;
  }
}

export async function getMealLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  studentId?: string;
  cafeteriaId?: string;
  limit?: number;
}): Promise<MealLog[]> {
  try {
    const logsRef = collection(db, "mealLogs");
    const constraints: QueryConstraint[] = [];

    if (filters?.startDate) {
      constraints.push(
        where("timestamp", ">=", Timestamp.fromDate(filters.startDate))
      );
    }
    if (filters?.endDate) {
      constraints.push(
        where("timestamp", "<=", Timestamp.fromDate(filters.endDate))
      );
    }
    if (filters?.studentId) {
      constraints.push(where("studentId", "==", filters.studentId));
    }
    if (filters?.cafeteriaId) {
      constraints.push(where("cafeteriaId", "==", filters.cafeteriaId));
    }

    constraints.push(orderBy("timestamp", "desc"));

    const q = query(logsRef, ...constraints);
    const logsSnap = await getDocs(q);

    let logs = logsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        studentId: data.studentId || "",
        studentName: data.studentName || "",
        mealType: data.mealType || "lunch",
        cafeteriaId: data.cafeteriaId || "",
        cafeteriaName: data.cafeteriaName || "",
        timestamp: data.timestamp?.toDate() || new Date(),
        result: data.result || "denied",
        reason: data.reason,
        cashierId: data.cashierId,
        isOverride: data.isOverride,
        overrideReason: data.overrideReason,
        synced: data.synced ?? true,
      } as MealLog;
    });

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  } catch (error) {
    console.error("Error getting meal logs:", error);
    throw error;
  }
}

// =============================================
// REAL-TIME LISTENERS
// =============================================

export function subscribeToStudents(callback: (students: Student[]) => void) {
  const studentsRef = collection(db, "students");

  return onSnapshot(studentsRef, (snapshot) => {
    const students = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        studentId: data.studentId || doc.id,
        fullName: data.fullName || "",
        fullNameAmharic: data.fullNameAmharic,
        department: data.department || "",
        year: data.year || 1,
        photoURL: data.photoURL,
        cafeStatus: data.cafeStatus || "none",
        cafeteriaType: data.cafeteriaType || "christian",
        hostelResident: data.hostelResident || false,
        monthlyQuota: data.monthlyQuota ?? null,
        usedQuota: data.usedQuota || 0,
        allowedCafeterias: data.allowedCafeterias,
        lastMeal: data.lastMeal
          ? {
              ...data.lastMeal,
              timestamp: data.lastMeal.timestamp?.toDate() || new Date(),
            }
          : undefined,
        notes: data.notes,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Student;
    });
    callback(students);
  });
}

export function subscribeToMealSettings(
  callback: (settings: SystemSettings | null) => void
) {
  const settingsRef = doc(db, "settings", "mealSettings");

  return onSnapshot(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        mealWindows: data.mealWindows || {
          breakfast: { start: "06:00", end: "09:00" },
          lunch: { start: "11:30", end: "14:00" },
          dinner: { start: "17:30", end: "20:00" },
        },
        lockDurationMinutes: data.lockDurationMinutes || 180,
        showEthiopianDate: data.showEthiopianDate ?? true,
        defaultLanguage: data.defaultLanguage || "en",
        scanningEnabled: data.scanningEnabled ?? true,
      } as SystemSettings);
    } else {
      callback(null);
    }
  });
}

export function subscribeToCafeterias(
  callback: (cafeterias: Cafeteria[]) => void
) {
  const cafeteriasRef = collection(db, "cafeterias");

  return onSnapshot(cafeteriasRef, (snapshot) => {
    const cafeterias = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        cafeteriaId: data.cafeteriaId || doc.id,
        cafeteriaType: data.cafeteriaType || "christian",
        name: data.name || "",
        nameAmharic: data.nameAmharic,
        location: data.location || "",
        openHours: data.openHours || {
          breakfast: { start: "06:00", end: "09:00" },
          lunch: { start: "11:30", end: "14:00" },
          dinner: { start: "17:30", end: "20:00" },
        },
        isActive: data.isActive ?? true,
      } as Cafeteria;
    });
    callback(cafeterias);
  });
}

export function subscribeToMealLogs(
  callback: (logs: MealLog[]) => void,
  filters?: { cafeteriaId?: string; limit?: number }
) {
  const logsRef = collection(db, "mealLogs");
  const constraints: QueryConstraint[] = [];

  if (filters?.cafeteriaId) {
    constraints.push(where("cafeteriaId", "==", filters.cafeteriaId));
  }

  constraints.push(orderBy("timestamp", "desc"));

  const q = query(logsRef, ...constraints);

  return onSnapshot(q, (snapshot) => {
    let logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        studentId: data.studentId || "",
        studentName: data.studentName || "",
        mealType: data.mealType || "lunch",
        cafeteriaId: data.cafeteriaId || "",
        cafeteriaName: data.cafeteriaName || "",
        timestamp: data.timestamp?.toDate() || new Date(),
        result: data.result || "denied",
        reason: data.reason,
        cashierId: data.cashierId,
        isOverride: data.isOverride,
        overrideReason: data.overrideReason,
        synced: data.synced ?? true,
      } as MealLog;
    });

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    callback(logs);
  });
}

// Update student's last meal after successful scan
export async function updateStudentLastMeal(
  studentId: string,
  mealType: string,
  cafeteriaId: string
) {
  try {
    const docId = studentId.replace(/\//g, "-");
    const studentRef = doc(db, "students", docId);
    await updateDoc(studentRef, {
      lastMeal: {
        mealType,
        timestamp: Timestamp.now(),
        cafeteriaId,
      },
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating student last meal:", error);
    throw error;
  }
}
