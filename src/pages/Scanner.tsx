import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { ScanResultDisplay } from '@/components/scanner/ScanResultDisplay';
import { CurrentMealStatus } from '@/components/scanner/CurrentMealStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrentMealType, checkMealEligibility, MealEligibilityResult } from '@/lib/mealLogic';
import { formatDualDate } from '@/lib/ethiopianCalendar';
import { Student, MealType, Cafeteria, MealLog } from '@/types';
import { Wifi, WifiOff, Clock, History } from 'lucide-react';

// Mock data for demo
const mockCafeterias: Cafeteria[] = [
  { id: '1', cafeteriaId: 'CAF-MAIN', name: 'Main Cafeteria', nameAmharic: 'ዋና ካፌቴሪያ', location: 'Main Campus', openHours: { breakfast: { start: '06:00', end: '09:00' }, lunch: { start: '11:30', end: '14:00' }, dinner: { start: '17:30', end: '20:00' } }, isActive: true },
  { id: '2', cafeteriaId: 'CAF-COL-A', name: 'College A Cafeteria', nameAmharic: 'ኮሌጅ ሀ ካፌቴሪያ', location: 'College A', openHours: { breakfast: { start: '06:00', end: '09:00' }, lunch: { start: '11:30', end: '14:00' }, dinner: { start: '17:30', end: '20:00' } }, isActive: true },
  { id: '3', cafeteriaId: 'CAF-HOSTEL', name: 'Hostel Cafeteria', nameAmharic: 'ሆስቴል ካፌቴሪያ', location: 'Student Hostels', openHours: { breakfast: { start: '06:00', end: '09:00' }, lunch: { start: '11:30', end: '14:00' }, dinner: { start: '17:30', end: '20:00' } }, isActive: true },
];

const mockStudents: Record<string, Student> = {
  'HU2024001': {
    id: '1',
    studentId: 'HU2024001',
    fullName: 'Abebe Kebede',
    fullNameAmharic: 'አበበ ከበደ',
    department: 'Computer Science',
    year: 3,
    cafeStatus: 'cafe',
    hostelResident: true,
    monthlyQuota: null,
    usedQuota: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'HU2024002': {
    id: '2',
    studentId: 'HU2024002',
    fullName: 'Sara Tesfaye',
    fullNameAmharic: 'ሳራ ተስፋዬ',
    department: 'Engineering',
    year: 2,
    cafeStatus: 'cafe',
    hostelResident: false,
    monthlyQuota: 60,
    usedQuota: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'HU2024003': {
    id: '3',
    studentId: 'HU2024003',
    fullName: 'Dawit Haile',
    fullNameAmharic: 'ዳዊት ሃይሌ',
    department: 'Medicine',
    year: 4,
    cafeStatus: 'none',
    hostelResident: true,
    monthlyQuota: null,
    usedQuota: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export default function Scanner() {
  const { t, language } = useLanguage();
  const [selectedCafeteria, setSelectedCafeteria] = useState<string>(mockCafeterias[0].cafeteriaId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<MealEligibilityResult | null>(null);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [currentMealType, setCurrentMealType] = useState<MealType | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [recentScans, setRecentScans] = useState<MealLog[]>([]);

  const today = new Date();
  const dualDate = formatDualDate(today, language);
  const activeMeal = getCurrentMealType();

  const cafeteria = mockCafeterias.find(c => c.cafeteriaId === selectedCafeteria)!;

  const handleScan = useCallback(async (barcode: string) => {
    setIsProcessing(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const student = mockStudents[barcode] || null;
    const mealType = getCurrentMealType() || 'lunch'; // Default to lunch for demo
    
    const result = checkMealEligibility(student, mealType, cafeteria);
    
    setScannedStudent(student);
    setCurrentMealType(mealType);
    setScanResult(result);
    
    // Add to recent scans
    if (student) {
      const newLog: MealLog = {
        id: Date.now().toString(),
        studentId: student.studentId,
        studentName: student.fullName,
        mealType,
        cafeteriaId: cafeteria.cafeteriaId,
        cafeteriaName: cafeteria.name,
        timestamp: new Date(),
        result: result.result,
        reason: result.reason,
        synced: isOnline,
      };
      setRecentScans(prev => [newLog, ...prev.slice(0, 19)]);
      
      // Update student's last meal if granted
      if (result.eligible && mockStudents[barcode]) {
        mockStudents[barcode].lastMeal = {
          mealType,
          timestamp: new Date(),
          cafeteriaId: cafeteria.cafeteriaId,
        };
      }
    }
    
    setIsProcessing(false);
  }, [cafeteria, isOnline]);

  const dismissResult = () => {
    setScanResult(null);
    setScannedStudent(null);
    setCurrentMealType(null);
  };

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{t('scanner')}</h1>
            <div className="mt-1 text-sm text-muted-foreground">
              <p>{dualDate.gregorian}</p>
              <p className="text-accent">{dualDate.ethiopian}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Online status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isOnline 
                ? 'bg-success/10 text-success' 
                : 'bg-warning/10 text-warning'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? t('online') : t('offline')}
            </div>
            
            {/* Cafeteria selector */}
            <Select value={selectedCafeteria} onValueChange={setSelectedCafeteria}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockCafeterias.map((caf) => (
                  <SelectItem key={caf.cafeteriaId} value={caf.cafeteriaId}>
                    {language === 'am' && caf.nameAmharic ? caf.nameAmharic : caf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Meal Status */}
        <CurrentMealStatus />

        {/* Scanner and Result */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                {t('scanBarcode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanResult ? (
                <ScanResultDisplay
                  result={scanResult}
                  student={scannedStudent}
                  mealType={currentMealType}
                  onDismiss={dismissResult}
                />
              ) : (
                <BarcodeScanner
                  onScan={handleScan}
                  isProcessing={isProcessing}
                  disabled={!activeMeal}
                />
              )}
              
              {!activeMeal && !scanResult && (
                <div className="mt-4 p-4 bg-warning/10 rounded-lg text-center">
                  <p className="text-warning font-medium">
                    No active meal window. Scanner disabled.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                {t('recentScans')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                        scan.result === 'granted' 
                          ? 'border-success/30 bg-success/5' 
                          : 'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{scan.studentName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{scan.studentId}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={scan.result === 'granted' ? 'granted' : 'denied'}>
                            {scan.result === 'granted' ? t('accessGranted') : t('accessDenied')}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {scan.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {scan.reason && (
                        <p className="text-xs text-muted-foreground mt-2">{scan.reason}</p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Instructions */}
        <Card variant="bordered" className="border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Mode:</strong> Use test barcodes: <code className="bg-muted px-1.5 py-0.5 rounded">HU2024001</code> (active), 
              <code className="bg-muted px-1.5 py-0.5 rounded ml-1">HU2024002</code> (quota), 
              <code className="bg-muted px-1.5 py-0.5 rounded ml-1">HU2024003</code> (blocked)
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
