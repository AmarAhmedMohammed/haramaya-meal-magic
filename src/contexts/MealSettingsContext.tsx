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
import { MealType } from "@/types";

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
  registrationEnabled: boolean;
}

interface MealSettingsContextType {
  settings: MealSettings;
  updateMealWindow: (meal: MealType, window: MealWindow) => void;
  updateLockDuration: (minutes: number) => void;
  updateScanningEnabled: (enabled: boolean) => void;
  updateRegistrationEnabled: (enabled: boolean) => void;
  updateAllSettings: (newSettings: MealSettings) => Promise<void>;
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
  registrationEnabled: true,
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
            scanningEnabled: firestoreSettings.scanningEnabled ?? true,
            registrationEnabled: (firestoreSettings as any).registrationEnabled ?? true,
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

  const updateMealWindow = async (meal: MealType, window: MealWindow) => {
    // Functional update to avoid race conditions
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        mealWindows: {
          ...prev.mealWindows,
          [meal]: window,
        },
      };

      // Save to Firestore (async side effect)
      updateFirestoreSettings(newSettings).catch((err) => {
        console.error("Error updating meal window:", err);
        // We might want to revert here, but functional updates make it tricky
        // For now, let's rely on the real-time subscription to correct the UI
      });

      return newSettings;
    });
  };

  const updateLockDuration = async (minutes: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev, lockDurationMinutes: minutes };
      updateFirestoreSettings(newSettings).catch((err) =>
        console.error("Error updating lock duration:", err)
      );
      return newSettings;
    });
  };

  const updateScanningEnabled = async (enabled: boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev, scanningEnabled: enabled };
      updateFirestoreSettings(newSettings).catch((err) =>
        console.error("Error updating scanning enabled:", err)
      );
      return newSettings;
    });
  };

  const updateAllSettings = async (newSettings: MealSettings) => {
    setSettings(newSettings);
    try {
      await updateFirestoreSettings(newSettings);
    } catch (error) {
      console.error("Error updating all settings:", error);
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
        updateAllSettings,
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
