import Papa from "papaparse";
import type { Student } from "@/types";

// Export students to CSV
export function exportStudentsToCSV(
  students: Student[],
  filename: string = "students.csv"
) {
  const csv = Papa.unparse(students, {
    columns: [
      "studentId",
      "fullName",
      "fullNameAmharic",
      "department",
      "year",
      "cafeStatus",
      "hostelResident",
      "monthlyQuota",
      "usedQuota",
    ],
  });

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import students from CSV
export function importStudentsFromCSV(
  file: File,
  onComplete: (students: Partial<Student>[]) => void,
  onError: (error: string) => void
) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        const students = results.data.map((row: any) => ({
          studentId: row.studentId || "",
          fullName: row.fullName || "",
          fullNameAmharic: row.fullNameAmharic || "",
          department: row.department || "",
          year: parseInt(row.year) || 1,
          cafeStatus: row.cafeStatus || "none",
          hostelResident:
            row.hostelResident === "true" || row.hostelResident === true,
          monthlyQuota: row.monthlyQuota ? parseInt(row.monthlyQuota) : null,
          usedQuota: parseInt(row.usedQuota) || 0,
        }));

        // Validate required fields
        const invalid = students.filter((s) => !s.studentId || !s.fullName);
        if (invalid.length > 0) {
          onError(
            `Found ${invalid.length} rows with missing studentId or fullName`
          );
          return;
        }

        onComplete(students);
      } catch (error) {
        onError(`Failed to parse CSV: ${error}`);
      }
    },
    error: (error) => {
      onError(`CSV parsing error: ${error.message}`);
    },
  });
}

// Validate student data
export function validateStudentData(student: Partial<Student>): string[] {
  const errors: string[] = [];

  if (!student.studentId) errors.push("Student ID is required");
  if (!student.fullName) errors.push("Full name is required");
  if (!student.department) errors.push("Department is required");
  if (!student.year || student.year < 1 || student.year > 7) {
    errors.push("Year must be between 1 and 7");
  }
  if (!["cafe", "quota", "none"].includes(student.cafeStatus || "")) {
    errors.push("Cafe status must be cafe, quota, or none");
  }

  return errors;
}

// Download template CSV
export function downloadCsvTemplate() {
  const template = [
    [
      "studentId",
      "fullName",
      "fullNameAmharic",
      "department",
      "year",
      "cafeStatus",
      "hostelResident",
      "monthlyQuota",
      "usedQuota",
    ],
    [
      "HU2024001",
      "John Doe",
      "ጆን ዶ",
      "Computer Science",
      "3",
      "cafe",
      "true",
      "",
      "0",
    ],
    [
      "HU2024002",
      "Jane Smith",
      "ጄን ስሚዝ",
      "Engineering",
      "2",
      "quota",
      "false",
      "60",
      "0",
    ],
  ];

  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "student_template.csv");
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
