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
    const studentRef = doc(db, "students", studentData.studentId);
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
    const studentRef = doc(db, "students", studentId);
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
    const studentRef = doc(db, "students", studentId);
    await deleteDoc(studentRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}

export async function getStudent(studentId: string): Promise<Student | null> {
  try {
    const studentRef = doc(db, "students", studentId);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
      const data = studentSnap.data();
      return {
        id: studentSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMeal: data.lastMeal
          ? {
              ...data.lastMeal,
              timestamp: data.lastMeal.timestamp?.toDate() || new Date(),
            }
          : null,
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
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMeal: data.lastMeal
          ? {
              ...data.lastMeal,
              timestamp: data.lastMeal.timestamp?.toDate() || new Date(),
            }
          : null,
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
        ...data,
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

export async function createCafeteria(
  cafeteriaData: Omit<Cafeteria, "id" | "createdAt" | "updatedAt">
) {
  try {
    const cafeteriaRef = doc(db, "cafeterias", cafeteriaData.cafeteriaId);
    const cafeteriaDoc = {
      ...cafeteriaData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
      updatedAt: Timestamp.now(),
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
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
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
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
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
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
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
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMeal: data.lastMeal
          ? {
              ...data.lastMeal,
              timestamp: data.lastMeal.timestamp?.toDate() || new Date(),
            }
          : null,
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
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
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
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Cafeteria;
    });
    callback(cafeterias);
  });
}
