import React from "react";
import { motion } from "framer-motion";
import { Lock, Brain, Database, Crown, ShieldCheck, Cpu, TrendingUp, Check, X as XIcon } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppMockup";
import { Particles, fadeUp } from "./LandingAnimations";
import { LandingSection, SectionHeading, LandingCTA } from "./LandingComponents";

interface FeaturesSectionProps {
  t: (k: any) => string;
  signupLink: string;
}

export const TrustBanner: React.FC<{ t: (k: any) => string }> = ({ t }) => {
  const trustBadges = [
    { icon: Lock, label: t("landing.trust.encryption") },
    { icon: Brain, label: t("landing.trust.ai") },
    { icon: Database, label: t("landing.trust.cloud") },
    { icon: WhatsAppIcon, label: t("landing.trust.api"), isCustom: true },
  ];

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 relative" aria-label="Trust badges">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p {...fadeUp()} className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[hsl(0,0%,42%)] font-medium mb-5 sm:mb-6">
          {t("landing.trust.subtitle")}
        </motion.p>
        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              {...fadeUp(i * 0.06)}
              className="flex items-center gap-2 opacity-50 min-h-[44px] min-w-[44px] px-2"
            >
              {badge.isCustom ? (
                <WhatsAppIcon className="w-4 h-4 text-[hsl(0,0%,52%)]" />
              ) : (
                <badge.icon className="w-4 h-4 text-[hsl(0,0%,52%)]" aria-hidden="true" />
              )}
              <span className="text-[10px] sm:text-[11px] text-[hsl(0,0%,52%)] font-medium whitespace-nowrap">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const UpgradeBanner: React.FC<FeaturesSectionProps> = ({ t, signupLink }) => (
  <section className="py-10 sm:py-16 px-4 sm:px-6" aria-label="Upgrade banner">
    <motion.div
      {...fadeUp()}
      className="max-w-5xl mx-auto rounded-3xl border border-[hsl(var(--landing-neon)/0.2)] bg-gradient-to-br from-[hsl(var(--landing-neon)/0.08)] via-[hsl(var(--primary)/0.05)] to-transparent p-8 sm:p-12 text-center relative overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[hsl(var(--landing-neon)/0.08)] rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[hsl(var(--primary)/0.08)] rounded-full blur-3xl" />
      <div className="relative z-10">
        <Crown className="w-10 h-10 sm:w-14 sm:h-14 text-[hsl(var(--landing-neon))] mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">{t("landing.upgradeBanner.title")}</h2>
        <p className="text-sm sm:text-lg text-[hsl(0,0%,58%)] max-w-xl mx-auto mb-6 leading-relaxed">{t("landing.upgradeBanner.desc")}</p>
        <LandingCTA to={signupLink} variant="neon" icon={<Crown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />}>
          {t("landing.upgradeBanner.cta")}
        </LandingCTA>
      </div>
    </motion.div>
  </section>
);

export const StepsSection: React.FC<{ t: (k: any) => string }> = ({ t }) => {
  const steps = [
    { num: "01", icon: WhatsAppIcon, isCustomIcon: true, title: t("landing.steps.1.title"), desc: t("landing.steps.1.desc"), accent: "hsl(var(--landing-neon))" },
    { num: "02", icon: Cpu, isCustomIcon: false, title: t("landing.steps.2.title"), desc: t("landing.steps.2.desc"), accent: "hsl(var(--primary))" },
    { num: "03", icon: TrendingUp, isCustomIcon: false, title: t("landing.steps.3.title"), desc: t("landing.steps.3.desc"), accent: "hsl(var(--landing-cta))" },
  ];

  return (
    <LandingSection id="como-funciona" ariaLabelledBy="steps-title">
      <Particles />
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading id="steps-title" label={t("landing.steps.label")} title={t("landing.steps.title")} />
        <div className="space-y-3 sm:space-y-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              {...fadeUp(i * 0.1)}
              className="group relative flex items-start gap-4 sm:gap-6 rounded-xl sm:rounded-2xl border border-[hsl(0,0%,10%)] bg-[hsl(0,0%,3%)] p-4 sm:p-7 active:scale-[0.99] sm:hover:border-[hsl(var(--landing-neon)/0.15)] transition-all duration-300 overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block"
                style={{ background: `linear-gradient(180deg, transparent, ${step.accent}, transparent)` }}
              />
              <div className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ backgroundColor: `${step.accent}12` }}>
                {step.isCustomIcon ? (
                  <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: step.accent } as React.CSSProperties} />
                ) : (
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: step.accent }} aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
                  <span className="text-[9px] sm:text-[10px] font-mono-fin font-bold text-[hsl(0,0%,25%)] tracking-widest">{step.num}</span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">{step.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-[hsl(0,0%,55%)] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
};

export const GuaranteeSection: React.FC<{ t: (k: any) => string }> = ({ t }) => (
  <section className="py-10 sm:py-16 px-4 sm:px-6 relative bg-[hsl(0,0%,7%)]" aria-label="Guarantee">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0,0%,2%)] via-[hsl(0,0%,7%)] to-[hsl(0,0%,2%)] pointer-events-none" />
    <motion.div {...fadeUp()} className="max-w-3xl mx-auto relative z-10 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[hsl(var(--landing-cta)/0.08)] border border-[hsl(var(--landing-cta)/0.15)] mb-5 sm:mb-6">
        <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[hsl(var(--landing-cta))]" aria-hidden="true" />
      </div>
      <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 sm:mb-5 leading-[1.15]">{t("landing.guarantee.title")}</h2>
      <p className="text-sm sm:text-base text-[hsl(0,0%,55%)] leading-relaxed max-w-2xl mx-auto mb-6">
        {t("landing.guarantee.text1")}{" "}
        <span className="text-white font-semibold">{t("landing.guarantee.highlight")}</span>
        {t("landing.guarantee.text2")}{" "}
        <span className="text-[hsl(var(--landing-cta))] font-semibold">{t("landing.guarantee.noQuestions")}</span>
      </p>
      <div className="flex items-center justify-center gap-6 sm:gap-8 text-[hsl(0,0%,48%)]">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs min-h-[44px]">
          <Lock className="w-3.5 h-3.5 text-[hsl(var(--landing-cta)/0.7)]" aria-hidden="true" />
          <span>{t("landing.guarantee.instantCancel")}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs min-h-[44px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--landing-cta)/0.7)]" aria-hidden="true" />
          <span>{t("landing.guarantee.noCommitment")}</span>
        </div>
      </div>
    </motion.div>
  </section>
);

export const CompareSection: React.FC<{ t: (k: any) => string }> = ({ t }) => (
  <LandingSection ariaLabelledBy="compare-title">
    <div className="max-w-5xl mx-auto relative z-10">
      <SectionHeading id="compare-title" title={t("landing.compare.title")} />
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <motion.div {...fadeUp(0.1)} className="rounded-xl sm:rounded-2xl border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,3%)] p-5 sm:p-8">
          <h3 className="text-base sm:text-lg font-extrabold text-[hsl(0,0%,58%)] mb-5 sm:mb-6">{t("landing.compare.oldTitle")}</h3>
          <ul className="space-y-3.5 sm:space-y-4">
            {[t("landing.compare.old1"), t("landing.compare.old2"), t("landing.compare.old3"), t("landing.compare.old4")].map(item => (
              <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-[hsl(0,0%,52%)]">
                <XIcon className="w-4 h-4 text-[hsl(var(--landing-cta))] shrink-0 mt-0.5" aria-hidden="true" />{item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...fadeUp(0.2)} className="relative rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-[hsl(var(--landing-neon)/0.25)] shadow-[0_0_30px_-5px_hsl(var(--landing-neon)/0.12)]" />
          <div className="absolute inset-px rounded-[11px] sm:rounded-[15px] bg-[hsl(0,0%,3%)]" />
          <div className="relative p-5 sm:p-8">
            <h3 className="text-base sm:text-lg font-extrabold text-[hsl(var(--landing-neon))] mb-5 sm:mb-6">{t("landing.compare.newTitle")}</h3>
            <ul className="space-y-3.5 sm:space-y-4">
              {[t("landing.compare.new1"), t("landing.compare.new2"), t("landing.compare.new3"), t("landing.compare.new4")].map(item => (
                <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-[hsl(0,0%,68%)]">
                  <Check className="w-4 h-4 text-[hsl(var(--landing-neon))] shrink-0 mt-0.5" aria-hidden="true" />{item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  </LandingSection>
);
