import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { authType, staff, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (authType === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (authType === "staff" && staff) {
      if (staff.role === "registrar") {
        navigate("/registrar/dashboard", { replace: true });
      } else {
        navigate("/cafe/dashboard", { replace: true });
      }
    } else if (!authType) {
      navigate("/login", { replace: true });
    }
  }, [authType, staff, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground animate-pulse">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
