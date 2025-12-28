import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ScanLine, 
  Shield, 
  Clock, 
  Building2, 
  Users, 
  Globe,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Wifi
} from 'lucide-react';

const features = [
  {
    icon: ScanLine,
    title: 'Code 39 Barcode Scanning',
    description: 'Fast, accurate scanning using student ID barcodes. Works on any camera.',
  },
  {
    icon: Shield,
    title: 'Anti-Cheat Protection',
    description: '3-hour meal lock prevents duplicate scans across all cafeterias.',
  },
  {
    icon: Building2,
    title: 'Multi-Cafeteria Support',
    description: 'Main campus, college, and hostel cafeterias connected in one system.',
  },
  {
    icon: Clock,
    title: 'Smart Meal Windows',
    description: 'Configurable breakfast, lunch, and dinner service times.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Super admin, cafeteria managers, cashiers, and registrar roles.',
  },
  {
    icon: Wifi,
    title: 'Offline Support',
    description: 'Works offline and syncs automatically when connection returns.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 ethiopian-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-accent shadow-2xl mb-8"
            >
              <span className="text-accent-foreground font-display font-bold text-5xl">H</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-4"
            >
              Haramaya University
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-display text-primary-foreground/90 mb-2"
            >
              Smart Meal System
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-primary-foreground/70 font-display mb-2"
            >
              ሀረማያ ዩኒቨርሲቲ የምግብ ስርዓት
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-primary-foreground/60 max-w-2xl mx-auto mb-8"
            >
              Modern, secure, and cheat-resistant meal service for students.
              Replace plastic cards with smart barcode scanning.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/login">
                <Button variant="hero" size="xl" className="gap-2 min-w-48">
                  Staff Login
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/student-portal">
                <Button
                  variant="outline"
                  size="xl"
                  className="gap-2 min-w-48 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Globe className="w-5 h-5" />
                  Student Portal
                </Button>
              </Link>
            </motion.div>

            {/* Meal badges */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 mt-12"
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
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Everything you need for meal management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive system designed specifically for Haramaya University's cafeteria operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card variant="elevated" className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '15,000+', label: 'Students Served' },
              { value: '5', label: 'Cafeterias' },
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
                <p className="text-4xl sm:text-5xl font-display font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Ready to modernize meal service?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contact Haramaya University IT department to get started with the Smart Meal System.
          </p>
          <Link to="/login">
            <Button variant="gradient" size="xl" className="gap-2">
              Get Started
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">H</span>
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
