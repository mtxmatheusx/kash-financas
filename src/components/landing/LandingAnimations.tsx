import React from "react";
import { motion } from "framer-motion";

/* ── Fade-up animation preset ── */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

/* ── Particles ── */
export const Particles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: i % 3 === 0 ? "hsl(var(--landing-neon) / 0.3)" : "hsl(var(--primary) / 0.2)",
        }}
        animate={{ y: [0, -25, 0], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ── Grid overlay ── */
export const GridOverlay: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(hsl(var(--landing-neon)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--landing-neon)) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }}
    />
  </div>
);
