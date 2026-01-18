import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  GraduationCap,
  ShieldBan,
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
  {
    icon: <GraduationCap className="w-5 h-5" />,
    label: "Graduated Students",
    href: "/admin/graduated",
    roles: ["super_admin"],
  },
  {
    icon: <ShieldBan className="w-5 h-5" />,
    label: "Restricted Students",
    href: "/admin/restricted",
    roles: ["super_admin"],
  },
];

// Filter nav items by role
function filterByRole(items: NavItem[], admin: any): NavItem[] {
  return items.filter((item) => {
    if (!item.roles) return true;
    if (!admin) return false;
    return item.roles.includes(admin.role);
  });
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { admin, staff, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false);
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, try to navigate home
      navigate("/");
    }
  };

  const toggleLanguage = () => {
    if (language === "en") {
      setLanguage("am");
    } else if (language === "am") {
      setLanguage("or");
    } else {
      setLanguage("en");
    }
  };

  const getLanguageDisplay = () => {
    if (language === "en") return "አማርኛ";
    if (language === "am") return "Oromiffa";
    return "English";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4 border-r border-sidebar-border">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <span className="text-accent-foreground font-bold text-xl">
                H
              </span>
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-display font-bold text-lg tracking-tight">
                Haramaya
              </h1>
              <p className="text-sidebar-foreground/70 text-xs font-medium">
                Meal System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {filterByRole(mainNavItems, admin).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}

              {filterByRole(adminNavItems, admin).length > 0 && (
                <>
                  <li className="mt-6 mb-2">
                    <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-[0.2em] px-3">
                      Administrative
                    </p>
                  </li>
                  {filterByRole(adminNavItems, admin).map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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

              <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border/50">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-inner">
                  <span className="text-primary-foreground text-sm font-bold uppercase">
                    {admin?.displayName?.[0] || staff?.fullName?.[0] || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-sidebar-foreground truncate">
                    {admin?.displayName || staff?.fullName || "User"}
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/60 truncate uppercase tracking-wider">
                    {admin
                      ? admin.role?.replace("_", " ")
                      : staff?.role?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="default"
                onClick={handleLogout}
                className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">{t("logout")}</span>
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 w-full max-w-xs bg-sidebar border-r border-sidebar-border shadow-2xl"
          >
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                  <span className="text-accent-foreground font-bold text-xl">
                    H
                  </span>
                </div>
                <span className="text-sidebar-foreground font-display font-bold text-lg">
                  Haramaya
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
                      "flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-200 mb-1",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}

              {filterByRole(adminNavItems, admin).length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-[0.2em] px-3 mt-6 mb-2">
                    Administrative
                  </p>
                  {filterByRole(adminNavItems, admin).map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-200 mb-1",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Mobile User Section */}
              <div className="mt-8 pt-6 border-t border-sidebar-border space-y-4">
                <div className="flex items-center gap-3 px-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {admin?.displayName?.[0] || staff?.fullName?.[0] || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sidebar-foreground truncate">
                      {admin?.displayName || staff?.fullName || "User"}
                    </p>
                    <p className="text-[10px] text-sidebar-foreground/60 truncate uppercase tracking-wider">
                      {admin
                        ? admin.role?.replace("_", " ")
                        : staff?.role?.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="default"
                  onClick={handleLogout}
                  className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  {t("logout")}
                </Button>
              </div>
            </nav>
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8 bg-background min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
