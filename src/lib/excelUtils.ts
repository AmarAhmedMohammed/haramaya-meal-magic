import * as XLSX from "xlsx";
import { Student, StudentStatus, CafeStatus, CafeteriaType } from "@/types";

// Map Excel columns to Student properties
const COLUMN_MAPPING: Record<string, keyof Student | string> = {
  "Student ID": "studentId",
  ID: "studentId",
  "Full Name": "fullName",
  Name: "fullName",
  "Full Name (Amharic)": "fullNameAmharic",
  Department: "department",
  Year: "year",
  "Cafe Status": "cafeStatus",
  "Cafeteria Type": "cafeteriaType",
  "Hostel Resident": "hostelResident",
  Status: "status",
  "Monthly Quota": "monthlyQuota",
};

export function exportStudentsToExcel(
  students: Student[],
  filename: string = "students.xlsx"
) {
  const data = students.map((student) => ({
    "Student ID": student.studentId,
    "Full Name": student.fullName,
    "Full Name (Amharic)": student.fullNameAmharic || "",
    Department: student.department,
    Year: student.year,
    "Cafe Status": student.cafeStatus === "cafe" ? "Active" : "Non-Cafe",
    "Cafeteria Type": formatCafeteriaType(student.cafeteriaType),
    "Hostel Resident": student.hostelResident ? "Yes" : "No",
    Status: formatStatus(student.status),
    "Monthly Quota": student.monthlyQuota || "Unlimited",
    "Used Quota": student.usedQuota,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, filename);
}

export function importStudentsFromExcel(
  file: File,
  onComplete: (students: Partial<Student>[]) => void,
  onError: (error: string) => void
) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const students: Partial<Student>[] = jsonData.map((row: any) => {
        // Helper to find value by multiple possible keys
        const getVal = (keys: string[]) => {
          for (const k of keys) {
            if (row[k] !== undefined) return row[k];
          }
          return undefined;
        };

        const statusRaw =
          getVal(["Status", "status"])?.toString().toLowerCase() || "active";
        let status: StudentStatus = "active";
        if (statusRaw.includes("grad")) status = "graduated";
        else if (
          statusRaw.includes("persecut") ||
          statusRaw.includes("suspend")
        )
          status = "persecuted";
        else if (statusRaw.includes("active")) status = "active";

        const cafeStatusRaw = getVal(["Cafe Status", "cafeStatus", "Cafe"])
          ?.toString()
          .toLowerCase();
        const cafeStatus: CafeStatus =
          cafeStatusRaw?.includes("non") || cafeStatusRaw === "none"
            ? "none"
            : "cafe";

        const cafeTypeRaw =
          getVal(["Cafeteria Type", "cafeteriaType", "Cafe Type"])
            ?.toString()
            .toLowerCase() || "christian";
        let cafeteriaType: CafeteriaType = "christian";
        if (cafeTypeRaw.includes("muslim")) cafeteriaType = "muslim";
        else if (cafeTypeRaw.includes("fresh")) cafeteriaType = "fresh";
        else cafeteriaType = "christian";

        return {
          studentId: getVal(["Student ID", "ID", "studentId"])
            ?.toString()
            .trim(),
          fullName: getVal(["Full Name", "Name", "fullName"])
            ?.toString()
            .trim(),
          fullNameAmharic: getVal(["Full Name (Amharic)", "Amharic Name"])
            ?.toString()
            .trim(),
          department: getVal(["Department", "department"])?.toString().trim(),
          year: parseInt(getVal(["Year", "year"]) || "1"),
          cafeStatus,
          cafeteriaType,
          hostelResident:
            getVal(["Hostel Resident", "Hostel"])
              ?.toString()
              .toLowerCase()
              .startsWith("y") || false,
          monthlyQuota:
            parseInt(getVal(["Monthly Quota", "Quota"]) || "0") || null,
          status,
          usedQuota: 0,
        };
      });

      // Filter valid
      const validStudents = students.filter((s) => s.studentId && s.fullName);

      if (validStudents.length === 0) {
        onError(
          'No valid students found in the file. Ensure columns "Student ID" and "Full Name" exist.'
        );
        return;
      }

      onComplete(validStudents);
    } catch (error) {
      console.error("Excel parse error:", error);
      onError("Failed to parse Excel file.");
    }
  };

  reader.onerror = () => onError("Failed to read file.");
  reader.readAsBinaryString(file);
}

export function downloadExcelTemplate() {
  const template = [
    {
      "Student ID": "UGPR0680/16",
      "Full Name": "Amar Ahmed",
      "Full Name (Amharic)": "አማር አህመድ",
      Department: "Software Engineering",
      Year: 3,
      "Cafe Status": "Active", // Active, Non-Cafe
      "Cafeteria Type": "Christian", // Christian, Muslim, Freshman
      "Hostel Resident": "Yes",
      Status: "Active", // Active, Graduated, Persecuted
      "Monthly Quota": "",
    },
    {
      "Student ID": "UGPR1234/16",
      "Full Name": "Example Student",
      "Full Name (Amharic)": "",
      Department: "Medicine",
      Year: 2,
      "Cafe Status": "Non-Cafe",
      "Cafeteria Type": "Muslim",
      "Hostel Resident": "No",
      Status: "Graduated",
      "Monthly Quota": "30",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, "student_import_template.xlsx");
}

function formatCafeteriaType(type: CafeteriaType): string {
  switch (type) {
    case "muslim":
      return "Muslim";
    case "fresh":
      return "Freshman";
    default:
      return "Christian";
  }
}

function formatStatus(status: StudentStatus): string {
  switch (status) {
    case "graduated":
      return "Graduated";
    case "persecuted":
      return "Persecuted";
    case "suspended":
      return "Suspended";
    default:
      return "Active";
  }
}
