export type UserRole = 'super_admin' | 'cafeteria_manager' | 'cashier' | 'registrar_admin';
export type StaffRole = 'registrar' | 'cafe_service';
export type CafeStatus = 'cafe' | 'none';
export type StudentStatus = 'active' | 'graduated' | 'persecuted' | 'suspended';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type ScanResult = 'granted' | 'denied';
export type CafeteriaType = 'muslim' | 'christian' | 'fresh';

export interface Student {
  id: string;
  studentId: string; // Barcode value (e.g., UGPR0680/16)
  fullName: string;
  fullNameAmharic?: string;
  email: string;
  department: string;
  year: number;
  photoURL?: string;
  cafeStatus: CafeStatus;
  cafeteriaType: CafeteriaType; // Which cafeteria they belong to
  hostelResident: boolean;
  monthlyQuota: number | null;
  usedQuota: number;
  allowedCafeterias?: string[];
  status: StudentStatus;
  lastMeal?: {
    mealType: MealType;
    timestamp: Date;
    cafeteriaId: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  staffId: string; // Auto-generated unique ID
  email: string;
  fullName: string;
  phoneNumber: string;
  role: StaffRole;
  cafeteriaType?: CafeteriaType; // For cafe service staff
  isActive: boolean;
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
  cafeteriaType: CafeteriaType; // muslim, christian, or fresh
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
  defaultLanguage: 'en' | 'am' | 'or';
  scanningEnabled: boolean;
  registrationEnabled: boolean;
}

export interface SupportTicket {
  id: string;
  staffId: string;
  staffName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
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
    or?: string;
  };
}
