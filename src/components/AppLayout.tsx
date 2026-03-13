import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { TopBar } from "@/components/TopBar";
import { FloatingChat } from "@/components/FloatingChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const TABLET_BREAKPOINT = 1024;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isPremium } = useAuth();

  // Auto-collapse sidebar on tablet-sized screens
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w >= 768 && w < TABLET_BREAKPOINT) {
        setCollapsed(true);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <MobileNav />

      <motion.div
        initial={false}
        animate={{ marginLeft: isMobile ? 0 : collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen pb-[72px] md:pb-0"
      >
        <TopBar />
        <main className="px-3 py-3 md:px-5 md:py-5 lg:p-8 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* Chat button positioned above mobile nav */}
      <div className="md:bottom-5 md:right-5">
        <FloatingChat />
      </div>
    </div>
  );
};
