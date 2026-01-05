import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  getMealSettings,
  updateMealSettings as updateFirestoreSettings,
  subscribeToMealSettings,
} from "@/lib/firestore";
import { MealType } from "@/types";
import { getCurrentMealType } from "@/lib/mealLogic";

interface MealWindow {
  start: string;
  end: string;
}

export interface MealSettings {
  mealWindows: {
    breakfast: MealWindow;
    lunch: MealWindow;
    dinner: MealWindow;
  };
  lockDurationMinutes: number;
  scanningEnabled: boolean;
}

interface MealSettingsContextType {
  settings: MealSettings;
  updateMealWindow: (meal: MealType, window: MealWindow) => void;
  updateLockDuration: (minutes: number) => void;
  updateScanningEnabled: (enabled: boolean) => void;
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
  scanningEnabled: true,
};

const MealSettingsContext = createContext<MealSettingsContextType | undefined>(
  undefined
);

export function MealSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<MealSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Check if current time is within any meal window and auto-update scanning
  const checkAndUpdateScanningStatus = useCallback(async () => {
    const systemSettings = {
      mealWindows: settings.mealWindows,
      lockDurationMinutes: settings.lockDurationMinutes,
      showEthiopianDate: false,
      defaultLanguage: 'en' as const,
      scanningEnabled: settings.scanningEnabled,
    };
    
    const currentMeal = getCurrentMealType(new Date(), systemSettings);
    const shouldBeEnabled = currentMeal !== null;
    
    // Only update if the status needs to change
    if (shouldBeEnabled !== settings.scanningEnabled) {
      const newSettings = {
        ...settings,
        scanningEnabled: shouldBeEnabled,
      };
      setSettings(newSettings);
      try {
        await updateFirestoreSettings(newSettings);
        console.log(`Auto-scanning ${shouldBeEnabled ? 'enabled' : 'disabled'} - ${currentMeal ? `${currentMeal} time` : 'outside meal hours'}`);
      } catch (error) {
        console.error("Error auto-updating scanning status:", error);
      }
    }
  }, [settings]);

  // Set up interval to check meal times every minute
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load initial settings from Firestore
    const loadSettings = async () => {
      try {
        const firestoreSettings = await getMealSettings();
        if (firestoreSettings) {
          setSettings({
            mealWindows: firestoreSettings.mealWindows,
            lockDurationMinutes: firestoreSettings.lockDurationMinutes,
            scanningEnabled: firestoreSettings.scanningEnabled ?? true,
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
          scanningEnabled: updatedSettings.scanningEnabled ?? true,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-check scanning status every minute based on meal times
  useEffect(() => {
    if (loading) return;

    // Initial check
    checkAndUpdateScanningStatus();

    // Check every minute
    intervalRef.current = setInterval(() => {
      checkAndUpdateScanningStatus();
    }, 60000); // 60 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading, checkAndUpdateScanningStatus]);

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

  const updateScanningEnabled = async (enabled: boolean) => {
    const newSettings = {
      ...settings,
      scanningEnabled: enabled,
    };

    // Optimistic update
    setSettings(newSettings);

    // Save to Firestore
    try {
      await updateFirestoreSettings(newSettings);
    } catch (error) {
      console.error("Error updating scanning enabled:", error);
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
        updateScanningEnabled,
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
