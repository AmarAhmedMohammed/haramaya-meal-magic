import { Student, MealType, SystemSettings, ScanResult, Cafeteria } from '@/types';

export interface MealEligibilityResult {
  eligible: boolean;
  result: ScanResult;
  reason?: string;
  nextAllowedTime?: Date;
  reasonCode: 
    | 'granted'
    | 'not_registered'
    | 'already_scanned'
    | 'quota_exhausted'
    | 'student_not_found'
    | 'outside_meal_window'
    | 'cafeteria_not_allowed';
}

const DEFAULT_LOCK_DURATION = 180; // 3 hours in minutes

const DEFAULT_MEAL_WINDOWS: SystemSettings['mealWindows'] = {
  breakfast: { start: '06:00', end: '09:00' },
  lunch: { start: '11:30', end: '14:00' },
  dinner: { start: '17:30', end: '20:00' }
};

export function getCurrentMealType(time: Date = new Date(), settings?: SystemSettings): MealType | null {
  const windows = settings?.mealWindows || DEFAULT_MEAL_WINDOWS;
  const currentTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  
  if (currentTime >= windows.breakfast.start && currentTime <= windows.breakfast.end) {
    return 'breakfast';
  }
  if (currentTime >= windows.lunch.start && currentTime <= windows.lunch.end) {
    return 'lunch';
  }
  if (currentTime >= windows.dinner.start && currentTime <= windows.dinner.end) {
    return 'dinner';
  }
  
  return null;
}

export function getNextMealWindow(time: Date = new Date(), settings?: SystemSettings): { mealType: MealType; startTime: Date } | null {
  const windows = settings?.mealWindows || DEFAULT_MEAL_WINDOWS;
  const currentTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  
  const meals: MealType[] = ['breakfast', 'lunch', 'dinner'];
  
  for (const meal of meals) {
    if (currentTime < windows[meal].start) {
      const [hours, minutes] = windows[meal].start.split(':').map(Number);
      const startTime = new Date(time);
      startTime.setHours(hours, minutes, 0, 0);
      return { mealType: meal, startTime };
    }
  }
  
  // Next breakfast tomorrow
  const [hours, minutes] = windows.breakfast.start.split(':').map(Number);
  const tomorrow = new Date(time);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);
  return { mealType: 'breakfast', startTime: tomorrow };
}

export function checkMealEligibility(
  student: Student | null,
  currentMealType: MealType,
  cafeteria: Cafeteria,
  settings?: SystemSettings
): MealEligibilityResult {
  const lockDuration = settings?.lockDurationMinutes || DEFAULT_LOCK_DURATION;
  
  // Student not found
  if (!student) {
    return {
      eligible: false,
      result: 'denied',
      reason: 'Student ID not found in system',
      reasonCode: 'student_not_found'
    };
  }
  
  // Check cafe status
  if (student.cafeStatus === 'none') {
    return {
      eligible: false,
      result: 'denied',
      reason: 'Not registered for Haramaya University cafeteria service',
      reasonCode: 'not_registered'
    };
  }
  
  // Check cafeteria restrictions
  if (student.allowedCafeterias && student.allowedCafeterias.length > 0) {
    if (!student.allowedCafeterias.includes(cafeteria.cafeteriaId)) {
      return {
        eligible: false,
        result: 'denied',
        reason: `Not authorized for ${cafeteria.name}`,
        reasonCode: 'cafeteria_not_allowed'
      };
    }
  }
  
  // Check monthly quota
  if (student.monthlyQuota !== null && student.usedQuota >= student.monthlyQuota) {
    return {
      eligible: false,
      result: 'denied',
      reason: 'Monthly meal quota exhausted',
      reasonCode: 'quota_exhausted'
    };
  }
  
  // Check 3-hour lock
  if (student.lastMeal) {
    const lastMealTime = student.lastMeal.timestamp instanceof Date 
      ? student.lastMeal.timestamp 
      : new Date(student.lastMeal.timestamp);
    const now = new Date();
    const timeDiffMinutes = (now.getTime() - lastMealTime.getTime()) / (1000 * 60);
    
    if (timeDiffMinutes < lockDuration && student.lastMeal.mealType === currentMealType) {
      const nextAllowedTime = new Date(lastMealTime.getTime() + lockDuration * 60 * 1000);
      return {
        eligible: false,
        result: 'denied',
        reason: 'Already scanned for this meal',
        reasonCode: 'already_scanned',
        nextAllowedTime
      };
    }
  }
  
  // All checks passed
  return {
    eligible: true,
    result: 'granted',
    reasonCode: 'granted'
  };
}

export function validateStudentBarcode(barcode: string): boolean {
  // Accept alphanumeric barcodes with common separators (/, -, etc.)
  // Examples: UGPR0680/16, STU-123456, ABC12345
  const barcodePattern = /^[A-Za-z0-9\s\-\.\/\+\_]+$/;
  
  if (!barcode || barcode.length < 3 || barcode.length > 30) {
    return false;
  }
  
  return barcodePattern.test(barcode);
}

// Keep backward compatibility
export const validateCode39Barcode = validateStudentBarcode;

export function formatTimeRemaining(targetTime: Date): string {
  const now = new Date();
  const diffMs = targetTime.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Now';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getMealWindowLabel(mealType: MealType, settings?: SystemSettings): string {
  const windows = settings?.mealWindows || DEFAULT_MEAL_WINDOWS;
  const window = windows[mealType];
  return `${window.start} - ${window.end}`;
}
