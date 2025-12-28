// Ethiopian Calendar Conversion Utilities
// Based on the Ethiopian calendar which is 7-8 years behind Gregorian

const ETHIOPIAN_MONTHS = {
  en: [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
  ],
  am: [
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
  ]
};

const ETHIOPIAN_DAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  am: ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']
};

interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 3;
}

export function gregorianToEthiopian(date: Date): EthiopianDate {
  const jdn = gregorianToJDN(date);
  return jdnToEthiopian(jdn);
}

function gregorianToJDN(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = (jdn - 1723856) % 1461;
  const n = r % 365 + 365 * Math.floor(r / 1460);
  
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = n % 30 + 1;

  return { year, month, day };
}

export function formatEthiopianDate(date: Date, lang: 'en' | 'am' = 'en'): string {
  const ethDate = gregorianToEthiopian(date);
  const monthName = ETHIOPIAN_MONTHS[lang][ethDate.month - 1];
  const dayName = ETHIOPIAN_DAYS[lang][date.getDay()];
  
  if (lang === 'am') {
    return `${dayName}፣ ${monthName} ${ethDate.day}፣ ${ethDate.year}`;
  }
  return `${dayName}, ${monthName} ${ethDate.day}, ${ethDate.year}`;
}

export function formatDualDate(date: Date, lang: 'en' | 'am' = 'en'): { gregorian: string; ethiopian: string } {
  const gregorian = date.toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const ethiopian = formatEthiopianDate(date, lang);
  
  return { gregorian, ethiopian };
}

export function formatTime(date: Date, use12Hour: boolean = true): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: use12Hour
  });
}

export function formatFullDateTime(date: Date, lang: 'en' | 'am' = 'en'): string {
  const { gregorian, ethiopian } = formatDualDate(date, lang);
  const time = formatTime(date);
  
  return `${gregorian} (${ethiopian}) ${time}`;
}
