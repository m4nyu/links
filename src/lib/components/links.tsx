"use client"

import {
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
import dynamic from "next/dynamic"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"
import PixelAvatar from "@/lib/components/pixel-avatar"
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
import { downloadImages, shareContent } from "@/lib/utils"

const Meeting = dynamic(() => import("@/lib/components/meeting"))

// Languages m4nuel.net serves; anything else falls back to English.
const netLanguages = new Set(["en", "de", "fr", "es", "it", "pt", "nl", "ru", "ja", "ko", "zh", "ar"])

function opinionsUrl(lang: string): string {
  const base = lang.split("-")[0].toLowerCase()
  return `https://m4nuel.net/${netLanguages.has(base) ? base : "en"}#qa`
}

export type Dictionary = { portfolio: { [key: string]: string } }

export default function Links({ lang, dictionary }: { lang: string; dictionary: Dictionary }) {
  const [isMeetingOpen, setIsMeetingOpen] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const { setTheme } = useTheme()

  const handleDownloadImages = async () => {
    try {
      await downloadImages("/image.jpg")
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleShareClick = async () => {
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

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <div className="flex w-full max-w-md flex-col items-center space-y-4 sm:space-y-6 text-center px-4">
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="cursor-pointer select-none">
              <PixelAvatar alt={dictionary.portfolio.name} />
            </div>
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
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full h-12 sm:h-14 text-sm sm:text-base uppercase font-semibold tracking-wider justify-start border-black dark:border-white select-none"
              >
                <Link href="https://m4nuel.blog" target="_blank">
                  {dictionary.portfolio.visitBlog || "My Blog"}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Visit my blog for articles and insights</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full h-12 sm:h-14 text-sm sm:text-base uppercase font-semibold tracking-wider justify-start border-black dark:border-white select-none"
              >
                <Link href={opinionsUrl(lang)} target="_blank">
                  {dictionary.portfolio.opinions}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Opinions on m4nuel.net</p>
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
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-11 w-11 sm:h-12 sm:w-12 border-black dark:border-white"
              >
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
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-11 w-11 sm:h-12 sm:w-12 border-black dark:border-white"
              >
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
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-11 w-11 sm:h-12 sm:w-12 border-black dark:border-white"
              >
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
                <span key={isShared ? "check" : "share"} className="animate-in fade-in zoom-in-50 duration-200">
                  {isShared ? (
                    <CheckIcon className="size-5 sm:size-6" />
                  ) : (
                    <ShareNetworkIcon className="size-5 sm:size-6" />
                  )}
                </span>
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
