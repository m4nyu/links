import { getOpenGraphData } from "@/app/server/actions"
import StartupsPageClient from "@/lib/components/startups-page-client"
import { getDictionary } from "@/lib/hooks/use-dictionary"
import type { Locale } from "@/lib/hooks/use-i18n-config"

const startupUrls = ["https://vercel.com", "https://nextjs.org", "https://v0.dev", "https://github.com"]

export default async function StartupsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const startups = await Promise.all(startupUrls.map((url) => getOpenGraphData(url)))

  return <StartupsPageClient lang={lang} dictionary={dictionary} startups={startups} />
}
