"use server"

import { parse } from "node-html-parser"

const getMetaTag = (doc: any, property: string) => {
  const el = doc.querySelector(`meta[property="${property}"]`)
  return el ? el.getAttribute("content") : null
}

export async function getOpenGraphData(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
    }

    const html = await res.text()
    const doc = parse(html)

    const title = getMetaTag(doc, "og:title") || doc.querySelector("title")?.text || "No title found"
    const description = getMetaTag(doc, "og:description") || "No description found"
    const image =
      getMetaTag(doc, "og:image") || `/placeholder.svg?height=225&width=400&query=${encodeURIComponent(title)}`

    return {
      title,
      description,
      image,
      liveUrl: url,
    }
  } catch (error) {
    console.error(`Error fetching OpenGraph data for ${url}:`, error)
    return {
      title: "Could not fetch data",
      description: `There was an error fetching the details for ${url}.`,
      image: "/placeholder.svg?height=225&width=400",
      liveUrl: url,
    }
  }
}
