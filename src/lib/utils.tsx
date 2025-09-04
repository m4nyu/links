import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

interface ZipFile {
  file: (name: string, content: Blob) => void
  generateAsync: (options: { type: string }) => Promise<Blob>
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const processZip = async (
  canvas: HTMLCanvasElement,
  zip: ZipFile,
  grayscale: boolean = false
): Promise<void> => {
  return new Promise<void>((resolve) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve()
      return
    }

    if (grayscale) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const prefix = grayscale ? "image-gray" : "image-color"
    let completed = 0
    const total = 3

    const checkComplete = () => {
      completed++
      if (completed === total) resolve()
    }

    canvas.toBlob((blob) => {
      if (blob) zip.file(`${prefix}.png`, blob)
      checkComplete()
    }, "image/png")

    canvas.toBlob(
      (blob) => {
        if (blob) zip.file(`${prefix}.jpg`, blob)
        checkComplete()
      },
      "image/jpeg",
      0.9
    )

    canvas.toBlob(
      (blob) => {
        if (blob) zip.file(`${prefix}.webp`, blob)
        checkComplete()
      },
      "image/webp",
      0.9
    )
  })
}

export const downloadImages = async (imageSrc: string = "/image.jpg"): Promise<void> => {
  try {
    const { default: JSZip } = await import("jszip")
    const zip = new JSZip()

    const img = new window.Image()
    img.crossOrigin = "anonymous"

    const processImage = async (grayscale: boolean = false): Promise<void> => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      await processZip(canvas, zip as ZipFile, grayscale)
    }

    return new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        try {
          await processImage(false)
          await processImage(true)

          const content = await zip.generateAsync({ type: "blob" })
          const url = URL.createObjectURL(content)
          const link = document.createElement("a")
          link.href = url
          link.download = "portfolio-images.zip"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageSrc
    })
  } catch (error) {
    console.error("Download failed:", error)
    throw error
  }
}

export const shareContent = async (shareData: { title: string; text: string; url: string }): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return true
    } else {
      await navigator.clipboard.writeText(shareData.url)
      return true
    }
  } catch (error) {
    console.error("Share failed:", error)
    return false
  }
}

export const generatePersondata = async (data: {
  name: string
  alternateName?: string
  jobTitle: string
  description: string
  url: string
  image: string
  sameAs: string[]
  knowsAbout: string[]
  worksFor?: {
    "@type": string
    name: string
  }
}): Promise<string> => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    ...(data.alternateName && { alternateName: data.alternateName }),
    jobTitle: data.jobTitle,
    description: data.description,
    url: data.url,
    image: data.image,
    sameAs: data.sameAs,
    knowsAbout: data.knowsAbout,
    ...(data.worksFor && { worksFor: data.worksFor }),
  }

  return JSON.stringify(structuredData)
}

export const generateWebsitedata = async (data: {
  name: string
  alternateName: string
  url: string
  description: string
  author: {
    "@type": string
    name: string
    alternateName?: string
  }
  publisher: {
    "@type": string
    name: string
  }
  inLanguage: string[]
  searchTarget?: string
}): Promise<string> => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    alternateName: data.alternateName,
    url: data.url,
    description: data.description,
    author: data.author,
    publisher: data.publisher,
    inLanguage: data.inLanguage,
    ...(data.searchTarget && {
      potentialAction: {
        "@type": "SearchAction",
        target: data.searchTarget,
        "query-input": "required name=search_term_string",
      },
    }),
  }

  return JSON.stringify(structuredData)
}

// Export type information to help TypeScript language server
export type { ClassValue } from "clsx"
