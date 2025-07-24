import PortfolioPageClient from "@/lib/components/portfolio-page-client"
import { getDictionary } from "@/lib/hooks/use-dictionary"
import type { Locale } from "@/lib/hooks/use-i18n-config"

export default async function PortfolioPage(props: { params: { lang: Locale } }) {
  const { params } = props
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  return <PortfolioPageClient dictionary={dictionary.portfolio} lang={lang} />
}
