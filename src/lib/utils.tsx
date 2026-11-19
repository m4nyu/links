import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Locale } from "@/lib/hooks/use-i18n-config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDictionary = async (locale: Locale) => {
  const dictionaries = ["en", "de", "es", "fr", "zh-CN", "ja", "pt-BR", "ru", "hi", "ar"] as const

  const validLocale = dictionaries.includes(locale as (typeof dictionaries)[number]) ? locale : "en"
  return import(`@/lib/dictionaries/${validLocale}.json`).then((module) => module.default)
}

export const shareContent = async (shareData: { title: string; text: string; url: string }): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return true
    } else {
      await navigator.clipboard.writeText(shareData.url)
      return true
    }
  } catch (error) {
    console.error("Share failed:", error)
    return false
  }
}

export const generatePersondata = async (data: {
  name: string
  alternateName?: string
  jobTitle: string
  description: string
  url: string
  image: string
  sameAs: string[]
  knowsAbout: string[]
  worksFor?: {
    "@type": string
    name: string
  }
}): Promise<string> => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    ...(data.alternateName && { alternateName: data.alternateName }),
    jobTitle: data.jobTitle,
    description: data.description,
    url: data.url,
    image: data.image,
    sameAs: data.sameAs,
    knowsAbout: data.knowsAbout,
    ...(data.worksFor && { worksFor: data.worksFor }),
  }

  return JSON.stringify(structuredData)
}

export const generateWebsitedata = async (data: {
  name: string
  alternateName: string
  url: string
  description: string
  author: {
    "@type": string
    name: string
    alternateName?: string
  }
  publisher: {
    "@type": string
    name: string
  }
  inLanguage: string[]
  searchTarget?: string
}): Promise<string> => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    alternateName: data.alternateName,
    url: data.url,
    description: data.description,
    author: data.author,
    publisher: data.publisher,
    inLanguage: data.inLanguage,
    ...(data.searchTarget && {
      potentialAction: {
        "@type": "SearchAction",
        target: data.searchTarget,
        "query-input": "required name=search_term_string",
      },
    }),
  }

  return JSON.stringify(structuredData)
}

// Export type information to help TypeScript language server
export type { ClassValue } from "clsx"
