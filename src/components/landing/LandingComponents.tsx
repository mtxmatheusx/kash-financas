import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "./LandingAnimations";

/* ── Reusable Section wrapper ── */
interface LandingSectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export const LandingSection: React.FC<LandingSectionProps> = ({
  id,
  children,
  className = "",
  ariaLabel,
  ariaLabelledBy,
}) => (
  <section
    id={id}
    className={`py-14 sm:py-28 px-4 sm:px-6 relative ${className}`}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
  >
    {children}
  </section>
);

/* ── Reusable Section Heading ── */
interface SectionHeadingProps {
  id?: string;
  label?: string;
  title: string;
  titleBreak?: string;
  subtitle?: string;
  delay?: number;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  id,
  label,
  title,
  titleBreak,
  subtitle,
  delay = 0,
}) => (
  <motion.div {...fadeUp(delay)} className="text-center mb-10 sm:mb-16">
    {label && (
      <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[hsl(var(--landing-neon))] mb-3 sm:mb-4">
        {label}
      </span>
    )}
    <h2
      id={id}
      className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
    >
      {title}
      {titleBreak && (
        <>
          <br className="hidden sm:block" /> {titleBreak}
        </>
      )}
    </h2>
    {subtitle && (
      <p className="text-[hsl(0,0%,58%)] text-sm sm:text-lg max-w-xl mx-auto mt-3 sm:mt-4">
        {subtitle}
      </p>
    )}
  </motion.div>
);

/* ── Reusable CTA Button ── */
interface LandingCTAProps {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "neon" | "outline";
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({
  to,
  children,
  variant = "primary",
  icon = <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />,
  className = "",
  fullWidth = false,
}) => {
  const variantStyles = {
    primary:
      "bg-[hsl(var(--landing-cta))] hover:bg-[hsl(var(--landing-cta)/0.85)] text-white border-0 cta-glow font-bold",
    neon:
      "bg-[hsl(var(--landing-neon))] hover:bg-[hsl(var(--landing-neon)/0.85)] text-[hsl(0,0%,2%)] font-bold border-0 shadow-lg shadow-[hsl(var(--landing-neon)/0.25)]",
    outline:
      "border-[hsl(0,0%,18%)] bg-transparent hover:bg-[hsl(0,0%,8%)] text-[hsl(0,0%,75%)] font-bold",
  };

  return (
    <Link to={to} className={fullWidth ? "block" : "inline-block"}>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
        <Button
          size="lg"
          variant={variant === "outline" ? "outline" : "default"}
          className={`text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14 ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        >
          {icon}
          {children}
        </Button>
      </motion.div>
    </Link>
  );
};
