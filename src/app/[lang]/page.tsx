import Links from "@/lib/components/links"
import type { Locale } from "@/lib/hooks/use-i18n-config"
import { getDictionary } from "@/lib/utils"

// Rendered at build time per locale, so the HTML already carries the page.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as Locale)
  return <Links lang={lang} dictionary={dictionary} />
}
