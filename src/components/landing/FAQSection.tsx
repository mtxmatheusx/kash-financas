import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fadeUp } from "./LandingAnimations";
import { LandingSection, SectionHeading } from "./LandingComponents";

interface FAQSectionProps {
  t: (k: any) => string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ t }) => (
  <LandingSection id="faq" ariaLabelledBy="faq-title">
    <div className="max-w-2xl mx-auto relative z-10">
      <SectionHeading
        id="faq-title"
        label={t("landing.faq.label")}
        title={t("landing.faq.title")}
        titleBreak={t("landing.faq.title2")}
      />
      <motion.div {...fadeUp(0.1)}>
        <Accordion type="single" collapsible className="space-y-3">
          {[
            { q: t("landing.faq.q1"), a: t("landing.faq.a1") },
            { q: t("landing.faq.q2"), a: t("landing.faq.a2") },
            { q: t("landing.faq.q3"), a: t("landing.faq.a3") },
            { q: t("landing.faq.q4"), a: t("landing.faq.a4") },
          ].map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-[hsl(var(--landing-border))] rounded-xl bg-[hsl(0,0%,4%,0.5)] px-5 sm:px-6 data-[state=open]:border-[hsl(var(--landing-cta)/0.2)]">
              <AccordionTrigger className="text-sm sm:text-base font-medium text-white hover:no-underline py-4 sm:py-5 [&[data-state=open]>svg]:text-[hsl(var(--landing-cta))] min-h-[44px]">{item.q}</AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-[hsl(0,0%,52%)] leading-relaxed pb-4 sm:pb-5">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </LandingSection>
);
