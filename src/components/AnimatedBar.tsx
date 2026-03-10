import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  radius?: number | [number, number, number, number];
  index?: number;
  layout?: "horizontal" | "vertical";
}

/**
 * Custom animated bar shape for Recharts.
 * Grows from zero with per-bar stagger using framer-motion.
 */
export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "hsl(217, 91%, 60%)",
  radius,
  index = 0,
  layout = "horizontal",
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Parse border radius
  let rx = 0;
  if (Array.isArray(radius)) {
    rx = radius[0] || 0;
  } else if (typeof radius === "number") {
    rx = radius;
  }

  const isVertical = layout === "vertical";

  if (!mounted) return null;

  // For horizontal bars (vertical layout), animate width from 0
  // For vertical bars (horizontal layout), animate height from 0 (grow up)
  if (isVertical) {
    return (
      <motion.rect
        x={x}
        y={y}
        height={height}
        rx={rx}
        ry={rx}
        fill={fill}
        initial={{ width: 0 }}
        animate={{ width }}
        transition={{
          duration: 1.2,
          delay: index * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94], // ease-in-out
        }}
      />
    );
  }

  return (
    <motion.rect
      x={x}
      rx={rx}
      ry={rx}
      width={width}
      fill={fill}
      initial={{ y: y + height, height: 0 }}
      animate={{ y, height }}
      transition={{
        duration: 1.2,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  );
};

/** Factory to create shape prop for a specific layout */
export const createAnimatedBarShape = (layout: "horizontal" | "vertical" = "horizontal") => {
  return (props: any) => <AnimatedBar {...props} layout={layout} />;
};
