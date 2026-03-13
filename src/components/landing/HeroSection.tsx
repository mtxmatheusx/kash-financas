import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { GridOverlay, Particles, fadeUp } from "./LandingAnimations";
import { LandingCTA } from "./LandingComponents";
import { WhatsAppIcon, MobileWhatsAppPreview, IPhoneMockup } from "./WhatsAppMockup";

interface HeroSectionProps {
  t: (k: any) => string;
  signupLink: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ t, signupLink }) => (
  <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-24 px-4 sm:px-6 min-h-[auto] sm:min-h-[92vh] flex items-center">
    <GridOverlay />
    <Particles />

    {/* Orbs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-10 left-1/4 w-[300px] sm:w-[700px] h-[250px] sm:h-[600px] rounded-full blur-[80px] sm:blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(var(--landing-neon) / 0.07), transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>

    <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
      {/* Left — Copy */}
      <div className="text-center lg:text-left">
        <motion.div {...fadeUp(0)}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--landing-neon)/0.2)] bg-[hsl(var(--landing-neon)/0.05)] backdrop-blur-sm text-[11px] font-semibold text-[hsl(var(--landing-neon))] mb-5 sm:mb-6 neon-box-glow min-h-[44px]">
            <WhatsAppIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {t("landing.hero.badge")}
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </div>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-[2rem] leading-[1.1] sm:text-5xl xl:text-6xl font-extrabold tracking-tight sm:leading-[1.05] mb-4 sm:mb-5"
        >
          <span className="text-white">{t("landing.hero.title1")}</span>
          <br />
          <span className="text-white">{t("landing.hero.title2")}</span>
          <span className="neon-glow text-[hsl(var(--landing-neon))]">{t("landing.hero.title3")}</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="text-sm sm:text-lg text-[hsl(0,0%,55%)] max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed"
        >
          {t("landing.hero.subtitle")}{" "}
          <span className="text-[hsl(var(--landing-neon))] font-semibold">{t("landing.hero.subtitleHighlight")}</span>.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="space-y-3">
          <LandingCTA to={signupLink} className="w-full sm:w-auto">
            {t("landing.hero.cta")}
          </LandingCTA>
          <p className="text-[11px] text-[hsl(0,0%,42%)]">{t("landing.hero.ctaNote")}</p>
        </motion.div>

        <motion.div {...fadeUp(0.4)} className="flex items-center gap-2 mt-4 justify-center lg:justify-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-400">{t("landing.trust.encryption")}</span>
          </div>
          <span className="text-[10px] text-[hsl(0,0%,40%)]">·</span>
          <span className="text-[10px] text-[hsl(0,0%,40%)]">{t("landing.encryption.notice")}</span>
        </motion.div>

        <MobileWhatsAppPreview t={t} />
      </div>

      {/* Right — Desktop iPhone */}
      <div className="hidden lg:flex justify-center">
        <IPhoneMockup t={t} />
      </div>
    </div>
  </section>
);
