import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { exportStudentsToExcel } from "@/lib/excelUtils";
import type { Student } from "@/types";

interface ImportExportButtonsProps {
  students: Student[];
  onImportComplete?: () => void;
}

export function ImportExportButtons({
  students,
}: ImportExportButtonsProps) {
  const { toast } = useToast();

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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={students.length === 0}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      Export
    </Button>
  );
}
