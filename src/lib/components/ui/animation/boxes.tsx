'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const { resolvedTheme } = useTheme()
  const rows = new Array(200).fill(1)
  const cols = new Array(150).fill(1)
  const hoverColor = resolvedTheme === 'dark' ? '#fff' : '#18181b'
  const blurColor = resolvedTheme === 'dark' ? '0, 0, 0' : '255, 255, 255'

  return (
    <div className="absolute inset-0 z-10">
      <motion.div
        initial={{
          transform:
            'translate(-25%, -25%) skewX(-48deg) skewY(14deg) scale(1.2)',
        }}
        animate={{
          transform:
            'translate(-15%, -35%) skewX(-48deg) skewY(14deg) scale(1.2)',
        }}
        transition={{
          duration: 30,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
        className={cn(
          'pointer-events-auto absolute inset-0 flex h-[300%] w-[300%]',
          className
        )}
        {...rest}
      >
        {rows.map((_, i) => (
          <motion.div
            key={`row` + i}
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
                key={`col` + j}
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
            background: `radial-gradient(circle at center, transparent 30%, rgba(${blurColor}, 0.3) 70%, rgba(${blurColor}, 0.8) 95%)`
          }}
        />
      </div>
    </div>
  )
}

export const Boxes = React.memo(BoxesCore)
