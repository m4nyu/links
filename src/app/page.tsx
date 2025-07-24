import { redirect } from "next/navigation"
import { i18n } from "@/lib/hooks/use-i18n-config"

export default function RootPage() {
  redirect(`/${i18n.defaultLocale}`)
  return null
}
