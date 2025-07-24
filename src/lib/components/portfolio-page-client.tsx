"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/lib/components/ui/button"
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/ui/tooltip"
import { CalendarCheckIcon, GithubLogoIcon, LinkedinLogoIcon, XLogoIcon, ShareNetworkIcon, CheckIcon, DownloadSimpleIcon, MonitorIcon, MoonIcon, SunIcon } from "@phosphor-icons/react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/lib/components/ui/drawer"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/lib/components/ui/context-menu"
import { useSetAtom } from "jotai"
import { prefetchMDXContentAtom } from "@/lib/components/content/atoms"
import { useTheme } from "next-themes"

const Meeting = dynamic(() => import("@/lib/components/meeting"))
import { ContentProvider, Content } from "@/lib/components/content"

import type { Locale } from "@/lib/hooks/use-i18n-config"

function PortfolioPageClientInner({ dictionary, lang }: { dictionary: any; lang: Locale }) {
  const [isMeetingOpen, setIsMeetingOpen] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [legalDrawerContent, setLegalDrawerContent] = useState<"imprint" | "privacy" | null>(null)
  const { theme, setTheme } = useTheme()
  const prefetchContent = useSetAtom(prefetchMDXContentAtom)

  useEffect(() => {
    prefetchContent(['imprint', 'privacy-policy'])
  }, [prefetchContent])

  const downloadAllImages = async () => {
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const processImage = (grayscale: boolean = false) => {
        return new Promise<void>((resolve) => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            resolve()
            return
          }
          
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          if (grayscale) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            
            for (let i = 0; i < data.length; i += 4) {
              const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
              data[i] = gray
              data[i + 1] = gray
              data[i + 2] = gray
            }
            
            ctx.putImageData(imageData, 0, 0)
          }
          
          const prefix = grayscale ? 'image-gray' : 'image-color'
          let completed = 0
          const total = 3
          
          const checkComplete = () => {
            completed++
            if (completed === total) resolve()
          }
          
          // PNG
          canvas.toBlob((blob) => {
            if (blob) zip.file(`${prefix}.png`, blob)
            checkComplete()
          }, 'image/png')
          
          // JPG
          canvas.toBlob((blob) => {
            if (blob) zip.file(`${prefix}.jpg`, blob)
            checkComplete()
          }, 'image/jpeg', 0.9)
          
          // WebP
          canvas.toBlob((blob) => {
            if (blob) zip.file(`${prefix}.webp`, blob)
            checkComplete()
          }, 'image/webp', 0.9)
        })
      }
      
      img.onload = async () => {
        await processImage(false) // Color versions
        await processImage(true)  // Grayscale versions
        
        const content = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(content)
        const link = document.createElement('a')
        link.href = url
        link.download = 'portfolio-images.zip'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
      
      img.src = '/image.jpg'
      
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: dictionary.shareTitle,
      text: dictionary.shareText,
      url: window.location.href,
    }

    let shared = false
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        shared = true
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        shared = true
      } catch (err) {}
    }

    if (shared) {
      setIsShared(true)
      setTimeout(() => setIsShared(false), 2000)
    }
  }

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <div className="flex w-full max-w-md flex-col items-center space-y-6 text-center">
        <ContextMenu>
          <ContextMenuTrigger>
            <Avatar className="size-40 rounded-full">
              <Image 
                src="/image.jpg" 
                alt={dictionary.name} 
                width={160} 
                height={160} 
                draggable="false"
                className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-300 rounded-full"
              />
              <AvatarFallback className="rounded-full">MS</AvatarFallback>
            </Avatar>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={downloadAllImages}>
              <DownloadSimpleIcon className="mr-2 size-4" />
              Download Images
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setTheme('light')}>
              <SunIcon className="mr-2 size-4" />
              Light Theme
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setTheme('dark')}>
              <MoonIcon className="mr-2 size-4" />
              Dark Theme
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setTheme('system')}>
              <MonitorIcon className="mr-2 size-4" />
              System Theme
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <div className="space-y-1">
          <h1 className="text-4xl font-bold">{dictionary.name}</h1>
          <p className="text-lg text-muted-foreground">{dictionary.tagline}</p>
        </div>

        <div className="flex w-full max-w-[280px] flex-col space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                disabled 
                className="w-full uppercase font-semibold tracking-wider opacity-50 cursor-not-allowed"
              >
                {dictionary.myWork} - Coming Soon
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Portfolio coming soon</p>
            </TooltipContent>
          </Tooltip>
          <Drawer open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  className="w-full justify-between uppercase font-semibold tracking-wider"
                  onClick={() => setIsMeetingOpen(true)}
                >
                  {dictionary.scheduleMeeting}
                  <CalendarCheckIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{dictionary.scheduleMeetingTooltip}</p>
              </TooltipContent>
            </Tooltip>
            <DrawerContent className="h-[90vh] max-h-[800px]">
              <DrawerHeader>
                <DrawerTitle>{dictionary.scheduleMeeting}</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-hidden">
                {isMeetingOpen && <Meeting />}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex w-full justify-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://github.com/manuel-lambda" target="_blank" aria-label="GitHub">
                  <GithubLogoIcon className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{dictionary.githubTooltip}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://www.linkedin.com/in/manuel-szedlak" target="_blank" aria-label="LinkedIn">
                  <LinkedinLogoIcon className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{dictionary.linkedinTooltip}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://x.com/ManuelSzedlak" target="_blank" aria-label="X (formerly Twitter)">
                  <XLogoIcon className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{dictionary.twitterTooltip}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="icon" 
                onClick={handleShare} 
                aria-label="Share portfolio"
                className={isShared ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isShared ? "check" : "share"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isShared ? <CheckIcon className="size-5" /> : <ShareNetworkIcon className="size-5" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isShared ? dictionary.shareCopiedTooltip : dictionary.shareTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-full max-w-[280px] space-y-2 text-center">
          <div className="flex justify-center space-x-4 text-xs">
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setLegalDrawerContent("imprint")}
              onMouseEnter={() => prefetchContent(['imprint'])}
            >
              Imprint
            </Button>
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setLegalDrawerContent("privacy")}
              onMouseEnter={() => prefetchContent(['privacy-policy'])}
            >
              Privacy Policy
            </Button>
          </div>
        </div>

        <Drawer open={!!legalDrawerContent} onOpenChange={(open) => !open && setLegalDrawerContent(null)}>
          <DrawerContent className="h-[90vh] max-h-[800px]">
            <DrawerHeader>
              <DrawerTitle>{legalDrawerContent === "imprint" ? "Imprint" : "Privacy Policy"}</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <Content filename={legalDrawerContent === "imprint" ? "imprint" : "privacy-policy"} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </TooltipProvider>
  )
}

export default function PortfolioPageClient(props: { dictionary: any; lang: Locale }) {
  return (
    <ContentProvider>
      <PortfolioPageClientInner {...props} />
    </ContentProvider>
  )
}
