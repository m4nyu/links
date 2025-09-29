"use client"

import {
  ArticleIcon,
  CalendarCheckIcon,
  CheckIcon,
  DownloadSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  MonitorIcon,
  MoonIcon,
  ShareNetworkIcon,
  SunIcon,
  XLogoIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar"
import { Button } from "@/lib/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/lib/components/ui/context-menu"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/lib/components/ui/drawer"
import { ScrollArea } from "@/lib/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/ui/tooltip"
import type { Locale } from "@/lib/hooks/use-i18n-config"
import { downloadImages, getDictionary, shareContent } from "@/lib/utils"

const Meeting = dynamic(() => import("@/lib/components/meeting"))

export default function Page() {
  const params = useParams()
  const lang = params?.lang as Locale
  const [dictionary, setDictionary] = useState<{ portfolio: { [key: string]: string } } | null>(null)
  const [isMeetingOpen, setIsMeetingOpen] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(lang)
      setDictionary(dict)
    }
    if (lang) {
      loadDictionary()
    }
  }, [lang])

  const handleDownloadImages = async () => {
    try {
      await downloadImages("/image.jpg")
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleShareClick = async () => {
    if (!dictionary) return

    const shareData = {
      title: dictionary.portfolio.shareTitle,
      text: dictionary.portfolio.shareText,
      url: window.location.href,
    }

    const shared = await shareContent(shareData)

    if (shared) {
      setIsShared(true)
      setTimeout(() => setIsShared(false), 2000)
    }
  }

  if (!dictionary) {
    return null
  }

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <div className="flex w-full max-w-md flex-col items-center space-y-4 sm:space-y-6 text-center px-4">
        <ContextMenu>
          <ContextMenuTrigger>
            <Avatar className="size-44 sm:size-52 rounded-full cursor-pointer select-none">
              <Image
                src="/image.jpg"
                alt={dictionary.portfolio.name}
                width={208}
                height={208}
                priority
                draggable="false"
                className="object-cover object-center rounded-full"
              />
              <AvatarFallback className="rounded-full">MS</AvatarFallback>
            </Avatar>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleDownloadImages}>
              <DownloadSimpleIcon className="mr-2 size-4" />
              Download Images
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setTheme("light")}>
              <SunIcon className="mr-2 size-4" />
              Light Theme
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setTheme("dark")}>
              <MoonIcon className="mr-2 size-4" />
              Dark Theme
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setTheme("system")}>
              <MonitorIcon className="mr-2 size-4" />
              System Theme
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <div className="space-y-1 select-text">
          <h1 className="text-3xl sm:text-4xl font-bold">{dictionary.portfolio.name}</h1>
          <p className="text-base sm:text-lg text-muted-foreground">{dictionary.portfolio.tagline}</p>
        </div>

        <div className="flex w-full max-w-[280px] sm:max-w-[360px] flex-col space-y-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="outline" size="lg" className="w-full h-12 sm:h-14 text-sm sm:text-base uppercase font-semibold tracking-wider justify-start border-black dark:border-white select-none">
                <Link href="https://m4nuel.blog" target="_blank">
                  {dictionary.portfolio.visitBlog || "My Blog"}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Visit my blog for articles and insights</p>
            </TooltipContent>
          </Tooltip>
          <Drawer open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full h-12 sm:h-14 text-sm sm:text-base uppercase font-semibold tracking-wider justify-start select-none hover:opacity-90"
                  onClick={() => setIsMeetingOpen(true)}
                >
                  {dictionary.portfolio.scheduleMeeting}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Book a 30-minute call to discuss opportunities</p>
              </TooltipContent>
            </Tooltip>
            <DrawerContent className="h-[100vh] max-h-none flex flex-col">
              <DrawerHeader className="shrink-0">
                <DrawerTitle>{dictionary.portfolio.scheduleMeeting}</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="flex-1">
                <div className="min-h-[600px] flex items-center justify-center">{isMeetingOpen && <Meeting />}</div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex w-full justify-center space-x-2 sm:space-x-3 select-none">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild className="h-11 w-11 sm:h-12 sm:w-12 border-black dark:border-white">
                <Link href="https://github.com/m4nyu" target="_blank" aria-label="GitHub">
                  <GithubLogoIcon className="size-5 sm:size-6" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>GitHub</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild className="h-11 w-11 sm:h-12 sm:w-12 border-black dark:border-white">
                <Link href="https://www.linkedin.com/in/manuel-szedlak" target="_blank" aria-label="LinkedIn">
                  <LinkedinLogoIcon className="size-5 sm:size-6" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>LinkedIn</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild className="h-11 w-11 sm:h-12 sm:w-12 border-black dark:border-white">
                <Link href="https://x.com/ManuelSzedlak" target="_blank" aria-label="X (formerly Twitter)">
                  <XLogoIcon className="size-5 sm:size-6" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>X</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                onClick={handleShareClick}
                aria-label="Share portfolio"
                className={`h-11 w-11 sm:h-12 sm:w-12 ${isShared ? "bg-green-600 hover:bg-green-700" : "hover:opacity-90"}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isShared ? "check" : "share"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isShared ? <CheckIcon className="size-5 sm:size-6" /> : <ShareNetworkIcon className="size-5 sm:size-6" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isShared ? "Copied!" : "Share"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
