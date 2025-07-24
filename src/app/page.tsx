import { i18n } from "@/lib/hooks/use-i18n-config";
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect(`/${i18n.defaultLocale}`);
  return null;
} 