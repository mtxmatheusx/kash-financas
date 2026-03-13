import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fadeUp } from "./LandingAnimations";

interface FAQSectionProps {
  t: (k: any) => string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ t }) => (
  <section className="py-14 sm:py-28 px-4 sm:px-6 relative" aria-labelledby="faq-title">
    <div className="max-w-2xl mx-auto relative z-10">
      <motion.div {...fadeUp()} className="text-center mb-10 sm:mb-14">
        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[hsl(0,0%,35%)] font-medium mb-4">{t("landing.faq.label")}</p>
        <h2 id="faq-title" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          {t("landing.faq.title")}<br className="hidden sm:block" /> {t("landing.faq.title2")}
        </h2>
      </motion.div>
      <motion.div {...fadeUp(0.1)}>
        <Accordion type="single" collapsible className="space-y-3">
          {[
            { q: t("landing.faq.q1"), a: t("landing.faq.a1") },
            { q: t("landing.faq.q2"), a: t("landing.faq.a2") },
            { q: t("landing.faq.q3"), a: t("landing.faq.a3") },
            { q: t("landing.faq.q4"), a: t("landing.faq.a4") },
          ].map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-[hsl(var(--landing-border))] rounded-xl bg-[hsl(0,0%,4%,0.5)] px-5 sm:px-6 data-[state=open]:border-[hsl(var(--landing-cta)/0.2)]">
              <AccordionTrigger className="text-sm sm:text-base font-medium text-white hover:no-underline py-4 sm:py-5 [&[data-state=open]>svg]:text-[hsl(var(--landing-cta))]">{item.q}</AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-[hsl(0,0%,45%)] leading-relaxed pb-4 sm:pb-5">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);
