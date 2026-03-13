import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, type LanguageCode } from "@/contexts/PreferencesContext";

interface LandingNavProps {
  t: (k: any) => string;
  language: string;
  setLanguage: (lang: LanguageCode) => void;
  signupLink: string;
}

const NAV_ANCHORS = [
  { key: "landing.nav.howItWorks", href: "#como-funciona" },
  { key: "landing.nav.pricing", href: "#precos" },
  { key: "landing.nav.faq", href: "#faq" },
];

export const LandingNav: React.FC<LandingNavProps> = ({ t, language, setLanguage, signupLink }) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["como-funciona", "precos", "faq"];
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) current = `#${id}`;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-[hsl(var(--landing-bg)/0.85)] border-b border-[hsl(var(--landing-border)/0.4)]" aria-label="Main navigation">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded">
        Skip to content
      </a>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 relative z-10" aria-label="Faciliten - Home">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[hsl(var(--landing-neon))] flex items-center justify-center shadow-lg shadow-[hsl(var(--landing-neon)/0.3)]">
            <img src="/favicon.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          </div>
          <span className="font-bold tracking-tight text-white text-base sm:text-lg">Faciliten</span>
        </Link>

        {/* Anchor links — hidden on small mobile */}
        <div className="hidden md:flex items-center gap-1 relative z-10">
          {NAV_ANCHORS.map(({ key, href }) => (
            <button
              key={href}
              onClick={() => scrollTo(href)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] flex items-center ${
                activeSection === href
                  ? "text-[hsl(var(--landing-neon))] bg-[hsl(var(--landing-neon)/0.08)]"
                  : "text-[hsl(0,0%,58%)] hover:text-white hover:bg-[hsl(0,0%,8%)]"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
            <SelectTrigger className="h-8 w-auto min-w-0 gap-1 border-[hsl(0,0%,15%)] bg-transparent text-[hsl(0,0%,60%)] hover:text-white text-xs px-2 [&>svg]:w-3 [&>svg]:h-3" aria-label="Select language">
              <SelectValue>{LANGUAGES.find(l => l.code === language)?.flag}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[hsl(0,0%,8%)] border-[hsl(0,0%,15%)] text-white min-w-[140px]">
              {LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.code} className="text-xs hover:bg-[hsl(0,0%,12%)] focus:bg-[hsl(0,0%,12%)] focus:text-white">
                  {l.flag} {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-[hsl(0,0%,60%)] hover:text-white hover:bg-[hsl(0,0%,10%)] text-xs sm:text-sm px-2 sm:px-3 min-h-[44px]">
              {t("landing.nav.login")}
            </Button>
          </Link>
          <Link to={signupLink}>
            <Button size="sm" className="bg-[hsl(var(--landing-cta))] hover:bg-[hsl(var(--landing-cta)/0.85)] text-white cta-glow border-0 font-semibold text-xs sm:text-sm px-3 sm:px-4 min-h-[44px]">
              <span className="hidden sm:inline">{t("landing.nav.cta")}</span>
              <span className="sm:hidden">{t("landing.nav.ctaMobile")}</span>
              <ArrowRight className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
