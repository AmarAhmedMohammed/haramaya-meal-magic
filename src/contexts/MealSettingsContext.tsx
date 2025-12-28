import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemSettings, MealType } from '@/types';

interface MealWindow {
  start: string;
  end: string;
}

interface MealSettings {
  mealWindows: {
    breakfast: MealWindow;
    lunch: MealWindow;
    dinner: MealWindow;
  };
  lockDurationMinutes: number;
}

interface MealSettingsContextType {
  settings: MealSettings;
  updateMealWindow: (meal: MealType, window: MealWindow) => void;
  updateLockDuration: (minutes: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: MealSettings = {
  mealWindows: {
    breakfast: { start: '06:00', end: '09:00' },
    lunch: { start: '11:30', end: '14:00' },
    dinner: { start: '17:30', end: '20:00' },
  },
  lockDurationMinutes: 180,
};

const STORAGE_KEY = 'meal-settings';

const MealSettingsContext = createContext<MealSettingsContextType | undefined>(undefined);

export function MealSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<MealSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateMealWindow = (meal: MealType, window: MealWindow) => {
    setSettings(prev => ({
      ...prev,
      mealWindows: {
        ...prev.mealWindows,
        [meal]: window,
      },
    }));
  };

  const updateLockDuration = (minutes: number) => {
    setSettings(prev => ({
      ...prev,
      lockDurationMinutes: minutes,
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <MealSettingsContext.Provider value={{ settings, updateMealWindow, updateLockDuration, resetToDefaults }}>
      {children}
    </MealSettingsContext.Provider>
  );
}

export function useMealSettings() {
  const context = useContext(MealSettingsContext);
  if (!context) {
    throw new Error('useMealSettings must be used within a MealSettingsProvider');
  }
  return context;
}
