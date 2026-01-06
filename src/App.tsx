import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MealSettingsProvider } from "@/contexts/MealSettingsContext";
import { StudentsProvider } from "@/contexts/StudentsContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Settings from "./pages/Settings";
import IDCards from "./pages/admin/IDCards";
import ManageAdmins from "./pages/admin/ManageAdmins";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RegistrarDashboard from "./pages/registrar/RegistrarDashboard";
import CafeServiceDashboard from "./pages/cafe/CafeServiceDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <MealSettingsProvider>
          <StudentsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/login/:type" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route
                    path="/registrar/dashboard"
                    element={<RegistrarDashboard />}
                  />
                  <Route
                    path="/cafe/dashboard"
                    element={<CafeServiceDashboard />}
                  />
                  <Route path="/students" element={<Students />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin/id-cards" element={<IDCards />} />
                  <Route path="/admin/manage" element={<ManageAdmins />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </StudentsProvider>
        </MealSettingsProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
