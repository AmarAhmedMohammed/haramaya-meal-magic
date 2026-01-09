import React, { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useStudents } from "@/contexts/StudentsContext";
import { CafeStatus, CafeteriaType } from "@/types";
import { UserPlus, ArrowLeft, Save, RefreshCw, Camera, Upload, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface StudentFormData {
  studentId: string;
  fullName: string;
  fullNameAmharic: string;
  email: string;
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
  email: "",
  department: "",
  year: 1,
  cafeStatus: "cafe",
  cafeteriaType: "christian",
  hostelResident: false,
  monthlyQuota: null,
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

export default function RegisterStudent() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { students, addStudent: contextAddStudent } = useStudents();
  
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = admin?.role === 'super_admin' || admin?.role === 'registrar_admin';

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 854 } },
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);
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

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.fullName || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate using context students
    const existingById = students.find((s) => s.studentId === formData.studentId);
    if (existingById) {
      toast({
        title: "Duplicate ID",
        description: "A student with this ID already exists.",
        variant: "destructive",
      });
      return;
    }

    if (formData.email) {
      const existingByEmail = students.find((s) => s.email === formData.email);
      if (existingByEmail) {
        toast({
          title: "Duplicate Email",
          description: "A student with this email already exists.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const success = await contextAddStudent({
        studentId: formData.studentId,
        fullName: formData.fullName,
        fullNameAmharic: formData.fullNameAmharic,
        email: formData.email || '',
        department: formData.department,
        year: formData.year,
        cafeStatus: formData.cafeStatus,
        cafeteriaType: formData.cafeteriaType,
        hostelResident: formData.hostelResident,
        monthlyQuota: formData.monthlyQuota,
        photoURL: capturedImage || undefined,
        status: 'active',
      });

      if (success) {
        toast({
          title: "Student Registered",
          description: `${formData.fullName} has been registered successfully.`,
        });
        setFormData(emptyFormData);
        setCapturedImage(null);
      }
    } catch (error) {
      console.error("Error registering student:", error);
      toast({
        title: "Error",
        description: "Failed to register student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(emptyFormData);
    setCapturedImage(null);
    stopCamera();
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to register students.
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Register Student
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new student to the meal system
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" />
              Student Information
            </CardTitle>
            <CardDescription>
              Fill in the student details below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student ID */}
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID / Barcode *</Label>
                <Input
                  id="studentId"
                  placeholder="e.g., UGPR0680/16"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange("studentId", e.target.value.toUpperCase())}
                  className="font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This should match the barcode on the student's ID card
                </p>
              </div>

              {/* Names */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (English) *</Label>
                  <Input
                    id="fullName"
                    placeholder="Full name in English"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullNameAmharic">Full Name (Amharic)</Label>
                  <Input
                    id="fullNameAmharic"
                    placeholder="ሙሉ ስም በአማርኛ"
                    value={formData.fullNameAmharic}
                    onChange={(e) => handleInputChange("fullNameAmharic", e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              {/* Photo Capture Section */}
              <div className="space-y-3">
                <Label>Student Photo</Label>
                <div className="border rounded-lg p-4 bg-muted/30">
                  {capturedImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-32 h-40 object-cover rounded-lg border-2 border-primary"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={retakePhoto}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Photo
                      </Button>
                    </div>
                  ) : showCamera ? (
                    <div className="flex flex-col items-center gap-3">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-48 h-64 object-cover rounded-lg border"
                      />
                      <Button type="button" onClick={capturePhoto}>
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button type="button" variant="outline" onClick={startCamera}>
                        <Camera className="w-4 h-4 mr-2" />
                        Use Camera
                      </Button>
                      <span className="text-muted-foreground text-sm">or</span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
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
                <p className="text-xs text-muted-foreground">
                  Photo will be stored directly in the database (base64)
                </p>
              </div>

              {/* Hidden canvas for photo processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Department and Year */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
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
                  <Label htmlFor="year">Year *</Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value) => handleInputChange("year", parseInt(value))}
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

              {/* Cafeteria Type */}
              <div className="space-y-2">
                <Label htmlFor="cafeteriaType">Cafeteria Type *</Label>
                <Select
                  value={formData.cafeteriaType}
                  onValueChange={(value: CafeteriaType) => handleInputChange("cafeteriaType", value)}
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
                  The student can only scan at their assigned cafeteria
                </p>
              </div>

              {/* Cafe Status */}
              <div className="space-y-2">
                <Label htmlFor="cafeStatus">Meal Status</Label>
                <Select
                  value={formData.cafeStatus}
                  onValueChange={(value: CafeStatus) => handleInputChange("cafeStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cafe">Active (Can receive meals)</SelectItem>
                    <SelectItem value="none">Inactive (No meal access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hostel Resident */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="hostelResident">Hostel Resident</Label>
                  <p className="text-xs text-muted-foreground">
                    Is the student living in university hostel?
                  </p>
                </div>
                <Switch
                  id="hostelResident"
                  checked={formData.hostelResident}
                  onCheckedChange={(checked) => handleInputChange("hostelResident", checked)}
                />
              </div>

              {/* Monthly Quota */}
              <div className="space-y-2">
                <Label htmlFor="monthlyQuota">Monthly Quota (optional)</Label>
                <Input
                  id="monthlyQuota"
                  type="number"
                  min={0}
                  placeholder="Leave empty for unlimited"
                  value={formData.monthlyQuota ?? ""}
                  onChange={(e) => 
                    handleInputChange(
                      "monthlyQuota", 
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Register Student
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
