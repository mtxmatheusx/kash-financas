import React, { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences, LANGUAGES, type LanguageCode } from "@/contexts/PreferencesContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import {
  ArrowRight, Shield, ShieldCheck, Zap, Brain, TrendingUp,
  Crown, Check, ChevronRight, Sparkles, AudioLines, Cpu, Lock, Database,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

/* ── Referral capture hook ── */
const useReferralCapture = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) localStorage.setItem("faciliten_referral_code", ref);
  }, [searchParams]);
};

/* ── Animations ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

/* ── Particles — fewer on mobile ── */
const Particles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: i % 3 === 0 ? "hsl(160 100% 50% / 0.3)" : "hsl(217 91% 60% / 0.2)",
        }}
        animate={{ y: [0, -25, 0], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ── Grid overlay ── */
const GridOverlay: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(hsl(160 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 50%) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }}
    />
  </div>
);

/* ── WhatsApp SVG ── */
const WhatsAppIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── Compact WhatsApp Preview (mobile) ── */
const MobileWhatsAppPreview: React.FC = () => (
  <motion.div
    {...fadeUp(0.4)}
    className="mt-10 mx-auto max-w-sm rounded-2xl border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,4%)] p-4 lg:hidden"
  >
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center">
        <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-white">Faciliten Copiloto</p>
        <p className="text-[9px] text-[hsl(160,100%,50%)]">online</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-end">
        <div className="bg-[hsl(142,40%,18%)] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
          <div className="flex items-center gap-1.5 text-[11px] text-[hsl(0,0%,85%)]">
            <AudioLines className="w-3 h-3 text-[hsl(160,100%,50%)]" />
            <span>"Gastei 50 de gasolina"</span>
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-[hsl(0,0%,10%)] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
          <p className="text-[11px] text-[hsl(0,0%,85%)] leading-relaxed">
            ✅ <span className="font-semibold">R$ 50,00</span> → <span className="text-[hsl(160,100%,50%)]">Transporte</span>. 15% acima do mês passado. 📊
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── iPhone Mockup (desktop) ── */
const IPhoneMockup: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 40, rotateY: -8 }}
    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
    className="relative flex items-center justify-center"
  >
    <div className="absolute w-[320px] h-[500px] rounded-full blur-[80px] bg-[hsl(160,100%,50%)/0.08]" />
    <div className="relative w-[290px] h-[580px] rounded-[40px] border-2 border-[hsl(0,0%,15%)] bg-[hsl(0,0%,6%)] shadow-2xl shadow-[hsl(0,0%,0%)/0.6] overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[hsl(0,0%,2%)] rounded-b-2xl z-20" />
      <div className="absolute inset-[3px] rounded-[37px] overflow-hidden bg-[hsl(200,5%,8%)]">
        <div className="bg-[hsl(200,8%,12%)] px-4 pt-10 pb-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[hsl(160,100%,50%)/0.15] flex items-center justify-center">
            <span className="text-[hsl(160,100%,50%)] text-xs font-bold">F</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white">Faciliten Copiloto</p>
            <p className="text-[9px] text-[hsl(160,100%,50%)]">online</p>
          </div>
        </div>
        <div className="p-3 space-y-2.5 mt-2">
          <div className="flex justify-end">
            <div className="bg-[hsl(142,40%,18%)] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
              <div className="flex items-center gap-2 text-[11px] text-[hsl(0,0%,85%)]">
                <AudioLines className="w-3.5 h-3.5 text-[hsl(160,100%,50%)]" />
                <span>"Gastei 50 de gasolina"</span>
              </div>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:32</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-[hsl(0,0%,12%)] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
              <p className="text-[11px] text-[hsl(0,0%,85%)] leading-relaxed">
                ✅ <span className="font-semibold">R$ 50,00</span> → <span className="text-[hsl(160,100%,50%)]">Transporte</span><br />
                Gasto 15% acima do mês passado. 📊
              </p>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:32</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[hsl(142,40%,18%)] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
              <p className="text-[11px] text-[hsl(0,0%,85%)]">Onde posso cortar?</p>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:33</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-[hsl(0,0%,12%)] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
              <p className="text-[11px] text-[hsl(0,0%,85%)] leading-relaxed">
                💡 Delivery: R$ 380 (+40%). Cozinhar 3x/semana economiza ~R$ 250/mês.
              </p>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:33</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Steps and trust badges are now inside the component for i18n ── */

/* ═══════════════════════════════════════════════════════ */
const Landing: React.FC = () => {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = usePreferences();
  useReferralCapture();

  const steps = [
    { num: "01", icon: WhatsAppIcon, isCustomIcon: true, title: t("landing.steps.1.title"), desc: t("landing.steps.1.desc"), accent: "hsl(160 100% 50%)" },
    { num: "02", icon: Cpu, isCustomIcon: false, title: t("landing.steps.2.title"), desc: t("landing.steps.2.desc"), accent: "hsl(217 91% 60%)" },
    { num: "03", icon: TrendingUp, isCustomIcon: false, title: t("landing.steps.3.title"), desc: t("landing.steps.3.desc"), accent: "hsl(348 100% 64%)" },
  ];

  const trustBadges = [
    { icon: Lock, label: t("landing.trust.encryption") },
    { icon: Brain, label: t("landing.trust.ai") },
    { icon: Database, label: t("landing.trust.cloud") },
    { icon: WhatsAppIcon, label: t("landing.trust.api"), isCustom: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,2%)]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(160,100%,50%)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const signupLink = "/signup" + (localStorage.getItem("faciliten_referral_code") ? `?ref=${localStorage.getItem("faciliten_referral_code")}` : "");

  return (
    <div className="landing-dark noise-texture min-h-screen overflow-x-hidden font-['DM_Sans']">

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-[hsl(0,0%,2%)/0.85] border-b border-[hsl(0,0%,12%)/0.4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 relative z-10">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[hsl(160,100%,50%)] flex items-center justify-center shadow-lg shadow-[hsl(160,100%,50%)/0.3]">
              <img src="/favicon.png" alt="Faciliten" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
            </div>
            <span className="font-bold tracking-tight text-white text-base sm:text-lg">Faciliten</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
              <SelectTrigger className="h-8 w-auto min-w-0 gap-1 border-[hsl(0,0%,15%)] bg-transparent text-[hsl(0,0%,60%)] hover:text-white text-xs px-2 [&>svg]:w-3 [&>svg]:h-3">
                <SelectValue>
                  {LANGUAGES.find(l => l.code === language)?.flag}
                </SelectValue>
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
              <Button variant="ghost" size="sm" className="text-[hsl(0,0%,60%)] hover:text-white hover:bg-[hsl(0,0%,10%)] text-xs sm:text-sm px-2 sm:px-3">
                {t("landing.nav.login")}
              </Button>
            </Link>
            <Link to={signupLink}>
              <Button size="sm" className="bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white cta-glow border-0 font-semibold text-xs sm:text-sm px-3 sm:px-4">
                <span className="hidden sm:inline">{t("landing.nav.cta")}</span>
                <span className="sm:hidden">{t("landing.nav.ctaMobile")}</span>
                <ArrowRight className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-24 px-4 sm:px-6 min-h-[auto] sm:min-h-[92vh] flex items-center">
        <GridOverlay />
        <Particles />

        {/* Orbs — smaller on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 left-1/4 w-[300px] sm:w-[700px] h-[250px] sm:h-[600px] rounded-full blur-[80px] sm:blur-[120px]"
            style={{ background: "radial-gradient(circle, hsl(160 100% 50% / 0.07), transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          {/* Left — Copy */}
          <div className="text-center lg:text-left">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(160,100%,50%)/0.2] bg-[hsl(160,100%,50%)/0.05] backdrop-blur-sm text-[11px] font-semibold text-[hsl(160,100%,50%)] mb-5 sm:mb-6 neon-box-glow">
                <WhatsAppIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {t("landing.hero.badge")}
                <ChevronRight className="h-3 w-3" />
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp(0.1)}
              className="text-[2rem] leading-[1.1] sm:text-5xl xl:text-6xl font-extrabold tracking-tight sm:leading-[1.05] mb-4 sm:mb-5"
            >
              <span className="text-white">{t("landing.hero.title1")}</span>
              <br />
              <span className="text-white">{t("landing.hero.title2")}</span>
              <span className="neon-glow text-[hsl(160,100%,50%)]">{t("landing.hero.title3")}</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="text-sm sm:text-lg text-[hsl(0,0%,50%)] max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed"
            >
              {t("landing.hero.subtitle")}{" "}
              <span className="text-[hsl(160,100%,50%)] font-semibold">{t("landing.hero.subtitleHighlight")}</span>.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="space-y-3">
              <Link to={signupLink}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow font-bold w-full sm:w-auto">
                    <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {t("landing.hero.cta")}
                  </Button>
                </motion.div>
              </Link>
              <p className="text-[11px] text-[hsl(0,0%,35%)]">
                {t("landing.hero.ctaNote")}
              </p>
            </motion.div>

            {/* Mobile WhatsApp preview */}
            <MobileWhatsAppPreview />
          </div>

          {/* Right — Desktop iPhone Mockup */}
          <div className="hidden lg:flex justify-center">
            <IPhoneMockup />
          </div>
        </div>
      </section>

      {/* ═══ TRUST BANNER ═══ */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p {...fadeUp()} className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[hsl(0,0%,35%)] font-medium mb-5 sm:mb-6">
            {t("landing.trust.subtitle")}
          </motion.p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                {...fadeUp(i * 0.06)}
                className="flex items-center gap-2 opacity-40"
              >
                {badge.isCustom ? (
                  <WhatsAppIcon className="w-4 h-4 text-[hsl(0,0%,45%)]" />
                ) : (
                  <badge.icon className="w-4 h-4 text-[hsl(0,0%,45%)]" />
                )}
                <span className="text-[10px] sm:text-[11px] text-[hsl(0,0%,45%)] font-medium whitespace-nowrap">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 STEPS ═══ */}
      <section id="como-funciona" className="py-14 sm:py-28 px-4 sm:px-6 relative">
        <Particles />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-10 sm:mb-20">
            <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[hsl(160,100%,50%)] mb-3 sm:mb-4">
              {t("landing.steps.label")}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              {t("landing.steps.title")}
            </h2>
          </motion.div>

          <div className="space-y-3 sm:space-y-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUp(i * 0.1)}
                className="group relative flex items-start gap-4 sm:gap-6 rounded-xl sm:rounded-2xl border border-[hsl(0,0%,10%)] bg-[hsl(0,0%,3%)] p-4 sm:p-7 active:scale-[0.99] sm:hover:border-[hsl(160,100%,50%)/0.15] transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block"
                  style={{ background: `linear-gradient(180deg, transparent, ${step.accent}, transparent)` }}
                />

                <div
                  className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${step.accent}12` }}
                >
                  {step.isCustomIcon ? (
                    <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: step.accent } as React.CSSProperties} />
                  ) : (
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: step.accent }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
                    <span className="text-[9px] sm:text-[10px] font-mono-fin font-bold text-[hsl(0,0%,22%)] tracking-widest">{step.num}</span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">{step.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[hsl(0,0%,48%)] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GARANTIA DE ESFORÇO ZERO ═══ */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 relative bg-[hsl(0,0%,7%)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0,0%,2%)] via-[hsl(0,0%,7%)] to-[hsl(0,0%,2%)] pointer-events-none" />
        <motion.div
          {...fadeUp()}
          className="max-w-3xl mx-auto relative z-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[hsl(348,100%,64%)/0.08] border border-[hsl(348,100%,64%)/0.15] mb-5 sm:mb-6">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[hsl(348,100%,64%)]" />
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 sm:mb-5 leading-[1.15]">
            {t("landing.guarantee.title")}
          </h2>

          <p className="text-sm sm:text-base text-[hsl(0,0%,50%)] leading-relaxed max-w-2xl mx-auto mb-6">
            {t("landing.guarantee.text1")}{" "}
            <span className="text-white font-semibold">{t("landing.guarantee.highlight")}</span>
            {t("landing.guarantee.text2")}{" "}
            <span className="text-[hsl(348,100%,64%)] font-semibold">{t("landing.guarantee.noQuestions")}</span>
          </p>

          <div className="flex items-center justify-center gap-6 sm:gap-8 text-[hsl(0,0%,40%)]">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              <Lock className="w-3.5 h-3.5 text-[hsl(348,100%,64%)/0.7]" />
              <span>{t("landing.guarantee.instantCancel")}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[hsl(348,100%,64%)/0.7]" />
              <span>{t("landing.guarantee.noCommitment")}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ O JEITO VELHO vs O JEITO FACILITEN ═══ */}
      <section className="py-14 sm:py-28 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              {t("landing.compare.title")}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Card Esquerdo — O Jeito Velho */}
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-xl sm:rounded-2xl border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,3%)] p-5 sm:p-8"
            >
              <h3 className="text-base sm:text-lg font-extrabold text-[hsl(0,0%,55%)] mb-5 sm:mb-6">
                {t("landing.compare.oldTitle")}
              </h3>
              <ul className="space-y-3.5 sm:space-y-4">
                {[t("landing.compare.old1"), t("landing.compare.old2"), t("landing.compare.old3"), t("landing.compare.old4")].map(item => (
                  <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-[hsl(0,0%,45%)]">
                    <XIcon className="w-4 h-4 text-[hsl(348,100%,64%)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
                  <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-[hsl(0,0%,45%)]">
                    <XIcon className="w-4 h-4 text-[hsl(348,100%,64%)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Card Direito — O Jeito Faciliten */}
            <motion.div
              {...fadeUp(0.2)}
              className="relative rounded-xl sm:rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-[hsl(160,100%,50%)/0.25] shadow-[0_0_30px_-5px_hsl(160,100%,50%,0.12)]" />
              <div className="absolute inset-px rounded-[11px] sm:rounded-[15px] bg-[hsl(0,0%,3%)]" />
              <div className="relative p-5 sm:p-8">
                <h3 className="text-base sm:text-lg font-extrabold text-[hsl(160,100%,50%)] mb-5 sm:mb-6">
                  {t("landing.compare.newTitle")}
                </h3>
                <ul className="space-y-3.5 sm:space-y-4">
                  {[t("landing.compare.new1"), t("landing.compare.new2"), t("landing.compare.new3"), t("landing.compare.new4")].map(item => (
                    <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-[hsl(0,0%,65%)]">
                      <Check className="w-4 h-4 text-[hsl(160,100%,50%)] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                    <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-[hsl(0,0%,65%)]">
                      <Check className="w-4 h-4 text-[hsl(160,100%,50%)] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-14 sm:py-28 px-4 sm:px-6 relative">
        <GridOverlay />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-6">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-3 sm:mb-4">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-[hsl(0,0%,45%)] text-sm sm:text-lg max-w-xl mx-auto mb-1.5">
              {t("landing.pricing.subtitle")} <span className="line-through text-[hsl(0,0%,30%)]">{t("landing.pricing.oldPrice")}</span>
            </p>
            <p className="text-[hsl(160,100%,50%)] font-bold text-base sm:text-lg">
              {t("landing.pricing.punchline")}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mt-8 sm:mt-14">
            {/* Free */}
            <motion.div {...fadeUp(0.1)} className="rounded-xl sm:rounded-2xl border border-[hsl(0,0%,10%)] bg-[hsl(0,0%,3%)] p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1">{t("landing.pricing.freeTitle")}</h3>
              <p className="text-xs sm:text-sm text-[hsl(0,0%,42%)] mb-4 sm:mb-5">{t("landing.pricing.freeDesc")}</p>
              <p className="text-4xl sm:text-5xl font-extrabold text-white mb-5 sm:mb-6 font-mono-fin">
                R$ 0<span className="text-xs sm:text-sm font-normal text-[hsl(0,0%,35%)]">{t("landing.pricing.freePerMonth")}</span>
              </p>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {[t("landing.pricing.free1"), t("landing.pricing.free2"), t("landing.pricing.free3")].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-[hsl(0,0%,65%)]">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(160,100%,50%)] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={signupLink}>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" className="w-full h-11 sm:h-13 text-sm sm:text-base border-[hsl(0,0%,20%)] bg-transparent hover:bg-[hsl(0,0%,8%)] text-[hsl(0,0%,60%)] font-bold">
                    {t("landing.pricing.freeCta")}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Premium — glow border + neon CTA */}
            <motion.div {...fadeUp(0.2)} className="relative rounded-xl sm:rounded-2xl overflow-hidden">
              {/* Glow border */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[hsl(217,91%,60%)/0.35] via-[hsl(160,100%,50%)/0.15] to-[hsl(217,91%,60%)/0.25] shadow-[0_0_40px_-5px_hsl(217,91%,60%,0.2),0_0_80px_-10px_hsl(160,100%,50%,0.1)]" />
              <div className="absolute inset-px rounded-[11px] sm:rounded-[15px] bg-[hsl(0,0%,3%)]" />

              <div className="absolute -top-px right-5 sm:right-6 bg-[hsl(160,100%,50%)] text-[hsl(0,0%,2%)] text-[9px] sm:text-[10px] font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-b-lg shadow-lg shadow-[hsl(160,100%,50%)/0.3] z-10 uppercase tracking-[0.15em]">
                {t("landing.pricing.premiumBadge")}
              </div>

              <div className="relative p-5 sm:p-8">
                <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1 flex items-center gap-2">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(45,100%,60%)]" /> {t("landing.pricing.premiumTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-[hsl(0,0%,42%)] mb-4 sm:mb-5">{t("landing.pricing.premiumDesc")}</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-white mb-5 sm:mb-6 font-mono-fin">
                  R$ 29<span className="text-base sm:text-lg">,90</span>
                  <span className="text-xs sm:text-sm font-normal text-[hsl(0,0%,35%)]">/mês</span>
                </p>
                <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                  {[t("landing.pricing.premium1"), t("landing.pricing.premium2"), t("landing.pricing.premium3"), t("landing.pricing.premium4"), t("landing.pricing.premium5")].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-[hsl(0,0%,65%)]">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(160,100%,50%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                    <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-[hsl(0,0%,65%)]">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(160,100%,50%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={signupLink}>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button className="w-full h-12 sm:h-14 text-sm sm:text-base bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 font-bold shadow-[0_0_24px_-4px_hsl(348,100%,64%,0.5)] hover:shadow-[0_0_32px_-4px_hsl(348,100%,64%,0.7)] transition-shadow">
                      <Sparkles className="mr-2 h-4 w-4" /> Liberar Meu Assistente Agora
                    </Button>
                  </motion.div>
                </Link>
                <p className="text-center text-[11px] text-[hsl(0,0%,40%)] mt-3">
                  30 dias grátis · Cancele com 1 clique. Sem burocracia.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ MATA-OBJEÇÕES ═══ */}
      <section className="py-14 sm:py-28 px-4 sm:px-6 relative">
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-10 sm:mb-14">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[hsl(0,0%,35%)] font-medium mb-4">
              Quebra de objeções
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ainda tem dúvidas?<br className="hidden sm:block" /> Nós destruímos cada uma.
            </h2>
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "Meus dados financeiros estão seguros?",
                  a: "Absolutamente. Utilizamos a mesma infraestrutura de criptografia de nível bancário que grandes corporações. Seus dados são seus e ninguém mais tem acesso.",
                },
                {
                  q: "A IA pode errar os meus lançamentos?",
                  a: "A nossa IA atua como um extrator cirúrgico. Ela lê o seu áudio, categoriza e pede a sua confirmação no WhatsApp se houver alguma dúvida. Você tem sempre o controle final.",
                },
                {
                  q: "Preciso entender de contabilidade para usar?",
                  a: "Zero. O Faciliten foi criado justamente para quem odeia planilhas. Você só precisa saber falar ou digitar no WhatsApp.",
                },
                {
                  q: "Posso cancelar se não gostar?",
                  a: "Com um único clique, direto no seu painel. Sem ter que ligar para ninguém ou justificar. Risco zero para você.",
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-[hsl(0,0%,12%)] rounded-xl bg-[hsl(0,0%,4%,0.5)] px-5 sm:px-6 data-[state=open]:border-[hsl(348,100%,64%,0.2)]"
                >
                  <AccordionTrigger className="text-sm sm:text-base font-medium text-white hover:no-underline py-4 sm:py-5 [&[data-state=open]>svg]:text-[hsl(348,100%,64%)]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-[hsl(0,0%,45%)] leading-relaxed pb-4 sm:pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-14 sm:py-28 px-4 sm:px-6">
        <motion.div
          {...fadeUp()}
          className="max-w-3xl mx-auto text-center rounded-2xl sm:rounded-3xl p-8 sm:p-16 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, hsl(160 100% 50% / 0.1), hsl(217 91% 60% / 0.06), hsl(160 100% 50% / 0.1))", backgroundSize: "200% 200%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[hsl(0,0%,2%)/0.7] backdrop-blur-xl" />
          <div className="absolute inset-px rounded-[15px] sm:rounded-[23px] border border-[hsl(160,100%,50%)/0.08]" />

          <div className="relative z-10">
            <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(160,100%,50%)] mx-auto mb-5 sm:mb-6" />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Seu Copiloto Está Esperando
            </h2>
            <p className="text-[hsl(0,0%,48%)] text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
              Ative agora sem cadastrar cartão. Se você não recuperar pelo menos 10x o valor da assinatura já no primeiro mês, o teste sai de graça.
            </p>
            <Link to={signupLink}>
              <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
                <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow font-bold">
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Ativar Meu Copiloto Grátis
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[hsl(0,0%,7%)] py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[hsl(160,100%,50%)] flex items-center justify-center">
              <img src="/favicon.png" alt="Faciliten" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
            </div>
            <span className="font-bold text-sm text-white">Faciliten</span>
          </div>
          <div className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm text-[hsl(0,0%,35%)]">
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link to={signupLink} className="hover:text-white transition-colors">Criar conta</Link>
            <Link to="/upgrade" className="hover:text-white transition-colors">Planos</Link>
          </div>
          <p className="text-[10px] text-[hsl(0,0%,25%)]">
            © {new Date().getFullYear()} Faciliten
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
