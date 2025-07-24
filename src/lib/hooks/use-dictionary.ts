import "server-only"
import type { Locale } from "./use-i18n-config"

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

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en()
}