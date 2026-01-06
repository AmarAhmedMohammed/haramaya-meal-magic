import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMealSettings } from "@/contexts/MealSettingsContext";
import {
  subscribeToStudents,
  updateStudent,
  deleteStudent,
  subscribeToMealLogs,
} from "@/lib/firestore";
import { subscribeToStaff, deleteStaff, createStaff } from "@/lib/staffAuth";
import { Student, Staff, StaffRole, CafeteriaType, MealLog } from "@/types";
import * as XLSX from "xlsx";
import {
  Clock,
  Users,
  Upload,
  Trash2,
  Edit,
  UserX,
  GraduationCap,
  Ban,
  Settings,
  UserPlus,
  Coffee,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  Activity,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";

interface StaffFormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: StaffRole;
  cafeteriaType: CafeteriaType;
}

const emptyStaffForm: StaffFormData = {
  email: "",
  fullName: "",
  phoneNumber: "",
  role: "registrar",
  cafeteriaType: "christian",
};

export default function AdminDashboard() {
  const { admin, authType, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { settings, updateMealWindow, updateScanningEnabled } =
    useMealSettings();

  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isDeleteStaffOpen, setIsDeleteStaffOpen] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState<StaffFormData>(emptyStaffForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{
    staffId: string;
    email: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Student action dialogs
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentAction, setStudentAction] = useState<
    "none" | "graduated" | "persecuted" | "suspended"
  >("none");

  // Import dialog
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<"graduated" | "persecuted">(
    "graduated"
  );
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<
    { id: string; name?: string }[]
  >([]);

  const isSuperAdmin = admin?.role === "super_admin";

  useEffect(() => {
    const unsubStudents = subscribeToStudents(
      (updatedStudents) => {
        setStudents(updatedStudents);
        setLoading(false);
      },
      (error) => {
        console.error("Students snapshot listener error:", error);
        setLoading(false);
        toast({
          title: "Data access error",
          description: "Cannot load students. Please check your Firestore permissions.",
          variant: "destructive",
        });
      }
    );

    const unsubStaff = subscribeToStaff(
      (updatedStaff) => {
        setStaff(updatedStaff);
      },
      (error) => {
        console.error("Staff snapshot listener error:", error);
        toast({
          title: "Data access error",
          description: "Cannot load staff. Please check your Firestore permissions.",
          variant: "destructive",
        });
      }
    );

    const unsubLogs = subscribeToMealLogs(
      (logs) => {
        setMealLogs(logs.slice(0, 50));
      },
      undefined,
      (error) => {
        console.error("Meal logs snapshot listener error:", error);
      }
    );

    return () => {
      unsubStudents();
      unsubStaff();
      unsubLogs();
    };
  }, [toast]);

  // Wait for auth init (prevents redirect flicker)
  if (authLoading) {
    return (
      <Layout>
        <div className="py-10 text-center text-muted-foreground">Loading...</div>
      </Layout>
    );
  }

  // Redirect if not admin (wait for auth loading)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (authType !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleMealTimeChange = (
    meal: "breakfast" | "lunch" | "dinner",
    field: "start" | "end",
    value: string
  ) => {
    const currentWindow = settings.mealWindows[meal];
    updateMealWindow(meal, { ...currentWindow, [field]: value });
    toast({
      title: "Settings Updated",
      description: `${
        meal.charAt(0).toUpperCase() + meal.slice(1)
      } time updated.`,
    });
  };

  const handleAddStaff = async () => {
    if (!staffForm.email || !staffForm.fullName || !staffForm.phoneNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newStaff = await createStaff({
        email: staffForm.email.toLowerCase(),
        fullName: staffForm.fullName,
        phoneNumber: staffForm.phoneNumber,
        role: staffForm.role,
        isActive: true,
        ...(staffForm.role === "cafe_service"
          ? { cafeteriaType: staffForm.cafeteriaType }
          : {}),
      });

      setNewCredentials({
        staffId: newStaff.staffId,
        email: newStaff.email,
      });

      setIsAddStaffOpen(false);
      setStaffForm(emptyStaffForm);
      setIsCredentialsOpen(true);

      toast({
        title: "Staff Created",
        description: `${staffForm.fullName} has been registered.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      await deleteStaff(selectedStaff.staffId);
      toast({
        title: "Staff Deleted",
        description: `${selectedStaff.fullName} has been removed.`,
      });
      setIsDeleteStaffOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff.",
        variant: "destructive",
      });
    }
  };

  const handleSetStudentStatus = async () => {
    if (!selectedStudent) return;

    try {
      const newStatus = studentAction === "none" ? "active" : studentAction;
      const newCafeStatus = studentAction === "none" ? "cafe" : "none";
      await updateStudent(selectedStudent.studentId, {
        status: newStatus as
          | "active"
          | "graduated"
          | "persecuted"
          | "suspended",
        cafeStatus: newCafeStatus,
      });

      toast({
        title: "Student Status Updated",
        description: `${selectedStudent.fullName} has been marked as ${studentAction}.`,
      });

      setIsStatusDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student status.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

        const preview = jsonData.slice(0, 10).map((row) => ({
          id: row.studentId || row.id || row.ID || row.StudentId || "",
          name: row.fullName || row.name || row.Name || row.FullName || "",
        }));

        setImportPreview(preview);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportStudents = async () => {
    if (!importFile) return;

    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

        let updated = 0;
        for (const row of jsonData) {
          const studentId = row.studentId || row.id || row.ID || row.StudentId;
          if (studentId) {
            const existing = students.find((s) => s.studentId === studentId);
            if (existing) {
              await updateStudent(studentId, {
                status: importType,
                cafeStatus: "none",
              });
              updated++;
            }
          }
        }

        toast({
          title: "Import Complete",
          description: `${updated} students marked as ${importType}.`,
        });

        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportPreview([]);
        setIsSubmitting(false);
      };
      reader.readAsArrayBuffer(importFile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import students.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const todayLogs = mealLogs.filter((log) => {
    const today = new Date();
    const logDate = new Date(log.timestamp);
    return logDate.toDateString() === today.toDateString();
  });

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(
      (s) => s.status === "active" && s.cafeStatus === "cafe"
    ).length,
    nonCafeStudents: students.filter((s) => s.cafeStatus === "none").length,
    graduatedStudents: students.filter((s) => s.status === "graduated").length,
    persecutedStudents: students.filter((s) => s.status === "persecuted")
      .length,
    todayMeals: todayLogs.filter((l) => l.result === "granted").length,
    todayDenied: todayLogs.filter((l) => l.result === "denied").length,
  };

  const registrars = staff.filter((s) => s.role === "registrar");
  const cafeStaff = staff.filter((s) => s.role === "cafe_service");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage meal system settings, staff, and students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={settings.scanningEnabled ? "granted" : "denied"}>
              {settings.scanningEnabled ? "Scanning Active" : "Scanning Paused"}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Students
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.activeStudents}
                  </p>
                </div>
                <div className="p-2 bg-success/10 rounded-lg">
                  <Users className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Non-Cafe</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.nonCafeStudents}
                  </p>
                </div>
                <div className="p-2 bg-warning/10 rounded-lg">
                  <UserX className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Meals</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.todayMeals}
                  </p>
                </div>
                <div className="p-2 bg-accent/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Denied Today</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.todayDenied}
                  </p>
                </div>
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Meal Time Settings
                </CardTitle>
                <CardDescription>
                  Configure meal service windows. Scanning auto-starts/stops
                  based on these times.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Breakfast */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                      <Coffee className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-medium">Breakfast</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={settings.mealWindows.breakfast.start}
                      onChange={(e) =>
                        handleMealTimeChange(
                          "breakfast",
                          "start",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={settings.mealWindows.breakfast.end}
                      onChange={(e) =>
                        handleMealTimeChange("breakfast", "end", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Lunch */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                      <Sun className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="font-medium">Lunch</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={settings.mealWindows.lunch.start}
                      onChange={(e) =>
                        handleMealTimeChange("lunch", "start", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={settings.mealWindows.lunch.end}
                      onChange={(e) =>
                        handleMealTimeChange("lunch", "end", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Dinner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                      <Moon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-medium">Dinner</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={settings.mealWindows.dinner.start}
                      onChange={(e) =>
                        handleMealTimeChange("dinner", "start", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={settings.mealWindows.dinner.end}
                      onChange={(e) =>
                        handleMealTimeChange("dinner", "end", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Scanning Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Manual Scanning Control</p>
                    <p className="text-sm text-muted-foreground">
                      Override auto-start/stop to enable or disable scanning
                      manually
                    </p>
                  </div>
                  <Switch
                    checked={settings.scanningEnabled}
                    onCheckedChange={(checked) => {
                      updateScanningEnabled(checked);
                      toast({
                        title: checked
                          ? "Scanning Enabled"
                          : "Scanning Disabled",
                        description: checked
                          ? "Cafe service can now scan students."
                          : "Scanning has been paused.",
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Staff Management</h2>
                <p className="text-muted-foreground">
                  Manage registrar and cafe service staff
                </p>
              </div>
              <Button
                variant="hero"
                className="gap-2"
                onClick={() => setIsAddStaffOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Add Staff
              </Button>
            </div>

            {/* Registrars */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Registrars ({registrars.length})</CardTitle>
                <CardDescription>
                  Staff who can register students
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrars.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No registrars found
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrars.map((s) => (
                        <TableRow key={s.staffId}>
                          <TableCell className="font-medium">
                            {s.fullName}
                          </TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {s.staffId}
                            </code>
                          </TableCell>
                          <TableCell>{s.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge variant={s.isActive ? "granted" : "denied"}>
                              {s.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedStaff(s);
                                setIsDeleteStaffOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cafe Service Staff */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Cafe Service ({cafeStaff.length})</CardTitle>
                <CardDescription>
                  Staff who operate the scanning terminals
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Cafeteria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cafeStaff.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No cafe service staff found
                        </TableCell>
                      </TableRow>
                    ) : (
                      cafeStaff.map((s) => (
                        <TableRow key={s.staffId}>
                          <TableCell className="font-medium">
                            {s.fullName}
                          </TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {s.staffId}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {s.cafeteriaType === "muslim"
                                ? "Muslim Cafe"
                                : s.cafeteriaType === "christian"
                                ? "Christian Cafe"
                                : "Freshman Cafe"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={s.isActive ? "granted" : "denied"}>
                              {s.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedStaff(s);
                                setIsDeleteStaffOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Student Management</h2>
                <p className="text-muted-foreground">
                  Set student statuses and import bulk changes
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setImportType("graduated");
                    setIsImportDialogOpen(true);
                  }}
                >
                  <GraduationCap className="w-4 h-4" />
                  Import Graduated
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setImportType("persecuted");
                    setIsImportDialogOpen(true);
                  }}
                >
                  <Ban className="w-4 h-4" />
                  Import Persecuted
                </Button>
              </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-success/10 border-success/30">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-success">
                    {stats.activeStudents}
                  </p>
                  <p className="text-sm text-success/80">Active Students</p>
                </CardContent>
              </Card>
              <Card className="bg-warning/10 border-warning/30">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-warning">
                    {stats.nonCafeStudents}
                  </p>
                  <p className="text-sm text-warning/80">Non-Cafe</p>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-muted-foreground">
                    {stats.graduatedStudents}
                  </p>
                  <p className="text-sm text-muted-foreground">Graduated</p>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/30">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-destructive">
                    {stats.persecutedStudents}
                  </p>
                  <p className="text-sm text-destructive/80">Persecuted</p>
                </CardContent>
              </Card>
            </div>

            {/* Non-Cafe Students List */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-warning" />
                  Non-Cafe & Restricted Students
                </CardTitle>
                <CardDescription>
                  Students who cannot use the cafeteria service
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter(
                        (s) => s.cafeStatus === "none" || s.status !== "active"
                      )
                      .slice(0, 20)
                      .map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-medium">
                            {student.fullName}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {student.studentId}
                            </code>
                          </TableCell>
                          <TableCell>{student.department}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === "graduated"
                                  ? "outline"
                                  : student.status === "persecuted"
                                  ? "denied"
                                  : student.status === "suspended"
                                  ? "denied"
                                  : "none"
                              }
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedStudent(student);
                                setStudentAction(student.status as any);
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {students.filter(
                      (s) => s.cafeStatus === "none" || s.status !== "active"
                    ).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-muted-foreground"
                        >
                          All students are active
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest meal scans and system events
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Meal</TableHead>
                      <TableHead>Cafeteria</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mealLogs.slice(0, 20).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.studentName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.mealType as any}>
                            {log.mealType}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.cafeteriaName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.result === "granted" ? "granted" : "denied"
                            }
                          >
                            {log.result}
                          </Badge>
                          {log.reason && (
                            <span className="block text-xs text-muted-foreground mt-1">
                              {log.reason}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {mealLogs.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No activity recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>
              Create a new staff account. Staff ID will be auto-generated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={staffForm.role}
                onValueChange={(value: StaffRole) =>
                  setStaffForm((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrar">Registrar</SelectItem>
                  <SelectItem value="cafe_service">Cafe Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="Enter full name"
                value={staffForm.fullName}
                onChange={(e) =>
                  setStaffForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@haramaya.edu.et"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                placeholder="+251 9XX XXX XXX"
                value={staffForm.phoneNumber}
                onChange={(e) =>
                  setStaffForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
            </div>

            {staffForm.role === "cafe_service" && (
              <div className="space-y-2">
                <Label>Assigned Cafeteria *</Label>
                <Select
                  value={staffForm.cafeteriaType}
                  onValueChange={(value: CafeteriaType) =>
                    setStaffForm((prev) => ({ ...prev, cafeteriaType: value }))
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
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Credentials Created</DialogTitle>
            <DialogDescription>
              Share these credentials with the staff member. The Staff ID is
              used for login.
            </DialogDescription>
          </DialogHeader>

          {newCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm font-medium text-warning">
                  ⚠️ Save these credentials! The Staff ID cannot be recovered.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-mono font-medium">
                      {newCredentials.email}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(newCredentials.email, "email")
                    }
                  >
                    {copiedField === "email" ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Staff ID (Password)
                    </p>
                    <p className="font-mono font-medium">
                      {newCredentials.staffId}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(newCredentials.staffId, "staffId")
                    }
                  >
                    {copiedField === "staffId" ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsCredentialsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <AlertDialog open={isDeleteStaffOpen} onOpenChange={setIsDeleteStaffOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedStaff?.fullName} from the
              system. They will no longer be able to login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Student Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Student Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedStudent?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={studentAction}
              onValueChange={(value: any) => setStudentAction(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (Can use cafe)</SelectItem>
                <SelectItem value="none">Non-Cafe (No access)</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="persecuted">
                  Persecuted from University
                </SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSetStudentStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importType === "graduated" ? (
                <GraduationCap className="w-5 h-5" />
              ) : (
                <Ban className="w-5 h-5 text-destructive" />
              )}
              Import {importType === "graduated" ? "Graduated" : "Persecuted"}{" "}
              Students
            </DialogTitle>
            <DialogDescription>
              Upload an Excel file (.xlsx) with student IDs to mark as{" "}
              {importType}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload Excel file with "studentId" column
              </p>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>

            {importPreview.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview (first 10 rows):</p>
                <div className="max-h-40 overflow-y-auto bg-muted rounded-lg p-2">
                  {importPreview.map((row, i) => (
                    <div
                      key={i}
                      className="text-sm py-1 border-b border-border last:border-0"
                    >
                      <code>{row.id}</code> {row.name && `- ${row.name}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportFile(null);
                setImportPreview([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportStudents}
              disabled={!importFile || isSubmitting}
              variant={importType === "persecuted" ? "destructive" : "default"}
            >
              {isSubmitting ? "Importing..." : `Import as ${importType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
