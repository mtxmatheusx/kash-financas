import React from "react";
import { motion } from "framer-motion";
import { Crown, Check, Sparkles } from "lucide-react";
import { GridOverlay, fadeUp } from "./LandingAnimations";
import { LandingSection, SectionHeading, LandingCTA } from "./LandingComponents";

interface PricingSectionProps {
  t: (k: any) => string;
  signupLink: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ t, signupLink }) => (
  <LandingSection id="precos" ariaLabelledBy="pricing-title">
    <GridOverlay />
    <div className="max-w-3xl mx-auto relative z-10">
      <SectionHeading
        id="pricing-title"
        title={t("landing.pricing.title")}
        subtitle={`${t("landing.pricing.subtitle")} `}
      />
      <div className="text-center -mt-8 sm:-mt-10 mb-8 sm:mb-14">
        <p className="text-[hsl(0,0%,45%)] text-sm sm:text-lg">
          <span className="line-through text-[hsl(0,0%,32%)]">{t("landing.pricing.oldPrice")}</span>
        </p>
        <p className="text-[hsl(var(--landing-neon))] font-bold text-base sm:text-lg">{t("landing.pricing.punchline")}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* Free plan */}
        <motion.div {...fadeUp(0.1)} className="h-full rounded-xl sm:rounded-2xl border border-[hsl(0,0%,16%)] bg-[hsl(0,0%,5%)] p-5 sm:p-8 flex flex-col">
          <h3 className="text-lg sm:text-xl font-extrabold text-[hsl(0,0%,90%)] mb-1">{t("landing.pricing.freeTitle")}</h3>
          <p className="text-xs sm:text-sm text-[hsl(0,0%,52%)] mb-4 sm:mb-5">{t("landing.pricing.freeDesc")}</p>
          <p className="mb-5 sm:mb-6 font-mono-fin flex items-baseline gap-1">
            <span className="text-xl text-[hsl(0,0%,48%)] font-bold">{t("pricing.currencySymbol")}</span>
            <span className="text-5xl sm:text-6xl font-black text-[hsl(0,0%,90%)]">0</span>
            <span className="text-xs sm:text-sm font-normal text-[hsl(0,0%,52%)]">{t("landing.pricing.freePerMonth")}</span>
          </p>
          <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 flex-1">
            {[t("landing.pricing.free1"), t("landing.pricing.free2"), t("landing.pricing.free3")].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-[hsl(0,0%,52%)]">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(0,0%,48%)] shrink-0" aria-hidden="true" />{f}
              </li>
            ))}
          </ul>
          <LandingCTA to={signupLink} variant="outline" icon={null} fullWidth>
            {t("landing.pricing.freeCta")}
          </LandingCTA>
        </motion.div>

        {/* Premium plan */}
        <motion.div {...fadeUp(0.2)} className="relative h-full rounded-xl sm:rounded-2xl border border-[hsl(var(--landing-cta)/0.3)] bg-[hsl(0,0%,5%)] md:scale-105 origin-center overflow-visible shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-[hsl(0,0%,3%)] border border-[hsl(var(--landing-cta)/0.5)] text-[hsl(var(--landing-cta))] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {t("landing.pricing.premiumBadge")}
          </div>
          <div className="p-5 sm:p-8 flex flex-col flex-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1 flex items-center gap-2">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(45,100%,60%)]" aria-hidden="true" /> {t("landing.pricing.premiumTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-[hsl(0,0%,52%)] mb-4 sm:mb-5">{t("landing.pricing.premiumDesc")}</p>
            <p className="mb-5 sm:mb-6 font-mono-fin flex items-baseline gap-0.5">
              <span className="text-xl text-[hsl(0,0%,48%)] font-bold">{t("pricing.currencySymbol")}</span>
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">{t("pricing.premiumPrice")}</span>
              <span className="text-lg sm:text-xl text-[hsl(0,0%,48%)] font-bold">{t("pricing.premiumCents")}</span>
              <span className="text-xs sm:text-sm font-normal text-[hsl(0,0%,52%)] ml-1">{t("landing.pricing.freePerMonth")}</span>
            </p>
            <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 flex-1">
              {[t("landing.pricing.premium1"), t("landing.pricing.premium2"), t("landing.pricing.premium3"), t("landing.pricing.premium4"), t("landing.pricing.premium5")].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-[hsl(0,0%,75%)]">
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(var(--landing-neon))] shrink-0" aria-hidden="true" />{f}
                </li>
              ))}
            </ul>
            <LandingCTA
              to={signupLink}
              variant="primary"
              icon={<Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />}
              fullWidth
              className="shadow-[0_0_24px_-4px_hsl(var(--landing-cta)/0.5)] hover:shadow-[0_0_32px_-4px_hsl(var(--landing-cta)/0.7)]"
            >
              {t("landing.pricing.premiumCta")}
            </LandingCTA>
            <p className="text-center text-[11px] text-[hsl(0,0%,52%)] mt-3">{t("landing.pricing.premiumNote")}</p>
          </div>
        </motion.div>
      </div>
    </div>
  </LandingSection>
);
