import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { AppLayout } from "@/components/AppLayout";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AccountProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/receitas" element={<Receitas />} />
                <Route path="/despesas" element={<Despesas />} />
                <Route path="/investimentos" element={<Investimentos />} />
                <Route path="/metas" element={<Metas />} />
                <Route path="/mensal" element={<Mensal />} />
                <Route path="/planejamento" element={<PlanejamentoFinanceiro />} />
                <Route path="/dre" element={<DRE />} />
                <Route path="/ebitda" element={<EBITDA />} />
                <Route path="/importar" element={<Importar />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AccountProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
