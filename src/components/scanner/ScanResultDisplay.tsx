import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, User, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MealEligibilityResult } from '@/lib/mealLogic';
import { formatTime } from '@/lib/ethiopianCalendar';
import { Student, MealType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScanResultDisplayProps {
  result: MealEligibilityResult | null;
  student: Student | null;
  mealType: MealType | null;
  onDismiss: () => void;
}

export function ScanResultDisplay({ result, student, mealType, onDismiss }: ScanResultDisplayProps) {
  const { t, language } = useLanguage();
  
  if (!result) return null;

  const isGranted = result.result === 'granted';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-md mx-auto"
        onClick={onDismiss}
      >
        <Card 
          variant="elevated"
          className={`overflow-hidden cursor-pointer ${
            isGranted 
              ? 'border-success/50 bg-success/5' 
              : 'border-destructive/50 bg-destructive/5'
          }`}
        >
          {/* Status Header */}
          <div className={`p-6 ${isGranted ? 'bg-success' : 'bg-destructive'}`}>
            <div className="flex items-center justify-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isGranted ? 'bg-success-foreground/20' : 'bg-destructive-foreground/20'
                }`}
              >
                {isGranted ? (
                  <Check className="w-10 h-10 text-success-foreground" strokeWidth={3} />
                ) : (
                  <X className="w-10 h-10 text-destructive-foreground" strokeWidth={3} />
                )}
              </motion.div>
              
              <div className="text-left">
                <h2 className={`text-2xl font-display font-bold ${
                  isGranted ? 'text-success-foreground' : 'text-destructive-foreground'
                }`}>
                  {isGranted ? t('accessGranted') : t('accessDenied')}
                </h2>
                {mealType && (
                  <Badge variant={mealType} className="mt-2">
                    {t(mealType)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Student Info */}
            {student && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {student.photoURL ? (
                    <img 
                      src={student.photoURL} 
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {language === 'am' && student.fullNameAmharic 
                      ? student.fullNameAmharic 
                      : student.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {student.department} • Year {student.year}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {student.studentId}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {isGranted ? (
                <p className="text-success font-medium text-center text-lg">
                  {t('enjoyMeal')}, {student?.fullName.split(' ')[0]}! 🍽️
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-destructive font-medium">
                      {result.reason}
                    </p>
                  </div>
                  
                  {result.nextAllowedTime && (
                    <div className="flex items-center gap-2 justify-center text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {t('nextAllowed')}: {formatTime(result.nextAllowedTime)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </CardContent>

          {/* Tap to dismiss hint */}
          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-muted-foreground">Tap to dismiss</p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
