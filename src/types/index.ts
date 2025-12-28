export type UserRole = 'super_admin' | 'cafeteria_manager' | 'cashier' | 'registrar_admin';
export type CafeStatus = 'cafe' | 'none';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type ScanResult = 'granted' | 'denied';

export interface Student {
  id: string;
  studentId: string; // Code 39 barcode value
  fullName: string;
  fullNameAmharic?: string;
  department: string;
  year: number;
  photoURL?: string;
  cafeStatus: CafeStatus;
  hostelResident: boolean;
  monthlyQuota: number | null;
  usedQuota: number;
  allowedCafeterias?: string[];
  lastMeal?: {
    mealType: MealType;
    timestamp: Date;
    cafeteriaId: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealLog {
  id: string;
  studentId: string;
  studentName: string;
  mealType: MealType;
  cafeteriaId: string;
  cafeteriaName: string;
  timestamp: Date;
  result: ScanResult;
  reason?: string;
  cashierId?: string;
  isOverride?: boolean;
  overrideReason?: string;
  synced: boolean;
}

export interface Cafeteria {
  id: string;
  cafeteriaId: string;
  name: string;
  nameAmharic?: string;
  location: string;
  openHours: {
    breakfast: { start: string; end: string };
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
  isActive: boolean;
}

export interface Admin {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  cafeteriaId?: string; // For cafeteria managers
  createdAt: Date;
}

export interface SystemSettings {
  mealWindows: {
    breakfast: { start: string; end: string };
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
  lockDurationMinutes: number;
  showEthiopianDate: boolean;
  defaultLanguage: 'en' | 'am';
}

export interface OfflineQueueItem {
  id: string;
  studentId: string;
  mealType: MealType;
  cafeteriaId: string;
  timestamp: Date;
  result: ScanResult;
  reason?: string;
}

export interface DashboardStats {
  todayTotal: number;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  deniedCount: number;
  noneCafeAttempts: number;
}

export interface LocalizedStrings {
  [key: string]: {
    en: string;
    am: string;
  };
}
