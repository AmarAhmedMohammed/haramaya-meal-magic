import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDualDate } from '@/lib/ethiopianCalendar';
import { 
  Users, 
  Utensils, 
  TrendingUp, 
  AlertTriangle,
  Coffee,
  Sun,
  Moon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data
const mockStats = {
  todayTotal: 1247,
  breakfastCount: 423,
  lunchCount: 512,
  dinnerCount: 312,
  deniedCount: 45,
  noneCafeAttempts: 12,
  yesterdayTotal: 1189,
};

const mockRecentScans = [
  { id: 1, studentId: 'HU2024156', name: 'Tigist Alemayehu', mealType: 'lunch' as const, result: 'granted' as const, time: '12:45 PM' },
  { id: 2, studentId: 'HU2024089', name: 'Yohannes Bekele', mealType: 'lunch' as const, result: 'granted' as const, time: '12:43 PM' },
  { id: 3, studentId: 'HU2024234', name: 'Meron Tadesse', mealType: 'lunch' as const, result: 'denied' as const, time: '12:41 PM', reason: 'Already scanned' },
  { id: 4, studentId: 'HU2024067', name: 'Henok Girma', mealType: 'lunch' as const, result: 'granted' as const, time: '12:38 PM' },
  { id: 5, studentId: 'HU2024301', name: 'Bethlehem Assefa', mealType: 'lunch' as const, result: 'denied' as const, time: '12:35 PM', reason: 'Not registered' },
];

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
};

export default function Dashboard() {
  const { t, language } = useLanguage();
  const today = new Date();
  const dualDate = formatDualDate(today, language as 'en' | 'am');
  
  const percentChange = ((mockStats.todayTotal - mockStats.yesterdayTotal) / mockStats.yesterdayTotal * 100).toFixed(1);
  const isPositive = mockStats.todayTotal >= mockStats.yesterdayTotal;

  const statCards = [
    {
      title: t('todayServed'),
      value: mockStats.todayTotal.toLocaleString(),
      icon: Utensils,
      change: `${isPositive ? '+' : ''}${percentChange}%`,
      changePositive: isPositive,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('breakfast'),
      value: mockStats.breakfastCount.toLocaleString(),
      icon: mealIcons.breakfast,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      title: t('lunch'),
      value: mockStats.lunchCount.toLocaleString(),
      icon: mealIcons.lunch,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      title: t('dinner'),
      value: mockStats.dinnerCount.toLocaleString(),
      icon: mealIcons.dinner,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{t('dashboard')}</h1>
            <div className="mt-1 text-sm text-muted-foreground">
              <p>{dualDate.gregorian}</p>
              <p className="text-accent">{dualDate.ethiopian}</p>
            </div>
          </div>
          <Button variant="hero" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            {t('export')} Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                      {stat.change && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${
                          stat.changePositive ? 'text-success' : 'text-destructive'
                        }`}>
                          {stat.changePositive ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {stat.change} from yesterday
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Denied Attempts */}
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('deniedAttempts')}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{mockStats.deniedCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mockStats.noneCafeAttempts} non-cafe attempts
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Cafeteria Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Muslim Cafe', count: 567, percentage: 45 },
                  { name: 'Christian Cafe', count: 389, percentage: 31 },
                  { name: 'Freshman Cafe', count: 291, percentage: 24 },
                ].map((caf) => (
                  <div key={caf.name} className="text-center">
                    <div className="relative w-20 h-20 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="stroke-muted fill-none"
                          strokeWidth="8"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="stroke-accent fill-none"
                          strokeWidth="8"
                          strokeDasharray={`${caf.percentage * 2} 200`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                        {caf.percentage}%
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-2">{caf.name}</p>
                    <p className="text-xs text-muted-foreground">{caf.count} meals</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('recentScans')}</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Meal</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentScans.map((scan, index) => (
                    <motion.tr
                      key={scan.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{scan.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{scan.studentId}</code>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={scan.mealType}>{t(scan.mealType)}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={scan.result === 'granted' ? 'granted' : 'denied'}>
                          {scan.result === 'granted' ? t('accessGranted') : t('accessDenied')}
                        </Badge>
                        {scan.reason && (
                          <span className="block text-xs text-muted-foreground mt-1">{scan.reason}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{scan.time}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
