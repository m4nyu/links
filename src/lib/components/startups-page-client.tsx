"use client"

import { CaretLeftIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { InfoCard } from "@/lib/components/info"
import { Button } from "@/lib/components/ui/button"
import type { Locale } from "@/lib/hooks/use-i18n-config"

type Startup = {
  title: string
  description: string
  image: string
  liveUrl: string
}

interface StartupsPageClientProps {
  lang: Locale
  dictionary: {
    startups: {
      backToHome: string
      pageTitle: string
      pageDescription: string
    }
  }
  startups: Startup[]
}

export default function StartupsPageClient({ lang, dictionary, startups }: StartupsPageClientProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 md:px-8">
      <div>
        <Button variant="ghost" asChild className="-ml-2 h-10 w-10">
          <Link href={`/${lang}`} aria-label={dictionary.startups.backToHome}>
            <CaretLeftIcon className="h-6 w-6" />
          </Link>
        </Button>
      </div>
      <main className="mt-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {startups.map((startup) => (
            <InfoCard key={startup.liveUrl} startup={startup} />
          ))}
        </div>
      </main>
    </div>
  )
}
