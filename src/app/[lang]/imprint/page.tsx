import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote"
import { mdxComponents } from "@/lib/components/content/components"
import { getMDXContent } from "@/lib/components/content/mdx"
import type { Locale } from "@/lib/hooks/use-i18n-config"

export default async function ImprintPage({ params: _params }: { params: { lang: Locale } }) {
  const content = await getMDXContent("imprint")

  if (!content) {
    notFound()
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <MDXRemote {...content.source} components={mdxComponents} />
    </div>
  )
}

export async function generateMetadata({ params: _params }: { params: { lang: Locale } }) {
  const content = await getMDXContent("imprint")

  return {
    title: content?.frontmatter?.title || "Imprint",
    description: content?.frontmatter?.description || "Legal imprint information",
  }
}
