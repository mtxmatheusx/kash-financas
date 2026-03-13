import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { fadeUp } from "./LandingAnimations";
import { LandingCTA } from "./LandingComponents";

interface FooterSectionProps {
  t: (k: any) => string;
  signupLink: string;
}

export const FinalCTA: React.FC<FooterSectionProps> = ({ t, signupLink }) => (
  <section className="py-14 sm:py-28 px-4 sm:px-6" aria-label="Final call to action">
    <motion.div {...fadeUp()} className="max-w-3xl mx-auto text-center rounded-2xl sm:rounded-3xl p-8 sm:p-16 relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, hsl(var(--landing-neon) / 0.1), hsl(var(--primary) / 0.06), hsl(var(--landing-neon) / 0.1))", backgroundSize: "200% 200%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-[hsl(var(--landing-bg)/0.7)] backdrop-blur-xl" />
      <div className="absolute inset-px rounded-[15px] sm:rounded-[23px] border border-[hsl(var(--landing-neon)/0.08)]" />
      <div className="relative z-10">
        <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--landing-neon))] mx-auto mb-5 sm:mb-6" aria-hidden="true" />
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">{t("landing.finalCta.title")}</h2>
        <p className="text-[hsl(0,0%,55%)] text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">{t("landing.finalCta.subtitle")}</p>
        <LandingCTA to={signupLink}>
          {t("landing.finalCta.button")}
        </LandingCTA>
      </div>
    </motion.div>
  </section>
);

export const FooterSection: React.FC<FooterSectionProps> = ({ t, signupLink }) => (
  <footer className="border-t border-[hsl(0,0%,7%)] py-8 sm:py-10 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[hsl(var(--landing-neon))] flex items-center justify-center">
          <img src="/favicon.png" alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
        </div>
        <span className="font-bold text-sm text-white">Faciliten</span>
      </div>
      <nav className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm text-[hsl(0,0%,42%)]" aria-label="Footer navigation">
        <Link to="/login" className="hover:text-white transition-colors min-h-[44px] flex items-center">{t("landing.footer.login")}</Link>
        <Link to={signupLink} className="hover:text-white transition-colors min-h-[44px] flex items-center">{t("landing.footer.signup")}</Link>
        <Link to="/upgrade" className="hover:text-white transition-colors min-h-[44px] flex items-center">{t("landing.footer.plans")}</Link>
      </nav>
      <p className="text-[10px] text-[hsl(0,0%,30%)]">© {new Date().getFullYear()} Faciliten</p>
    </div>
  </footer>
);
