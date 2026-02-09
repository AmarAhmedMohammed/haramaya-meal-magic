import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { InlineScanner } from "@/components/scanner/InlineScanner";
import { ScanResultDisplay } from "@/components/scanner/ScanResultDisplay";
import { CurrentMealStatus } from "@/components/scanner/CurrentMealStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { useMealSettings } from "@/contexts/MealSettingsContext";
import {
  getCurrentMealType,
  checkMealEligibility,
  MealEligibilityResult,
  getCafeteriaTypeLabel,
} from "@/lib/mealLogic";
import { formatDualDate } from "@/lib/ethiopianCalendar";
import {
  getStudent,
  createMealLog,
  updateStudentLastMeal,
  subscribeToMealLogs,
} from "@/lib/firestore";
import { Student, MealType, Cafeteria, MealLog, CafeteriaType } from "@/types";
import {
  Wifi,
  WifiOff,
  Clock,
  History,
  Keyboard,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

// Three cafeterias: Muslim, Christian, and Freshman
const cafeteriaList: Cafeteria[] = [
  {
    id: "1",
    cafeteriaId: "CAF-MUSLIM",
    cafeteriaType: "muslim",
    name: "Muslim Cafe",
    nameAmharic: "ሙስሊም ካፌ",
    location: "Block A",
    openHours: {
      breakfast: { start: "06:00", end: "09:00" },
      lunch: { start: "11:30", end: "14:00" },
      dinner: { start: "17:30", end: "20:00" },
    },
    isActive: true,
  },
  {
    id: "2",
    cafeteriaId: "CAF-CHRISTIAN",
    cafeteriaType: "christian",
    name: "Christian Cafe",
    nameAmharic: "ክርስቲያን ካፌ",
    location: "Block B",
    openHours: {
      breakfast: { start: "06:00", end: "09:00" },
      lunch: { start: "11:30", end: "14:00" },
      dinner: { start: "17:30", end: "20:00" },
    },
    isActive: true,
  },
  {
    id: "3",
    cafeteriaId: "CAF-FRESH",
    cafeteriaType: "fresh",
    name: "Freshman Cafe",
    nameAmharic: "አዲስ ተማሪ ካፌ",
    location: "Block C",
    openHours: {
      breakfast: { start: "06:00", end: "09:00" },
      lunch: { start: "11:30", end: "14:00" },
      dinner: { start: "17:30", end: "20:00" },
    },
    isActive: true,
  },
];

export default function Scanner() {
  const { t, language } = useLanguage();
  const { settings } = useMealSettings();
  const [selectedCafeteria, setSelectedCafeteria] = useState<string>(
    cafeteriaList[0].cafeteriaId
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<MealEligibilityResult | null>(
    null
  );
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [currentMealType, setCurrentMealType] = useState<MealType | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [recentScans, setRecentScans] = useState<MealLog[]>([]);
  const [manualBarcode, setManualBarcode] = useState("");
  const [now, setNow] = useState(() => new Date());

  // Re-evaluate active meal automatically (no refresh needed)
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const dualDate = formatDualDate(today, language as "en" | "am");

  // Use settings from context
  const systemSettings = {
    mealWindows: settings.mealWindows,
    lockDurationMinutes: settings.lockDurationMinutes,
    showEthiopianDate: true,
    defaultLanguage: "en" as const,
    scanningEnabled: settings.scanningEnabled ?? true,
    registrationEnabled: settings.registrationEnabled ?? true,
  };
  const activeMeal = getCurrentMealType(now, systemSettings);

  const cafeteria = cafeteriaList.find(
    (c) => c.cafeteriaId === selectedCafeteria
  )!;

  // Scanner only works during active meal windows AND when admin hasn't paused scanning
  const canScan = (settings.scanningEnabled ?? true) && activeMeal !== null;

  // Subscribe to real-time meal logs
  useEffect(() => {
    const unsubscribe = subscribeToMealLogs(
      (logs) => {
        setRecentScans(logs);
      },
      { cafeteriaId: selectedCafeteria, limit: 20 }
    );

    return () => unsubscribe();
  }, [selectedCafeteria]);

  const handleScan = useCallback(
    async (barcode: string) => {
      if (!activeMeal) return;

      setIsProcessing(true);

      try {
        // Fetch student from Firebase
        const student = await getStudent(barcode.toUpperCase());

        const result = checkMealEligibility(
          student,
          activeMeal,
          cafeteria,
          systemSettings
        );

        setScannedStudent(student);
        setCurrentMealType(activeMeal);
        setScanResult(result);

        // Log the scan to Firebase
        await createMealLog({
          studentId: student?.studentId || barcode,
          studentName: student?.fullName || "Unknown Student",
          mealType: activeMeal,
          cafeteriaId: cafeteria.cafeteriaId,
          cafeteriaName: cafeteria.name,
          timestamp: new Date(),
          result: result.result,
          reason: result.reason,
          synced: isOnline,
        });

        // Update student's last meal if granted
        if (result.eligible && student) {
          await updateStudentLastMeal(
            student.studentId,
            activeMeal,
            cafeteria.cafeteriaId
          );
        }
      } catch (error) {
        console.error("Scan error:", error);
        setScanResult({
          eligible: false,
          result: "denied",
          reason: "Error processing scan. Please try again.",
          reasonCode: "student_not_found",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [cafeteria, isOnline, activeMeal, systemSettings]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  const dismissResult = () => {
    setScanResult(null);
    setScannedStudent(null);
    setCurrentMealType(null);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {t("scanner")}
            </h1>
            <div className="mt-1 text-sm text-muted-foreground">
              <p>{dualDate.gregorian}</p>
              <p className="text-accent">{dualDate.ethiopian}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Settings Link */}
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Meal Settings
              </Button>
            </Link>

            {/* Online status */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isOnline
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {isOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              {isOnline ? t("online") : t("offline")}
            </div>

            {/* Cafeteria selector */}
            <Select
              value={selectedCafeteria}
              onValueChange={setSelectedCafeteria}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cafeteriaList.map((caf) => (
                  <SelectItem key={caf.cafeteriaId} value={caf.cafeteriaId}>
                    {language === "am" && caf.nameAmharic
                      ? caf.nameAmharic
                      : caf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Cafeteria Info */}
        <Card variant="default" className="border-accent/30 bg-accent/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {cafeteria.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Only students registered for{" "}
                  <span className="font-medium text-accent">
                    {getCafeteriaTypeLabel(cafeteria.cafeteriaType)}
                  </span>{" "}
                  can scan here
                </p>
              </div>
              <Badge variant="cafe" className="text-sm">
                {getCafeteriaTypeLabel(cafeteria.cafeteriaType)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current Meal Status */}
        <CurrentMealStatus />

        {/* Scanner and Result */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                {t("scanBarcode")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {scanResult ? (
                <ScanResultDisplay
                  result={scanResult}
                  student={scannedStudent}
                  mealType={currentMealType}
                  onDismiss={dismissResult}
                />
              ) : (
                <>
                  <InlineScanner
                    onScan={handleScan}
                    isActive={canScan && !isProcessing}
                  />

                  {!canScan && (
                    <div className="p-4 bg-warning/10 rounded-lg text-center">
                      <p className="text-warning font-medium">
                        No active meal window. Scanning is disabled outside meal
                        hours.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Manual Barcode Input */}
              <div className="border-t pt-4">
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Keyboard className="w-4 h-4" />
                    Manual Barcode Entry
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter student ID (e.g., UGPR0680/16)"
                      value={manualBarcode}
                      onChange={(e) =>
                        setManualBarcode(e.target.value.toUpperCase())
                      }
                      disabled={!canScan || isProcessing}
                      className="flex-1 font-mono"
                    />
                    <Button
                      type="submit"
                      disabled={
                        !canScan || isProcessing || !manualBarcode.trim()
                      }
                      variant="default"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                {t("recentScans")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentScans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No scans yet today
                  </p>
                ) : (
                  recentScans.map((scan) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${
                        scan.result === "granted"
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {scan.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {scan.studentId}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              scan.result === "granted" ? "granted" : "denied"
                            }
                          >
                            {scan.result === "granted"
                              ? t("accessGranted")
                              : t("accessDenied")}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {scan.timestamp instanceof Date
                              ? scan.timestamp.toLocaleTimeString()
                              : new Date(scan.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {scan.reason && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {scan.reason}
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card variant="bordered" className="border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Note:</strong> Students can only scan at their registered
              cafeteria type. If a student scans at the wrong cafeteria, access
              will be denied.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
