import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  createStudent as createFirestoreStudent,
  updateStudent as updateFirestoreStudent,
  deleteStudent as deleteFirestoreStudent,
  subscribeToStudents,
} from "@/lib/firestore";
import { Student, CafeStatus, CafeteriaType, StudentStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

export interface StudentFormData {
  studentId: string;
  fullName: string;
  fullNameAmharic?: string;
  email: string;
  department: string;
  year: number;
  cafeStatus: CafeStatus;
  cafeteriaType: CafeteriaType;
  hostelResident: boolean;
  monthlyQuota: number | null;
  photoURL?: string;
  notes?: string;
  status: StudentStatus;
}

interface StudentsContextType {
  students: Student[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  addStudent: (data: StudentFormData) => Promise<boolean>;
  updateStudent: (
    id: string,
    data: Partial<StudentFormData>
  ) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  searchStudents: (query: string) => Student[];
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(
  undefined
);

interface LastOperation {
  type: "add" | "update" | "delete";
  data?: StudentFormData;
  id?: string;
  updates?: Partial<StudentFormData>;
}

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [lastOperation, setLastOperation] = useState<LastOperation | null>(
    null
  );
  const [backupState, setBackupState] = useState<Student[] | null>(null);
  const { toast } = useToast();

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Add a new student
  const addStudent = useCallback(
    async (data: StudentFormData): Promise<boolean> => {
      // Check for duplicate student ID
      if (students.some((s) => s.studentId === data.studentId)) {
        toast({
          title: "Duplicate ID",
          description: "A student with this ID already exists.",
          variant: "destructive",
        });
        return false;
      }

      setOperationLoading(true);
      setBackupState([...students]);
      setLastOperation({ type: "add", data });

      // Optimistic update
      const optimisticStudent: Student = {
        id: data.studentId.replace(/\//g, "-"),
        ...data,
        fullNameAmharic: data.fullNameAmharic || "",
        usedQuota: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setStudents((prev) => [...prev, optimisticStudent]);

      try {
        await createFirestoreStudent({
          studentId: data.studentId,
          fullName: data.fullName,
          fullNameAmharic: data.fullNameAmharic || "",
          email: data.email,
          department: data.department,
          year: data.year,
          cafeStatus: data.cafeStatus,
          cafeteriaType: data.cafeteriaType,
          hostelResident: data.hostelResident,
          monthlyQuota: data.monthlyQuota,
          usedQuota: 0,
          photoURL: data.photoURL,
          notes: data.notes,
          status: data.status,
        });

        toast({
          title: "Student Added",
          description: `${data.fullName} has been added successfully.`,
        });
        setError(null);
        setLastOperation(null);
        return true;
      } catch (err) {
        console.error("Error adding student:", err);
        // Rollback optimistic update
        if (backupState) {
          setStudents(backupState);
        }
        const errorMessage = "Failed to add student. Please try again.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setOperationLoading(false);
        setBackupState(null);
      }
    },
    [students, toast, backupState]
  );

  // Update an existing student
  const updateStudentFn = useCallback(
    async (id: string, updates: Partial<StudentFormData>): Promise<boolean> => {
      setOperationLoading(true);
      setBackupState([...students]);
      setLastOperation({ type: "update", id, updates });

      // Optimistic update
      setStudents((prev) =>
        prev.map((s) =>
          s.studentId === id ? { ...s, ...updates, updatedAt: new Date() } : s
        )
      );

      try {
        await updateFirestoreStudent(id, updates);

        toast({
          title: "Student Updated",
          description: "Student information has been updated.",
        });
        setError(null);
        setLastOperation(null);
        return true;
      } catch (err) {
        console.error("Error updating student:", err);
        // Rollback optimistic update
        if (backupState) {
          setStudents(backupState);
        }
        const errorMessage = "Failed to update student. Please try again.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setOperationLoading(false);
        setBackupState(null);
      }
    },
    [students, toast, backupState]
  );

  // Delete a student
  const deleteStudentFn = useCallback(
    async (id: string): Promise<boolean> => {
      const studentToDelete = students.find((s) => s.studentId === id);
      if (!studentToDelete) {
        toast({
          title: "Error",
          description: "Student not found.",
          variant: "destructive",
        });
        return false;
      }

      setOperationLoading(true);
      setBackupState([...students]);
      setLastOperation({ type: "delete", id });

      // Optimistic update
      setStudents((prev) => prev.filter((s) => s.studentId !== id));

      try {
        await deleteFirestoreStudent(id);

        toast({
          title: "Student Deleted",
          description: `${studentToDelete.fullName} has been removed from the system.`,
        });
        setError(null);
        setLastOperation(null);
        return true;
      } catch (err) {
        console.error("Error deleting student:", err);
        // Rollback optimistic update
        if (backupState) {
          setStudents(backupState);
        }
        const errorMessage = "Failed to delete student. Please try again.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setOperationLoading(false);
        setBackupState(null);
      }
    },
    [students, toast, backupState]
  );

  // Search students by name, ID, or department
  const searchStudents = useCallback(
    (query: string): Student[] => {
      if (!query.trim()) return students;

      const searchLower = query.toLowerCase();
      return students.filter(
        (student) =>
          student.fullName.toLowerCase().includes(searchLower) ||
          student.studentId.toLowerCase().includes(searchLower) ||
          student.department.toLowerCase().includes(searchLower) ||
          student.fullNameAmharic?.includes(query)
      );
    },
    [students]
  );

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Retry the last failed operation
  const retryLastOperation = useCallback(async () => {
    if (!lastOperation) return;

    switch (lastOperation.type) {
      case "add":
        if (lastOperation.data) {
          await addStudent(lastOperation.data);
        }
        break;
      case "update":
        if (lastOperation.id && lastOperation.updates) {
          await updateStudentFn(lastOperation.id, lastOperation.updates);
        }
        break;
      case "delete":
        if (lastOperation.id) {
          await deleteStudentFn(lastOperation.id);
        }
        break;
    }
  }, [lastOperation, addStudent, updateStudentFn, deleteStudentFn]);

  return (
    <StudentsContext.Provider
      value={{
        students,
        loading,
        error,
        operationLoading,
        addStudent,
        updateStudent: updateStudentFn,
        deleteStudent: deleteStudentFn,
        searchStudents,
        clearError,
        retryLastOperation,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error("useStudents must be used within a StudentsProvider");
  }
  return context;
}
