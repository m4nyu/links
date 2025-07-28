"use client"

import { ArrowSquareOutIcon, CheckIcon, CircleNotchIcon, ShareNetworkIcon } from "@phosphor-icons/react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/lib/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/lib/components/ui/card"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/lib/components/ui/context-menu"
import { Dialog, DialogOverlay, DialogPortal, DialogTrigger } from "@/lib/components/ui/dialog"
import { cn } from "@/lib/utils"

type Startup = {
  title: string
  description: string
  image: string
  liveUrl: string
}

export function InfoCard({ startup }: { startup: Startup }) {
  const [isShared, setIsShared] = useState(false)
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleShare = async (e?: React.MouseEvent | React.SyntheticEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    const shareData = {
      title: startup.title,
      text: startup.description,
      url: startup.liveUrl,
    }

    let shared = false
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        shared = true
      } catch (_err) {}
    } else {
      try {
        await navigator.clipboard.writeText(startup.liveUrl)
        shared = true
      } catch (_err) {}
    }

    if (shared) {
      setIsShared(true)
      setTimeout(() => setIsShared(false), 2000)
    }
  }

  const handleOpenInNewTab = (e?: React.MouseEvent | React.SyntheticEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    window.open(startup.liveUrl, "_blank", "noopener,noreferrer")
  }

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    const timeout = setTimeout(() => {
      setIsDialogOpen(true)
      setIsIframeLoading(true)
    }, 1000) // Increased to 1 second
    setHoverTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    // Removed automatic closing
  }

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div 
              role="button" 
              tabIndex={0} 
              onMouseEnter={handleMouseEnter} 
              onMouseLeave={handleMouseLeave}
              onClick={(e) => {
                // Only handle main card click if not clicking on the share button
                if (!(e.target as Element).closest('button')) {
                  handleOpenInNewTab(e)
                }
              }}
              style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
            >
              <Card className="group flex h-[450px] w-full flex-col overflow-hidden border transition-all hover:shadow-md">
                <div className="flex flex-col h-full">
                  <div className="h-56 overflow-hidden bg-muted">
                    <Image
                      src={startup.image || "/placeholder.svg"}
                      alt={`Screenshot of ${startup.title}`}
                      width={400}
                      height={224}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <CardTitle className="mb-2 text-xl font-bold line-clamp-2">{startup.title}</CardTitle>
                    <CardDescription className="text-balance text-muted-foreground line-clamp-3 flex-1">
                      {startup.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-end border-t p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    aria-label={`Share ${startup.title}`}
                    className="size-8"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isShared ? "check" : "share"}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isShared ? (
                          <CheckIcon className="size-4 text-green-600" />
                        ) : (
                          <ShareNetworkIcon className="size-4" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </Button>
                </div>
              </Card>
            </div>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
              className={cn(
                "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border bg-background shadow-lg duration-700",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                // Mobile: Full screen with some padding
                "w-[95vw] h-[50vh] max-w-none",
                // Small screens: Larger but still responsive
                "sm:w-[90vw] sm:h-[60vh]",
                // Medium screens and up: 16:9 aspect ratio
                "md:w-[85vw] md:h-[47.8125vw] md:max-h-[85vh]",
                // Large screens: Cap the maximum size
                "lg:w-[80vw] lg:h-[45vw] lg:max-h-[80vh]",
                // Extra large: Maximum reasonable size
                "xl:w-[75vw] xl:h-[42.1875vw] xl:max-h-[75vh]",
                "2xl:max-w-[1400px] 2xl:h-[787.5px]"
              )}
            >
              <div className="relative h-full w-full overflow-hidden">
                {isIframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                    <CircleNotchIcon className="size-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                <iframe
                  src={startup.liveUrl}
                  className={cn("h-full w-full border-0", isIframeLoading && "opacity-0")}
                  title={`Live preview of ${startup.title}`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={() => setIsIframeLoading(false)}
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPortal>
        </Dialog>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => handleOpenInNewTab()}>
          <ArrowSquareOutIcon className="mr-2 size-4" />
          Open in new tab
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => handleShare()}>
          <ShareNetworkIcon className="mr-2 size-4" />
          Share
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
