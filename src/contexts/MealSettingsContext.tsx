import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getMealSettings,
  updateMealSettings as updateFirestoreSettings,
  subscribeToMealSettings,
} from "@/lib/firestore";
import { SystemSettings, MealType } from "@/types";

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
  loading: boolean;
}

const DEFAULT_SETTINGS: MealSettings = {
  mealWindows: {
    breakfast: { start: "06:00", end: "09:00" },
    lunch: { start: "11:30", end: "14:00" },
    dinner: { start: "17:30", end: "20:00" },
  },
  lockDurationMinutes: 180,
};

const MealSettingsContext = createContext<MealSettingsContextType | undefined>(
  undefined
);

export function MealSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<MealSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial settings from Firestore
    const loadSettings = async () => {
      try {
        const firestoreSettings = await getMealSettings();
        if (firestoreSettings) {
          setSettings({
            mealWindows: firestoreSettings.mealWindows,
            lockDurationMinutes: firestoreSettings.lockDurationMinutes,
          });
        } else {
          // Initialize Firestore with default settings if none exist
          await updateFirestoreSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading meal settings:", error);
        setLoading(false);
      }
    };

    loadSettings();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMealSettings((updatedSettings) => {
      if (updatedSettings) {
        setSettings({
          mealWindows: updatedSettings.mealWindows,
          lockDurationMinutes: updatedSettings.lockDurationMinutes,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const updateMealWindow = async (meal: MealType, window: MealWindow) => {
    const newSettings = {
      ...settings,
      mealWindows: {
        ...settings.mealWindows,
        [meal]: window,
      },
    };

    // Optimistic update
    setSettings(newSettings);

    // Save to Firestore
    try {
      await updateFirestoreSettings(newSettings);
    } catch (error) {
      console.error("Error updating meal window:", error);
      // Revert on error
      setSettings(settings);
    }
  };

  const updateLockDuration = async (minutes: number) => {
    const newSettings = {
      ...settings,
      lockDurationMinutes: minutes,
    };

    // Optimistic update
    setSettings(newSettings);

    // Save to Firestore
    try {
      await updateFirestoreSettings(newSettings);
    } catch (error) {
      console.error("Error updating lock duration:", error);
      // Revert on error
      setSettings(settings);
    }
  };

  const resetToDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);

    // Save to Firestore
    try {
      await updateFirestoreSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  return (
    <MealSettingsContext.Provider
      value={{
        settings,
        updateMealWindow,
        updateLockDuration,
        resetToDefaults,
        loading,
      }}
    >
      {children}
    </MealSettingsContext.Provider>
  );
}

export function useMealSettings() {
  const context = useContext(MealSettingsContext);
  if (!context) {
    throw new Error(
      "useMealSettings must be used within a MealSettingsProvider"
    );
  }
  return context;
}
