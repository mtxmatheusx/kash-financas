"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrbProps {
  dimension?: string
  className?: string
  tones?: {
    base?: string
    accent1?: string
    accent2?: string
    accent3?: string
  }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const fallbackTones = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }

  const palette = { ...fallbackTones, ...tones }

  const dimValue = parseInt(dimension.replace("px", ""), 10)

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)

  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)

  const maskRadius =
    dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

  return (
    <div
      className={cx("color-orb", className)}
      style={
        {
          width: dimension,
          height: dimension,
          "--base": palette.base,
          "--accent1": palette.accent1,
          "--accent2": palette.accent2,
          "--accent3": palette.accent3,
          "--blur": `${blurStrength}px`,
          "--contrast": adjustedContrast,
          "--dot": `${pixelDot}px`,
          "--shadow": `${shadowRange}px`,
          "--mask": maskRadius,
          "--spin-duration": `${spinDuration}s`,
        } as React.CSSProperties
      }
    >
      <style>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

const SPEED_FACTOR = 1

interface ContextShape {
  showForm: boolean
  successFlag: boolean
  triggerOpen: () => void
  triggerClose: () => void
}

const FormContext = React.createContext<ContextShape>({} as ContextShape)
const useFormContext = () => React.useContext(FormContext)

interface MorphPanelProps {
  onSubmit?: (value: string) => void
  placeholder?: string
  label?: string
}

export function MorphPanel({ onSubmit, placeholder = "Ask AI anything...", label = "Ask AI" }: MorphPanelProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const [showForm, setShowForm] = React.useState(false)
  const [successFlag, setSuccessFlag] = React.useState(false)

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    textareaRef.current?.blur()
  }, [])

  const triggerOpen = React.useCallback(() => {
    setShowForm(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    })
  }, [])

  const handleSuccess = React.useCallback((value: string) => {
    triggerClose()
    setSuccessFlag(true)
    onSubmit?.(value)
    setTimeout(() => setSuccessFlag(false), 1500)
  }, [triggerClose, onSubmit])

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, triggerClose])

  const ctx = React.useMemo(
    () => ({ showForm, successFlag, triggerOpen, triggerClose }),
    [showForm, successFlag, triggerOpen, triggerClose]
  )

  return (
    <FormContext.Provider value={ctx}>
      <div ref={wrapperRef} data-panel="true" className="bg-background relative bottom-8 z-3 flex flex-col items-center overflow-hidden border max-sm:bottom-5" style={{ width: "auto", height: showForm ? FORM_HEIGHT : 44, borderRadius: 20, transition: "height 0.3s ease" }}>
        <InputForm ref={textareaRef} onSuccess={handleSuccess} placeholder={placeholder} />
        <DockBar label={label} />
      </div>
    </FormContext.Provider>
  )
}

function DockBar({ label }: { label: string }) {
  const { showForm, triggerOpen } = useFormContext()
  return (
    <motion.div
      className="absolute bottom-0 flex cursor-pointer select-none items-center gap-2 px-3 py-2.5"
      onClick={triggerOpen}
      animate={{ opacity: showForm ? 0 : 1 }}
      transition={{ duration: 0.15 / SPEED_FACTOR }}
    >
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ width: 20, height: 20 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key="orb"
            className="absolute"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <ColorOrb dimension="20px" spinDuration={8} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.span
        className="text-sm font-medium text-muted-foreground whitespace-nowrap"
        layout
      >
        {label}
      </motion.span>
    </motion.div>
  )
}

const FORM_WIDTH = 360
const FORM_HEIGHT = 200

const InputForm = React.forwardRef<HTMLTextAreaElement, { onSuccess: (value: string) => void; placeholder: string }>(
  ({ onSuccess, placeholder }, ref) => {
    const { triggerClose, showForm } = useFormContext()
    const btnRef = React.useRef<HTMLButtonElement>(null)
    const [value, setValue] = React.useState("")

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (value.trim()) {
        onSuccess(value.trim())
        setValue("")
      }
    }

    function handleKeys(e: React.KeyboardEvent) {
      if (e.key === "Escape") triggerClose()
      if (e.key === "Enter" && e.metaKey) {
        e.preventDefault()
        btnRef.current?.click()
      }
    }

    return (
      <form
        className="absolute bottom-0"
        style={{ width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? "auto" : "none" }}
        onSubmit={handleSubmit}
      >
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="flex flex-col gap-1 px-3 pt-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 / SPEED_FACTOR, duration: 0.15 / SPEED_FACTOR } }}
              exit={{ opacity: 0, transition: { duration: 0.05 / SPEED_FACTOR } }}
            >
              <div className="flex items-center justify-between">
                <motion.span
                  className="text-sm font-medium text-muted-foreground"
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.15 / SPEED_FACTOR, duration: 0.2 / SPEED_FACTOR } }}
                >
                  AI Input
                </motion.span>
                <motion.div
                  className="flex items-center gap-0.5"
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.2 / SPEED_FACTOR, duration: 0.2 / SPEED_FACTOR } }}
                >
                  <KeyHint>⌘</KeyHint>
                  <KeyHint>Enter</KeyHint>
                </motion.div>
              </div>
              <textarea
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                placeholder={placeholder}
                onKeyDown={handleKeys}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <motion.div
              className="absolute bottom-2.5 right-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 / SPEED_FACTOR, duration: 0.15 / SPEED_FACTOR } }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.05 / SPEED_FACTOR } }}
            >
              <Button ref={btnRef} type="submit" size="sm" className="rounded-full h-8 px-3">
                Send
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    )
  }
)
InputForm.displayName = "InputForm"

const SPRING_LOGO = { type: "spring" as const, stiffness: 350 / SPEED_FACTOR, damping: 35 }

function KeyHint({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export default MorphPanel
