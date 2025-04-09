"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SuccessPageProps {
  title?: string
  message?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export function SuccessPage({
  title = "Success!",
  message = "Your form has been successfully submitted.",
  actionText = "Back to Home",
  onAction,
  className,
}: SuccessPageProps) {
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    // Trigger confetti animation on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
      shapes: ["star", "circle"],
    })

    // Add bounce effect to the success icon
    setBounce(true)
    const timeout = setTimeout(() => {
      setBounce(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [])

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <div className={cn(
      "flex min-h-[50vh] w-full flex-col items-center justify-center p-4",
      className
    )}>
      <Card className="relative w-full max-w-md overflow-hidden p-6 text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Check className="h-12 w-12" />
            </motion.div>
            <AnimatePresence>
              {bounce && (
                <motion.div
                  className="absolute -right-2 -top-2"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={sparkleVariants}
                >
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
          <p className="mb-6 text-muted-foreground">{message}</p>

          {onAction && (
            <Button 
              onClick={onAction} 
              className="mt-2 w-full"
              variant="default"
            >
              {actionText}
            </Button>
          )}
        </motion.div>
      </Card>
    </div>
  )
} 