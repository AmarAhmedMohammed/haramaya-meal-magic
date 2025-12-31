import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { Navigate } from "react-router-dom";
import huLogo from "@/assets/hu-logo.png";

// Status message types
type ScanStatus = 'idle' | 'granted' | 'denied' | 'warning' | 'error';

interface ScanResult {
  status: ScanStatus;
  message: string;
  subMessage?: string;
  student?: Student;
}

export default function CafeServiceDashboard() {
  const { staff, signOut, authType } = useAuth();
  const { settings } = useMealSettings();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult>({ status: 'idle', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<MealType | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Scanner refs
  const scannerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio refs
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const staffCafeteria = staff?.cafeteriaType || 'christian';

  // Subscribe to students for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
    });

    return () => unsubscribe();
  }, []);

  // Determine current meal based on time
  useEffect(() => {
    const checkMealTime = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const { mealWindows } = settings;
      
      if (currentTime >= mealWindows.breakfast.start && currentTime <= mealWindows.breakfast.end) {
        setCurrentMeal('breakfast');
      } else if (currentTime >= mealWindows.lunch.start && currentTime <= mealWindows.lunch.end) {
        setCurrentMeal('lunch');
      } else if (currentTime >= mealWindows.dinner.start && currentTime <= mealWindows.dinner.end) {
        setCurrentMeal('dinner');
      } else {
        setCurrentMeal(null);
      }
    };

    checkMealTime();
    const interval = setInterval(checkMealTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [settings]);

  // Focus input for barcode scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, [scanResult]);

  // Redirect if not cafe service
  if (authType !== 'staff' || staff?.role !== 'cafe_service') {
    return <Navigate to="/" replace />;
  }

  const playSound = (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    
    // Use Web Audio API for simple tones
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'success') {
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
      } else {
        oscillator.frequency.value = 300;
        oscillator.type = 'square';
        gainNode.gain.value = 0.2;
      }
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, type === 'success' ? 200 : 400);
    } catch (e) {
      // Audio not supported
    }
  };

  const getCafeteriaLabel = (type: CafeteriaType): string => {
    switch (type) {
      case 'muslim': return 'Muslim Cafeteria';
      case 'christian': return 'Christian Cafeteria';
      case 'fresh': return 'Freshman Cafeteria';
      default: return 'Unknown';
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
      let student = students.find(s => s.studentId.toLowerCase() === studentId.toLowerCase());
      
      // If not found, try to fetch from Firestore
      if (!student) {
        student = await getStudent(studentId) || undefined;
      }

      if (!student) {
        playSound('error');
        setScanResult({
          status: 'error',
          message: 'Student Not Found',
          subMessage: `ID: ${studentId} is not registered in the system`,
        });
        logMealAttempt(studentId, 'denied', 'Student not found');
        return;
      }

      // Check if scanning is enabled
      if (!settings.scanningEnabled) {
        playSound('error');
        setScanResult({
          status: 'error',
          message: 'Scanning Disabled',
          subMessage: 'Meal service is currently paused by admin',
          student,
        });
        return;
      }

      // Check if current meal time
      if (!currentMeal) {
        playSound('error');
        setScanResult({
          status: 'warning',
          message: 'Outside Meal Hours',
          subMessage: 'No meal service is currently active',
          student,
        });
        return;
      }

      // Check student status
      if (student.status === 'graduated') {
        playSound('error');
        setScanResult({
          status: 'denied',
          message: 'Already Graduated',
          subMessage: 'This student has already graduated from the university',
          student,
        });
        logMealAttempt(studentId, 'denied', 'Student graduated', student);
        return;
      }

      if (student.status === 'persecuted') {
        playSound('error');
        setScanResult({
          status: 'denied',
          message: 'Persecuted from University',
          subMessage: 'This student has been persecuted from the university',
          student,
        });
        logMealAttempt(studentId, 'denied', 'Student persecuted', student);
        return;
      }

      if (student.status === 'suspended') {
        playSound('error');
        setScanResult({
          status: 'denied',
          message: 'Student Suspended',
          subMessage: 'This student is currently suspended',
          student,
        });
        logMealAttempt(studentId, 'denied', 'Student suspended', student);
        return;
      }

      // Check cafe status
      if (student.cafeStatus === 'none') {
        playSound('error');
        setScanResult({
          status: 'denied',
          message: 'Non-Cafe Student',
          subMessage: 'This student is not registered for cafeteria service',
          student,
        });
        logMealAttempt(studentId, 'denied', 'Non-cafe student', student);
        return;
      }

      // Check cafeteria type
      if (student.cafeteriaType !== staffCafeteria) {
        const studentCafe = getCafeteriaLabel(student.cafeteriaType);
        playSound('error');
        setScanResult({
          status: 'warning',
          message: 'Wrong Cafeteria',
          subMessage: `This student belongs to ${studentCafe}`,
          student,
        });
        logMealAttempt(studentId, 'denied', `Wrong cafeteria - belongs to ${studentCafe}`, student);
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
          playSound('error');
          setScanResult({
            status: 'denied',
            message: 'Already Scanned',
            subMessage: `This student already received ${currentMeal} today`,
            student,
          });
          logMealAttempt(studentId, 'denied', 'Already scanned for this meal', student);
          return;
        }
      }

      // All checks passed - grant access
      playSound('success');
      
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
      logMealAttempt(studentId, 'granted', undefined, student);

      setScanResult({
        status: 'granted',
        message: 'Access Granted',
        subMessage: `${currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)} meal approved`,
        student,
      });

    } catch (error) {
      console.error('Scan error:', error);
      playSound('error');
      setScanResult({
        status: 'error',
        message: 'System Error',
        subMessage: 'Please try again or contact support',
      });
    } finally {
      setIsProcessing(false);
      
      // Auto-reset after 3 seconds for next scan
      autoResetTimerRef.current = setTimeout(() => {
        setScanResult({ status: 'idle', message: '' });
        inputRef.current?.focus();
      }, 3000);
    }
  };

  const logMealAttempt = async (
    studentId: string, 
    result: 'granted' | 'denied', 
    reason?: string,
    student?: Student
  ) => {
    try {
      await createMealLog({
        studentId,
        studentName: student?.fullName || 'Unknown',
        mealType: currentMeal || 'lunch',
        cafeteriaId: staffCafeteria,
        cafeteriaName: getCafeteriaLabel(staffCafeteria),
        timestamp: new Date(),
        result,
        reason,
        cashierId: staff?.staffId,
        synced: true,
      });
    } catch (error) {
      console.error('Failed to log meal:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processScan(searchQuery);
    }
  };

  const getMealIcon = () => {
    switch (currentMeal) {
      case 'breakfast': return <Coffee className="w-6 h-6" />;
      case 'lunch': return <Sun className="w-6 h-6" />;
      case 'dinner': return <Moon className="w-6 h-6" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (scanResult.status) {
      case 'granted': return 'bg-success';
      case 'denied': return 'bg-destructive';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-sidebar border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={huLogo} alt="HU Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                {getCafeteriaLabel(staffCafeteria)}
              </h1>
              <p className="text-xs text-sidebar-foreground/70">{staff?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Current Meal Badge */}
            <Badge 
              variant={currentMeal ? 'granted' : 'denied'}
              className="gap-2 py-1.5 px-3"
            >
              {getMealIcon()}
              {currentMeal ? currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1) : 'Closed'}
            </Badge>
            
            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-sidebar-foreground/70"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
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
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
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
                className="pl-12 h-14 text-lg font-mono"
                autoFocus
                disabled={isProcessing}
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => processScan(searchQuery)}
                disabled={isProcessing || !searchQuery.trim()}
              >
                Verify
              </Button>
            </div>
          </Card>

          {/* Scan Result Display */}
          <AnimatePresence mode="wait">
            {scanResult.status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`overflow-hidden border-2 ${
                    scanResult.status === 'granted' ? 'border-success bg-success/5' :
                    scanResult.status === 'denied' ? 'border-destructive bg-destructive/5' :
                    scanResult.status === 'warning' ? 'border-warning bg-warning/5' :
                    'border-destructive bg-destructive/5'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Status Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className={`p-4 rounded-full ${getStatusColor()}`}
                      >
                        {scanResult.status === 'granted' ? (
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        ) : scanResult.status === 'warning' ? (
                          <AlertTriangle className="w-10 h-10 text-white" />
                        ) : (
                          <XCircle className="w-10 h-10 text-white" />
                        )}
                      </motion.div>
                      
                      {/* Message */}
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold ${
                          scanResult.status === 'granted' ? 'text-success' :
                          scanResult.status === 'warning' ? 'text-warning' :
                          'text-destructive'
                        }`}>
                          {scanResult.message}
                        </h3>
                        {scanResult.subMessage && (
                          <p className="text-lg text-muted-foreground mt-1">
                            {scanResult.subMessage}
                          </p>
                        )}
                        
                        {scanResult.student && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="font-medium">{scanResult.student.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {scanResult.student.studentId} • {scanResult.student.department}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle State */}
          {scanResult.status === 'idle' && !isProcessing && (
            <Card variant="elevated" className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="p-6 bg-accent/10 rounded-full mb-4">
                  <ScanLine className="w-16 h-16 text-accent" />
                </div>
                <h3 className="text-xl font-medium mb-2">Ready to Scan</h3>
                <p className="text-muted-foreground">
                  Scan student ID barcode or enter ID manually
                </p>
              </div>
            </Card>
          )}

          {/* Processing State */}
          {isProcessing && (
            <Card variant="elevated" className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="animate-pulse p-6 bg-accent/20 rounded-full mb-4">
                  <ScanLine className="w-16 h-16 text-accent animate-bounce" />
                </div>
                <h3 className="text-xl font-medium">Processing...</h3>
              </div>
            </Card>
          )}
        </div>

        {/* Student Photo Section */}
        <div className="lg:w-80">
          <Card variant="elevated" className="sticky top-24">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Student Photo</h3>
              
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                {scanResult.student?.photoURL ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={scanResult.student.photoURL}
                    alt={scanResult.student.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {scanResult.student && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold text-lg text-center">
                    {scanResult.student.fullName}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline">
                      {scanResult.student.department}
                    </Badge>
                    <Badge variant="outline">
                      Year {scanResult.student.year}
                    </Badge>
                  </div>
                  <div className="flex justify-center">
                    <Badge variant={
                      scanResult.student.cafeteriaType === staffCafeteria ? 'granted' : 'denied'
                    }>
                      {getCafeteriaLabel(scanResult.student.cafeteriaType)}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="sticky bottom-0 bg-sidebar border-t border-border py-2 px-4">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Badge variant={settings.scanningEnabled ? "granted" : "denied"}>
              {settings.scanningEnabled ? "Scanning Active" : "Scanning Paused"}
            </Badge>
            <span className="text-sidebar-foreground/70">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="text-sidebar-foreground/70">
            Staff ID: {staff?.staffId}
          </div>
        </div>
      </footer>
    </div>
  );
}
