import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToStudents, updateStudent } from "@/lib/firestore";
import { getCafeteriaTypeLabel } from "@/lib/mealLogic";
import { Student } from "@/types";
import {
  CreditCard,
  Search,
  Upload,
  ArrowLeft,
  User,
  Check,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function IDCards() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin =
    admin?.role === "super_admin" || admin?.role === "registrar_admin";

  useEffect(() => {
    const unsubscribe = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openUploadDialog = (student: Student) => {
    setSelectedStudent(student);
    setPhotoURL(student.photoURL || "");
    setIsUploadDialogOpen(true);
  };

  const handleUploadPhoto = async () => {
    if (!selectedStudent) return;

    setIsSubmitting(true);

    try {
      await updateStudent(selectedStudent.studentId, {
        photoURL: photoURL || undefined,
      });

      toast({
        title: "Photo Updated",
        description: `ID card photo for ${selectedStudent.fullName} has been updated.`,
      });

      setIsUploadDialogOpen(false);
      setSelectedStudent(null);
      setPhotoURL("");
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Error",
        description: "Failed to update photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to manage ID cards.
          </p>
          <Link to="/students">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                ID Card Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload and manage student ID card photos
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card variant="default">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="default">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {students.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {students.filter((s) => s.photoURL).length}
              </p>
              <p className="text-sm text-muted-foreground">With Photo</p>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">
                {students.filter((s) => !s.photoURL).length}
              </p>
              <p className="text-sm text-muted-foreground">No Photo</p>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {Math.round(
                  (students.filter((s) => s.photoURL).length /
                    students.length) *
                    100
                ) || 0}
                %
              </p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" />
              Student ID Cards
            </CardTitle>
            <CardDescription>
              Click on a student to upload or update their ID card photo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Cafeteria</TableHead>
                    <TableHead>Photo Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading students...
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
                        className="group border-b hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {student.photoURL ? (
                              <img
                                src={student.photoURL}
                                alt={student.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.department}
                          </p>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {student.studentId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCafeteriaTypeLabel(student.cafeteriaType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {student.photoURL ? (
                            <Badge variant="granted" className="gap-1">
                              <Check className="w-3 h-3" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="denied" className="gap-1">
                              <X className="w-3 h-3" />
                              Missing
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUploadDialog(student)}
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {student.photoURL ? "Update" : "Upload"}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Upload Photo Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload ID Card Photo</DialogTitle>
              <DialogDescription>
                Enter the URL of the student's ID card photo
              </DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    {selectedStudent.photoURL ? (
                      <img
                        src={selectedStudent.photoURL}
                        alt=""
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedStudent.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.studentId}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoURL">Photo URL</Label>
                  <Input
                    id="photoURL"
                    placeholder="https://example.com/photo.jpg"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to the student's photo
                  </p>
                </div>

                {photoURL && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="w-32 h-40 rounded-lg bg-muted overflow-hidden mx-auto">
                      <img
                        src={photoURL}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUploadPhoto} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Photo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
