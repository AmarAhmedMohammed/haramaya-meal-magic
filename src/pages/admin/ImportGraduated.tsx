import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Download, Plus, Search, Trash2 } from "lucide-react";
import { importStudentsFromExcel, downloadExcelTemplate } from "@/lib/excelUtils";
import { subscribeToStudents, updateStudent } from "@/lib/firestore";
import { Student } from "@/types";

export default function ImportGraduated() {
  const [students, setStudents] = useState<Student[]>([]);
  const [graduatedStudents, setGraduatedStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [manualStudentId, setManualStudentId] = useState("");
  const [manualFullName, setManualFullName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToStudents((allStudents) => {
      setStudents(allStudents);
      setGraduatedStudents(allStudents.filter((s) => s.status === "graduated"));
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    importStudentsFromExcel(
      file,
      async (importedStudents) => {
        let successCount = 0;
        let updateCount = 0;

        let skippedCount = 0;
        for (const studentData of importedStudents) {
          try {
            const existingStudent = students.find(
              (s) => s.studentId === studentData.studentId
            );

            if (existingStudent) {
              await updateStudent(existingStudent.studentId, {
                status: "graduated",
                cafeStatus: "none",
              });
              updateCount++;
            } else {
              // Skip unregistered students
              skippedCount++;
            }
          } catch (error) {
            console.error("Error processing student:", error);
          }
        }

        toast({
          title: "Import Complete",
          description: `${updateCount} students updated to graduated status.${skippedCount > 0 ? ` ${skippedCount} unregistered students skipped.` : ''}`,
        });
        setIsImporting(false);
        event.target.value = "";
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

  const handleManualAdd = async () => {
    if (!manualStudentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Student ID",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if student exists - must be previously registered
      const existingStudent = students.find(
        (s) => s.studentId === manualStudentId.trim()
      );

      if (!existingStudent) {
        toast({
          title: "Student Not Found",
          description: "This student ID is not registered in the system. Only previously registered students can be marked as graduated.",
          variant: "destructive",
        });
        return;
      }

      if (existingStudent.status === "graduated") {
        toast({
          title: "Already Graduated",
          description: `${existingStudent.fullName} is already marked as graduated.`,
          variant: "destructive",
        });
        return;
      }

      await updateStudent(existingStudent.studentId, {
        status: "graduated",
        cafeStatus: "none",
      });
      toast({
        title: "Student Graduated",
        description: `${existingStudent.fullName} has been marked as graduated.`,
      });

      setManualStudentId("");
      setManualFullName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveGraduated = async (studentId: string) => {
    try {
      await updateStudent(studentId, {
        status: "active",
        cafeStatus: "cafe",
      });
      toast({
        title: "Status Changed",
        description: "Student has been restored to active status.",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student status.",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = graduatedStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" />
              Graduated Students
            </h1>
            <p className="text-muted-foreground mt-1">
              Import or add graduated students to restrict meal access
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              {/* <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </DialogTrigger> */}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Graduated Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="e.g., UGPR0680/16"
                      value={manualStudentId}
                      onChange={(e) => setManualStudentId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter full name"
                      value={manualFullName}
                      onChange={(e) => setManualFullName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleManualAdd} className="w-full">
                    Add as Graduated
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button disabled={isImporting}>
                <Download className="w-4 h-4 mr-2" />
                {isImporting ? "Importing..." : "Import Excel"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{graduatedStudents.length}</p>
                  <p className="text-sm text-muted-foreground">Graduated Students</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Graduated Students List</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No graduated students found</p>
                <p className="text-sm">Import from Excel or add manually</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">
                        {student.studentId}
                      </TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.department || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Graduated</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveGraduated(student.studentId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
