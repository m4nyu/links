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
import { downloadImages, shareContent } from "@/lib/utils"

const Meeting = dynamic(() => import("@/lib/components/meeting"))

const dictionaries = {
  en: () => import("@/lib/dictionaries/en.json").then((module) => module.default),
  de: () => import("@/lib/dictionaries/de.json").then((module) => module.default),
  es: () => import("@/lib/dictionaries/es.json").then((module) => module.default),
  fr: () => import("@/lib/dictionaries/fr.json").then((module) => module.default),
  "zh-CN": () => import("@/lib/dictionaries/zh-CN.json").then((module) => module.default),
  ja: () => import("@/lib/dictionaries/ja.json").then((module) => module.default),
  "pt-BR": () => import("@/lib/dictionaries/pt-BR.json").then((module) => module.default),
  ru: () => import("@/lib/dictionaries/ru.json").then((module) => module.default),
  hi: () => import("@/lib/dictionaries/hi.json").then((module) => module.default),
  ar: () => import("@/lib/dictionaries/ar.json").then((module) => module.default),
}

const getDictionary = async (locale: Locale) => {
  return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en()
}

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
      <div className="flex w-full max-w-md flex-col items-center space-y-6 text-center">
        <ContextMenu>
          <ContextMenuTrigger>
            <Avatar className="size-40 rounded-full">
              <Image
                src="/image.jpg"
                alt={dictionary.portfolio.name}
                width={160}
                height={160}
                priority
                draggable="false"
                className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-300 rounded-full"
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

        <div className="space-y-1">
          <h1 className="text-4xl font-bold">{dictionary.portfolio.name}</h1>
          <p className="text-lg text-muted-foreground">{dictionary.portfolio.tagline}</p>
        </div>

        <div className="flex w-full max-w-[280px] flex-col space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild className="w-full uppercase font-semibold tracking-wider">
                <Link href="https://m4nuel.blog" target="_blank">
                  {dictionary.portfolio.visitBlog || "My Blog"}
                  <ArticleIcon className="size-4" />
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
                  variant="secondary"
                  className="w-full justify-between uppercase font-semibold tracking-wider"
                  onClick={() => setIsMeetingOpen(true)}
                >
                  {dictionary.portfolio.scheduleMeeting}
                  <CalendarCheckIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{dictionary.portfolio.scheduleMeetingTooltip}</p>
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

        <div className="flex w-full justify-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://github.com/m4nyu" target="_blank" aria-label="GitHub">
                  <GithubLogoIcon className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{dictionary.portfolio.githubTooltip}</p>
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
              <p>{dictionary.portfolio.linkedinTooltip}</p>
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
              <p>{dictionary.portfolio.twitterTooltip}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                onClick={handleShareClick}
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
              <p>{isShared ? dictionary.portfolio.shareCopiedTooltip : dictionary.portfolio.shareTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
