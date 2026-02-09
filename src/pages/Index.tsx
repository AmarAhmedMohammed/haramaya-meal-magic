import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMealSettings } from '@/contexts/MealSettingsContext';
import huLogo from '@/assets/hu-logo.png';
import { 
  ScanLine, 
  Shield, 
  Clock, 
  Building2, 
  Users, 
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Wifi,
  UserCog,
  FileText,
  Utensils
} from 'lucide-react';

const features = [
  {
    icon: ScanLine,
    title: 'Fast QR/Barcode Scanning',
    description: 'Lightning-fast scanning using BarcodeDetector API for instant student verification.',
  },
  {
    icon: Shield,
    title: 'Anti-Cheat Protection',
    description: '3-hour meal lock prevents duplicate scans across all cafeterias.',
  },
  {
    icon: Building2,
    title: 'Multi-Cafeteria Support',
    description: 'Muslim, Christian, and Freshman cafeterias connected in one system.',
  },
  {
    icon: Clock,
    title: 'Smart Meal Windows',
    description: 'Auto-start/stop scanning based on configurable meal times.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Admin, Registrar, and Cafe Service roles with specific permissions.',
  },
  {
    icon: Wifi,
    title: 'Real-time Updates',
    description: 'Live synchronization across all dashboards without page refresh.',
  },
];

export default function Index() {
  const { settings } = useMealSettings();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 ethiopian-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white shadow-2xl mb-6 overflow-hidden"
            >
              <img src={huLogo} alt="Haramaya University" className="w-24 h-24 object-contain" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-3"
            >
              Haramaya University
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-display text-primary-foreground/90 mb-1"
            >
              Smart Meal System
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-primary-foreground/70 font-display mb-6"
            >
              ሀረማያ ዩኒቨርሲቲ የምግብ ስርዓት
            </motion.p>

            {/* Three Login Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <Link to="/login/admin">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="gap-2 min-w-56 bg-amber-500 hover:bg-amber-600 text-primary-foreground border-none"
                >
                  <UserCog className="w-5 h-5" />
                  Admin Login
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              
              {settings.registrationEnabled && (
                <Link to="/login/registrar">
                  <Button
                    variant="outline"
                    size="xl"
                    className="gap-2 min-w-56 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <FileText className="w-5 h-5" />
                    Registrar Login
                  </Button>
                </Link>
              )}
              
              <Link to="/login/cafe">
                <Button
                  variant="outline"
                  size="xl"
                  className="gap-2 min-w-56 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Utensils className="w-5 h-5" />
                  Cafe Service Login
                </Button>
              </Link>
            </motion.div>

            {/* Meal badges */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground">
                <Coffee className="w-4 h-4" />
                <span className="text-sm font-medium">Breakfast</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground">
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">Lunch</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground">
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">Dinner</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
              Everything you need for meal management
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive system designed specifically for Haramaya University's cafeteria operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card variant="elevated" className="h-full">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-base font-display font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '15,000+', label: 'Students Served' },
              { value: '3', label: 'Cafeterias' },
              { value: '3', label: 'Daily Meals' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={huLogo} alt="HU" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-semibold text-foreground">Haramaya University</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Haramaya University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
