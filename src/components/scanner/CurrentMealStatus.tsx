import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Coffee, Sun, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentMealType, getMealWindowLabel, getNextMealWindow } from '@/lib/mealLogic';
import { formatTime } from '@/lib/ethiopianCalendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMealSettings } from '@/contexts/MealSettingsContext';
import { MealType } from '@/types';

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-6 h-6" />,
  lunch: <Sun className="w-6 h-6" />,
  dinner: <Moon className="w-6 h-6" />,
};

export function CurrentMealStatus() {
  const { t } = useLanguage();
  const { settings } = useMealSettings();
  const systemSettings = { 
    mealWindows: settings.mealWindows, 
    lockDurationMinutes: settings.lockDurationMinutes, 
    showEthiopianDate: true, 
    defaultLanguage: 'en' as const,
    scanningEnabled: settings.scanningEnabled ?? true
  };
  
  const currentMeal = getCurrentMealType(new Date(), systemSettings);
  const nextMeal = getNextMealWindow(new Date(), systemSettings);

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${
            currentMeal 
              ? 'bg-success/20 text-success' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {currentMeal ? mealIcons[currentMeal] : <Utensils className="w-6 h-6" />}
          </div>
          
          <div className="flex-1">
            {currentMeal ? (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {t(currentMeal)} Service Active
                  </h3>
                  <Badge variant={currentMeal}>{t(currentMeal)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Window: {getMealWindowLabel(currentMeal, systemSettings)}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-display text-lg font-semibold text-muted-foreground">
                  No Active Meal Window
                </h3>
                {nextMeal && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Next: {t(nextMeal.mealType)} at {formatTime(nextMeal.startTime)}
                  </p>
                )}
              </>
            )}
          </div>

          {currentMeal && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-3 h-3 rounded-full bg-success"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
