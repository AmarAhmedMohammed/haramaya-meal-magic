import React from "react";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMealSettings } from "@/contexts/MealSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MealType } from "@/types";
import { Clock, Coffee, Sun, Moon, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

const mealIcons: Record<
  MealType,
  React.ComponentType<{ className?: string }>
> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
};

const mealColors: Record<MealType, string> = {
  breakfast: "text-amber-500",
  lunch: "text-yellow-500",
  dinner: "text-indigo-500",
};

export default function Settings() {
  const { t } = useLanguage();
  const {
    settings,
    updateMealWindow,
    updateLockDuration,
    updateScanningEnabled,
    updateAllSettings,
    resetToDefaults,
  } = useMealSettings();

  const [localSettings, setLocalSettings] = React.useState(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleTimeChange = (
    meal: MealType,
    field: "start" | "end",
    value: string
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      mealWindows: {
        ...prev.mealWindows,
        [meal]: {
          ...prev.mealWindows[meal],
          [field]: value,
        },
      },
    }));
  };

  const handleLockDurationChange = (value: string) => {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      setLocalSettings((prev) => ({
        ...prev,
        lockDurationMinutes: minutes,
      }));
    }
  };

  const handleSave = async () => {
    // Apply all changes in one batch to avoid race conditions
    await updateAllSettings(localSettings);

    toast.success("Meal window settings saved successfully");
  };

  const handleReset = () => {
    resetToDefaults();
    toast.info("Settings reset to defaults");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Meal Window Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure the time windows for each meal. Scanning will only work
            during these periods.
          </p>
        </div>

        <Card variant="elevated" className="border-accent/20 bg-accent/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Manual Scanning Control</h3>
              <p className="text-sm text-muted-foreground">
                Master switch to enable or disable scanning across all
                cafeterias
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-bold ${
                  localSettings.scanningEnabled
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {localSettings.scanningEnabled ? "ACTIVE" : "PAUSED"}
              </span>
              <Switch
                checked={localSettings.scanningEnabled}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    scanningEnabled: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Meal Time Windows
            </CardTitle>
            <CardDescription>
              Set the start and end time for each meal period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(["breakfast", "lunch", "dinner"] as MealType[]).map((meal) => {
              const Icon = mealIcons[meal];
              return (
                <div
                  key={meal}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <Icon className={`w-5 h-5 ${mealColors[meal]}`} />
                    <span className="font-medium capitalize">{t(meal)}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <Label
                        htmlFor={`${meal}-start`}
                        className="text-xs text-muted-foreground flex justify-between"
                      >
                        <span>Start Time</span>
                        <span className="font-mono opacity-60">
                          ({localSettings.mealWindows[meal].start})
                        </span>
                      </Label>
                      <Input
                        id={`${meal}-start`}
                        type="time"
                        value={localSettings.mealWindows[meal].start}
                        onChange={(e) =>
                          handleTimeChange(meal, "start", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <span className="text-muted-foreground mt-5">to</span>
                    <div className="flex-1">
                      <Label
                        htmlFor={`${meal}-end`}
                        className="text-xs text-muted-foreground flex justify-between"
                      >
                        <span>End Time</span>
                        <span className="font-mono opacity-60">
                          ({localSettings.mealWindows[meal].end})
                        </span>
                      </Label>
                      <Input
                        id={`${meal}-end`}
                        type="time"
                        value={localSettings.mealWindows[meal].end}
                        onChange={(e) =>
                          handleTimeChange(meal, "end", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Lock Duration</CardTitle>
            <CardDescription>
              Time (in minutes) before a student can scan again for the same
              meal type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={0}
                max={1440}
                value={localSettings.lockDurationMinutes}
                onChange={(e) => handleLockDurationChange(e.target.value)}
                className="w-32"
              />
              <span className="text-muted-foreground">
                minutes ({Math.floor(localSettings.lockDurationMinutes / 60)}h{" "}
                {localSettings.lockDurationMinutes % 60}m)
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
}
