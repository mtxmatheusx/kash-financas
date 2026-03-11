import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Receitas from "@/pages/Receitas";
import Despesas from "@/pages/Despesas";
import Investimentos from "@/pages/Investimentos";
import Metas from "@/pages/Metas";
import Mensal from "@/pages/Mensal";
import PlanejamentoFinanceiro from "@/pages/PlanejamentoFinanceiro";
import DRE from "@/pages/DRE";
import EBITDA from "@/pages/EBITDA";
import Importar from "@/pages/Importar";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Upgrade from "@/pages/Upgrade";
import Perfil from "@/pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AccountProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/upgrade" element={<Upgrade />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  {/* Free tier */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/receitas" element={<Receitas />} />
                  <Route path="/despesas" element={<Despesas />} />

                  {/* Premium tier */}
                  <Route path="/investimentos" element={<ProtectedRoute requirePremium><Investimentos /></ProtectedRoute>} />
                  <Route path="/metas" element={<ProtectedRoute requirePremium><Metas /></ProtectedRoute>} />
                  <Route path="/mensal" element={<ProtectedRoute requirePremium><Mensal /></ProtectedRoute>} />
                  <Route path="/planejamento" element={<ProtectedRoute requirePremium><PlanejamentoFinanceiro /></ProtectedRoute>} />
                  <Route path="/dre" element={<ProtectedRoute requirePremium><DRE /></ProtectedRoute>} />
                  <Route path="/ebitda" element={<ProtectedRoute requirePremium><EBITDA /></ProtectedRoute>} />
                  <Route path="/importar" element={<ProtectedRoute requirePremium><Importar /></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
