import React, { useState } from "react";
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
import { createStudent, getAllStudents } from "@/lib/firestore";
import { CafeStatus, CafeteriaType } from "@/types";
import { UserPlus, ArrowLeft, Save, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = admin?.role === 'super_admin' || admin?.role === 'registrar_admin';

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    setIsSubmitting(true);

    try {
      // Check for duplicate
      const existingStudents = await getAllStudents();
      if (existingStudents.some((s) => s.studentId === formData.studentId)) {
        toast({
          title: "Duplicate ID",
          description: "A student with this ID already exists.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      await createStudent({
        studentId: formData.studentId,
        fullName: formData.fullName,
        fullNameAmharic: formData.fullNameAmharic,
        department: formData.department,
        year: formData.year,
        cafeStatus: formData.cafeStatus,
        cafeteriaType: formData.cafeteriaType,
        hostelResident: formData.hostelResident,
        monthlyQuota: formData.monthlyQuota,
        usedQuota: 0,
      });

      toast({
        title: "Student Registered",
        description: `${formData.fullName} has been registered successfully.`,
      });

      setFormData(emptyFormData);
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
