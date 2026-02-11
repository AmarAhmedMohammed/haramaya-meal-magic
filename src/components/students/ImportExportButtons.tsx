import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { exportStudentsToExcel, importStudentsFromExcel } from "@/lib/excelUtils";
import { createStudent, updateStudent } from "@/lib/firestore";
import type { Student } from "@/types";
import React, { useRef, useState } from "react";

interface ImportExportButtonsProps {
  students: Student[];
  onImportComplete?: () => void;
}

export function ImportExportButtons({
  students,
  onImportComplete,
}: ImportExportButtonsProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      exportStudentsToExcel(students, `students_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({
        title: "Export Successful",
        description: `Exported ${students.length} students to Excel`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export students",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    importStudentsFromExcel(
      file,
      async (importedStudents) => {
        let addedCount = 0;
        let updatedCount = 0;

        for (const studentData of importedStudents) {
          try {
            const existing = students.find(s => s.studentId === studentData.studentId);
            if (existing) {
              await updateStudent(existing.studentId, {
                fullName: studentData.fullName || existing.fullName,
                department: studentData.department || existing.department,
                year: studentData.year || existing.year,
              });
              updatedCount++;
            } else {
              await createStudent({
                studentId: studentData.studentId!,
                fullName: studentData.fullName!,
                fullNameAmharic: studentData.fullNameAmharic || "",
                email: "",
                department: studentData.department || "",
                year: studentData.year || 1,
                cafeStatus: studentData.cafeStatus || "cafe",
                cafeteriaType: studentData.cafeteriaType || "christian",
                hostelResident: studentData.hostelResident || false,
                monthlyQuota: studentData.monthlyQuota ?? null,
                usedQuota: 0,
                status: "active",
              });
              addedCount++;
            }
          } catch (error) {
            console.error("Error importing student:", error);
          }
        }

        toast({
          title: "Import Complete",
          description: `${addedCount} added, ${updatedCount} updated.`,
        });
        setIsImporting(false);
        event.target.value = "";
        onImportComplete?.();
      },
      (error) => {
        toast({
          title: "Import Failed",
          description: error,
          variant: "destructive",
        });
        setIsImporting(false);
        event.target.value = "";
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={students.length === 0}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        Export
      </Button>

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isImporting}
        />
        <Button variant="outline" size="sm" disabled={isImporting} className="gap-2">
          <Download className="w-4 h-4" />
          {isImporting ? "Importing..." : "Import"}
        </Button>
      </div>
    </div>
  );
}
