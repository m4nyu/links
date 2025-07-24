"use client"

import { CircleNotchIcon } from "@phosphor-icons/react"
import { Provider as JotaiProvider, useAtomValue, useSetAtom } from "jotai"
import type React from "react"
import { Suspense, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getMDXContentAtom, mdxContentCacheAtom, mdxErrorStatesAtom, mdxLoadingStatesAtom } from "./atoms"
import { MDXRenderer } from "./renderer"

const Spinner = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center w-full h-full min-h-32", className)}>
    <CircleNotchIcon className="size-8 animate-spin text-muted-foreground" />
  </div>
)

interface ContentProps {
  filename: string
  className?: string
}

const ContentInner: React.FC<ContentProps> = ({ filename, className }) => {
  const contentCache = useAtomValue(mdxContentCacheAtom)
  const loadingStates = useAtomValue(mdxLoadingStatesAtom)
  const errorStates = useAtomValue(mdxErrorStatesAtom)
  const getMDXContent = useSetAtom(getMDXContentAtom)

  const content = contentCache[filename]
  const isLoading = loadingStates[filename] || false
  const error = errorStates[filename]

  useEffect(() => {
    if (!content && !isLoading && !error) {
      getMDXContent(filename).catch(() => {})
    }
  }, [filename, content, isLoading, error, getMDXContent])

  if (!content && isLoading) return <Spinner />
  if (error) return <div className="text-destructive text-sm text-center p-4">Error: {error.message}</div>
  if (!content) return <Spinner />

  return <MDXRenderer source={content.mdxSource} className={className} />
}

const Content: React.FC<ContentProps> = (props) => {
  return (
    <Suspense fallback={<Spinner />}>
      <ContentInner {...props} />
    </Suspense>
  )
}

interface ContentProviderProps {
  children: React.ReactNode
}

const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => <JotaiProvider>{children}</JotaiProvider>

export { ContentProvider, Content }
