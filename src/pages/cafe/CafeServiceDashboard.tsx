import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMealSettings } from "@/contexts/MealSettingsContext";
import {
  getStudent,
  createMealLog,
  updateStudent,
  subscribeToStudents,
} from "@/lib/firestore";
import { Student, MealType, CafeteriaType } from "@/types";
import { InactiveStaffModal } from "@/components/InactiveStaffModal";
import { useStaffStatus } from "@/hooks/useStaffStatus";
import {
  ScanLine,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  LogOut,
  User,
  Coffee,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Camera,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import huLogo from "@/assets/hu-logo.png";
import { InlineScanner } from "@/components/scanner/InlineScanner";

// Status message types
type ScanStatus = "idle" | "granted" | "denied" | "warning" | "error";

interface ScanResult {
  status: ScanStatus;
  message: string;
  subMessage?: string;
  student?: Student;
}

export default function CafeServiceDashboard() {
  const { staff, signOut, authType, loading: authLoading } = useAuth();
  const { settings } = useMealSettings();
  const { toast } = useToast();

  // Real-time staff status check
  const { isActive: staffIsActive, loading: statusLoading } = useStaffStatus(staff?.staffId);

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult>({
    status: "idle",
    message: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<MealType | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannerActive, setScannerActive] = useState(true);

  // Scanner refs
  const scannerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio refs
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const staffCafeteria = staff?.cafeteriaType || "christian";

  // Subscribe to students for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
    });

    return () => unsubscribe();
  }, []);

  // Determine current meal based on time - live update every 10 seconds and when settings change
  useEffect(() => {
    const checkMealTime = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const { mealWindows } = settings;

      const toMinutes = (timeStr: string): number => {
        if (!timeStr || typeof timeStr !== 'string') return -1;
        const parts = timeStr.split(":");
        if (parts.length !== 2) return -1;
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return -1;
        return h * 60 + m;
      };

      const isTimeInRange = (startStr: string, endStr: string): boolean => {
        const start = toMinutes(startStr);
        const end = toMinutes(endStr);
        if (start < 0 || end < 0) return false;
        
        // Invalid window: end is before start but NOT a midnight-crossing window
        // Only consider midnight crossing if end is before 06:00 (early morning)
        if (start > end) {
          // If end time is after 06:00, it's an invalid configuration, not midnight crossing
          if (end > 360) { // 06:00 = 360 minutes
            return false; // Invalid window, never active
          }
          // True midnight crossing (e.g., 22:00 to 02:00)
          return currentMinutes >= start || currentMinutes < end;
        }
        
        // Normal window: start <= end
        return currentMinutes >= start && currentMinutes < end;
      };

      // Check each meal window in order
      let detectedMeal: MealType | null = null;
      
      if (mealWindows?.breakfast && isTimeInRange(mealWindows.breakfast.start, mealWindows.breakfast.end)) {
        detectedMeal = "breakfast";
      } else if (mealWindows?.lunch && isTimeInRange(mealWindows.lunch.start, mealWindows.lunch.end)) {
        detectedMeal = "lunch";
      } else if (mealWindows?.dinner && isTimeInRange(mealWindows.dinner.start, mealWindows.dinner.end)) {
        detectedMeal = "dinner";
      }

      setCurrentMeal(detectedMeal);
    };

    // Check immediately and every 10 seconds for responsive updates
    checkMealTime();
    const interval = setInterval(checkMealTime, 10000);

    return () => clearInterval(interval);
  }, [settings.mealWindows.breakfast.start, settings.mealWindows.breakfast.end, 
      settings.mealWindows.lunch.start, settings.mealWindows.lunch.end,
      settings.mealWindows.dinner.start, settings.mealWindows.dinner.end]);

  // Focus input for barcode scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, [scanResult]);

  // Redirect if not cafe service (wait for auth loading)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authType !== "staff" || staff?.role !== "cafe_service") {
    return <Navigate to="/" replace />;
  }

  const playSound = (type: "success" | "error") => {
    if (!soundEnabled) return;

    // Use Web Audio API for simple tones
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === "success") {
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.value = 0.3;
      } else {
        oscillator.frequency.value = 300;
        oscillator.type = "square";
        gainNode.gain.value = 0.2;
      }

      oscillator.start();
      setTimeout(
        () => {
          oscillator.stop();
          audioContext.close();
        },
        type === "success" ? 200 : 400
      );
    } catch (e) {
      // Audio not supported
    }
  };

  const getCafeteriaLabel = (type: CafeteriaType): string => {
    switch (type) {
      case "muslim":
        return "Muslim Cafeteria";
      case "christian":
        return "Christian Cafeteria";
      case "fresh":
        return "Freshman Cafeteria";
      default:
        return "Unknown";
    }
  };

  const processScan = async (studentId: string) => {
    if (isProcessing || !studentId.trim()) return;

    setIsProcessing(true);
    setSearchQuery("");

    // Clear previous auto-reset timer
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
    }

    try {
      // Find student in real-time subscribed data first
      let student = students.find(
        (s) => s.studentId.toLowerCase() === studentId.toLowerCase()
      );

      // If not found, try to fetch from Firestore
      if (!student) {
        student = (await getStudent(studentId)) || undefined;
      }

      if (!student) {
        playSound("error");
        setScanResult({
          status: "error",
          message: "Student Not Found",
          subMessage: `ID: ${studentId} is not registered in the system`,
        });
        logMealAttempt(studentId, "denied", "Student not found");
        return;
      }

      // Check if scanning is enabled
      if (!settings.scanningEnabled) {
        playSound("error");
        setScanResult({
          status: "error",
          message: "Scanning Disabled",
          subMessage: "Meal service is currently paused by admin",
          student,
        });
        return;
      }

      // Check if current meal time
      if (!currentMeal) {
        playSound("error");
        setScanResult({
          status: "warning",
          message: "Outside Meal Hours",
          subMessage: "No meal service is currently active",
          student,
        });
        return;
      }

      // Check student status
      if (student.status === "graduated") {
        playSound("error");
        setScanResult({
          status: "denied",
          message: "Already Graduated",
          subMessage: "This student has already graduated from the university",
          student,
        });
        logMealAttempt(studentId, "denied", "Student graduated", student);
        return;
      }

      if (student.status === "persecuted") {
        playSound("error");
        setScanResult({
          status: "denied",
          message: "Persecuted from University",
          subMessage: "This student has been persecuted from the university",
          student,
        });
        logMealAttempt(studentId, "denied", "Student persecuted", student);
        return;
      }

      if (student.status === "suspended") {
        playSound("error");
        setScanResult({
          status: "denied",
          message: "Student Suspended",
          subMessage: "This student is currently suspended",
          student,
        });
        logMealAttempt(studentId, "denied", "Student suspended", student);
        return;
      }

      // Check cafe status
      if (student.cafeStatus === "none") {
        playSound("error");
        setScanResult({
          status: "denied",
          message: "Non-Cafe Student",
          subMessage: "This student is not registered for cafeteria service",
          student,
        });
        logMealAttempt(studentId, "denied", "Non-cafe student", student);
        return;
      }

      // Check cafeteria type
      if (student.cafeteriaType !== staffCafeteria) {
        const studentCafe = getCafeteriaLabel(student.cafeteriaType);
        playSound("error");
        setScanResult({
          status: "warning",
          message: "Wrong Cafeteria",
          subMessage: `This student belongs to ${studentCafe}`,
          student,
        });
        logMealAttempt(
          studentId,
          "denied",
          `Wrong cafeteria - belongs to ${studentCafe}`,
          student
        );
        return;
      }

      // Check if already scanned for this meal
      if (student.lastMeal) {
        const lastMealDate = new Date(student.lastMeal.timestamp);
        const today = new Date();

        if (
          lastMealDate.toDateString() === today.toDateString() &&
          student.lastMeal.mealType === currentMeal
        ) {
          playSound("error");
          setScanResult({
            status: "denied",
            message: "Already Scanned",
            subMessage: `This student already received ${currentMeal} today`,
            student,
          });
          logMealAttempt(
            studentId,
            "denied",
            "Already scanned for this meal",
            student
          );
          return;
        }
      }

      // All checks passed - grant access
      playSound("success");

      // Update student's last meal
      await updateStudent(studentId, {
        lastMeal: {
          mealType: currentMeal,
          timestamp: new Date(),
          cafeteriaId: staffCafeteria,
        },
        usedQuota: (student.usedQuota || 0) + 1,
      });

      // Log the meal
      logMealAttempt(studentId, "granted", undefined, student);

      setScanResult({
        status: "granted",
        message: "Access Granted",
        subMessage: `${
          currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)
        } meal approved`,
        student,
      });
    } catch (error) {
      console.error("Scan error:", error);
      playSound("error");
      setScanResult({
        status: "error",
        message: "System Error",
        subMessage: "Please try again or contact support",
      });
    } finally {
      setIsProcessing(false);

      // Auto-reset after 3 seconds for next scan
      autoResetTimerRef.current = setTimeout(() => {
        setScanResult({ status: "idle", message: "" });
        inputRef.current?.focus();
      }, 3000);
    }
  };

  const logMealAttempt = async (
    studentId: string,
    result: "granted" | "denied",
    reason?: string,
    student?: Student
  ) => {
    try {
      await createMealLog({
        studentId,
        studentName: student?.fullName || "Unknown",
        mealType: currentMeal || "lunch",
        cafeteriaId: staffCafeteria,
        cafeteriaName: getCafeteriaLabel(staffCafeteria),
        timestamp: new Date(),
        result,
        reason,
        cashierId: staff?.staffId,
        synced: true,
      });
    } catch (error) {
      console.error("Failed to log meal:", error);
    }
  };

  const resetScanner = () => {
    setScanResult({ status: "idle", message: "" });
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      processScan(searchQuery);
    }
  };

  const getMealIcon = () => {
    switch (currentMeal) {
      case "breakfast":
        return <Coffee className="w-6 h-6" />;
      case "lunch":
        return <Sun className="w-6 h-6" />;
      case "dinner":
        return <Moon className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (scanResult.status) {
      case "granted":
        return "bg-success";
      case "denied":
        return "bg-destructive";
      case "warning":
        return "bg-warning";
      case "error":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-sidebar border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={huLogo}
              alt="HU Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                {getCafeteriaLabel(staffCafeteria)}
              </h1>
              <p className="text-xs text-sidebar-foreground/70">
                {staff?.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Current Meal Badge */}
            <Badge
              variant={currentMeal ? "granted" : "denied"}
              className="gap-2 py-1.5 px-3"
            >
              {getMealIcon()}
              {currentMeal
                ? currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)
                : "Closed"}
            </Badge>

            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-sidebar-foreground/70"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-sidebar-foreground/70 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-40 flex flex-col lg:flex-row gap-6 overflow-y-auto">
        {/* Scanner Section */}
        <div className="lg:flex-1 space-y-6">
          {/* Scan Input */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent/20 rounded-xl">
                <ScanLine className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Scan Student ID</h2>
                <p className="text-sm text-muted-foreground">
                  Scan barcode or enter ID manually
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Scan barcode or type student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="pl-12 pr-36 h-14 text-lg font-mono"
                autoFocus
                disabled={isProcessing}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <Button
                  onClick={() => processScan(searchQuery)}
                  disabled={isProcessing || !searchQuery.trim()}
                  className="h-10"
                >
                  Verify
                </Button>
              </div>
            </div>
          </Card>

          {/* Inline Camera Scanner */}
          {scanResult.status === "idle" && !isProcessing && (
            <div>
              <InlineScanner
                isActive={scannerActive}
                onScan={(code) => {
                  processScan(code);
                }}
                onStop={() => setScannerActive(false)}
                onStart={() => setScannerActive(true)}
              />
            </div>
          )}
          {/* Scan Result Display */}
          {/* Processing State */}
          {isProcessing && (
            <Card className="h-[400px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-[#006d5b]/20 border-t-[#006d5b] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className="w-8 h-8 text-[#006d5b]/40 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#006d5b] mb-2">
                Processing Identity
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Verifying student credentials and checking meal eligibility...
              </p>
            </Card>
          )}

          {/* Success State */}
          {scanResult.status === "granted" && scanResult.student && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <Card className="border-2 border-green-500 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-green-800">
                        {scanResult.message}
                      </h3>
                      <p className="text-green-700">
                        {scanResult.student.fullName}
                      </p>
                      <p className="text-sm text-green-600">
                        {currentMeal?.toUpperCase()} -{" "}
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={resetScanner}
                    className="mt-4 w-full"
                    variant="outline"
                  >
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error State */}
          {(scanResult.status === "denied" ||
            scanResult.status === "error" ||
            scanResult.status === "warning") && (
            <div className="animate-in shake duration-300">
              <Card className="border-2 border-red-500 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <XCircle className="w-12 h-12 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-red-800">
                        {scanResult.message}
                      </h3>
                      {scanResult.subMessage && (
                        <p className="text-red-700">{scanResult.subMessage}</p>
                      )}
                      <p className="text-sm text-red-600">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={resetScanner}
                    className="mt-4 w-full"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Side Panel - Student Photo & Info */}
        </div>

        {/* Side Panel - Student Photo & Info */}
        <div className="hidden lg:block w-80 shrink-0">
          <Card className="h-full border-2 p-4 flex flex-col items-center justify-start bg-white/50 backdrop-blur-sm">
            <h3 className="text-sm font-serif font-bold text-[#1a4d2e]/70 mb-4 tracking-wide w-full text-left border-b pb-2">
              Student Photo
            </h3>
            <div className="w-full aspect-[3/4] rounded-xl bg-[#f0f2f0] border-2 border-dashed border-[#1a4d2e]/10 flex items-center justify-center overflow-hidden shadow-inner group transition-all hover:border-[#1a4d2e]/30">
              {isProcessing ? (
                <Skeleton className="w-full h-full bg-[#e2e8e2] animate-pulse" />
              ) : scanResult.student?.photoURL ? (
                <img
                  src={scanResult.student.photoURL}
                  alt="Student"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <User className="w-24 h-24 text-[#cbd5cc]" />
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a4d2e] border-t border-white/10 py-2 px-4 shadow-lg shrink-0">
        <div className="container mx-auto flex items-center justify-between text-sm text-white/90">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Badge
              variant={settings.scanningEnabled ? "granted" : "denied"}
              className="border-white/20"
            >
              {settings.scanningEnabled ? "Scanning Active" : "Scanning Paused"}
            </Badge>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 border-l border-white/20 pl-4">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 border-l border-white/20 pl-4">
                <span className="text-[10px] uppercase font-bold opacity-60">
                  Settings:
                </span>
                <span className="text-xs font-mono">
                  B:{settings.mealWindows.breakfast.start}-
                  {settings.mealWindows.breakfast.end} | L:
                  {settings.mealWindows.lunch.start}-
                  {settings.mealWindows.lunch.end} | D:
                  {settings.mealWindows.dinner.start}-
                  {settings.mealWindows.dinner.end}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-80">
            <span>Staff ID: {staff?.staffId}</span>
          </div>
        </div>
      </footer>

      {/* Inactive Staff Modal */}
      <InactiveStaffModal
        isOpen={!statusLoading && !staffIsActive}
        onLogout={signOut}
        staffName={staff?.fullName}
      />
    </div>
  );
}
