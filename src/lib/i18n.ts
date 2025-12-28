export type Language = "en" | "am" | "or";

export const translations = {
  // General
  appName: {
    en: "Haramaya University Meal System",
    am: "ሀረማያ ዩኒቨርሲቲ የምግብ ስርዓት",
    or: "Sirna Nyaata Yunivarsiitii Haramaayaa",
  },
  welcome: {
    en: "Welcome",
    am: "እንኳን ደህና መጡ",
    or: "Baga Nagaan Dhuftan",
  },

  // Navigation
  dashboard: {
    en: "Dashboard",
    am: "ዳሽቦርድ",
    or: "Gabatee",
  },
  scanner: {
    en: "Scanner",
    am: "ስካነር",
    or: "Iskaanarii",
  },
  students: {
    en: "Students",
    am: "ተማሪዎች",
    or: "Barsiisota",
  },
  cafeterias: {
    en: "Cafeterias",
    am: "ካፌቴሪያዎች",
    or: "Kaafeetiiriyaalee",
  },
  settings: {
    en: "Settings",
    am: "ቅንብሮች",
    or: "Qindaa'ina",
  },
  logout: {
    en: "Logout",
    am: "ውጣ",
    or: "Ba'i",
  },
  login: {
    en: "Login",
    am: "ግባ",
    or: "Seeni",
  },

  // Meals
  breakfast: {
    en: "Breakfast",
    am: "ቁርስ",
    or: "Ciree",
  },
  lunch: {
    en: "Lunch",
    am: "ምሳ",
    or: "Qeeboo",
  },
  dinner: {
    en: "Dinner",
    am: "እራት",
    or: "Irbaata",
  },

  // Scanner messages
  scanBarcode: {
    en: "Scan Student ID Barcode",
    am: "የተማሪ መታወቂያ ባርኮድ ይቃኙ",
    or: "Baarkoodii Eenyummaa Barsiisaa Iskaanii",
  },
  scanning: {
    en: "Scanning...",
    am: "እየቃኘ ነው...",
    or: "Iskaanii irra jira...",
  },
  accessGranted: {
    en: "Access Granted",
    am: "መዳረሻ ተፈቅዷል",
    or: "Eeyyaman Kenname",
  },
  accessDenied: {
    en: "Access Denied",
    am: "መዳረሻ ተከልክሏል",
    or: "Eeyyaman Dhowwame",
  },
  enjoyMeal: {
    en: "Enjoy your meal",
    am: "ምግብዎን ይመገቡ",
    or: "Nyaata kee gammadi",
  },
  alreadyScanned: {
    en: "You have already scanned for this meal",
    am: "ለዚህ ምግብ ቀድመው ቃኝተዋል",
    or: "Nyaata kanaaf duraanuu iskaanifameera",
  },
  nextAllowed: {
    en: "Next allowed",
    am: "ቀጣይ የሚፈቀድ",
    or: "Itti aanuu eeyyamamaa",
  },
  notRegistered: {
    en: "Not registered for Haramaya University cafeteria service",
    am: "ለሀረማያ ዩኒቨርሲቲ ካፌቴሪያ አገልግሎት አልተመዘገቡም",
    or: "Tajaajila kaafeetiiriyaa Yunivarsiitii Haramaayaatiif hin galmaa'amne",
  },
  quotaExhausted: {
    en: "Monthly meal quota exhausted",
    am: "ወርሃዊ የምግብ ኮታ አልቋል",
    or: "Koota nyaataa ji'a dhumeera",
  },
  studentNotFound: {
    en: "Student not found",
    am: "ተማሪ አልተገኘም",
    or: "Barsiisaan hin argamne",
  },

  // Dashboard
  todayServed: {
    en: "Today's Served",
    am: "ዛሬ የተሰጡ",
    or: "Har'a Kenname",
  },
  totalMeals: {
    en: "Total Meals",
    am: "ጠቅላላ ምግቦች",
    or: "Ida'ama Nyaataa",
  },
  deniedAttempts: {
    en: "Denied Attempts",
    am: "የተከለከሉ ሙከራዎች",
    or: "Yaalii Dhowwame",
  },
  recentScans: {
    en: "Recent Scans",
    am: "የቅርብ ጊዜ ስካኖች",
    or: "Iskaanii Dhihoo",
  },

  // Student Portal
  myMeals: {
    en: "My Meals",
    am: "የእኔ ምግቦች",
    or: "Nyaata Koo",
  },
  lastMeal: {
    en: "Last Meal",
    am: "የመጨረሻ ምግብ",
    or: "Nyaata Dhumaa",
  },
  remainingQuota: {
    en: "Remaining Quota",
    am: "ቀሪ ኮታ",
    or: "Koota Hafe",
  },

  // Actions
  save: {
    en: "Save",
    am: "አስቀምጥ",
    or: "Olkaa'i",
  },
  cancel: {
    en: "Cancel",
    am: "ሰርዝ",
    or: "Dhiisi",
  },
  search: {
    en: "Search",
    am: "ፈልግ",
    or: "Barbaadi",
  },
  filter: {
    en: "Filter",
    am: "አጣራ",
    or: "Calaqqisiisi",
  },
  export: {
    en: "Export",
    am: "ላክ",
    or: "Alergadaa",
  },
  import: {
    en: "Import",
    am: "አስገባ",
    or: "Galchuu",
  },

  // Status
  online: {
    en: "Online",
    am: "በመስመር ላይ",
    or: "Toora Irra",
  },
  offline: {
    en: "Offline",
    am: "ከመስመር ውጪ",
    or: "Toora Ala",
  },
  syncing: {
    en: "Syncing",
    am: "እየተመሳጠረ ነው",
    or: "Walsimsiisuutti jira",
  },

  // Errors
  error: {
    en: "Error",
    am: "ስህተት",
    or: "Dogoggora",
  },
  tryAgain: {
    en: "Try Again",
    am: "እንደገና ሞክር",
    or: "Irra Deebi'ii Yaali",
  },

  // Time
  hours: {
    en: "hours",
    am: "ሰዓቶች",
    or: "sa'aatii",
  },
  minutes: {
    en: "minutes",
    am: "ደቂቃዎች",
    or: "daqiiqaa",
  },
};

export function t(
  key: keyof typeof translations,
  lang: Language = "en"
): string {
  return translations[key]?.[lang] || key;
}

export function getMealTypeLabel(
  mealType: string,
  lang: Language = "en"
): string {
  const mealKey = mealType as keyof typeof translations;
  return translations[mealKey]?.[lang] || mealType;
}
