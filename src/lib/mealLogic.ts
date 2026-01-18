import { Student, MealType, SystemSettings, ScanResult, Cafeteria, CafeteriaType } from '@/types';

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
    | 'cafeteria_not_allowed'
    | 'wrong_cafeteria';
}

const DEFAULT_LOCK_DURATION = 180; // 3 hours in minutes

const DEFAULT_MEAL_WINDOWS: SystemSettings['mealWindows'] = {
  breakfast: { start: '06:00', end: '09:00' },
  lunch: { start: '11:30', end: '14:00' },
  dinner: { start: '17:30', end: '20:00' }
};

export function getCurrentMealType(
  time: Date = new Date(),
  settings?: SystemSettings
): MealType | null {
  const windows = settings?.mealWindows || DEFAULT_MEAL_WINDOWS;

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const currentMinutes = time.getHours() * 60 + time.getMinutes();

  const isTimeInRange = (startStr: string, endStr: string) => {
    const start = toMinutes(startStr);
    let end = toMinutes(endStr);

    if (Number.isNaN(start) || Number.isNaN(end)) return false;

    // Handle end time of 00:00 (midnight) - treat as 24:00 (end of day)
    if (end === 0) {
      end = 24 * 60; // 1440 minutes = midnight as end of day
    }

    // Normal same-day range (including when end is midnight treated as 24:00)
    if (start < end) {
      return currentMinutes >= start && currentMinutes < end;
    }

    // Crosses midnight (e.g., 22:00 to 02:00) - but NOT when end is exactly midnight
    // This handles cases like 22:00 to 02:00 (next day)
    return currentMinutes >= start || currentMinutes < end;
  };

  if (isTimeInRange(windows.breakfast.start, windows.breakfast.end)) {
    return "breakfast";
  }
  if (isTimeInRange(windows.lunch.start, windows.lunch.end)) {
    return "lunch";
  }
  if (isTimeInRange(windows.dinner.start, windows.dinner.end)) {
    return "dinner";
  }

  return null;
}

export function getNextMealWindow(
  time: Date = new Date(),
  settings?: SystemSettings
): { mealType: MealType; startTime: Date } | null {
  const windows = settings?.mealWindows || DEFAULT_MEAL_WINDOWS;
  const meals: MealType[] = ["breakfast", "lunch", "dinner"];

  const candidates = meals.map((meal) => {
    const [hours, minutes] = windows[meal].start.split(":").map(Number);
    const startTime = new Date(time);
    startTime.setHours(hours, minutes, 0, 0);

    // If start time already passed today, schedule it for tomorrow
    if (startTime.getTime() <= time.getTime()) {
      startTime.setDate(startTime.getDate() + 1);
    }

    return { mealType: meal, startTime };
  });

  candidates.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  return candidates[0] ?? null;
}

export function getCafeteriaTypeLabel(type: CafeteriaType): string {
  switch (type) {
    case 'muslim':
      return 'Muslim Cafe';
    case 'christian':
      return 'Christian Cafe';
    case 'fresh':
      return 'Freshman Cafe';
    default:
      return type;
  }
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
  
  // Check if student belongs to this cafeteria type
  if (student.cafeteriaType !== cafeteria.cafeteriaType) {
    const studentCafe = getCafeteriaTypeLabel(student.cafeteriaType);
    const currentCafe = getCafeteriaTypeLabel(cafeteria.cafeteriaType);
    return {
      eligible: false,
      result: 'denied',
      reason: `This student belongs to ${studentCafe}, not ${currentCafe}`,
      reasonCode: 'wrong_cafeteria'
    };
  }
  
  // Check cafeteria restrictions (legacy support)
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
