import React, { useEffect, useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences, type LanguageCode } from "@/contexts/PreferencesContext";
import { useSEO } from "@/hooks/useSEO";

import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBanner, UpgradeBanner, StepsSection, GuaranteeSection, CompareSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA, FooterSection } from "@/components/landing/FooterSection";

/* ── Referral capture hook ── */
const useReferralCapture = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) localStorage.setItem("faciliten_referral_code", ref);
  }, [searchParams]);
};

const Landing: React.FC = () => {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = usePreferences();
  useReferralCapture();

  const jsonLd = useMemo(() => [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Faciliten",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: "https://kash-financas.lovable.app",
      description: t("seo.landing.description"),
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "BRL", description: "Free" },
        { "@type": "Offer", price: "29.90", priceCurrency: "BRL", description: "Premium" },
      ],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "150" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Faciliten",
      url: "https://kash-financas.lovable.app",
      logo: "https://kash-financas.lovable.app/favicon.png",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: t("landing.faq.q1"), acceptedAnswer: { "@type": "Answer", text: t("landing.faq.a1") } },
        { "@type": "Question", name: t("landing.faq.q2"), acceptedAnswer: { "@type": "Answer", text: t("landing.faq.a2") } },
        { "@type": "Question", name: t("landing.faq.q3"), acceptedAnswer: { "@type": "Answer", text: t("landing.faq.a3") } },
        { "@type": "Question", name: t("landing.faq.q4"), acceptedAnswer: { "@type": "Answer", text: t("landing.faq.a4") } },
      ],
    },
  ], [t]);

  useSEO({
    title: t("seo.landing.title"),
    description: t("seo.landing.description"),
    canonical: "https://kash-financas.lovable.app/",
    ogImage: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d5283518-bfd0-443c-b909-70781903c305/id-preview-cd6e8791--9ea12495-5229-4c46-84bf-dc9a54baa27d.lovable.app-1773175074000.png",
    jsonLd,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--landing-bg))]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--landing-neon))] border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const signupLink = "/signup" + (localStorage.getItem("faciliten_referral_code") ? `?ref=${localStorage.getItem("faciliten_referral_code")}` : "");

  return (
    <main id="main-content" className="landing-dark noise-texture min-h-screen overflow-x-hidden font-['DM_Sans']">
      <LandingNav t={t} language={language} setLanguage={setLanguage as (lang: LanguageCode) => void} signupLink={signupLink} />
      <HeroSection t={t} signupLink={signupLink} />
      <TrustBanner t={t} />
      <UpgradeBanner t={t} signupLink={signupLink} />
      <StepsSection t={t} />
      <GuaranteeSection t={t} />
      <CompareSection t={t} />
      <PricingSection t={t} signupLink={signupLink} />
      <FAQSection t={t} />
      <FinalCTA t={t} signupLink={signupLink} />
      <FooterSection t={t} signupLink={signupLink} />
    </main>
  );
};

export default Landing;
