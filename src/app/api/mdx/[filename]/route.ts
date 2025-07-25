import { type NextRequest, NextResponse } from "next/server"
import { getMDXContent } from "@/lib/components/content/mdx"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params
    const content = await getMDXContent(filename)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        mdxSource: content.source,
        frontmatter: content.frontmatter,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    )
  } catch (error) {
    console.error("MDX API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
