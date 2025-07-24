import fs from "node:fs/promises"
import path from "node:path"
import type { MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import { cache } from "react"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

const CONTENT_DIR = path.join(process.cwd(), "src/content/legal")
const ALLOWED_FILES = ["imprint", "privacy-policy"] as const

type AllowedFile = (typeof ALLOWED_FILES)[number]
type MDXContent = {
  source: MDXRemoteSerializeResult
  frontmatter: Record<string, string | number | boolean | undefined>
}

const isValidFile = (filename: string): filename is AllowedFile => ALLOWED_FILES.includes(filename as AllowedFile)

const extractFrontmatter = (content: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content }

  const frontmatter: Record<string, string | number | boolean | undefined> = {}
  match[1].split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":")
    if (key?.trim() && valueParts.length > 0) {
      const value = valueParts.join(":").trim()
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, "")
    }
  })

  return { frontmatter, content: match[2] }
}

export const getMDXContent = cache(async (filename: string): Promise<MDXContent | null> => {
  if (!isValidFile(filename)) return null

  try {
    const filePath = path.join(CONTENT_DIR, `${filename}.mdx`)
    const rawContent = await fs.readFile(filePath, "utf-8")
    const { frontmatter, content } = extractFrontmatter(rawContent)

    const source = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
        development: process.env.NODE_ENV === "development",
      },
    })

    return { source, frontmatter }
  } catch (error) {
    console.error(`Failed to load MDX content: ${filename}`, error)
    return null
  }
})

export const getAllMDXFiles = cache(async (): Promise<string[]> => {
  try {
    const files = await fs.readdir(CONTENT_DIR)
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(".mdx", ""))
      .filter(isValidFile)
  } catch {
    return []
  }
})
