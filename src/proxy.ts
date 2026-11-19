import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { type NextRequest, NextResponse } from "next/server"
import { i18n } from "@/lib/hooks/use-i18n-config"

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value
  })

  const locales: string[] = [...i18n.locales]
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales)
  const defaultLocale = i18n.defaultLocale

  return matchLocale(languages, locales, defaultLocale)
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url))
  }
}

// Page paths only: anything with a file extension (the images zip, robots.txt,
// sitemap.xml, icons) is served as is, never redirected to /<locale>/...
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
