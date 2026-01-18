import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Student, CafeStatus, CafeteriaType } from "@/types";
import { getCafeteriaTypeLabel } from "@/lib/mealLogic";
import { useStudents } from "@/contexts/StudentsContext";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { ImportExportButtons } from "@/components/students/ImportExportButtons";

interface StudentFormData {
  studentId: string;
  fullName: string;
  fullNameAmharic: string;
  department: string;
  year: number;
  cafeStatus: CafeStatus;
  cafeteriaType: CafeteriaType;
  hostelResident: boolean;
  monthlyQuota: number | null;
}

const emptyFormData: StudentFormData = {
  studentId: "",
  fullName: "",
  fullNameAmharic: "",
  department: "",
  year: 1,
  cafeStatus: "cafe",
  cafeteriaType: "christian",
  hostelResident: false,
  monthlyQuota: null,
};

export default function Students() {
  const { t, language } = useLanguage();
  const { admin, loading: authLoading, authType, staff } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    students,
    loading,
    addStudent: contextAddStudent,
    updateStudent: contextUpdateStudent,
    deleteStudent: contextDeleteStudent,
  } = useStudents();

  // Check if user is admin
  const isAdmin =
    admin?.role === "super_admin" || admin?.role === "registrar_admin";

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStudent = async () => {
    if (!formData.studentId || !formData.fullName || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate student ID
    if (students.some((s) => s.studentId === formData.studentId)) {
      toast({
        title: "Duplicate ID",
        description: "A student with this ID already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await contextAddStudent({
        studentId: formData.studentId,
        fullName: formData.fullName,
        fullNameAmharic: formData.fullNameAmharic,
        email: "",
        department: formData.department,
        year: formData.year,
        cafeStatus: formData.cafeStatus,
        cafeteriaType: formData.cafeteriaType,
        hostelResident: formData.hostelResident,
        monthlyQuota: formData.monthlyQuota,
        status: "active",
      });

      if (success) {
        setIsAddDialogOpen(false);
        setFormData(emptyFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent || !formData.fullName || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await contextUpdateStudent(selectedStudent.studentId, {
        fullName: formData.fullName,
        fullNameAmharic: formData.fullNameAmharic,
        department: formData.department,
        year: formData.year,
        cafeStatus: formData.cafeStatus,
        cafeteriaType: formData.cafeteriaType,
        hostelResident: formData.hostelResident,
        monthlyQuota: formData.monthlyQuota,
      });

      if (success) {
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
        setFormData(emptyFormData);

        toast({
          title: "Student Updated",
          description: `${formData.fullName}'s information has been updated.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      const success = await contextDeleteStudent(selectedStudent.studentId);
      if (success) {
        setIsDeleteDialogOpen(false);

        toast({
          title: "Student Deleted",
          description: `${selectedStudent.fullName} has been removed from the system.`,
        });

        setSelectedStudent(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId,
      fullName: student.fullName,
      fullNameAmharic: student.fullNameAmharic || "",
      department: student.department,
      year: student.year,
      cafeStatus: student.cafeStatus,
      cafeteriaType: student.cafeteriaType,
      hostelResident: student.hostelResident,
      monthlyQuota: student.monthlyQuota,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const openAddDialog = () => {
    setFormData(emptyFormData);
    setIsAddDialogOpen(true);
  };

  const getCafeteriaTypeBadgeVariant = (type: CafeteriaType) => {
    switch (type) {
      case "muslim":
        return "secondary";
      case "christian":
        return "outline";
      case "fresh":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {t("students")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? "Manage student meal registrations"
                : "View student meal registrations"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <ImportExportButtons
                students={filteredStudents}
                onImportComplete={() => {
                  toast({
                    title: "Import Complete",
                    description: "Students imported successfully.",
                  });
                }}
              />
            )}
            {!isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                <ShieldCheck className="w-4 h-4" />
                View Only Mode
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <Card variant="default">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {t("filter")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card variant="elevated">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Cafeteria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quota</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading students...
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group border-b"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              {student.photoURL ? (
                                <img
                                  src={student.photoURL}
                                  alt=""
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {language === "am" && student.fullNameAmharic
                                  ? student.fullNameAmharic
                                  : student.fullName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {student.studentId}
                          </code>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.department}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Year {student.year}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getCafeteriaTypeBadgeVariant(
                              student.cafeteriaType
                            )}
                          >
                            {getCafeteriaTypeLabel(student.cafeteriaType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.cafeStatus === "cafe" ? "cafe" : "none"
                            }
                          >
                            {student.cafeStatus === "cafe"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {student.monthlyQuota ? (
                            <div className="text-sm">
                              <span className="font-medium">
                                {student.usedQuota}
                              </span>
                              <span className="text-muted-foreground">
                                /{student.monthlyQuota}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Unlimited
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openViewDialog(student)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(student)}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Student
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog(student)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Student
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {students.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {students.filter((s) => s.cafeStatus === "cafe").length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {students.filter((s) => s.cafeteriaType === "muslim").length}
              </p>
              <p className="text-sm text-muted-foreground">Muslim Cafe</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {students.filter((s) => s.cafeteriaType === "fresh").length}
              </p>
              <p className="text-sm text-muted-foreground">Freshman Cafe</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Student Dialog - Only for Admin */}
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the student information to register them for cafeteria
                  services.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID (Barcode) *</Label>
                  <Input
                    id="studentId"
                    placeholder="UGPR0680/16"
                    value={formData.studentId}
                    onChange={(e) =>
                      handleInputChange(
                        "studentId",
                        e.target.value.toUpperCase()
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the ID from the student's barcode card
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (English) *</Label>
                  <Input
                    id="fullName"
                    placeholder="Amar Ahmed Mohammed"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullNameAmharic">Full Name (Amharic)</Label>
                  <Input
                    id="fullNameAmharic"
                    placeholder="አማር አህመድ ሞሐመድ"
                    value={formData.fullNameAmharic}
                    onChange={(e) =>
                      handleInputChange("fullNameAmharic", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    placeholder="Information Technology"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={formData.year.toString()}
                      onValueChange={(v) =>
                        handleInputChange("year", parseInt(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            Year {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cafeStatus">Cafe Status</Label>
                    <Select
                      value={formData.cafeStatus}
                      onValueChange={(v) =>
                        handleInputChange("cafeStatus", v as CafeStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cafe">Active (Cafe)</SelectItem>
                        <SelectItem value="none">Inactive (None)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cafeteriaType">Cafeteria Type *</Label>
                  <Select
                    value={formData.cafeteriaType}
                    onValueChange={(v) =>
                      handleInputChange("cafeteriaType", v as CafeteriaType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muslim">Muslim Cafe</SelectItem>
                      <SelectItem value="christian">Christian Cafe</SelectItem>
                      <SelectItem value="fresh">Freshman Cafe</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select which cafeteria this student can access
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hostelResident"
                    checked={formData.hostelResident}
                    onChange={(e) =>
                      handleInputChange("hostelResident", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <Label
                    htmlFor="hostelResident"
                    className="text-sm font-normal"
                  >
                    Hostel Resident
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setFormData(emptyFormData);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleAddStudent}>
                  Add Student
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Student Dialog - Only for Admin */}
        {isAdmin && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogDescription>
                  Update the student's information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input
                    value={formData.studentId}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Full Name (English) *</Label>
                  <Input
                    id="edit-fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullNameAmharic">
                    Full Name (Amharic)
                  </Label>
                  <Input
                    id="edit-fullNameAmharic"
                    value={formData.fullNameAmharic}
                    onChange={(e) =>
                      handleInputChange("fullNameAmharic", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department *</Label>
                  <Input
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={formData.year.toString()}
                      onValueChange={(v) =>
                        handleInputChange("year", parseInt(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            Year {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cafe Status</Label>
                    <Select
                      value={formData.cafeStatus}
                      onValueChange={(v) =>
                        handleInputChange("cafeStatus", v as CafeStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cafe">Active (Cafe)</SelectItem>
                        <SelectItem value="none">Inactive (None)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cafeteria Type *</Label>
                  <Select
                    value={formData.cafeteriaType}
                    onValueChange={(v) =>
                      handleInputChange("cafeteriaType", v as CafeteriaType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muslim">Muslim Cafe</SelectItem>
                      <SelectItem value="christian">Christian Cafe</SelectItem>
                      <SelectItem value="fresh">Freshman Cafe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-hostelResident"
                    checked={formData.hostelResident}
                    onChange={(e) =>
                      handleInputChange("hostelResident", e.target.checked)
                    }
                    className="rounded border-input"
                  />
                  <Label
                    htmlFor="edit-hostelResident"
                    className="text-sm font-normal"
                  >
                    Hostel Resident
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setFormData(emptyFormData);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleEditStudent}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* View Student Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    {selectedStudent.photoURL ? (
                      <img
                        src={selectedStudent.photoURL}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedStudent.fullName}
                    </h3>
                    {selectedStudent.fullNameAmharic && (
                      <p className="text-muted-foreground">
                        {selectedStudent.fullNameAmharic}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Student ID</p>
                    <p className="font-mono">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p>{selectedStudent.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year</p>
                    <p>Year {selectedStudent.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cafeteria</p>
                    <Badge
                      variant={getCafeteriaTypeBadgeVariant(
                        selectedStudent.cafeteriaType
                      )}
                    >
                      {getCafeteriaTypeLabel(selectedStudent.cafeteriaType)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cafe Status</p>
                    <Badge
                      variant={
                        selectedStudent.cafeStatus === "cafe" ? "cafe" : "none"
                      }
                    >
                      {selectedStudent.cafeStatus === "cafe"
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hostel Resident</p>
                    <p>{selectedStudent.hostelResident ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quota</p>
                    <p>
                      {selectedStudent.monthlyQuota
                        ? `${selectedStudent.usedQuota}/${selectedStudent.monthlyQuota}`
                        : "Unlimited"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog - Only for Admin */}
        {isAdmin && (
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedStudent?.fullName}
                  </span>
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteStudent}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </Layout>
  );
}
