import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { ScanResultDisplay } from '@/components/scanner/ScanResultDisplay';
import { CurrentMealStatus } from '@/components/scanner/CurrentMealStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCurrentMealType, checkMealEligibility, MealEligibilityResult } from '@/lib/mealLogic';
import { formatDualDate } from '@/lib/ethiopianCalendar';
import { Student, MealType, Cafeteria, MealLog } from '@/types';
import { Wifi, WifiOff, Clock, History, Keyboard, AlertTriangle } from 'lucide-react';

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
  const [demoMode, setDemoMode] = useState(true); // Enable demo mode by default
  const [manualBarcode, setManualBarcode] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  const today = new Date();
  const dualDate = formatDualDate(today, language);
  const activeMeal = getCurrentMealType();

  const cafeteria = mockCafeterias.find(c => c.cafeteriaId === selectedCafeteria)!;

  // In demo mode, allow scanning anytime; otherwise only during meal windows
  const canScan = demoMode || activeMeal !== null;
  const effectiveMealType = activeMeal || selectedMealType;

  const handleScan = useCallback(async (barcode: string) => {
    setIsProcessing(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const student = mockStudents[barcode.toUpperCase()] || null;
    
    const result = checkMealEligibility(student, effectiveMealType, cafeteria);
    
    setScannedStudent(student);
    setCurrentMealType(effectiveMealType);
    setScanResult(result);
    
    // Add to recent scans
    const newLog: MealLog = {
      id: Date.now().toString(),
      studentId: student?.studentId || barcode,
      studentName: student?.fullName || 'Unknown Student',
      mealType: effectiveMealType,
      cafeteriaId: cafeteria.cafeteriaId,
      cafeteriaName: cafeteria.name,
      timestamp: new Date(),
      result: result.result,
      reason: result.reason,
      synced: isOnline,
    };
    setRecentScans(prev => [newLog, ...prev.slice(0, 19)]);
    
    // Update student's last meal if granted
    if (result.eligible && student && mockStudents[barcode.toUpperCase()]) {
      mockStudents[barcode.toUpperCase()].lastMeal = {
        mealType: effectiveMealType,
        timestamp: new Date(),
        cafeteriaId: cafeteria.cafeteriaId,
      };
    }
    
    setIsProcessing(false);
  }, [cafeteria, isOnline, effectiveMealType]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

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
            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <Label htmlFor="demo-mode" className="text-sm font-medium cursor-pointer">
                Demo Mode
              </Label>
              <Switch
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={setDemoMode}
              />
            </div>

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

        {/* Demo Mode Meal Selector */}
        {demoMode && !activeMeal && (
          <Card variant="bordered" className="border-accent/50 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Demo Mode Active</p>
                  <p className="text-xs text-muted-foreground">No active meal window - select a meal type for testing</p>
                </div>
                <Select value={selectedMealType} onValueChange={(v) => setSelectedMealType(v as MealType)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{t('breakfast')}</SelectItem>
                    <SelectItem value="lunch">{t('lunch')}</SelectItem>
                    <SelectItem value="dinner">{t('dinner')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <BarcodeScanner
                    onScan={handleScan}
                    isProcessing={isProcessing}
                    disabled={!canScan}
                  />
                  
                  {!canScan && (
                    <div className="p-4 bg-warning/10 rounded-lg text-center">
                      <p className="text-warning font-medium">
                        No active meal window. Enable Demo Mode to test scanning.
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
                      placeholder="Enter student ID (e.g., HU2024001)"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value.toUpperCase())}
                      disabled={!canScan || isProcessing}
                      className="flex-1 font-mono"
                    />
                    <Button 
                      type="submit" 
                      disabled={!canScan || isProcessing || !manualBarcode.trim()}
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
                {t('recentScans')}
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
              <strong>Test IDs:</strong>{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded">HU2024001</code> (active student),{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded">HU2024002</code> (has quota),{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded">HU2024003</code> (blocked - none cafe)
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
