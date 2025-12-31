import React, { useRef, useState } from "react";
import { Upload, Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  exportStudentsToCSV,
  importStudentsFromCSV,
  downloadCsvTemplate,
} from "@/lib/csvUtils";
import { createStudent } from "@/lib/firestore";
import type { Student, CafeteriaType } from "@/types";

interface ImportExportButtonsProps {
  students: Student[];
  onImportComplete?: () => void;
}

export function ImportExportButtons({
  students,
  onImportComplete,
}: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportStudentsToCSV(students);
      toast({
        title: "Export Successful",
        description: `Exported ${students.length} students to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export students",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    importStudentsFromCSV(
      file,
      async (students) => {
        try {
          // Import students to Firestore
          let successCount = 0;
          let errorCount = 0;

          for (const student of students) {
            try {
              // Validate and default cafeteriaType
              let cafeteriaType: CafeteriaType = 'christian';
              if (student.cafeteriaType === 'muslim' || student.cafeteriaType === 'christian' || student.cafeteriaType === 'fresh') {
                cafeteriaType = student.cafeteriaType;
              }

              await createStudent({
                studentId: student.studentId!,
                fullName: student.fullName!,
                fullNameAmharic: student.fullNameAmharic || "",
                email: '',
                department: student.department!,
                year: student.year || 1,
                cafeStatus: (student.cafeStatus as any) || "none",
                cafeteriaType: cafeteriaType,
                hostelResident: student.hostelResident || false,
                monthlyQuota: student.monthlyQuota || null,
                usedQuota: student.usedQuota || 0,
                allowedCafeterias: [],
                status: 'active',
              });
              successCount++;
            } catch (error) {
              console.error(
                `Failed to import student ${student.studentId}:`,
                error
              );
              errorCount++;
            }
          }

          toast({
            title: "Import Complete",
            description: `Imported ${successCount} students. ${
              errorCount > 0 ? `${errorCount} failed.` : ""
            }`,
          });

          onImportComplete?.();
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to import students",
            variant: "destructive",
          });
        } finally {
          setImporting(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      (error) => {
        toast({
          title: "Import Error",
          description: error,
          variant: "destructive",
        });
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    );
  };

  const handleDownloadTemplate = () => {
    downloadCsvTemplate();
    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadTemplate}
        className="gap-2"
      >
        <FileDown className="w-4 h-4" />
        Template
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        disabled={importing}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        {importing ? "Importing..." : "Import CSV"}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={students.length === 0}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </Button>
    </div>
  );
}
