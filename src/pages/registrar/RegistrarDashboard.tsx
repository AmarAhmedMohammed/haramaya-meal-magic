import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  createStudent,
  updateStudent,
  deleteStudent,
  subscribeToStudents,
  getAllStudents,
} from "@/lib/firestore";
import { createSupportTicket } from "@/lib/staffAuth";
import { Student, CafeStatus, CafeteriaType } from "@/types";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { 
  UserPlus, 
  Camera,
  Users,
  Edit,
  Trash2,
  Search,
  HelpCircle,
  LogOut,
  User,
  CheckCircle,
  X,
  RotateCcw,
  Send,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import huLogo from "@/assets/hu-logo.png";

interface StudentFormData {
  studentId: string;
  fullName: string;
  fullNameAmharic: string;
  email: string;
  department: string;
  year: number;
  cafeteriaType: CafeteriaType;
  cafeStatus: CafeStatus;
}

const emptyFormData: StudentFormData = {
  studentId: "",
  fullName: "",
  fullNameAmharic: "",
  email: "",
  department: "",
  year: 1,
  cafeteriaType: "christian",
  cafeStatus: "cafe",
};

const departments = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Medicine",
  "Pharmacy",
  "Nursing",
  "Agriculture",
  "Business Administration",
  "Accounting",
  "Law",
  "Psychology",
  "Economics",
];

export default function RegistrarDashboard() {
  const { staff, signOut, authType } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Support ticket
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect if not registrar
  if (authType !== 'staff' || staff?.role !== 'registrar') {
    return <Navigate to="/" replace />;
  }

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 854 }, // 3:4 ratio
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Set canvas size for 3:4 ratio (HD quality)
    canvas.width = 600;
    canvas.height = 800;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const uploadPhoto = async (studentId: string): Promise<string | null> => {
    if (!capturedImage) return null;

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const storageRef = ref(storage, `student-photos/${studentId}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.fullName || !formData.email || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!capturedImage) {
      toast({
        title: "Photo Required",
        description: "Please capture a photo of the student.",
        variant: "destructive",
      });
      return;
    }

    // Validate unique email
    const existingByEmail = students.find(s => s.email === formData.email);
    if (existingByEmail) {
      toast({
        title: "Duplicate Email",
        description: "A student with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    // Validate unique ID
    const existingById = students.find(s => s.studentId === formData.studentId);
    if (existingById) {
      toast({
        title: "Duplicate ID",
        description: "A student with this ID already exists.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photo first
      const photoURL = await uploadPhoto(formData.studentId);

      // Create student
      await createStudent({
        studentId: formData.studentId,
        fullName: formData.fullName,
        fullNameAmharic: formData.fullNameAmharic,
        email: formData.email,
        department: formData.department,
        year: formData.year,
        cafeStatus: formData.cafeStatus,
        cafeteriaType: formData.cafeteriaType,
        hostelResident: false,
        monthlyQuota: null,
        usedQuota: 0,
        status: 'active',
        photoURL: photoURL || undefined,
      });

      toast({
        title: "Student Registered",
        description: `${formData.fullName} has been registered successfully.`,
      });

      // Reset form
      setFormData(emptyFormData);
      setCapturedImage(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register student.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      await updateStudent(selectedStudent.studentId, {
        fullName: formData.fullName,
        fullNameAmharic: formData.fullNameAmharic,
        email: formData.email,
        department: formData.department,
        year: formData.year,
        cafeteriaType: formData.cafeteriaType,
        cafeStatus: formData.cafeStatus,
      });

      toast({
        title: "Student Updated",
        description: `${formData.fullName} has been updated.`,
      });

      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      setFormData(emptyFormData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      await deleteStudent(selectedStudent.studentId);
      toast({
        title: "Student Deleted",
        description: `${selectedStudent.fullName} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  const handleSupportSubmit = async () => {
    if (!supportSubject || !supportMessage) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSupportTicket({
        staffId: staff?.staffId || "",
        staffName: staff?.fullName || "",
        subject: supportSubject,
        message: supportMessage,
        status: 'open',
      });

      toast({
        title: "Ticket Submitted",
        description: "Your support request has been sent to admin.",
      });

      setSupportSubject("");
      setSupportMessage("");
      setIsSupportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket.",
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
      email: student.email,
      department: student.department,
      year: student.year,
      cafeteriaType: student.cafeteriaType,
      cafeStatus: student.cafeStatus,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-sidebar border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={huLogo} alt="HU Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Registrar Portal</h1>
              <p className="text-xs text-sidebar-foreground/70">{staff?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSupportDialogOpen(true)}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Support
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-sidebar-foreground/70 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Register Student
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Users className="w-4 h-4" />
              Manage Students
            </TabsTrigger>
          </TabsList>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent" />
                  Register New Student
                </CardTitle>
                <CardDescription>
                  Fill in student details and capture their photo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Student ID *</Label>
                          <Input
                            placeholder="e.g., UGPR0680/16"
                            value={formData.studentId}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              studentId: e.target.value.toUpperCase() 
                            }))}
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            placeholder="student@haramaya.edu.et"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              email: e.target.value.toLowerCase() 
                            }))}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name (English) *</Label>
                          <Input
                            placeholder="Full name"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Full Name (Amharic)</Label>
                          <Input
                            placeholder="ሙሉ ስም"
                            value={formData.fullNameAmharic}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullNameAmharic: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Department *</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Year *</Label>
                          <Select
                            value={formData.year.toString()}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                                <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cafeteria Type *</Label>
                          <Select
                            value={formData.cafeteriaType}
                            onValueChange={(value: CafeteriaType) => setFormData(prev => ({ ...prev, cafeteriaType: value }))}
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
                        <div className="space-y-2">
                          <Label>Meal Status</Label>
                          <Select
                            value={formData.cafeStatus}
                            onValueChange={(value: CafeStatus) => setFormData(prev => ({ ...prev, cafeStatus: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cafe">Active</SelectItem>
                              <SelectItem value="none">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Photo Capture */}
                    <div className="space-y-4">
                      <Label>Student Photo (3:4 Ratio) *</Label>
                      <div className="relative aspect-[3/4] max-w-xs mx-auto bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30">
                        {showCamera ? (
                          <>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={stopCamera}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={capturePhoto}
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Capture
                              </Button>
                            </div>
                          </>
                        ) : capturedImage ? (
                          <>
                            <img
                              src={capturedImage}
                              alt="Captured"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant="granted" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Captured
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-4 left-1/2 -translate-x-1/2"
                              onClick={retakePhoto}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Retake
                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <User className="w-16 h-16 mb-4" />
                            <p className="text-sm mb-4">No photo captured</p>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={startCamera}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Open Camera
                            </Button>
                          </div>
                        )}
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                      {isSubmitting ? "Registering..." : "Register Student"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4">
            <Card variant="default">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Cafeteria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.slice(0, 50).map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <div className="w-12 h-16 rounded bg-muted overflow-hidden">
                              {student.photoURL ? (
                                <img
                                  src={student.photoURL}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{student.fullName}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {student.studentId}
                            </code>
                          </TableCell>
                          <TableCell>{student.department}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {student.cafeteriaType === 'muslim' ? 'Muslim' :
                               student.cafeteriaType === 'christian' ? 'Christian' : 'Freshman'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.cafeStatus === 'cafe' ? 'granted' : 'denied'}>
                              {student.cafeStatus === 'cafe' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(student)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                      <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cafeteria</Label>
                <Select
                  value={formData.cafeteriaType}
                  onValueChange={(value: CafeteriaType) => setFormData(prev => ({ ...prev, cafeteriaType: value }))}
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.cafeStatus}
                  onValueChange={(value: CafeStatus) => setFormData(prev => ({ ...prev, cafeStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cafe">Active</SelectItem>
                    <SelectItem value="none">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedStudent?.fullName} from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Support Dialog */}
      <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" />
              Submit Support Ticket
            </DialogTitle>
            <DialogDescription>
              Report an issue or request help from admin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Brief description of the issue"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSupportSubmit} className="gap-2">
              <Send className="w-4 h-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
