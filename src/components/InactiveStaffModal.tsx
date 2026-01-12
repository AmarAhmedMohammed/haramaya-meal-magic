import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InactiveStaffModalProps {
  isOpen: boolean;
  onLogout: () => void;
  staffName?: string;
}

export function InactiveStaffModal({ isOpen, onLogout, staffName }: InactiveStaffModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 w-full max-w-md overflow-hidden"
          >
            {/* Card with gradient border */}
            <div className="relative rounded-2xl bg-gradient-to-br from-destructive/20 via-warning/10 to-destructive/20 p-[2px]">
              <div className="rounded-2xl bg-card p-8 shadow-2xl">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-destructive/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-destructive/80 to-destructive flex items-center justify-center">
                      <AlertTriangle className="w-10 h-10 text-destructive-foreground" />
                    </div>
                  </motion.div>
                </div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-center text-foreground mb-2"
                >
                  Account Inactive
                </motion.h2>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-3 mb-8"
                >
                  {staffName && (
                    <p className="text-lg text-foreground font-medium">
                      Hello, {staffName}
                    </p>
                  )}
                  <p className="text-muted-foreground leading-relaxed">
                    Your account has been <span className="text-destructive font-semibold">deactivated</span> by an administrator.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You are currently unable to perform any operations. Please contact the admin to reactivate your account.
                  </p>
                </motion.div>

                {/* Contact info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2"
                >
                  <p className="text-sm font-medium text-foreground text-center mb-3">
                    Contact Admin
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>admin@haramaya.edu.et</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>+251 25 553 0006</span>
                  </div>
                </motion.div>

                {/* Logout button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={onLogout}
                    variant="destructive"
                    className="w-full h-12 text-base font-semibold"
                  >
                    Sign Out
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
