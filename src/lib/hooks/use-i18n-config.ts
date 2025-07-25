export const i18n = {
  defaultLocale: "en",
  locales: ["en", "de", "es", "fr", "zh-CN", "ja", "pt-BR", "ru", "hi", "ar"],
} as const

export type Locale = (typeof i18n)["locales"][number]
