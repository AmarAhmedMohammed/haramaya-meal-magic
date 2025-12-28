export type Language = 'en' | 'am';

export const translations = {
  // General
  appName: {
    en: 'Haramaya University Meal System',
    am: 'ሀረማያ ዩኒቨርሲቲ የምግብ ስርዓት'
  },
  welcome: {
    en: 'Welcome',
    am: 'እንኳን ደህና መጡ'
  },
  
  // Navigation
  dashboard: {
    en: 'Dashboard',
    am: 'ዳሽቦርድ'
  },
  scanner: {
    en: 'Scanner',
    am: 'ስካነር'
  },
  students: {
    en: 'Students',
    am: 'ተማሪዎች'
  },
  cafeterias: {
    en: 'Cafeterias',
    am: 'ካፌቴሪያዎች'
  },
  settings: {
    en: 'Settings',
    am: 'ቅንብሮች'
  },
  logout: {
    en: 'Logout',
    am: 'ውጣ'
  },
  login: {
    en: 'Login',
    am: 'ግባ'
  },
  
  // Meals
  breakfast: {
    en: 'Breakfast',
    am: 'ቁርስ'
  },
  lunch: {
    en: 'Lunch',
    am: 'ምሳ'
  },
  dinner: {
    en: 'Dinner',
    am: 'እራት'
  },
  
  // Scanner messages
  scanBarcode: {
    en: 'Scan Student ID Barcode',
    am: 'የተማሪ መታወቂያ ባርኮድ ይቃኙ'
  },
  scanning: {
    en: 'Scanning...',
    am: 'እየቃኘ ነው...'
  },
  accessGranted: {
    en: 'Access Granted',
    am: 'መዳረሻ ተፈቅዷል'
  },
  accessDenied: {
    en: 'Access Denied',
    am: 'መዳረሻ ተከልክሏል'
  },
  enjoyMeal: {
    en: 'Enjoy your meal',
    am: 'ምግብዎን ይመገቡ'
  },
  alreadyScanned: {
    en: 'You have already scanned for this meal',
    am: 'ለዚህ ምግብ ቀድመው ቃኝተዋል'
  },
  nextAllowed: {
    en: 'Next allowed',
    am: 'ቀጣይ የሚፈቀድ'
  },
  notRegistered: {
    en: 'Not registered for Haramaya University cafeteria service',
    am: 'ለሀረማያ ዩኒቨርሲቲ ካፌቴሪያ አገልግሎት አልተመዘገቡም'
  },
  quotaExhausted: {
    en: 'Monthly meal quota exhausted',
    am: 'ወርሃዊ የምግብ ኮታ አልቋል'
  },
  studentNotFound: {
    en: 'Student not found',
    am: 'ተማሪ አልተገኘም'
  },
  
  // Dashboard
  todayServed: {
    en: "Today's Served",
    am: 'ዛሬ የተሰጡ'
  },
  totalMeals: {
    en: 'Total Meals',
    am: 'ጠቅላላ ምግቦች'
  },
  deniedAttempts: {
    en: 'Denied Attempts',
    am: 'የተከለከሉ ሙከራዎች'
  },
  recentScans: {
    en: 'Recent Scans',
    am: 'የቅርብ ጊዜ ስካኖች'
  },
  
  // Student Portal
  myMeals: {
    en: 'My Meals',
    am: 'የእኔ ምግቦች'
  },
  lastMeal: {
    en: 'Last Meal',
    am: 'የመጨረሻ ምግብ'
  },
  remainingQuota: {
    en: 'Remaining Quota',
    am: 'ቀሪ ኮታ'
  },
  
  // Actions
  save: {
    en: 'Save',
    am: 'አስቀምጥ'
  },
  cancel: {
    en: 'Cancel',
    am: 'ሰርዝ'
  },
  search: {
    en: 'Search',
    am: 'ፈልግ'
  },
  filter: {
    en: 'Filter',
    am: 'አጣራ'
  },
  export: {
    en: 'Export',
    am: 'ላክ'
  },
  import: {
    en: 'Import',
    am: 'አስገባ'
  },
  
  // Status
  online: {
    en: 'Online',
    am: 'በመስመር ላይ'
  },
  offline: {
    en: 'Offline',
    am: 'ከመስመር ውጪ'
  },
  syncing: {
    en: 'Syncing',
    am: 'እየተመሳጠረ ነው'
  },
  
  // Errors
  error: {
    en: 'Error',
    am: 'ስህተት'
  },
  tryAgain: {
    en: 'Try Again',
    am: 'እንደገና ሞክር'
  },
  
  // Time
  hours: {
    en: 'hours',
    am: 'ሰዓቶች'
  },
  minutes: {
    en: 'minutes',
    am: 'ደቂቃዎች'
  }
};

export function t(key: keyof typeof translations, lang: Language = 'en'): string {
  return translations[key]?.[lang] || key;
}

export function getMealTypeLabel(mealType: string, lang: Language = 'en'): string {
  const mealKey = mealType as keyof typeof translations;
  return translations[mealKey]?.[lang] || mealType;
}
