import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePremium = false }) => {
  const { user, loading, isPremium, sessionBlocked, signOut } = useAuth();
  const { t } = usePreferences();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sessionBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{t("sessions.blocked")}</h2>
          <p className="text-sm text-muted-foreground">{t("sessions.blockedDesc")}</p>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" /> {t("sidebar.logout")}
          </Button>
        </div>
      </div>
    );
  }

  if (requirePremium && !isPremium) {
    return <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
};
