import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Languages,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  roles?: string[];
}

const mainNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Students",
    href: "/students",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: "Settings",
    href: "/settings",
    roles: ["super_admin"],
  },
];

const adminNavItems: NavItem[] = [
  {
    icon: <Shield className="w-5 h-5" />,
    label: "Manage Admins",
    href: "/admin/manage",
    roles: ["super_admin"],
  },
];

// Filter nav items by role
function filterByRole(items: NavItem[], admin: any): NavItem[] {
  return items.filter(item => {
    if (!item.roles) return true;
    if (!admin) return false;
    return item.roles.includes(admin.role);
  });
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { admin, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleLanguage = () => {
    // Cycle through: en -> am -> or -> en
    if (language === "en") {
      setLanguage("am");
    } else if (language === "am") {
      setLanguage("or");
    } else {
      setLanguage("en");
    }
  };

  const getLanguageDisplay = () => {
    if (language === "en") return "አማርኛ"; // Show next language
    if (language === "am") return "Oromiffa"; // Show next language
    return "English"; // Show next language
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-xl">
                H
              </span>
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-display font-bold text-lg">
                Haramaya
              </h1>
              <p className="text-sidebar-foreground/70 text-xs">Meal System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {/* Main Nav Items */}
              {filterByRole(mainNavItems, admin).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}

              {/* Admin Section */}
              {filterByRole(adminNavItems, admin).length > 0 && (
                <>
                  <li className="mt-4">
                    <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">
                      Admin
                    </p>
                  </li>
                  {filterByRole(adminNavItems, admin).map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </>
              )}
            </ul>

            {/* User section */}
            <div className="mt-auto space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <Languages className="w-5 h-5 mr-3" />
                {getLanguageDisplay()}
              </Button>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground text-sm font-medium">
                    {admin?.displayName?.[0] || "A"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {admin?.displayName || "Admin"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {admin?.role?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t("logout")}
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-sidebar px-4 py-4 shadow-sm lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="text-sidebar-foreground"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">H</span>
          </div>
          <span className="text-sidebar-foreground font-display font-bold">
            Haramaya Meal
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="text-sidebar-foreground"
        >
          <Languages className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="fixed inset-0 bg-foreground/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 w-full max-w-xs bg-sidebar"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold">
                    H
                  </span>
                </div>
                <span className="text-sidebar-foreground font-display font-bold">
                  Haramaya
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sidebar-foreground"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <nav className="px-4 py-2">
              {filterByRole(mainNavItems, admin).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex gap-x-3 rounded-lg p-3 text-sm font-medium mb-1",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin Section */}
              {filterByRole(adminNavItems, admin).length > 0 && (
                <>
                  <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mt-4 mb-2">
                    Admin
                  </p>
                  {filterByRole(adminNavItems, admin).map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex gap-x-3 rounded-lg p-3 text-sm font-medium mb-1",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
