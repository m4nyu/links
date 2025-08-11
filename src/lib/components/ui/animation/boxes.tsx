"use client"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import React from "react"
import { cn } from "@/lib/utils"

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const { resolvedTheme } = useTheme()
  const rows = new Array(250).fill(1)
  const cols = new Array(200).fill(1)
  const hoverColor = resolvedTheme === "dark" ? "#fff" : "#18181b"
  const blurColor = resolvedTheme === "dark" ? "0, 0, 0" : "255, 255, 255"

  return (
    <div className="absolute inset-0 z-10">
      <motion.div
        initial={{
          transform: "translate(-50%, -50%) skewX(-48deg) skewY(14deg) scale(1.5)",
        }}
        animate={{
          transform: "translate(-40%, -60%) skewX(-48deg) skewY(14deg) scale(1.5)",
        }}
        transition={{
          duration: 35,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
        className={cn("pointer-events-auto absolute inset-0 flex h-[500%] w-[500%]", className)}
        {...rest}
      >
        {rows.map((_, i) => (
          <motion.div
            key={`row-${i}`}
            className="relative h-8 w-16 border-l border-slate-300/40 dark:border-slate-700/40"
          >
            {cols.map((_, j) => (
              <motion.div
                whileHover={{
                  backgroundColor: hoverColor,
                  transition: { duration: 0 },
                }}
                animate={{
                  transition: { duration: 2 },
                }}
                key={`col-${i}-${j}`}
                className="relative h-8 w-16 border-r border-t border-slate-300/40 hover:z-50 dark:border-slate-700/40"
              />
            ))}
          </motion.div>
        ))}
      </motion.div>

      {/* Circular fade overlay from center */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, rgba(${blurColor}, 0.3) 70%, rgba(${blurColor}, 0.8) 95%)`,
          }}
        />
      </div>
    </div>
  )
}

export const Boxes = React.memo(BoxesCore)
