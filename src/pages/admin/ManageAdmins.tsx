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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { auth, secondaryAuth, db } from "@/lib/firebase";
import { Admin, UserRole, Staff, StaffRole, CafeteriaType } from "@/types";
import { subscribeToStaff, deleteStaff, createStaff, updateStaff } from "@/lib/staffAuth";
import {
  Shield,
  Plus,
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  UserCog,
  Key,
  Users,
  Coffee,
  Edit,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AdminFormData {
  email: string;
  displayName: string;
  role: UserRole;
  cafeteriaId: string;
}

interface StaffFormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: StaffRole;
  cafeteriaType: CafeteriaType;
}

const emptyFormData: AdminFormData = {
  email: "",
  displayName: "",
  role: "cashier",
  cafeteriaId: "",
};

const emptyStaffForm: StaffFormData = {
  email: "",
  fullName: "",
  phoneNumber: "",
  role: "registrar",
  cafeteriaType: "christian",
};

// Generate random admin ID
function generateAdminId(): string {
  const prefix = "ADM";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Generate random password
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function ManageAdmins() {
  const { admin: currentAdmin } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteStaffDialogOpen, setIsDeleteStaffDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isStaffCredentialsDialogOpen, setIsStaffCredentialsDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<AdminFormData>(emptyFormData);
  const [staffForm, setStaffForm] = useState<StaffFormData>(emptyStaffForm);
  const [editStaffForm, setEditStaffForm] = useState<StaffFormData & { isActive: boolean }>({
    ...emptyStaffForm,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{
    adminId: string;
    email: string;
    password: string;
  } | null>(null);
  const [newStaffCredentials, setNewStaffCredentials] = useState<{
    staffId: string;
    email: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("admins");

  const isSuperAdmin = currentAdmin?.role === "super_admin";

  useEffect(() => {
    const adminsRef = collection(db, "admins");
    const unsubscribeAdmins = onSnapshot(adminsRef, (snapshot) => {
      const adminsList = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Admin[];
      setAdmins(adminsList);
      setLoading(false);
    });

    const unsubscribeStaff = subscribeToStaff(
      (updatedStaff) => {
        setStaffList(updatedStaff);
      },
      (error) => {
        console.error("Staff snapshot listener error:", error);
      }
    );

    return () => {
      unsubscribeAdmins();
      unsubscribeStaff();
    };
  }, []);

  const handleInputChange = (field: keyof AdminFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAdmin = async () => {
    if (!formData.email || !formData.displayName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const adminId = generateAdminId();
      const password = generatePassword();

      // Create Firebase Auth user using secondary auth to avoid signing out current admin
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        password
      );
      
      // Sign out from secondary auth immediately
      await firebaseSignOut(secondaryAuth);

      // Create admin document in Firestore
      await setDoc(doc(db, "admins", userCredential.user.uid), {
        uid: userCredential.user.uid,
        adminId,
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        cafeteriaId: formData.cafeteriaId || null,
        createdAt: Timestamp.now(),
      });

      // Store credentials to show
      setNewCredentials({
        adminId,
        email: formData.email,
        password,
      });

      setIsAddDialogOpen(false);
      setFormData(emptyFormData);
      setIsCredentialsDialogOpen(true);

      toast({
        title: "Admin Created",
        description: `${
          formData.displayName
        } has been added as ${formData.role.replace("_", " ")}.`,
      });
    } catch (error: any) {
      console.error("Error creating admin:", error);
      let errorMessage = "Failed to create admin. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Use a different email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      // Delete admin document from Firestore
      await deleteDoc(doc(db, "admins", selectedAdmin.uid));

      // Note: Firebase Auth user cannot be deleted from client SDK
      // The Auth user will remain but won't have access since the admin doc is gone
      // For complete cleanup, a Cloud Function would be needed

      toast({
        title: "Admin Deleted",
        description: `${selectedAdmin.displayName} has been removed from the system. Their login credentials have been revoked.`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Error",
        description: "Failed to delete admin. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Staff handlers
  const handleStaffInputChange = (field: keyof StaffFormData, value: any) => {
    setStaffForm((prev) => ({ ...prev, [field]: value }));
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

      setNewStaffCredentials({
        staffId: newStaff.staffId,
        email: newStaff.email,
      });

      setIsAddStaffDialogOpen(false);
      setStaffForm(emptyStaffForm);
      setIsStaffCredentialsDialogOpen(true);

      toast({
        title: "Staff Created",
        description: `${staffForm.fullName} has been registered as ${staffForm.role === "registrar" ? "Registrar" : "Cafe Service"}.`,
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
        description: `${selectedStaff.fullName} has been removed. They can no longer login.`,
      });
      setIsDeleteStaffDialogOpen(false);
      setSelectedStaff(null);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff.",
        variant: "destructive",
      });
    }
  };

  const openEditStaffDialog = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setEditStaffForm({
      email: staffMember.email,
      fullName: staffMember.fullName,
      phoneNumber: staffMember.phoneNumber,
      role: staffMember.role,
      cafeteriaType: staffMember.cafeteriaType || "christian",
      isActive: staffMember.isActive,
    });
    setIsEditStaffDialogOpen(true);
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    setIsSubmitting(true);
    try {
      await updateStaff(selectedStaff.staffId, {
        fullName: editStaffForm.fullName,
        email: editStaffForm.email.toLowerCase(),
        phoneNumber: editStaffForm.phoneNumber,
        isActive: editStaffForm.isActive,
        ...(selectedStaff.role === "cafe_service"
          ? { cafeteriaType: editStaffForm.cafeteriaType }
          : {}),
      });

      toast({
        title: "Staff Updated",
        description: `${editStaffForm.fullName} has been updated successfully.`,
      });
      setIsEditStaffDialogOpen(false);
      setSelectedStaff(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrars = staffList.filter((s) => s.role === "registrar");
  const cafeStaff = staffList.filter((s) => s.role === "cafe_service");

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "default";
      case "registrar_admin":
        return "secondary";
      case "cafeteria_manager":
        return "outline";
      case "cashier":
        return "cafe";
      default:
        return "outline";
    }
  };

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            Only super admins can manage admin users.
          </p>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
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
                Manage Users
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage admin and staff accounts
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeTab === "staff" ? (
              <Button
                variant="hero"
                className="gap-2"
                onClick={() => setIsAddStaffDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Staff
              </Button>
            ) : (
              <Button
                variant="hero"
                className="gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Admin
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="w-4 h-4" />
              Admins ({admins.length})
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Users className="w-4 h-4" />
              Staff ({staffList.length})
            </TabsTrigger>
          </TabsList>

          {/* Admins Tab */}
          <TabsContent value="admins">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Admin Users
                </CardTitle>
                <CardDescription>
                  All admin users with their roles and access levels
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Admin ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
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
                            Loading admins...
                          </TableCell>
                        </TableRow>
                      ) : admins.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No admins found
                          </TableCell>
                        </TableRow>
                      ) : (
                        admins.map((adminUser, index) => (
                          <motion.tr
                            key={adminUser.uid}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group border-b"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                  <UserCog className="w-5 h-5 text-accent" />
                                </div>
                                <p className="font-medium text-foreground">
                                  {adminUser.displayName}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {(adminUser as any).adminId || "N/A"}
                              </code>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {adminUser.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(adminUser.role)}>
                                {adminUser.role.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {adminUser.createdAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {adminUser.uid !== currentAdmin?.uid && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setSelectedAdmin(adminUser);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            {/* Registrar Staff */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Registrar Staff ({registrars.length})
                </CardTitle>
                <CardDescription>
                  Staff who can register students
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Email</TableHead>
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
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {s.staffId}
                            </code>
                          </TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{s.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge variant={s.isActive ? "granted" : "denied"}>
                              {s.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditStaffDialog(s)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setSelectedStaff(s);
                                  setIsDeleteStaffDialogOpen(true);
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

            {/* Cafe Service Staff */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-success" />
                  Cafe Service Staff ({cafeStaff.length})
                </CardTitle>
                <CardDescription>
                  Staff who operate the scanning terminals
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Email</TableHead>
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
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {s.staffId}
                            </code>
                          </TableCell>
                          <TableCell>{s.email}</TableCell>
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
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditStaffDialog(s)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setSelectedStaff(s);
                                  setIsDeleteStaffDialogOpen(true);
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

        {/* Add Admin Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Create a new admin account. A password will be auto-generated.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@haramaya.edu.et"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="Full name"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) =>
                    handleInputChange("role", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.role === "cafeteria_manager" ||
                formData.role === "cashier") && (
                <div className="space-y-2">
                  <Label htmlFor="cafeteriaId">Assigned Cafeteria</Label>
                  <Select
                    value={formData.cafeteriaId}
                    onValueChange={(value) =>
                      handleInputChange("cafeteriaId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cafeteria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAF-MUSLIM">Muslim Cafe</SelectItem>
                      <SelectItem value="CAF-CHRISTIAN">
                        Christian Cafe
                      </SelectItem>
                      <SelectItem value="CAF-FRESH">Freshman Cafe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAdmin} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credentials Dialog */}
        <Dialog
          open={isCredentialsDialogOpen}
          onOpenChange={setIsCredentialsDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-accent" />
                Admin Credentials Created
              </DialogTitle>
              <DialogDescription>
                Save these credentials securely. The password cannot be
                retrieved later.
              </DialogDescription>
            </DialogHeader>

            {newCredentials && (
              <div className="space-y-4">
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm font-medium text-warning">
                    ⚠️ Important: Copy and save these credentials now!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Admin ID</p>
                      <p className="font-mono font-medium">
                        {newCredentials.adminId}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(newCredentials.adminId, "adminId")
                      }
                    >
                      {copiedField === "adminId" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

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
                      <p className="text-xs text-muted-foreground">Password</p>
                      <p className="font-mono font-medium">
                        {newCredentials.password}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(newCredentials.password, "password")
                      }
                    >
                      {copiedField === "password" ? (
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
              <Button
                onClick={() => {
                  setIsCredentialsDialogOpen(false);
                  setNewCredentials(null);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Admin</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Are you sure you want to delete {selectedAdmin?.displayName}?</p>
                <p className="text-sm">This will revoke their access to the system. This action cannot be undone.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAdmin}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Admin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Staff Dialog */}
        <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
              <DialogDescription>
                Create a new registrar or cafe service staff account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="staff@haramaya.edu.et"
                  value={staffForm.email}
                  onChange={(e) => handleStaffInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Full name"
                  value={staffForm.fullName}
                  onChange={(e) => handleStaffInputChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+251..."
                  value={staffForm.phoneNumber}
                  onChange={(e) => handleStaffInputChange("phoneNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={staffForm.role} onValueChange={(v: StaffRole) => handleStaffInputChange("role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registrar">Registrar</SelectItem>
                    <SelectItem value="cafe_service">Cafe Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {staffForm.role === "cafe_service" && (
                <div className="space-y-2">
                  <Label>Cafeteria *</Label>
                  <Select value={staffForm.cafeteriaType} onValueChange={(v: CafeteriaType) => handleStaffInputChange("cafeteriaType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStaff} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Staff"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Staff Credentials Dialog */}
        <Dialog open={isStaffCredentialsDialogOpen} onOpenChange={setIsStaffCredentialsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-accent" />Staff Credentials</DialogTitle>
              <DialogDescription>Save these credentials. The Staff ID is required for login.</DialogDescription>
            </DialogHeader>
            {newStaffCredentials && (
              <div className="space-y-3">
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm font-medium text-warning">⚠️ Copy and save the Staff ID now!</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div><p className="text-xs text-muted-foreground">Staff ID</p><p className="font-mono font-medium">{newStaffCredentials.staffId}</p></div>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newStaffCredentials.staffId, "staffId")}>
                    {copiedField === "staffId" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="font-mono font-medium">{newStaffCredentials.email}</p></div>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newStaffCredentials.email, "staffEmail")}>
                    {copiedField === "staffEmail" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter><Button onClick={() => { setIsStaffCredentialsDialogOpen(false); setNewStaffCredentials(null); }}>Done</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Staff Dialog */}
        <AlertDialog open={isDeleteStaffDialogOpen} onOpenChange={setIsDeleteStaffDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {selectedStaff?.fullName} from the system. They will no longer be able to login.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStaff} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
