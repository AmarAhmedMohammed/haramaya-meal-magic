import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { useMealSettings } from "@/contexts/MealSettingsContext";
import { subscribeToStudents, getAllStudents } from "@/lib/firestore";
import { useStudents } from "@/contexts/StudentsContext";
import { createSupportTicket } from "@/lib/staffAuth";
import { Student, CafeStatus, CafeteriaType } from "@/types";
import { compressImageToFit } from "@/lib/imageUtils";
import { InactiveStaffModal } from "@/components/InactiveStaffModal";
import { useStaffStatus } from "@/hooks/useStaffStatus";
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
  Upload,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import huLogo from "@/assets/hu-logo.png";
import QRCode from "qrcode";

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
  const { staff, signOut, authType, loading: authLoading } = useAuth();
  const { settings } = useMealSettings();
  const { toast } = useToast();

  // Real-time staff status check
  const { isActive: staffIsActive, loading: statusLoading } = useStaffStatus(
    staff?.staffId,
  );

  const {
    students,
    loading: studentsLoading,
    addStudent: contextAddStudent,
    updateStudent: contextUpdateStudent,
    deleteStudent: contextDeleteStudent,
  } = useStudents();

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Support ticket
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  useEffect(() => {
    // Auto-start camera on mount
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Set srcObject when video element is ready
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  // Redirect if not registrar (wait for auth loading)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authType !== "staff" || staff?.role !== "registrar") {
    return <Navigate to="/" replace />;
  }

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase()),
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
      setShowCamera(true);
      // binding is handled by useEffect
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

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;

    // Wait for up to 1 second for the video to be ready if it's not yet
    let attempts = 0;
    while ((video.readyState < 2 || video.videoWidth === 0) && attempts < 15) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size for 3:4 ratio based on video input if possible, otherwise fixed 600x800
    const width = video.videoWidth || 600;
    const height = video.videoHeight || 800;

    canvas.width = 600;
    canvas.height = 800;

    // Draw video frame to canvas - using the intrinsic video dimensions
    ctx.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    // Get image data - Decreased quality to 0.7 for faster upload
    const imageData = canvas.toDataURL("image/jpeg", 0.7);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const processPhoto = async (studentId: string): Promise<string | null> => {
    if (!capturedImage) return null;

    try {
      // Compress image to fit within Firestore document limits
      console.log(`Compressing photo for student: ${studentId}`);
      const compressedImage = await compressImageToFit(capturedImage, 400);
      console.log(`Photo compressed successfully`);
      return compressedImage;
    } catch (error) {
      console.error("Image compression failed:", error);
      // Return original if compression fails (may fail if too large)
      return capturedImage;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.studentId ||
      !formData.fullName ||
      !formData.email ||
      !formData.department
    ) {
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
    const existingByEmail = students.find((s) => s.email === formData.email);
    if (existingByEmail) {
      toast({
        title: "Duplicate Email",
        description: "A student with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    // Validate unique ID
    const existingById = students.find(
      (s) => s.studentId === formData.studentId,
    );
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
      const submissionTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Submission timeout")), 60000),
      );

      const submitProcess = (async () => {
        const originalStudentId = formData.studentId.trim();
        const sanitizedDocId = originalStudentId.replace(/\//g, "-");

        const photoURL = await processPhoto(sanitizedDocId);

        const success = await contextAddStudent({
          studentId: originalStudentId,
          fullName: formData.fullName,
          fullNameAmharic: formData.fullNameAmharic,
          email: formData.email,
          department: formData.department,
          year: formData.year,
          cafeStatus: formData.cafeStatus,
          cafeteriaType: formData.cafeteriaType,
          hostelResident: false,
          monthlyQuota: null,
          photoURL: photoURL || undefined,
          status: "active",
        });

        if (success) {
          // Generate QR code (just studentId for simplicity)
          const qrBase64 = await new Promise<string>((resolve, reject) => {
            QRCode.toDataURL(
              originalStudentId,
              {
                width: 300,
                margin: 1,
                color: { dark: "#000000", light: "#ffffff" },
                errorCorrectionLevel: "M",
              },
              (err, url) => {
                if (err) reject(err);
                else resolve(url);
              },
            );
          });

          // ────────────────────────────────────────────────
          // EMAIL TEMPLATE - QR CODE EMBEDDED AS BASE64 DATA URL
          // ────────────────────────────────────────────────
          // Get current timestamp for unique content
          const timestamp = new Date().toLocaleString("en-US", {
            timeZone: "Africa/Addis_Ababa",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cafeteria Access Registered - ${originalStudentId}</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9; padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #11bf00, #0161ff); color:white; padding:35px 20px; text-align:center;">
              <h1 style="margin:0; font-size:26px; font-weight:700;">Cafeteria Access Registered</h1>
              <p style="margin:10px 0 0; font-size:15px; opacity:0.95;">Your meal service account is now active</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:35px 25px; text-align:center;">
            <div>
                <img src="https://files.catbox.moe/s2qh9i.png" alt="Haramaya University Logo" width="100" height="100" style="display:block; border-radius:6px; background:#fff; margin:0 auto;">
              </div><br>
              <p style="font-size:18px; margin:0 0 10px;">Hello <strong>{{student_name}}</strong>,</p>
              <p style="font-size:14px; color:#555; margin:0 0 25px;">Congratulations! You have been successfully registered for Haramaya University meal service.</p>
              
              <!-- Student ID Box -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 25px auto;">
                <tr>
                  <td style="background:#dbeafe; color:#1e40af; padding:12px 28px; border-radius:8px; font-weight:600; font-size:17px;">
                    Student ID: {{student_id}}
                  </td>
                </tr>
              </table>
              
              <!-- QR Code -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 25px auto;">
                <tr>
                  <td style="background:#3a3a4a; padding:8px; border-radius:12px;">
                    <img src="cid:qrcode.png" alt="QR Code" width="190" height="190" style="display:block; border-radius:6px; background:#fff;">
                  </td>
                </tr>
              </table>
              
              <p style="font-size:15px; color:#444; margin:0 0 25px;">
                <strong>Scan this QR code</strong> at the cafeteria entrance every time you come for meals.
              </p>
              
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                <tr><td style="height:1px; background:#e2e8f0;"></td></tr>
              </table>
              <br>
              <br>
              <br>
              <br>
              
              
              <!-- Footer Info -->
              <p style="font-size:12px; color:#666; margin:0;">
                <strong style="color:#333;">Haramaya University</strong><br>
                Student Affairs &bull; Cafeteria Services<br>
                <a href="https://www.haramaya.edu.et" style="color:#3b82f6; text-decoration:none;">www.haramaya.edu.et</a>
              </p>
              
              <p style="font-size:10px; color:#999; margin:20px 0 0;">Registered on: ${timestamp}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          // Replace placeholders
          html = html.replace(/{{student_name}}/g, formData.fullName);
          html = html.replace(/{{student_id}}/g, originalStudentId);
          html = html.replace(/{{to_email}}/g, formData.email);

          // Send via Brevo with inline QR code attachment
          const BREVO_API_KEY =
            "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";

          console.log("Sending email to:", formData.email);

          const emailResponse = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
              method: "POST",
              headers: {
                accept: "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json",
              },
              body: JSON.stringify({
                sender: {
                  name: "Haramaya University Cafeteria",
                  email: "amarselmansudeys@gmail.com",
                },
                to: [{ email: formData.email, name: formData.fullName }],
                subject: "Cafeteria Registration Successful – Your QR Code",
                htmlContent: html,
                attachment: [
                  {
                    content: qrBase64.split(",")[1],
                    name: "qrcode.png",
                    type: "image/png",
                  },
                ],
                inlineImageActivation: true,
                params: {
                  qrCodeImage: qrBase64.split(",")[1],
                },
              }),
            },
          );

          console.log("Email response status:", emailResponse.status);

          if (!emailResponse.ok) {
            const err = await emailResponse.json();
            console.error("Brevo error:", err);
            throw new Error(
              `Brevo failed: ${err?.message || err?.code || emailResponse.status}`,
            );
          }

          toast({
            title: "Success",
            description: `Student registered & QR code sent to ${formData.email}`,
          });
        }

        return success;
      })();

      const success = (await Promise.race([
        submitProcess,
        submissionTimeout,
      ])) as boolean;

      if (success) {
        setFormData(emptyFormData);
        setCapturedImage(null);
        toast({
          title: "Student Registered",
          description: `${formData.fullName} is now registered for meal service.`,
        });
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────
  // The rest of the component (edit, delete, support dialogs, UI, etc.) remains UNCHANGED
  // ────────────────────────────────────────────────

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      const success = await contextUpdateStudent(selectedStudent.studentId, {
        fullName: formData.fullName,
        fullNameAmharic: formData.fullNameAmharic,
        email: formData.email,
        department: formData.department,
        year: formData.year,
        cafeteriaType: formData.cafeteriaType,
        cafeStatus: formData.cafeStatus,
      });

      if (success) {
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
        setFormData(emptyFormData);
      }
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
      const success = await contextDeleteStudent(selectedStudent.studentId);
      if (success) {
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
      }
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
        status: "open",
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
            <img
              src={huLogo}
              alt="HU Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                Registrar Portal
              </h1>
              <p className="text-xs text-sidebar-foreground/70">
                {staff?.fullName}
              </p>
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
        <Tabs defaultValue={settings.registrationEnabled ? "register" : "manage"} className="space-y-6">
          <TabsList className={`grid w-full ${settings.registrationEnabled ? "grid-cols-2" : "grid-cols-1"}`}>
            {settings.registrationEnabled && (
              <TabsTrigger value="register" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Register Student
              </TabsTrigger>
            )}
            <TabsTrigger value="manage" className="gap-2">
              <Users className="w-4 h-4" />
              Manage Students
            </TabsTrigger>
          </TabsList>

          {/* Register Tab */}
          {settings.registrationEnabled && (
          <TabsContent value="register">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent" />
                  Register Student for Meal Service
                </CardTitle>
                <CardDescription>
                  Enter student details, assign cafeteria, and capture photo
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
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                studentId: e.target.value.toUpperCase(),
                              }))
                            }
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            placeholder="student@haramaya.edu.et"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value.toLowerCase(),
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name (English) *</Label>
                          <Input
                            placeholder="Full name"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Full Name (Amharic)</Label>
                          <Input
                            placeholder="ሙሉ ስም"
                            value={formData.fullNameAmharic}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                fullNameAmharic: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Department *</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                department: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Year *</Label>
                          <Select
                            value={formData.year.toString()}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                year: parseInt(value),
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  Year {year}
                                </SelectItem>
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
                            onValueChange={(value: CafeteriaType) =>
                              setFormData((prev) => ({
                                ...prev,
                                cafeteriaType: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="muslim">
                                Muslim Cafe
                              </SelectItem>
                              <SelectItem value="christian">
                                Christian Cafe
                              </SelectItem>
                              <SelectItem value="fresh">
                                Freshman Cafe
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Meal Status</Label>
                          <Select
                            value={formData.cafeStatus}
                            onValueChange={(value: CafeStatus) =>
                              setFormData((prev) => ({
                                ...prev,
                                cafeStatus: value,
                              }))
                            }
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
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={startCamera}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Camera
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
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
          )}

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
                    {studentsLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
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
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {student.studentId}
                            </code>
                          </TableCell>
                          <TableCell>{student.department}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {student.cafeteriaType === "muslim"
                                ? "Muslim"
                                : student.cafeteriaType === "christian"
                                  ? "Christian"
                                  : "Freshman"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.cafeStatus === "cafe"
                                  ? "granted"
                                  : "denied"
                              }
                            >
                              {student.cafeStatus === "cafe"
                                ? "Active"
                                : "Inactive"}
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
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, year: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        Year {year}
                      </SelectItem>
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
                  onValueChange={(value: CafeteriaType) =>
                    setFormData((prev) => ({ ...prev, cafeteriaType: value }))
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.cafeStatus}
                  onValueChange={(value: CafeStatus) =>
                    setFormData((prev) => ({ ...prev, cafeStatus: value }))
                  }
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
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedStudent?.fullName} from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-destructive text-destructive-foreground"
            >
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
            <Button
              variant="outline"
              onClick={() => setIsSupportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSupportSubmit} className="gap-2">
              <Send className="w-4 h-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inactive Staff Modal */}
      <InactiveStaffModal
        isOpen={!statusLoading && !staffIsActive}
        onLogout={signOut}
        staffName={staff?.fullName}
      />
    </div>
  );
}
